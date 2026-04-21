import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeCost, PRICING } from '../lib/cost.mjs';

test('Sonnet 4.6 pricing constants are present', () => {
  const p = PRICING['claude-sonnet-4-6'];
  assert.equal(typeof p.input_usd_per_mtok, 'number');
  assert.equal(typeof p.output_usd_per_mtok, 'number');
  assert.equal(typeof p.cache_read_usd_per_mtok, 'number');
  assert.equal(typeof p.cache_write_usd_per_mtok, 'number');
});

test('computeCost sums all four token classes correctly', () => {
  const usage = {
    input_tokens: 1_000_000,
    output_tokens: 1_000_000,
    cache_creation_input_tokens: 1_000_000,
    cache_read_input_tokens: 1_000_000,
  };
  const p = PRICING['claude-sonnet-4-6'];
  const expected =
    p.input_usd_per_mtok +
    p.output_usd_per_mtok +
    p.cache_write_usd_per_mtok +
    p.cache_read_usd_per_mtok;
  assert.equal(computeCost(usage, 'claude-sonnet-4-6'), expected);
});

test('computeCost throws loudly on unknown model', () => {
  assert.throws(
    () => computeCost({ input_tokens: 1 }, 'not-a-real-model'),
    /Unknown model/,
  );
});

test('computeCost handles missing cache counters as zero', () => {
  const usage = { input_tokens: 1_000_000, output_tokens: 0 };
  const p = PRICING['claude-sonnet-4-6'];
  assert.equal(computeCost(usage, 'claude-sonnet-4-6'), p.input_usd_per_mtok);
});
