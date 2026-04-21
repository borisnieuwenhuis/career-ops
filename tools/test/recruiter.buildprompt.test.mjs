import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMessages, RECRUITER_TOOL, RECRUITER_SYSTEM } from '../lib/personas/recruiter.mjs';

test('RECRUITER_TOOL has the schema required by the spec', () => {
  assert.equal(RECRUITER_TOOL.name, 'submit_recruiter_verdict');
  const props = RECRUITER_TOOL.input_schema.properties;
  for (const key of ['decision', 'time_to_kill_sec', 'matched_keywords', 'hard_filter_status', 'confidence']) {
    assert.ok(props[key], `missing property ${key}`);
  }
  assert.deepEqual(RECRUITER_TOOL.input_schema.properties.decision.enum, ['pass', 'fail']);
});

test('RECRUITER_SYSTEM mentions the 6-15 second budget', () => {
  assert.match(RECRUITER_SYSTEM, /6.{0,5}15 second/i);
});

test('buildMessages splits cacheable prefix from per-run tail', () => {
  const { messages, system } = buildMessages({
    cv: 'CV TEXT HERE',
    report: {
      header: { score: '4.2/5', url: 'https://x/y', legitimacy: 'green', date: '2026-04-20' },
      identity: { company: 'Example Corp', role: 'Staff Engineer' },
      sections: { A: 'fit text', B: 'risk text' },
    },
    profile: { location: 'Amsterdam', visa: 'EU citizen' },
    useCache: true,
  });

  assert.equal(messages.length, 1);
  assert.equal(messages[0].role, 'user');
  const blocks = messages[0].content;
  assert.ok(Array.isArray(blocks));
  const cached = blocks.filter((b) => b.cache_control);
  assert.ok(cached.length >= 1, 'at least one block should have cache_control');
  const uncached = blocks.filter((b) => !b.cache_control);
  assert.ok(uncached.length >= 1, 'at least one block should be uncached (the per-run tail)');
  const joined = blocks.map((b) => b.text).join('\n');
  assert.match(joined, /CV TEXT HERE/);
  assert.match(joined, /Example Corp/);
  assert.match(joined, /fit text/);
  assert.equal(system, RECRUITER_SYSTEM);
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
