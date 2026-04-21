import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractToolUse, runWithRetry } from '../lib/anthropic-client.mjs';

test('extractToolUse returns input when stop_reason is tool_use', () => {
  const resp = {
    stop_reason: 'tool_use',
    content: [
      { type: 'text', text: 'thinking...' },
      { type: 'tool_use', name: 'submit_recruiter_verdict', input: { decision: 'pass' } },
    ],
  };
  assert.deepEqual(extractToolUse(resp, 'submit_recruiter_verdict'), { decision: 'pass' });
});

test('extractToolUse throws loudly when stop_reason is not tool_use', () => {
  const resp = { stop_reason: 'end_turn', content: [{ type: 'text', text: 'x' }] };
  assert.throws(
    () => extractToolUse(resp, 'submit_recruiter_verdict'),
    /stop_reason=end_turn/,
  );
});

test('extractToolUse throws loudly when the named tool is missing', () => {
  const resp = {
    stop_reason: 'tool_use',
    content: [{ type: 'tool_use', name: 'other_tool', input: {} }],
  };
  assert.throws(
    () => extractToolUse(resp, 'submit_recruiter_verdict'),
    /tool_use block for "submit_recruiter_verdict" missing/,
  );
});

test('runWithRetry retries on 429 up to maxAttempts and eventually succeeds', async () => {
  let calls = 0;
  const op = async () => {
    calls++;
    if (calls < 3) {
      const e = new Error('rate_limited');
      e.status = 429;
      throw e;
    }
    return { ok: true };
  };
  const r = await runWithRetry(op, { maxAttempts: 3, baseDelayMs: 1 });
  assert.deepEqual(r, { ok: true });
  assert.equal(calls, 3);
});

test('runWithRetry fails fast on 400', async () => {
  const op = async () => {
    const e = new Error('bad request');
    e.status = 400;
    throw e;
  };
  await assert.rejects(
    runWithRetry(op, { maxAttempts: 3, baseDelayMs: 1 }),
    /bad request/,
  );
});

test('runWithRetry gives up after maxAttempts', async () => {
  let calls = 0;
  const op = async () => {
    calls++;
    const e = new Error('overloaded');
    e.status = 529;
    throw e;
  };
  await assert.rejects(
    runWithRetry(op, { maxAttempts: 3, baseDelayMs: 1 }),
    /overloaded/,
  );
  assert.equal(calls, 3);
});
