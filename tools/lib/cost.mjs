// Pricing verified 2026-04-21 against https://www.anthropic.com/pricing
export const PRICING = {
  'claude-sonnet-4-6': {
    input_usd_per_mtok: 3.0,
    output_usd_per_mtok: 15.0,
    cache_write_usd_per_mtok: 3.75,
    cache_read_usd_per_mtok: 0.3,
  },
};

export function computeCost(usage, model) {
  const p = PRICING[model];
  if (!p) {
    throw new Error(`Unknown model for cost calculation: ${model}`);
  }
  const input = (usage.input_tokens ?? 0) * p.input_usd_per_mtok;
  const output = (usage.output_tokens ?? 0) * p.output_usd_per_mtok;
  const cacheWrite = (usage.cache_creation_input_tokens ?? 0) * p.cache_write_usd_per_mtok;
  const cacheRead = (usage.cache_read_input_tokens ?? 0) * p.cache_read_usd_per_mtok;
  return (input + output + cacheWrite + cacheRead) / 1_000_000;
}
