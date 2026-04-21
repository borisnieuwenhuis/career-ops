import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runRecruiter } from '../lib/personas/recruiter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = JSON.parse(
  readFileSync(join(__dirname, 'fixtures', 'recruiter-046-synthesia.json'), 'utf8'),
);

function stubClient(response) {
  return { async call() { return response; } };
}

const REPORT = {
  header: { score: '4.6/5', url: 'https://synthesia.example/jobs/1', legitimacy: 'green', date: '2026-04-20' },
  identity: { company: 'Synthesia', role: 'Head of Applied AI' },
  sections: { A: 'fit', B: 'risks', C: 'gaps', D: 'scope', E: 'comp', F: 'next', G: 'legit' },
};

test('runRecruiter parses fixture into verdict and metrics', async () => {
  const client = stubClient(FIXTURE);
  const result = await runRecruiter(
    client,
    { cv: 'cv text', report: REPORT, profile: null },
    { model: 'claude-sonnet-4-6', useCache: true },
  );
  assert.ok(['pass', 'fail'].includes(result.verdict.decision));
  assert.equal(typeof result.metrics.cost_usd, 'number');
  assert.equal(result.metrics.name, 'recruiter');
  assert.ok(result.metrics.latency_ms >= 0);
  assert.equal(typeof result.metrics.input_tokens, 'number');
  assert.equal(typeof result.metrics.cache_creation_input_tokens, 'number');
});
