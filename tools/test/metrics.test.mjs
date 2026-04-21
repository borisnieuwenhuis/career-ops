import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPanelRecord, appendJsonl } from '../lib/metrics.mjs';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('buildPanelRecord assembles the expected top-level shape', () => {
  const record = buildPanelRecord({
    reportPath: 'reports/046-synthesia-2026-04-20.md',
    model: 'claude-sonnet-4-6',
    personas: { recruiter: { decision: 'pass' } },
    aggregate: { verdict: 'incomplete_simulation', weakest_link: null },
    perPersona: [{ name: 'recruiter', input_tokens: 10, output_tokens: 5, cost_usd: 0.0001, latency_ms: 900 }],
  });

  assert.equal(record.report, 'reports/046-synthesia-2026-04-20.md');
  assert.equal(record.model, 'claude-sonnet-4-6');
  assert.match(record.timestamp, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(record.personas.recruiter.decision, 'pass');
  assert.equal(record.aggregate.verdict, 'incomplete_simulation');
  assert.equal(record.metrics.total_cost_usd, 0.0001);
  assert.equal(record.metrics.total_latency_ms, 900);
  assert.equal(record.metrics.per_persona.length, 1);
});

test('appendJsonl writes one line per call', () => {
  const dir = mkdtempSync(join(tmpdir(), 'panel-jsonl-'));
  const path = join(dir, 'out.jsonl');
  appendJsonl(path, { a: 1 });
  appendJsonl(path, { b: 2 });
  const lines = readFileSync(path, 'utf8').trim().split('\n');
  assert.equal(lines.length, 2);
  assert.deepEqual(JSON.parse(lines[0]), { a: 1 });
  assert.deepEqual(JSON.parse(lines[1]), { b: 2 });
  rmSync(dir, { recursive: true, force: true });
});
