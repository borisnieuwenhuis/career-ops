import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runBarRaiser } from '../lib/personas/bar-raiser.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = JSON.parse(
  readFileSync(join(__dirname, 'fixtures', 'panel-046', 'exec.json'), 'utf8'),
);

function stubClient(response) {
  return { async call() { return response; } };
}

const REPORT = {
  header: { score: '4.6/5', url: 'https://synthesia.example/jobs/1', legitimacy: 'green', date: '2026-04-20' },
  identity: { company: 'Synthesia', role: 'Principal ML Platform Engineer' },
  sections: { A: 'fit', B: 'risks', C: 'gaps', D: 'scope', E: 'comp', F: 'next', G: 'legit' },
};

test('runBarRaiser parses fixture into verdict and metrics', async () => {
  const client = stubClient(FIXTURE);
  const result = await runBarRaiser(
    client,
    { cv: 'cv text', report: REPORT, profile: null },
    { model: 'claude-sonnet-4-6', useCache: true },
  );

  assert.ok(['go', 'go_if_fixed', 'no_go'].includes(result.verdict.decision));
  assert.ok(typeof result.verdict.rationale === 'string');
  assert.ok(result.verdict.rationale.length > 0);
  assert.ok(['yes', 'no', 'maybe'].includes(result.verdict.bar_raiser_signal));
  assert.ok(['under', 'at', 'over'].includes(result.verdict.budget_fit));
  assert.ok(['low', 'medium', 'high'].includes(result.verdict.retention_risk));
  assert.ok(['good', 'plateau', 'overshoot'].includes(result.verdict.growth_trajectory_fit));
  assert.ok(Array.isArray(result.verdict.culture_flags));
  assert.equal(result.metrics.name, 'exec');
  assert.equal(typeof result.metrics.cost_usd, 'number');
});
