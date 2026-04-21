# Modo: oferta — Evaluación Completa A-H

Cuando el candidato pega una oferta (texto o URL), entregar SIEMPRE los 8 bloques (A-F evaluation + G legitimacy + H hiring panel simulation):

## Paso 0 — Detección de Arquetipo

Clasificar la oferta en uno de los 6 arquetipos (ver `_shared.md`). Si es híbrido, indicar los 2 más cercanos. Esto determina:
- Qué proof points priorizar en bloque B
- Cómo reescribir el summary en bloque E
- Qué historias STAR preparar en bloque F

## Bloque A — Resumen del Rol

Tabla con:
- Arquetipo detectado
- Domain (platform/agentic/LLMOps/ML/enterprise)
- Function (build/consult/manage/deploy)
- Seniority
- Remote (full/hybrid/onsite)
- Team size (si se menciona)
- TL;DR en 1 frase

## Bloque B — Match con CV

Lee `cv.md`. Crea tabla con cada requisito del JD mapeado a líneas exactas del CV.

**Adaptado al arquetipo:**
- Si FDE → priorizar proof points de delivery rápida y client-facing
- Si SA → priorizar diseño de sistemas e integrations
- Si PM → priorizar product discovery y métricas
- Si LLMOps → priorizar evals, observability, pipelines
- Si Agentic → priorizar multi-agent, HITL, orchestration
- Si Transformation → priorizar change management, adoption, scaling

Sección de **gaps** con estrategia de mitigación para cada uno. Para cada gap:
1. ¿Es un hard blocker o un nice-to-have?
2. ¿Puede el candidato demostrar experiencia adyacente?
3. ¿Hay un proyecto portfolio que cubra este gap?
4. Plan de mitigación concreto (frase para cover letter, proyecto rápido, etc.)

## Bloque C — Nivel y Estrategia

1. **Nivel detectado** en el JD vs **nivel natural del candidato para ese arquetipo**
2. **Plan "vender senior sin mentir"**: frases específicas adaptadas al arquetipo, logros concretos a destacar, cómo posicionar la experiencia de founder como ventaja
3. **Plan "si me downlevelan"**: aceptar si comp es justa, negociar review a 6 meses, criterios de promoción claros

## Bloque D — Comp y Demanda

Usar WebSearch para:
- Salarios actuales del rol (Glassdoor, Levels.fyi, Blind)
- Reputación de compensación de la empresa
- Tendencia de demanda del rol

Tabla con datos y fuentes citadas. Si no hay datos, decirlo en vez de inventar.

## Bloque E — Plan de Personalización

| # | Sección | Estado actual | Cambio propuesto | Por qué |
|---|---------|---------------|------------------|---------|
| 1 | Summary | ... | ... | ... |
| ... | ... | ... | ... | ... |

Top 5 cambios al CV + Top 5 cambios a LinkedIn para maximizar match.

## Bloque F — Plan de Entrevistas

6-10 historias STAR+R mapeadas a requisitos del JD (STAR + **Reflection**):

| # | Requisito del JD | Historia STAR+R | S | T | A | R | Reflection |
|---|-----------------|-----------------|---|---|---|---|------------|

The **Reflection** column captures what was learned or what would be done differently. This signals seniority — junior candidates describe what happened, senior candidates extract lessons.

**Story Bank:** If `interview-prep/story-bank.md` exists, check if any of these stories are already there. If not, append new ones. Over time this builds a reusable bank of 5-10 master stories that can be adapted to any interview question.

**Seleccionadas y enmarcadas según el arquetipo:**
- FDE → enfatizar velocidad de entrega y client-facing
- SA → enfatizar decisiones de arquitectura
- PM → enfatizar discovery y trade-offs
- LLMOps → enfatizar métricas, evals, production hardening
- Agentic → enfatizar orchestration, error handling, HITL
- Transformation → enfatizar adopción, cambio organizacional

Incluir también:
- 1 case study recomendado (cuál de sus proyectos presentar y cómo)
- Preguntas red-flag y cómo responderlas (ej: "¿por qué vendiste tu empresa?", "¿tienes equipo de reports?")

## Bloque G — Posting Legitimacy

Analyze the job posting for signals that indicate whether this is a real, active opening. This helps the user prioritize their effort on opportunities most likely to result in a hiring process.

**Ethical framing:** Present observations, not accusations. Every signal has legitimate explanations. The user decides how to weigh them.

### Signals to analyze (in order):

**1. Posting Freshness** (from Playwright snapshot, already captured in Paso 0):
- Date posted or "X days ago" -- extract from page
- Apply button state (active / closed / missing / redirects to generic page)
- If URL redirected to generic careers page, note it

