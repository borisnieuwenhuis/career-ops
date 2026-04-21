import Anthropic, {
  APIConnectionError,
  APIUserAbortError,
} from '@anthropic-ai/sdk';

const RETRYABLE_STATUSES = new Set([408, 409, 429, 500, 502, 503, 504, 529]);
const RETRYABLE_CODES = new Set(['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN']);

function isRetryable(err) {
  if (err instanceof APIUserAbortError) return false;
  if (err?.name === 'APIUserAbortError') return false;
  if (err instanceof APIConnectionError) return true;
  if (err?.name === 'APIConnectionError' || err?.name === 'APIConnectionTimeoutError') return true;
  if (err?.status && RETRYABLE_STATUSES.has(err.status)) return true;
  if (err?.code && RETRYABLE_CODES.has(err.code)) return true;
  return false;
}

export async function runWithRetry(op, { maxAttempts = 3, baseDelayMs = 500 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await op();
    } catch (err) {
      lastErr = err;
      if (!isRetryable(err) || attempt === maxAttempts) throw err;
      // TODO: honor Retry-After header when server provides one (err.headers?.get?.('retry-after'))
      const jitter = Math.random() * baseDelayMs;
      const delay = baseDelayMs * 2 ** (attempt - 1) + jitter;
      process.stderr.write(
        `[anthropic-client] attempt ${attempt}/${maxAttempts} failed (${err.status ?? err.code ?? err.name}); retrying in ${Math.round(delay)}ms\n`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

export function extractToolUse(response, toolName) {
  if (response.stop_reason !== 'tool_use') {
    throw new Error(
      `Anthropic response did not end in tool_use (stop_reason=${response.stop_reason}). Prompt or tool schema drift.`,
    );
  }
  const block = response.content?.find(
    (b) => b.type === 'tool_use' && b.name === toolName,
  );
  if (!block) {
    throw new Error(`tool_use block for "${toolName}" missing from response.content`);
  }
  return block.input;
}

export function createClient({ apiKey }) {
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required (set in .env or environment).');
  }
  const sdk = new Anthropic({ apiKey, maxRetries: 0 });
  return {
    async call(request) {
      return runWithRetry(() => sdk.messages.create(request));
    },
  };
}
