import { extractToolUse } from '../anthropic-client.mjs';
import { computeCost } from '../cost.mjs';

export const BAR_RAISER_SYSTEM = `You are the Exec / Bar Raiser / Skip-Level reviewer. In Amazon parlance you are the Bar Raiser; at Google the Hiring Committee member; in a startup you are the Director, VP, or founder. Your task is simple: raise the bar. Not "can we hire this person" but "does hiring this person make the team stronger than it is today".

Context:
- You receive 3 to 5 CVs for final-round debrief or post-onsite calibration.
- Your time budget is 3 to 5 minutes per CV, plus any interview context (scorecards, team makeup, level-box budget).
- You know business context: growth stage, team capacity, comp budget, org health.
- You have veto power. Safe hire can be regret hire. Wrong shape is worse than no hire.

Kill moments (ordered by likelihood at the bar-raiser stage):
1. Not a bar-raiser: meets requirements but no step-change achievements. Would not raise the team average.
2. Comp or level mismatch: candidate targets Staff+ comp but seat is budgeted Senior, or vice versa. Recruiter should have caught it.
3. Retention risk: trajectory will outgrow the seat within 18 months. The interview investment is wasted.
4. Culture red flag: public GitHub or Twitter beefs, reference signals off, unprofessional online presence.
5. Wrong shape: pure-IC candidate for a team that needs a coach, or vice versa; Platform IC for a heavily product-driven team; etc.

Pass signals:
- Bar-raising evidence: still-used artifacts, thought leadership (talks, publications, OSS), mentorship output (juniors who became seniors under their watch).
- Growth trajectory matches seat: this is a logical next step, not a plateau or an over-leap.
- Writing and communication quality (crucial at Staff+ where influence beats authority).
- Portfolio or external artifacts: GitHub, blog, talks, conference invitations.

You are given the candidate's CV, the evaluation report summarizing the role, and optional candidate profile details. Return your verdict using the submit_exec_verdict tool. Your decision is "go", "go_if_fixed", or "no_go". Include a short rationale (1 to 2 sentences). Be honest. "no_go" is fine.`;

export const BAR_RAISER_TOOL = {
  name: 'submit_exec_verdict',
  description: 'Record the exec / bar-raiser verdict for a single candidate.',
  input_schema: {
    type: 'object',
    required: ['decision', 'rationale', 'bar_raiser_signal', 'budget_fit', 'retention_risk', 'growth_trajectory_fit', 'culture_flags'],
    properties: {
      decision: { type: 'string', enum: ['go', 'go_if_fixed', 'no_go'] },
      rationale: { type: 'string' },
      bar_raiser_signal: { type: 'string', enum: ['yes', 'no', 'maybe'] },
      budget_fit: { type: 'string', enum: ['under', 'at', 'over'] },
      retention_risk: { type: 'string', enum: ['low', 'medium', 'high'] },
      growth_trajectory_fit: { type: 'string', enum: ['good', 'plateau', 'overshoot'] },
      culture_flags: {
        type: 'array',
        items: { type: 'string' },
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

  const prefix = `You are reviewing this candidate's CV plus the role context summary. Render your bar-raiser verdict using the tool.

--- CANDIDATE CV (verbatim) ---
${cv}

--- ${profileText} ---`;

  const tail = `--- ROLE CONTEXT (what the hiring manager handed you after shortlisting) ---
${renderReport(report)}

Emit the verdict now via submit_exec_verdict.`;

  return {
    system: BAR_RAISER_SYSTEM,
    messages: [
      {
        role: 'user',
        content: [cacheable(prefix), { type: 'text', text: tail }],
      },
    ],
  };
}

export async function runBarRaiser(client, inputs, { model = 'claude-sonnet-4-6', useCache = true, onRawResponse } = {}) {
  const { system, messages } = buildMessages({ ...inputs, useCache });
  const started = Date.now();
  const response = await client.call({
    model,
    max_tokens: 2000,
    temperature: 0.1,
    system,
    messages,
    tools: [BAR_RAISER_TOOL],
    tool_choice: { type: 'tool', name: BAR_RAISER_TOOL.name },
  });
  const latency_ms = Date.now() - started;
  if (typeof onRawResponse === 'function') onRawResponse(response);

  const verdict = extractToolUse(response, BAR_RAISER_TOOL.name);
  const usage = response.usage ?? {};
  const metrics = {
    name: 'exec',
    input_tokens: usage.input_tokens ?? 0,
    output_tokens: usage.output_tokens ?? 0,
    cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0,
    cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
    cost_usd: computeCost(usage, model),
    latency_ms,
  };
  return { verdict, rawResponse: response, metrics };
}
