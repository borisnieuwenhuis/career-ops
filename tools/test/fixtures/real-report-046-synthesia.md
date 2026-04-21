# 046 — Synthesia — Principal ML Platform Engineer

**Company:** Synthesia
**Role:** Principal ML Platform Engineer (Europe)
**URL:** https://jobs.ashbyhq.com/synthesia/e9c63d3d-13cc-4049-ae0a-5fef402c595b
**Date:** 2026-04-20
**Arquetipo:** Principal/Staff (Platform / Infra) + Data-heavy Backend (hybrid, platform-dominant)
**Score:** 4.6/5
**Legitimacy:** High Confidence
**Verification:** unconfirmed (batch mode)
**PDF:** pending

---

## Block A — Role Summary

Principal IC on the ML Platform team. Builds the systems researchers and product teams use to train, serve, and deploy generative models: research infrastructure, production serving, internal tooling, platform interfaces. Explicit push toward agent-operable workflows. Heavy focus on reliability, scalability, performance, GPU scheduling, cost efficiency. The JD is unusually direct that this is NOT a pure ML role: "strong generalist with a systems mindset, comfortable across infrastructure, backend systems, and tooling, who has seen ML systems in practice." Hands-on, significant ownership, architectural decisions as the platform scales with model count and team count.

## Block B — Match con CV (4.8/5)

Extremely high alignment. The JD reads like a Principal platform-engineering role disguised as ML. Direct matches:

- **"Production systems with reliability, scalability, maintainability"** → Hyves 5000 req/s, 10M users, self-managed hardware pre-AWS (cv.md:80-89).
- **"Building internal platforms, developer tooling, infrastructure abstractions used by other engineers"** → Navan API framework used across integrations, TravelBird ES self-service tooling, CrunchDAO competition node framework with pluggable scorers (cv.md:23, 42, 53).
- **"Observability, debugging in distributed systems"** → New Relic adoption at Navan, TravelBird, CrunchDAO (cv.md:45, 58; achievements.md:6-7).
- **"Agentic or LLM-powered internal tools"** (bonus) → CrunchDAO operator platform with live anomaly detection on Redis Streams (cv.md:26).
- **"Python for backend systems and tooling"** → CrunchDAO FastAPI framework, Navan Python/Java stack.

Gaps: no direct Kubernetes or Terraform on CV, no GPU experience, no Temporal. These are learnable; the systems mindset is the harder thing and Boris has it in depth.

## Block C — North Star Alignment (5/5)

Matches "Principal/Staff Engineer (Platform / Infra)" primary archetype exactly. Title is literally "Principal." Hands-on IC with ownership, no management framing. Scope is platform engineering under real production load (generative model serving is latency and cost sensitive). Dark-launch / zero-downtime migration muscle applies directly to evolving a serving platform without breaking research workflows.

## Block D — Comp (3.8/5, provisional)

JD does not disclose comp. Synthesia is London HQ, Series E at $4B valuation, $200M recent raise. UK Principal Platform Engineer band at well-funded scaleups typically £150K-£220K base + meaningful equity. For EU-remote adjustment this usually lands £130K-£190K. Converted to EUR at current rates: roughly €155K-€225K, which overlaps Boris's €140K-€200K target well. Equity at a $4B late-stage private company has real but uncertain liquidity value. Budget 3.8 until comp is confirmed; upgrade to 4.5+ if the offer is in the €170K+ range with serious equity.

## Block E — Cultural Signals (4.5/5)

Positive: Series E, well-funded, Nvidia's VC arm on the cap table (strategic for GPU access), Fortune 100 enterprise customers, 90%+ F100 penetration, profitable trajectory rumored. The JD is unusually well-written, technically specific, and calibrated (explicit "not a pure ML Engineer" signals a thoughtful hiring manager). Attracts the right candidates. Concerns: London HQ with "Europe" posting means the remote/hybrid policy must be verified before first call. Synthesia has previously required London hybrid for some roles. If this one is London hybrid 2-3 days/week, score drops to 3.0 (disqualifier per location policy).

