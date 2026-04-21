import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function buildPanelRecord({ reportPath, model, personas, aggregate, perPersona }) {
  const totalCost = perPersona.reduce((s, p) => s + (p.cost_usd ?? 0), 0);
  const totalLatency = perPersona.reduce((s, p) => s + (p.latency_ms ?? 0), 0);
  return {
    report: reportPath,
    timestamp: new Date().toISOString(),
    model,
    personas,
    aggregate,
    metrics: {
      total_cost_usd: totalCost,
      total_latency_ms: totalLatency,
      per_persona: perPersona,
    },
  };
}

export function appendJsonl(path, record) {
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, JSON.stringify(record) + '\n');
}