**2. Description Quality** (from JD text):
- Does it name specific technologies, frameworks, tools?
- Does it mention team size, reporting structure, or org context?
- Are requirements realistic? (years of experience vs technology age)
- Is there a clear scope for the first 6-12 months?
- Is salary/compensation mentioned?
- What ratio of the JD is role-specific vs generic boilerplate?
- Any internal contradictions? (entry-level title + staff requirements, etc.)

**3. Company Hiring Signals** (2-3 WebSearch queries, combine with Block D research):
- Search: `"{company}" layoffs {year}` -- note date, scale, departments
- Search: `"{company}" hiring freeze {year}` -- note any announcements
- If layoffs found: are they in the same department as this role?

**4. Reposting Detection** (from scan-history.tsv):
- Check if company + similar role title appeared before with a different URL
- Note how many times and over what period

**5. Role Market Context** (qualitative, no additional queries):
- Is this a common role that typically fills in 4-6 weeks?
- Does the role make sense for this company's business?
- Is the seniority level one that legitimately takes longer to fill?

### Output format:

**Assessment:** One of three tiers:
- **High Confidence** -- Multiple signals suggest a real, active opening
- **Proceed with Caution** -- Mixed signals worth noting
- **Suspicious** -- Multiple ghost job indicators, investigate before investing time

**Signals table:** Each signal observed with its finding and weight (Positive / Neutral / Concerning).

**Context Notes:** Any caveats (niche role, government job, evergreen position, etc.) that explain potentially concerning signals.

### Edge case handling:
- **Government/academic postings:** Longer timelines are standard. Adjust thresholds (60-90 days is normal).
- **Evergreen/continuous hire postings:** If the JD explicitly says "ongoing" or "rolling," note it as context -- this is not a ghost job, it is a pipeline role.
- **Niche/executive roles:** Staff+, VP, Director, or highly specialized roles legitimately stay open for months. Adjust age thresholds accordingly.
- **Startup / pre-revenue:** Early-stage companies may have vague JDs because the role is genuinely undefined. Weight description vagueness less heavily.
- **No date available:** If posting age cannot be determined and no other signals are concerning, default to "Proceed with Caution" with a note that limited data was available. NEVER default to "Suspicious" without evidence.
- **Recruiter-sourced (no public posting):** Freshness signals unavailable. Note that active recruiter contact is itself a positive legitimacy signal.

## Bloque H — Hiring Panel Simulation

Simulate how three different people in the real hiring funnel would actually evaluate this candidate against this JD. Each persona reads **independently** without seeing the others' decisions. The point is to expose kill-moments the advocate-brained Block B-F analysis hides.

The funnel is not symmetric. Most CVs never reach the hiring manager; most who reach the HM never reach the exec. Each persona has a distinct time budget, distinct attention model, and distinct kill criteria.

