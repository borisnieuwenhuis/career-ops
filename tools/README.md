# tools/evaluate-panel

A standalone Anthropic-SDK harness that runs Block H (the hiring-panel simulation) against an evaluation report. Three persona calls per run, deterministic aggregator, prompt caching, record-replay fixtures, and JSONL metrics output.

This directory lives on the `feat/path-b-evaluate-panel-harness` branch of Boris's career-ops fork. It is NOT part of upstream santifer/career-ops.

## What it does

For a given evaluation report (`reports/*.md`), the harness calls Claude Sonnet 4.6 three times (one per persona), gets schema-enforced structured output via tool-use, and writes a combined verdict to JSONL:

- **Recruiter (Persona 1):** 6-15 second screen. Hard filters: location, visa, YoE, salary. Output via `submit_recruiter_verdict` tool.
- **Hiring Manager (Persona 2):** 60-120 second deep-read. Technical depth, seniority calibration, IC-vs-we voice, three probing questions. Output via `submit_hiring_manager_verdict` tool.
- **Exec / Bar Raiser (Persona 3):** 3-5 minute bar-raiser review. Budget fit, retention risk, growth trajectory, culture flags, rationale. Output via `submit_exec_verdict` tool.

A deterministic aggregator combines the three verdicts into one of: `strong_apply`, `apply`, `apply_with_caveats`, `skip`. No LLM involvement in aggregation.

## Usage

    node tools/evaluate-panel.mjs --report reports/046-synthesia-2026-04-20.md

Flags:

- `--report <path>`            required, path to a `reports/*.md` file
- `--model <name>`             default `claude-sonnet-4-6`
- `--dry-run`                  print the prompt and exit without calling the API
- `--record-fixture <p>`       write raw Recruiter response to `<p>` (single-file, legacy)
- `--record-fixture-dir <dir>` write raw persona responses to `<dir>/{recruiter,hiring_manager,exec}.json`
- `--no-cache`                 disable prompt caching (for A/B cost measurement)
- `--help`

Requires `ANTHROPIC_API_KEY` in `.env` or environment.

## Tests

    node --test tools/test/

58 unit tests. No network. All SDK-touching tests replay from `tools/test/fixtures/panel-046/*.json`.

## Recording fixtures

When a persona system prompt, user-prompt builder, or tool schema changes in a way that shifts the response shape, re-record the full bundle:

    node tools/evaluate-panel.mjs \
      --report reports/046-synthesia-2026-04-20.md \
      --record-fixture-dir tools/test/fixtures/panel-046/

That writes `recruiter.json`, `hiring_manager.json`, and `exec.json`. Inspect, then commit. Replay tests run offline against the new bundle.

## Prompt caching

Each persona call splits its user message into two content blocks:

1. Cacheable prefix (`cache_control: { type: 'ephemeral' }`): CV + static framing.
2. Per-run tail: the specific report sections.

Cache keys include the system prompt, which differs per persona, so the three personas do NOT share a cache entry. Each writes its own ~3800-token prefix on first call and reads it on subsequent calls within the 5-minute ephemeral TTL.

Real walking-skeleton measurements on Sonnet 4.6:

- First full-panel call on a fresh CV: cache_write totals ~11700 tokens across three personas, cost ~0.08 to 0.10 USD.
- Second call within 5 minutes on the same CV: cache_read totals ~11700 tokens, cost roughly one-tenth per-persona.

Pass `--no-cache` to opt out for A/B cost comparison.

## Real outputs

Verified on two reports:

- **046 Synthesia (positive control, Principal ML Platform Engineer):** `strong_apply`. All three personas pass. Exec rationale caught the Amsterdam-vs-London remote-policy nuance. Cost 0.077 USD, latency 23 seconds.
- **047 Attio (negative control, Senior Platform Engineer):** `skip`, weakest_link `recruiter`. All three personas independently identified the same three hard blockers (location London-only, level over-leveled, comp below floor) plus K8s/Terraform technical gaps. Cost 0.100 USD, latency 33 seconds.

JSONL outputs are under `tools/panel-results/` (gitignored).

## Module map

- `evaluate-panel.mjs`                    CLI orchestration (arg parsing, dispatch, JSONL write).
- `lib/anthropic-client.mjs`              SDK wrapper, retries, tool-use extraction.
- `lib/cost.mjs`                          model pricing table, `computeCost(usage, model)`.
- `lib/metrics.mjs`                       panel record shape, JSONL appender.
- `lib/report-parser.mjs`                 markdown report parser (handles 39 real report variants).
- `lib/cv-loader.mjs`                     reads `cv.md` via the repo-root symlink.
- `lib/aggregator.mjs`                    pure verdict combiner, fails loud on malformed persona output.
- `lib/personas/recruiter.mjs`            Persona 1: 6-15 second screen, `submit_recruiter_verdict` tool.
- `lib/personas/hiring-manager.mjs`       Persona 2: 60-120 second read, `submit_hiring_manager_verdict` tool.
- `lib/personas/bar-raiser.mjs`           Persona 3: 3-5 minute bar-raiser review, `submit_exec_verdict` tool (tool name aligns with modes/oferta.md weakest_link label `exec`).

## Reliability

- Retry policy: max 3 attempts on 408/409/429/500/502/503/504/529, APIConnectionError, APIConnectionTimeoutError. Never retries on user abort or 4xx other than 408/409/429. SDK built-in retries are disabled (`maxRetries: 0`) to avoid compounding.
- The wrapper fails loudly on malformed tool-use responses (wrong `stop_reason`, missing tool block).
- Aggregator raises explicitly when any persona verdict is missing a `decision` field, rather than defaulting to `strong_apply`.
- CLI preflight: missing `ANTHROPIC_API_KEY`, unreadable `--report`, or malformed report all exit with code 1 and an actionable message. Only unexpected runtime errors exit with code 2.

## Not in this harness (intentionally)

- Batch mode across many reports.
- `--jd <path>` raw JD override (the report currently serves as the JD surrogate).
- Concurrency or rate-limit management across concurrent panel runs.
- Calibration against a golden dataset (separate follow-up task, see spec).

## Regenerating results

Real reports and panel results live in gitignored directories. Every developer records their own fixtures against their own CV.
