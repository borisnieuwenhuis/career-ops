import { extractToolUse } from '../anthropic-client.mjs';
import { computeCost } from '../cost.mjs';

export const RECRUITER_SYSTEM = `You are a Talent Acquisition recruiter screening inbound candidates.

Context:
- You receive 150 to 300 CVs per role.
- Your time budget is 6 to 15 seconds per CV.
- You scan top-half only: summary, top two roles, skill list.
- You are a non-technical filter pass. You do NOT judge technical depth, that is the hiring manager's job.

Kill moments (in priority order):
1. Location mismatch.
2. Visa required but no work authorization visible.
3. Years of experience grossly off (senior role / junior CV, or overqualified).
4. Salary expectation out of band.
5. Zero JD keywords visible in the top half.
6. Formatting or readability issues.

Pass signals:
- First 50 words tell a clear story.
- Core stack keywords visible up top.
- Location, visa, availability obvious.
- Builder-of-X-at-scale or Led-Y-team-of-Z statements readable quickly.

You are given the candidate's CV, the evaluation report summarizing the role, and optional candidate profile details. Return your verdict using the submit_recruiter_verdict tool. Be honest. A fail is fine.`;

export const RECRUITER_TOOL = {
  name: 'submit_recruiter_verdict',
  description: 'Record the recruiter screen verdict for a single candidate.',
  input_schema: {
    type: 'object',
    required: ['decision', 'time_to_kill_sec', 'matched_keywords', 'hard_filter_status', 'confidence'],
    properties: {
      decision: { type: 'string', enum: ['pass', 'fail'] },
      time_to_kill_sec: { type: 'integer', minimum: 1, maximum: 15 },
      kill_reason: { type: ['string', 'null'] },
      matched_keywords: { type: 'array', items: { type: 'string' } },
      hard_filter_status: {
        type: 'object',
        required: ['location', 'visa', 'yoe', 'salary'],
        properties: {
          location: { type: 'string', enum: ['ok', 'fail'] },
          visa:     { type: 'string', enum: ['ok', 'fail', 'unknown'] },
          yoe:      { type: 'string', enum: ['ok', 'fail'] },
          salary:   { type: 'string', enum: ['ok', 'fail', 'unknown'] },
        },
      },
      confidence: { type: 'integer', minimum: 1, maximum: 5 },
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

  const prefix = `You are reviewing this candidate's CV plus the role context summary. Render your screen using the tool.

--- CANDIDATE CV (verbatim) ---
${cv}

--- ${profileText} ---`;

  const tail = `--- ROLE CONTEXT (the file you would see in the ATS) ---
${renderReport(report)}

Emit the verdict now via submit_recruiter_verdict.`;

  return {
    system: RECRUITER_SYSTEM,
    messages: [
      {
        role: 'user',
        content: [cacheable(prefix), { type: 'text', text: tail }],
      },
    ],
  };
}

export async function runRecruiter(client, inputs, { model = 'claude-sonnet-4-6', useCache = true, onRawResponse } = {}) {
  const { system, messages } = buildMessages({ ...inputs, useCache });
  const started = Date.now();
  const response = await client.call({
    model,
    max_tokens: 1500,
    temperature: 0.1,
    system,
    messages,
    tools: [RECRUITER_TOOL],
    tool_choice: { type: 'tool', name: RECRUITER_TOOL.name },
  });
  const latency_ms = Date.now() - started;
  if (typeof onRawResponse === 'function') onRawResponse(response);

  const verdict = extractToolUse(response, RECRUITER_TOOL.name);
  const usage = response.usage ?? {};
  const metrics = {
    name: 'recruiter',
    input_tokens: usage.input_tokens ?? 0,
    output_tokens: usage.output_tokens ?? 0,
    cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0,
    cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
    cost_usd: computeCost(usage, model),
    latency_ms,
  };
  return { verdict, rawResponse: response, metrics };
}