### Inputs
- The JD being evaluated (the same one Blocks A-G used)
- `cv.md` (the candidate's CV)
- `_profile.md` (candidate's positioning, narrative, comp targets)
- Blocks A-F output (so each persona has the same context the real person would have — recruiter sees summary + top-half; HM sees depth; exec sees everything)

### Persona 1 — Recruiter (Talent Acquisition)

**Who:** Non-technical sourcer, talent partner, or in-house recruiter. In small startups this is often the People Ops person. In large companies this is a dedicated TA function.

**Context:** 150-300 CVs in the funnel for one role. Doing first-pass filtering. ATS has already done a keyword-level pre-filter.

**Time budget:** 6-15 seconds per CV. Scans CV top-half only (summary + top 2 roles + skill list). Rarely reads more.

**Kill heuristics (in order of speed):**
1. Location mismatch with JD stated location: kill in 1-2 sec
2. Visa / work-authorization mismatch: kill in 2-3 sec
3. Years-of-experience grossly off (senior role / junior CV, or overqualified): kill in ~5 sec
4. Salary expectation outside band (only if known from prior screening): instant
5. Zero JD-keywords visible in top-half: kill in ~8 sec
6. Formatting / readability problems (walls of text, no metrics): goodwill drops fast, kill in 3-10 sec

**Pass signals:**
- First 50 words of summary tell a clear story
- Core stack keywords from JD visible in opening
- "Builder of X at scale" or "Led Y team of Z" readable in headline
- Location / visa / availability unambiguous enough to forward

**Does NOT:**
- Read bullets deeply
- Judge technical depth
- Make culture-fit calls (that's the HM's job)

**Produce output in this exact format:**

```markdown
### Recruiter (10-sec screen)
- **Decision:** pass | fail
- **Time to kill:** {1-15} sec
- **Kill reason:** {one sentence, or "none — forwarded to HM"}
- **Matched keywords:** [list of 3-8 JD keywords found in CV top-half]
- **Hard filters:**
  - Location: ok | fail
  - Visa: ok | fail | unknown
  - YoE: ok | fail
  - Salary band: ok | fail | unknown
- **Confidence:** {1-5} — how sure the recruiter is without reading deeper
```

### Persona 2 — Hiring Manager (for engineering: Engineering Manager)

**Who:** The person who will directly manage the hire. Technical. Wrote or reviewed the JD. Knows exactly what they need on the team, often more specifically than the JD states.

**Context:** 10-15 CVs shortlisted by the recruiter. Decides phone-screen yes/no.

**Time budget:** 60-120 seconds per CV. Reads summary + top 2-3 bullets per role, scans the rest for red flags.

**Kill heuristics:**
1. "Did you write the code or click the button?" — team-voice bullets with no "I built / I designed / I shipped" language. Lost trust in ~30 sec.
2. Title inflation — CV says Principal but bullets describe Senior IC work without architectural scope or leveraged impact. Kill in ~45 sec.
3. Stack-depth shallow — CV lists the stack but can't find evidence of real work with it ("used Kubernetes" with no scaling / fixing / designing story). Kill in ~60 sec.
4. Short tenures unexplained — two consecutive roles under 1 year with no context. Triggers job-hopper heuristic. Kill in ~30 sec.
5. Metrics-free bullets — "large-scale", "mission-critical", "cutting-edge" without numbers. Kill in ~60 sec.
6. Seniority miscalibration — clearly over-leveled (flight risk) or under-leveled (not ready).

**Pass signals:**
- Bullets in IC voice: "I designed the X", "I wrote the Y"
- Concrete metrics: req/s, users, $ saved, p95 latency, team size
- Architectural thinking visible: dark-launch, dual-write, zero-downtime migration, canary rollouts, feature flags
- Adjacent-experience stories showing fast stack pickup
- End-to-end ownership over a system, not just feature-level work

**Produce output in this exact format:**

```markdown
### Hiring Manager (60-120 sec deep scan)
- **Decision:** pass | fail
- **Kill reason:** {one sentence, or "none — invite to phone screen"}
- **Probing questions (what they'd ask in the phone screen):**
  1. {specific to this CV}
  2. {specific to this CV}
  3. {specific to this CV}
- **Technical depth score:** {1-5}
- **Seniority calibration:** under_leveled | at_level | over_leveled
- **I-vs-we ratio:** {1-5} — how often "I built" vs team-voice vs passive voice
- **Risk flags:** [short_tenure_unexplained | title_inflation | metrics_absent | stack_depth_shallow | seniority_mismatch | ...]
```

### Persona 3 — Skip-Level / Bar Raiser / Panel Reviewer

**Who:** Director, VP, Amazon-style Bar Raiser, Google-style Hiring Committee member, or in startups the CTO / founder. Sees the CV late in the process (final round debrief or calibration).

**Context:** 3-5 CVs in final rounds. Their task is not "can we hire this person" but "does this person raise the bar — make the team stronger than it currently is". Hires that are merely competent cost the team over 1-2 years.

**Time budget:** 3-5 minutes per CV, but with full context: interview scorecards, team composition, level-budget for the role.

**Kill heuristics:**
1. Not a bar-raiser — meets every requirement but no step-change achievement. Safe hire = regret hire in 12 months.
2. Comp / level mismatch — candidate wants Staff+ comp, budget is Senior. Recruiter should have caught this earlier; flag now.
3. Retention risk — trajectory suggests the candidate will outgrow the seat within 18 months. Investment wasted.
4. Culture red flags — public GitHub/Twitter beefs, reference signal off, visible conflict history.
5. "Wrong shape" for the seat — skills match but career arc is fundamentally off (e.g., Platform IC for a heavily product-driven team).

**Pass signals:**
- Bar-raising evidence: still-used artifacts, talks / publications / OSS, mentorship output (juniors now seniors elsewhere)
- Growth trajectory fits the seat: logical next step, not plateau, not over-leap
- Writing / communication quality (critical at Staff+ because influence without authority is the job)
- External visibility: GitHub activity, blog, conference talks, recognized work

**Produce output in this exact format:**

```markdown
### Skip-Level / Bar Raiser (3-5 min final read)
- **Decision:** go | go_if_fixed | no_go
- **Rationale:** {1-2 sentences explaining the call}
- **Bar-raiser signal:** yes | no | maybe
- **Budget fit:** under | at | over
- **Retention risk:** low | medium | high
- **Growth trajectory fit:** good | plateau | overshoot
- **Culture flags:** [list, or "none visible"]
```

### Aggregator (deterministic, no re-reading)

After all three personas produce their outputs, combine them using **this exact logic** (do not add LLM reasoning here — the whole point is that the personas already did the reasoning):

- If Recruiter `decision = fail` → verdict = `skip`, weakest_link = `recruiter`
- Else if Hiring Manager `decision = fail` → verdict = `apply_with_caveats`, weakest_link = `hiring_manager`
- Else if Exec `decision = no_go` → verdict = `apply`, weakest_link = `exec` (note: this is an application worth making but prepare for final-round pushback)
- Else if Exec `decision = go_if_fixed` → verdict = `apply`, weakest_link = `exec`, include fix checklist
- Else (all three pass) → verdict = `strong_apply`, weakest_link = null

**Produce aggregate output in this exact format:**

```markdown
### Panel Verdict
- **Verdict:** strong_apply | apply | apply_with_caveats | skip
- **One-liner:** {one sentence capturing the overall panel read}
- **Weakest link:** recruiter | hiring_manager | exec | none
- **Fix checklist** (only if verdict is `apply_with_caveats` or if exec said `go_if_fixed`):
  - {specific actionable fix derived from the kill_reason / risk_flags / rationale above}
  - {another fix, if applicable}
```

### Calibration notes (for future PRs, not required in output)

This block is calibrated against the user's own `reports/*.md` history. If enough reports exist (N≥10), a `tools/evaluate-panel.mjs` harness can compare simulated verdicts against real outcomes (ghosted / phone_screen / onsite / offer / rejected_at_stage). Tune the persona heuristics until agreement ≥70%. This harness is out-of-scope for this block; see issue #384 follow-ups.

### Edge cases

- **Missing hard-filter data in CV** (e.g., no location listed): mark the filter as `unknown` and explain in the kill_reason. Do not default to `fail`.
- **Vague JD:** the HM persona should probe harder — more `probing_questions` targeting the ambiguity.
- **Comp not disclosed in JD:** the Exec persona infers `budget_fit` from role + level + geography + company stage. Flag "inferred" in the rationale.
- **Recruiter-sourced roles (no public posting):** skip the Recruiter persona entirely; note "bypassed — direct recruiter contact" and start from the HM. Bar Raiser still applies.

---

## Post-evaluación

**SIEMPRE** después de generar los bloques A-G:

### 1. Guardar report .md

Guardar evaluación completa en `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`.

- `{###}` = siguiente número secuencial (3 dígitos, zero-padded)
- `{company-slug}` = nombre de empresa en lowercase, sin espacios (usar guiones)
- `{YYYY-MM-DD}` = fecha actual

**Formato del report:**

```markdown
# Evaluación: {Empresa} — {Rol}

**Fecha:** {YYYY-MM-DD}
**Arquetipo:** {detectado}
**Score:** {X/5}
**Legitimacy:** {High Confidence | Proceed with Caution | Suspicious}
**PDF:** {ruta o pendiente}

---

## A) Resumen del Rol
(contenido completo del bloque A)

## B) Match con CV
(contenido completo del bloque B)

## C) Nivel y Estrategia
(contenido completo del bloque C)

## D) Comp y Demanda
(contenido completo del bloque D)

## E) Plan de Personalización
(contenido completo del bloque E)

## F) Plan de Entrevistas
(contenido completo del bloque F)

## G) Posting Legitimacy
(contenido completo del bloque G)

## H) Hiring Panel Simulation
(contenido completo del bloque H — three persona outputs + aggregate verdict)

## I) Draft Application Answers
(solo si score >= 4.5 — borradores de respuestas para el formulario de aplicación)

---

## Keywords extraídas
(lista de 15-20 keywords del JD para ATS optimization)
```

### 2. Registrar en tracker

**SIEMPRE** registrar en `data/applications.md`:
- Siguiente número secuencial
- Fecha actual
- Empresa
- Rol
- Score: promedio de match (1-5)
- Estado: `Evaluada`
- PDF: ❌ (o ✅ si auto-pipeline generó PDF)
- Report: link relativo al report .md (ej: `[001](reports/001-company-2026-01-01.md)`)

**Formato del tracker:**

```markdown
| # | Fecha | Empresa | Rol | Score | Estado | PDF | Report |
```
