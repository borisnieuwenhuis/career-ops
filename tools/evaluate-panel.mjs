#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

try {
  const { config } = await import('dotenv');
  config();
} catch {
  // optional
}

import { createClient } from './lib/anthropic-client.mjs';
import { loadCv } from './lib/cv-loader.mjs';
import { parseReport } from './lib/report-parser.mjs';
import { runRecruiter, buildMessages } from './lib/personas/recruiter.mjs';
import { runHiringManager } from './lib/personas/hiring-manager.mjs';
import { runBarRaiser } from './lib/personas/bar-raiser.mjs';
import { aggregate } from './lib/aggregator.mjs';
import { buildPanelRecord, appendJsonl } from './lib/metrics.mjs';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export function parseCliArgs(argv) {
  const { values } = parseArgs({
    args: argv,
    options: {
      report: { type: 'string' },
      model: { type: 'string', default: 'claude-sonnet-4-6' },
      'dry-run': { type: 'boolean', default: false },
      'record-fixture': { type: 'string' },
      'no-cache': { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
    allowPositionals: false,
  });

  if (values.help) {
    return { help: true };
  }
  if (!values.report) {
    throw new Error('--report is required. See --help.');
  }
  return {
    report: values.report,
    model: values.model,
    dryRun: values['dry-run'],
    recordFixture: values['record-fixture'],
    useCache: !values['no-cache'],
  };
}

function printHelp() {
  process.stdout.write(`\nevaluate-panel (Path B walking skeleton)

USAGE
  node tools/evaluate-panel.mjs --report <path> [flags]

FLAGS
  --report <path>         Required. Path to reports/*.md.
  --model <name>          Default: claude-sonnet-4-6
  --dry-run               Build the prompt, print it, skip API call.
  --record-fixture <p>    Write raw Anthropic response JSON to <p>.
  --no-cache              Disable prompt caching.
  --help

OUTPUT
  JSONL appended to tools/panel-results/{report-basename}.jsonl

ENV
  ANTHROPIC_API_KEY       Required unless --dry-run.
`);
}

async function main() {
  let args;
  try {
    args = parseCliArgs(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    process.exit(1);
  }
  if (args.help) {
    printHelp();
    return;
  }

  let reportText;
  try {
    reportText = readFileSync(args.report, 'utf8');
  } catch (err) {
    process.stderr.write(`[evaluate-panel] Cannot read report at "${args.report}": ${err.message}\n`);
    process.exit(1);
  }
  const report = parseReport(reportText, args.report);
  const cv = loadCv();

  if (args.dryRun) {
    const { system, messages } = buildMessages({ cv, report, profile: null, useCache: args.useCache });
    process.stdout.write(`--- SYSTEM ---\n${system}\n\n--- MESSAGES ---\n${JSON.stringify(messages, null, 2)}\n`);
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    process.stderr.write(
      '[evaluate-panel] ANTHROPIC_API_KEY not set. Add it to .env or export it, or run with --dry-run.\n',
    );
    process.exit(1);
  }

  const client = createClient({ apiKey: process.env.ANTHROPIC_API_KEY });

  const recruiter = await runRecruiter(
    client,
    { cv, report, profile: null },
    {
      model: args.model,
      useCache: args.useCache,
      onRawResponse: args.recordFixture
        ? (resp) => {
            mkdirSync(dirname(args.recordFixture), { recursive: true });
            writeFileSync(args.recordFixture, JSON.stringify(resp, null, 2));
          }
        : undefined,
    },
  );
  const hm = await runHiringManager();
  const br = await runBarRaiser();

  const aggRes = aggregate(recruiter.verdict, hm.verdict, br.verdict);

  const perPersona = [recruiter.metrics, hm.metrics, br.metrics].filter(Boolean);
  const record = buildPanelRecord({
    reportPath: args.report,
    model: args.model,
    personas: {
      recruiter: recruiter.verdict,
      hiring_manager: hm.verdict,
      bar_raiser: br.verdict,
    },
    aggregate: aggRes,
    perPersona,
  });

  const outPath = join(
    REPO_ROOT,
    'tools',
    'panel-results',
    basename(args.report).replace(/\.(md|markdown)$/i, '') + '.jsonl',
  );
  appendJsonl(outPath, record);

  process.stdout.write(
    `\nVerdict: ${aggRes.verdict} (${aggRes.one_line})\n` +
    `Recruiter: ${recruiter.verdict.decision} (${recruiter.verdict.kill_reason ?? 'no kill reason'})\n` +
    `Cost: $${recruiter.metrics.cost_usd.toFixed(4)}  Latency: ${recruiter.metrics.latency_ms} ms\n` +
    `Cache: write=${recruiter.metrics.cache_creation_input_tokens} read=${recruiter.metrics.cache_read_input_tokens}\n` +
    `Output: ${outPath}\n`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    process.stderr.write(`[evaluate-panel] ${err.stack ?? err.message}\n`);
    process.exit(2);
  });
}
