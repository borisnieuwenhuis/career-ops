import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCliArgs } from '../evaluate-panel.mjs';

test('parseCliArgs requires --report', () => {
  assert.throws(() => parseCliArgs([]), /--report is required/);
});

test('parseCliArgs picks up --report and defaults', () => {
  const a = parseCliArgs(['--report', 'reports/x.md']);
  assert.equal(a.report, 'reports/x.md');
  assert.equal(a.model, 'claude-sonnet-4-6');
  assert.equal(a.useCache, true);
  assert.equal(a.dryRun, false);
});

test('parseCliArgs honors --no-cache and --dry-run', () => {
  const a = parseCliArgs(['--report', 'r.md', '--no-cache', '--dry-run']);
  assert.equal(a.useCache, false);
  assert.equal(a.dryRun, true);
});

test('parseCliArgs honors --record-fixture', () => {
  const a = parseCliArgs(['--report', 'r.md', '--record-fixture', 'f.json']);
  assert.equal(a.recordFixture, 'f.json');
});

test('parseCliArgs honors --record-fixture-dir', () => {
  const a = parseCliArgs(['--report', 'r.md', '--record-fixture-dir', 'fixtures/']);
  assert.equal(a.recordFixtureDir, 'fixtures/');
});
