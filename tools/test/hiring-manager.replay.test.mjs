import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runHiringManager } from '../lib/personas/hiring-manager.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = JSON.parse(
  readFileSync(join(__dirname, 'fixtures', 'panel-046', 'hiring_manager.json'), 'utf8'),
);

function stubClient(response) {
  return { async call() { return response; } };
}

const REPORT = {
  header: { score: '4.6/5', url: 'https://synthesia.example/jobs/1', legitimacy: 'green', date: '2026-04-20' },
  identity: { company: 'Synthesia', role: 'Principal ML Platform Engineer' },
  sections: { A: 'fit', B: 'risks', C: 'gaps', D: 'scope', E: 'comp', F: 'next', G: 'legit' },
};

test('runHiringManager parses fixture into verdict and metrics', async () => {
  const client = stubClient(FIXTURE);
  const result = await runHiringManager(
    client,
    { cv: 'cv text', report: REPORT, profile: null },
    { model: 'claude-sonnet-4-6', useCache: true },
  );

  assert.ok(['pass', 'fail'].includes(result.verdict.decision));
  assert.ok(Array.isArray(result.verdict.probing_questions));
  assert.equal(result.verdict.probing_questions.length, 3);
  assert.ok(['under_leveled', 'at_level', 'over_leveled'].includes(result.verdict.seniority_calibration));
  assert.ok(typeof result.verdict.technical_depth_score === 'number');
  assert.ok(Array.isArray(result.verdict.risk_flags));
  assert.equal(result.metrics.name, 'hiring_manager');
  assert.equal(typeof result.metrics.cost_usd, 'number');
  assert.ok(result.metrics.latency_ms >= 0);
});
