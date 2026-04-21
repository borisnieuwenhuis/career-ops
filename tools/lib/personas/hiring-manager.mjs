import { extractToolUse } from '../anthropic-client.mjs';
import { computeCost } from '../cost.mjs';

export const HIRING_MANAGER_SYSTEM = `You are the Hiring Manager (Engineering Manager for engineering roles, Product Lead for product roles, Design Director for design roles, etc.) deciding whether this candidate gets a phone screen.

Context:
- You have received 10 to 15 CVs shortlisted by the recruiter.
- Your time budget is 60 to 120 seconds per CV.
- You read the summary and the top 2 to 3 bullets per role, then scan the rest.
- You know the role intimately. You wrote or reviewed the JD.
- You care about technical depth and end-to-end ownership. Culture fit is someone else's call.

Kill moments (ordered by likelihood):
1. "Did you write the code or click the button?" Team-voice bullets with no "I built / I designed / I shipped" verbs.
2. Title inflation: CV claims Principal but bullets describe Senior IC work.
3. Stack depth shallow: candidate "used Kubernetes" with no scaling or incident or fix evidence.
4. Short tenures unexplained: 2 roles under 1 year with no context.
5. Metrics-free bullets: "large-scale", "mission-critical" with no numbers.
6. Seniority miscalibration: targeting Staff+ but CV reads as Senior, or vice versa.

Pass signals:
- Bullets in IC voice: "I designed the X", "I wrote the Y".
- Concrete metrics: req/s, users, dollars saved, p95 latency, team size.
- Architectural thinking visible: dark-launch, dual-write, zero-downtime migration, failure mode analysis.
- Adjacent-experience stories showing fast stack pickup.
- End-to-end ownership over a system, not just features.

You are given the candidate's CV, the evaluation report summarizing the role, and optional candidate profile details. Return your verdict using the submit_hiring_manager_verdict tool. Include three probing questions you would ask in a phone screen to test the weakest parts of the CV. Be honest. A fail is fine.`;

export const HIRING_MANAGER_TOOL = {
  name: 'submit_hiring_manager_verdict',
  description: 'Record the hiring manager screen verdict for a single candidate.',
  input_schema: {
    type: 'object',
    required: ['decision', 'probing_questions', 'technical_depth_score', 'seniority_calibration', 'i_vs_we_ratio', 'risk_flags'],
    properties: {
      decision: { type: 'string', enum: ['pass', 'fail'] },
      kill_reason: { type: ['string', 'null'] },
      probing_questions: {
        type: 'array',
        minItems: 3,
        maxItems: 3,
        items: { type: 'string' },
      },
      technical_depth_score: { type: 'integer', minimum: 1, maximum: 5 },
      seniority_calibration: { type: 'string', enum: ['under_leveled', 'at_level', 'over_leveled'] },
      i_vs_we_ratio: { type: 'integer', minimum: 1, maximum: 5 },
      risk_flags: {
        type: 'array',
        items: {
          type: 'string',
          enum: [
            'short_tenure_unexplained',
            'title_inflation',
            'metrics_absent',
            'stack_depth_shallow',
            'team_voice_bullets',
            'seniority_miscalibration',
          ],
        },
      },
    },
  },
};

function renderReport(report) {
  const { header, identity, sections } = report;
  const headerBits = [
    `Company: ${identity.company}`,
    `Role: ${identity.role}`,
    header.score && `Score: ${header.score}`,
    header.url && `URL: ${header.url}`,
    header.legitimacy && `Legitimacy: ${header.legitimacy}`,
    header.date && `Date: ${header.date}`,
  ].filter(Boolean).join('\n');
  const body = Object.entries(sections)
    .map(([k, v]) => `## ${k}\n${v}`)
    .join('\n\n');
  return `${headerBits}\n\n${body}`;
}

export function buildMessages({ cv, report, profile, useCache = true }) {
  const cacheable = (text) =>
    useCache
      ? { type: 'text', text, cache_control: { type: 'ephemeral' } }
      : { type: 'text', text };

  const profileText = profile
    ? `Candidate profile (supplemental):\n${JSON.stringify(profile, null, 2)}`
    : 'Candidate profile: not provided.';

  const prefix = `You are reviewing this candidate's CV plus the role context summary. Render your hiring-manager screen using the tool.

--- CANDIDATE CV (verbatim) ---
${cv}

--- ${profileText} ---`;

  const tail = `--- ROLE CONTEXT (the file the recruiter handed you) ---
${renderReport(report)}

Emit the verdict now via submit_hiring_manager_verdict.`;

  return {
    system: HIRING_MANAGER_SYSTEM,
    messages: [
      {
        role: 'user',
        content: [cacheable(prefix), { type: 'text', text: tail }],
      },
    ],
  };
}

export async function runHiringManager(client, inputs, { model = 'claude-sonnet-4-6', useCache = true, onRawResponse } = {}) {
  const { system, messages } = buildMessages({ ...inputs, useCache });
  const started = Date.now();
  const response = await client.call({
    model,
    max_tokens: 2000,
    temperature: 0.1,
    system,
    messages,
    tools: [HIRING_MANAGER_TOOL],
    tool_choice: { type: 'tool', name: HIRING_MANAGER_TOOL.name },
  });
  const latency_ms = Date.now() - started;
  if (typeof onRawResponse === 'function') onRawResponse(response);

  const verdict = extractToolUse(response, HIRING_MANAGER_TOOL.name);
  const usage = response.usage ?? {};
  const metrics = {
    name: 'hiring_manager',
    input_tokens: usage.input_tokens ?? 0,
    output_tokens: usage.output_tokens ?? 0,
    cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0,
    cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
    cost_usd: computeCost(usage, model),
    latency_ms,
  };
  return { verdict, rawResponse: response, metrics };
}
