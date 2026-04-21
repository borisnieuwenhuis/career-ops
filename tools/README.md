# tools/evaluate-panel (Path B walking skeleton)

A standalone Anthropic-SDK harness that runs Block H (the hiring-panel simulation) against an evaluation report. This directory stays on the `feat/path-b-evaluate-panel-harness` branch of the fork. It is NOT for upstream santifer/career-ops.

## Scope (walking skeleton)

- Persona 1 (Recruiter) runs end-to-end via `@anthropic-ai/sdk` with tool-use.
- Personas 2 (Hiring Manager) and 3 (Bar Raiser) are stubbed.
- Input: a single report file via `--report`.
- Output: JSONL under `tools/panel-results/` (gitignored).
- Metrics: input/output/cache-creation/cache-read tokens, cost USD, latency ms.

## Usage

    node tools/evaluate-panel.mjs --report reports/046-synthesia-2026-04-20.md

Flags:

- `--report <path>`        required, path to a `reports/*.md` file
- `--model <name>`         default `claude-sonnet-4-6`
- `--dry-run`              print the prompt and exit without calling the API
- `--record-fixture <p>`   write raw Anthropic response JSON to `<p>` (used for test fixtures)
- `--no-cache`             disable prompt caching (for A/B cost measurement)
- `--help`

Requires `ANTHROPIC_API_KEY` in `.env` or environment.

## Tests

    node --test tools/test/

No network. All SDK-touching tests replay from `tools/test/fixtures/*.json`.

## Recording a fixture

When the Recruiter system prompt, user-prompt builder, or tool schema changes in a way that shifts the response shape, re-record the fixture:

    node tools/evaluate-panel.mjs \
      --report reports/046-synthesia-2026-04-20.md \
      --record-fixture tools/test/fixtures/recruiter-046-synthesia.json

Inspect the JSON, then commit. The replay test then runs offline against the new fixture.

## Prompt caching

The Recruiter persona splits its user message into two content blocks:

1. Cacheable prefix (`cache_control: { type: 'ephemeral' }`): system prompt, CV, static framing.
2. Per-run tail: the specific report sections.

On the first call per cacheable prefix, the prefix tokens are billed at the cache-write rate and stored (5-minute TTL). Subsequent calls that share the prefix read it at the cache-read rate (about one-tenth the cost of cache-write).

Real walking-skeleton measurement against report 046 on Sonnet 4.6:

- First call: cache_creation_input_tokens=3768, cache_read_input_tokens=0, cost=0.024 USD.
- Second call within 5 minutes: cache_creation_input_tokens=0, cache_read_input_tokens=3768, cost=0.011 USD (54% cheaper).

Pass `--no-cache` to opt out for A/B comparison.

## Module map

- `evaluate-panel.mjs`           CLI orchestration (arg parsing, dispatch, JSONL write).
- `lib/anthropic-client.mjs`     SDK wrapper, retries, tool-use extraction.
- `lib/cost.mjs`                 model pricing table, `computeCost(usage, model)`.
- `lib/metrics.mjs`              panel record shape, JSONL appender.
- `lib/report-parser.mjs`        markdown report parser (handles multiple H1 shapes).
- `lib/cv-loader.mjs`            reads `cv.md` via the repo-root symlink.
- `lib/aggregator.mjs`           pure verdict combiner, stub-aware.
- `lib/personas/recruiter.mjs`   Persona 1: system prompt, tool schema, runner.
- `lib/personas/hiring-manager.mjs`   stub.
- `lib/personas/bar-raiser.mjs`       stub (verdict label is `exec` per modes/oferta.md alignment).

## Not in walking skeleton (intentionally)

- Batch mode across many reports.
- `--jd <path>` raw JD override.
- Concurrency or rate-limit management.
- Calibration against golden dataset.

See the follow-up tasks in `career-ops-data/docs/plans/2026-04-21-block-h-hiring-panel-spec.md` for the broader roadmap.

## Reliability notes

- Retry policy: max 3 attempts on 408/409/429/500/502/503/504/529, APIConnectionError, APIConnectionTimeoutError. Never retries on user abort or 4xx other than 408/409/429. SDK built-in retries are disabled (`maxRetries: 0`) to avoid compounding.
- The wrapper fails loudly on malformed tool-use responses (wrong `stop_reason`, missing tool block).
- Aggregator raises explicitly when any persona verdict is missing a `decision` field, rather than defaulting to `strong_apply`.

## Regenerating results

Real reports and panel results live in gitignored directories. Every developer records their own fixtures against their own CV.