## Block F — STAR+R Stories

1. **Platform scale under real load (Hyves, Principal/Platform)**
   **S:** Dutch social network pre-AWS, 5000 req/s, 10M users on self-managed hardware, site falling over.
   **T:** Keep the site up while the team reshaped the core data layer.
   **A:** Rewrote the DB access layer, introduced ORM, added master-slave replication, functionally partitioned DBs, sharded pictures DB, guarded every risky feature with memcached kill-switches.
   **R:** Site scaled past 10M users without a rewrite, never took a big-bang outage.
   **Reflection:** The instinct to avoid big-bang migrations and always carry a kill-switch is exactly what a generative-model serving platform needs.

2. **Zero-downtime migration on a production platform (Navan, Platform/Infra)**
   **S:** Monolith shared by 4-5 product teams; any team's bug could roll back everyone's deploy.
   **T:** Extract user/profile into its own microservice without breaking any caller.
   **A:** Dual-write pattern with gradual traffic shift and rollback flags, deploy-pipeline isolation per team.
   **R:** Zero downtime, user/profile team got its own release cadence, pattern reused for other extractions.
   **Reflection:** Migrating a serving platform across model versions is the same shape: dual-write, gradual shift, reversible at every step.

3. **Dark-launch for correctness (Navan, Data-heavy Backend)**
   **S:** Reporting was too slow on direct DB queries; had to replace it with Elasticsearch without a correctness regression.
   **T:** Validate the new system against every real production query before cutting over.
   **A:** Fired every production query against both systems in parallel, compared results, logged deltas, fixed, repeated until clean.
   **R:** Foundation for COVID reports, traveler safety, spending insights. No correctness incidents at cutover.
   **Reflection:** Same pattern applies to a model-serving platform migration: shadow traffic, compare outputs, then shift.

4. **Self-service platform for non-engineers (CrunchDAO, Platform/Tooling)**
   **S:** Small team, many competition types, no appetite to write custom code per competition.
   **T:** Make new competitions launchable without engineering involvement.
   **A:** Built a Python/FastAPI framework with pluggable scorers, configurable leaderboard components, standardized feed integration.
   **R:** New competition types ship without engineering code changes.
   **Reflection:** The platform-as-product mindset (researchers and agents as customers) maps 1:1 to the Synthesia JD.

5. **Live anomaly detection on a real-time data stream (CrunchDAO, Observability/Streams)**
   **S:** High-frequency trading competition with live operator platform.
   **T:** Surface anomalies in the incoming stream in near-real-time.
   **A:** Ingested Redis Streams, wrote anomaly detection, pushed to a graph-rendering frontend with near-zero latency. Selected the graphing library, built the full backend, delivered the frontend PoC.
   **R:** Operators could see anomalies live during the competition.
   **Reflection:** ML workload monitoring (GPU saturation, serving tail latency, token throughput drift) is the same problem shape.

## Block G — Posting Legitimacy: High Confidence

Signals reviewed:

- **Ashby posting** on a recognized company page. Direct URL, not an aggregator.
- **Specific and well-written JD** calibrated to exclude pure ML engineers; clear scope, non-generic bonus list (Temporal, Datadog, Terraform). Specificity is a strong positive signal.
- **Active company hiring cycle** post Series E, consistent with scaling platform teams.
- **Legitimate omission** of comp: UK-based employer, not a jurisdiction requiring disclosure.
- **Location "Europe"** is unusually broad but consistent with a distributed-team posting; not a ghost-job signal by itself.

No concerning patterns. Recommend the user confirm on the first call that (a) the role is truly remote-EU, not London hybrid, and (b) compensation band matches the €140K-€200K EUR target.

---

## Recommendation

**Apply.** This is the strongest platform match seen in the pipeline. Prioritize ahead of other open applications.

Before first call, confirm:
1. Remote EU policy vs London hybrid (location policy gate).
2. Base comp band in EUR/GBP.
3. Equity structure at current $4B valuation.
4. Team size and the specific platform's current pain points (scheduling? serving? observability?).
