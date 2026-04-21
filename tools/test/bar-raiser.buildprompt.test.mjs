import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMessages, BAR_RAISER_TOOL, BAR_RAISER_SYSTEM } from '../lib/personas/bar-raiser.mjs';

test('BAR_RAISER_TOOL has the schema required by the spec', () => {
  assert.equal(BAR_RAISER_TOOL.name, 'submit_exec_verdict');
  const props = BAR_RAISER_TOOL.input_schema.properties;
  for (const key of ['decision', 'rationale', 'bar_raiser_signal', 'budget_fit', 'retention_risk', 'growth_trajectory_fit', 'culture_flags']) {
    assert.ok(props[key], `missing property ${key}`);
  }
  assert.deepEqual(props.decision.enum, ['go', 'go_if_fixed', 'no_go']);
  assert.deepEqual(props.bar_raiser_signal.enum, ['yes', 'no', 'maybe']);
  assert.deepEqual(props.budget_fit.enum, ['under', 'at', 'over']);
  assert.deepEqual(props.retention_risk.enum, ['low', 'medium', 'high']);
  assert.deepEqual(props.growth_trajectory_fit.enum, ['good', 'plateau', 'overshoot']);
});

test('BAR_RAISER_SYSTEM mentions "raise the bar"', () => {
  assert.match(BAR_RAISER_SYSTEM, /raise the bar/i);
});

test('buildMessages splits cacheable prefix from per-run tail', () => {
  const { messages, system } = buildMessages({
    cv: 'CV TEXT HERE',
    report: {
      header: { score: '4.2/5', url: 'https://x/y', legitimacy: 'green', date: '2026-04-20' },
      identity: { company: 'Example Corp', role: 'Staff Engineer' },
      sections: { A: 'fit text', B: 'risk text' },
    },
    profile: null,
    useCache: true,
  });

  assert.equal(messages.length, 1);
  assert.equal(messages[0].role, 'user');
  const blocks = messages[0].content;
  const cached = blocks.filter((b) => b.cache_control);
  assert.ok(cached.length >= 1, 'at least one block should have cache_control');
  const uncached = blocks.filter((b) => !b.cache_control);
  assert.ok(uncached.length >= 1, 'at least one block should be uncached');
  const joined = blocks.map((b) => b.text).join('\n');
  assert.match(joined, /CV TEXT HERE/);
  assert.match(joined, /Example Corp/);
  assert.equal(system, BAR_RAISER_SYSTEM);
});

test('buildMessages omits cache_control when useCache is false', () => {
  const { messages } = buildMessages({
    cv: 'x',
    report: { header: {}, identity: { company: 'C', role: 'R' }, sections: {} },
    profile: null,
    useCache: false,
  });
  const hasCache = messages[0].content.some((b) => b.cache_control);
  assert.equal(hasCache, false);
});
