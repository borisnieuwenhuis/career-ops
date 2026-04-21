import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMessages, HIRING_MANAGER_TOOL, HIRING_MANAGER_SYSTEM } from '../lib/personas/hiring-manager.mjs';

test('HIRING_MANAGER_TOOL has the schema required by the spec', () => {
  assert.equal(HIRING_MANAGER_TOOL.name, 'submit_hiring_manager_verdict');
  const props = HIRING_MANAGER_TOOL.input_schema.properties;
  for (const key of ['decision', 'probing_questions', 'technical_depth_score', 'seniority_calibration', 'i_vs_we_ratio', 'risk_flags']) {
    assert.ok(props[key], `missing property ${key}`);
  }
  assert.deepEqual(props.decision.enum, ['pass', 'fail']);
  assert.deepEqual(props.seniority_calibration.enum, ['under_leveled', 'at_level', 'over_leveled']);
});

test('HIRING_MANAGER_SYSTEM mentions the 60-120 second budget', () => {
  assert.match(HIRING_MANAGER_SYSTEM, /60.{0,5}120 second/i);
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
  assert.match(joined, /fit text/);
  assert.equal(system, HIRING_MANAGER_SYSTEM);
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
