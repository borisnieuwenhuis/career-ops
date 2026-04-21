import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregate } from '../lib/aggregator.mjs';

const STUB = { decision: 'stub' };

test('any stub persona yields incomplete_simulation', () => {
  const r = aggregate({ decision: 'pass' }, STUB, STUB);
  assert.equal(r.verdict, 'incomplete_simulation');
  assert.equal(r.weakest_link, null);
});

test('recruiter fail yields skip', () => {
  const r = aggregate(
    { decision: 'fail', kill_reason: 'location mismatch' },
    { decision: 'pass' },
    { decision: 'go' },
  );
  assert.equal(r.verdict, 'skip');
  assert.equal(r.weakest_link, 'recruiter');
});

test('hiring manager fail yields apply_with_caveats', () => {
  const r = aggregate(
    { decision: 'pass' },
    { decision: 'fail', kill_reason: 'metrics absent' },
    { decision: 'go' },
  );
  assert.equal(r.verdict, 'apply_with_caveats');
  assert.equal(r.weakest_link, 'hiring_manager');
});

test('bar raiser no_go yields apply', () => {
  const r = aggregate(
    { decision: 'pass' },
    { decision: 'pass' },
    { decision: 'no_go', rationale: 'not a bar raiser' },
  );
  assert.equal(r.verdict, 'apply');
  assert.equal(r.weakest_link, 'bar_raiser');
});

test('bar raiser go_if_fixed yields apply', () => {
  const r = aggregate(
    { decision: 'pass' },
    { decision: 'pass' },
    { decision: 'go_if_fixed', rationale: 'fix bullet X' },
  );
  assert.equal(r.verdict, 'apply');
  assert.equal(r.weakest_link, 'bar_raiser');
});

test('all pass yields strong_apply', () => {
  const r = aggregate(
    { decision: 'pass' },
    { decision: 'pass' },
    { decision: 'go' },
  );
  assert.equal(r.verdict, 'strong_apply');
  assert.equal(r.weakest_link, null);
});
