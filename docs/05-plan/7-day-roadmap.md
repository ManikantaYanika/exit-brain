# Seven-Day Build Challenge — Roadmap

> Goal: a **working, demonstrable MVP** of the full journey on real GitHub data. Not a production-ready enterprise platform.
> Rule: a day is "done" only when its Definition of Done (DoD) passes. If a day slips, cut scope from the **Fallback** column, never skip tests for RLS.

## 0. Prerequisites (before Day 1, ~1 hour)

| Item | Detail |
|---|---|
| Accounts | GitHub (for the App + a **test org** with 2–3 repos you own), Supabase (free plan OK for dev), LLM provider API key, Vercel/Netlify (or your Ubuntu server) |
| Local tools | Node 20+, pnpm or npm, Docker (for `supabase start`), Supabase CLI, Git, Deno (optional — CLI bundles it) |
| Test data | A test GitHub user ("ravi-test") with commits/PRs/issues in the test repos. Write ~40 commits with realistic messages (incl. "temporary", "cron", "hotfix") — a script is provided on Day 2 |
| Decide | LLM provider + model; record its API data-retention policy in `07-security` |

## 1. Overview

| Day | Theme | Demo-able outcome |
|---|---|---|
| 1 | Foundation: repo, schema, auth, RLS, onboarding | Sign up → org created → invite → roles; cross-tenant test passes |
| 2 | GitHub App + ingestion jobs | Connect GitHub, select repos, start transition → evidence imported |
| 3 | Signals + knowledge detection + review workspace | AI-suggested knowledge areas with evidence; manager confirms |
| 4 | Interview: questions, chat, follow-ups, approval | Employee answers; follow-ups appear; answers approved |
| 5 | Verification + handover generation + approval/export | Approved handover with citations & statuses |
| 6 | Successor workspace + assistant + dashboard | Successor checklist, cited answers, dashboard metrics |
| 7 | Hardening, tests, deploy, demo rehearsal | Deployed app, E2E test green, demo script runs |

---

## Day 1 — Foundation

**Objectives:** project skeleton, database with tenant isolation, authentication, organisation onboarding (Workflow A minus GitHub).

**Tasks**
1. Create monorepo (`apps/web`, `supabase/`, `prompts/`, `evals/`, `docs/`); init Git; `.gitignore`; `.env.example`.
2. `npm create vite@latest apps/web -- --template react-ts`; add Tailwind, React Router, TanStack Query, Zod, supabase-js; oxlint + Prettier; Vitest. *(Day 1: Vite template now ships oxlint instead of ESLint — kept.)*
3. `supabase init` → `supabase start` (local stack).
4. Migration `0001_core.sql`: `org_role` enum, `organizations`, `profiles`, `memberships`, `invitations`, `employees`, `transitions` (+ enum), `audit_logs`; helper functions `is_member`, `has_role`; RLS enabled + policies for these tables.
5. Migration `0002_profile_trigger.sql`: create `profiles` row on `auth.users` insert.
6. Edge Functions: `_shared/` (CORS, JWT guard, error envelope, audit helper), `api-create-org`, `api-invite`, `api-accept-invite`.
7. Frontend: auth pages (S1), onboarding wizard steps 1–2 (S2), Team settings (S11), AppShell + RoleGate, basic dashboard empty state (S4).
8. pgTAP tests: user A cannot select org B rows on every Day-1 table; viewer cannot insert transitions.
9. GitHub Actions CI: install, lint, typecheck, unit tests, `supabase db lint` (optional), pgTAP via `supabase test db`.

**Files/modules:** `supabase/migrations/0001_core.sql`, `0002_profile_trigger.sql`, `supabase/tests/rls_core.test.sql`, `supabase/functions/_shared/*`, `supabase/functions/api-create-org/index.ts`, `api-invite`, `api-accept-invite`, `apps/web/src/features/auth/*`, `features/onboarding/*`, `features/team/*`, `components/ui/*`, `.github/workflows/ci.yml`.

**Dependencies:** prerequisites done; Docker running.

**Testing:** pgTAP RLS tests; Vitest for form schemas; manual: sign up two users in two orgs and confirm isolation in UI.

**DoD**
- [ ] `supabase db reset` applies migrations cleanly.
- [ ] New user signs up → creates org → is `owner`; audit row `org.created` exists.
- [ ] Owner invites second user as `manager`; invite accepted → membership exists.
- [ ] Cross-tenant pgTAP tests pass (0 rows visible across orgs).
- [ ] CI green on main.

**Risks / fallback:** invite email setup slow → show invite link in UI for copy (dev only, labelled). RLS recursion bugs → keep helpers `security definer` with fixed `search_path`.

---

## Day 1.5 — Clickable prototype (added 15 Oct 2026)

**Decision:** before wiring real data, build every screen once inside `apps/web` behind the `ExitBrainApi` interface with an in-memory **MOCK DATA** adapter (`src/data/mockApi.ts`). Days 2–6 replace the adapter, not the screens. Reason: validate the flow with 3–5 engineering managers this week; demand is the biggest risk.

**Scope:** manager dashboard (S4), knowledge review (S7), answers + verification, handover document (S9), employee interview with follow-ups (S8), successor checklist + cited assistant (S10), workspace setup (S2). Persona switcher for demos. AI steps are transparent heuristics, labelled as simulated.

**DoD**
- [x] All screens reachable per persona; MOCK DATA notice on every page.
- [x] Vitest: mock adapter rules + key flows (confirm item, vague answer → follow-up, successor gated until approval, assistant refusal + escalation).
- [x] Single-file build (`npm run build:prototype`) for sharing as an Artifact.
- [ ] Shown to ≥ 3 engineering managers; feedback logged via `exit-brain-customer-discovery`.

---

## Day 2 — GitHub App + ingestion

**Objectives:** connect GitHub read-only, select repos, create transition, ingest evidence via resumable jobs.

**Tasks**
1. Register GitHub App (permissions per `api-and-integrations.md §3.1`), generate private key + webhook secret; store as Supabase secrets.
2. Migration `0003_integrations_jobs.sql`: `integration_connections`, `repositories`, `jobs`, `evidence_records` (+ FTS index), RLS.
3. `_shared/github.ts`: App JWT signing, installation token, paged GET with rate-limit handling, secret redaction.
4. `github-callback` (state verification, installation ownership check, repo sync) and `github-webhook` (HMAC verification, revoke/suspend handling).
5. `api-start-transition` + `job-runner` with `ingest_github` steps: per repo → commits page → commit details (cap 300) → PR pages → issue pages.
6. pg_cron schedule calling `job-runner` every minute with a shared secret header **[RESEARCH NEEDED: confirm pg_cron + pg_net availability on your Supabase plan; fallback: call runner from a GitHub Actions cron or manually via a "Process now" dev button]**.
7. UI: Integrations page (S3) with repo toggles; New transition dialog (S5); Transition detail Overview tab with job progress + Retry.
8. Script `scripts/seed-github-test-repo.ts` to create realistic commits in your test repo (optional), and `supabase/seed.sql` mock Slack evidence (`is_mock=true`).

**DoD**
- [ ] Install App on test org; only selected repos are listed as readable.
- [ ] Starting a transition imports commits/PRs/issues for the test user; re-running creates no duplicates.
- [ ] Killing the runner mid-ingest and re-running resumes from cursor.
- [ ] Removing the App installation on GitHub marks connection `revoked` (webhook).
- [ ] Unit tests: rate-limit backoff calculation, redaction regexes, normaliser mapping.

**Risks / fallback:** webhook delivery locally → use GitHub's "Redeliver" + a tunnel (e.g., `supabase functions serve` + ngrok) or test against deployed dev project. If commit-detail calls are slow → reduce cap to 100.

---

## Day 3 — Signals, knowledge detection, review workspace

**Objectives:** turn evidence into reviewed knowledge items.

**Tasks**
1. Migration `0004_knowledge.sql`: `knowledge_items`, `knowledge_item_evidence`, `review_decisions`, `ai_runs`, `risk_assessments`, RLS.
2. `signals.ts`: area grouping + metrics (author share via additional `commits?path=` calls for top areas).
3. `_shared/llm/` provider interface + one adapter; Zod schemas; `prompts/detect_items@v1.md`.
4. `analyse` job: compute signals → risk → call LLM in batches → validate → insert items + links → transition status set to `analysing` (it stays there while the manager reviews items; `api-generate-questions` moves it to `interviewing`).
5. `api-review-item`.
6. UI: Knowledge areas tab / Evidence review workspace (S7), EvidencePanel, badges, risk score popover.
7. Evals E1, E2 with hand-labelled expectations for the test repo.

**DoD**
- [ ] Analysis produces ≥ 3 items on the test data, each with ≥ 1 valid evidence link.
- [ ] Injected fake evidence ID in LLM output is dropped (unit test with mocked provider).
- [ ] Manager confirms/edits/rejects; review_decisions + audit rows written.
- [ ] Risk score visible with its factors.

**Risks / fallback:** poor LLM grouping → fall back to "one item per high-risk area" generated deterministically, with LLM only writing the summary.

---

## Day 4 — Interview

**Objectives:** evidence-based questions, chat interview with follow-ups, employee approval.

**Tasks**
1. Migration `0005_interview.sql`: `questions`, `answers` (+FTS), RLS (employee-only edit until approved).
2. Prompts `gen_questions@v1`, `assess_answer@v1`; functions `api-generate-questions`, `api-submit-answer`, `api-approve-answers`.
3. Employee access: invite leaving employee as `employee`, link `employees.user_id`.
4. UI: Interview screen (S8) — topics, chat, "Why are we asking?", I don't know / Ask someone else, Review & approve.
5. Evals E3, E4.

**DoD**
- [ ] Questions reference concrete evidence (E3 ≥ 90% on sample).
- [ ] A vague answer triggers a follow-up; max depth 2 enforced.
- [ ] Unapproved answers invisible to manager and successor (RLS test).
- [ ] Approved answers cannot be edited (RLS test).

**Risks / fallback:** chat streaming complexity → no streaming; simple request/response with typing indicator.

---

## Day 5 — Verification + handover

**Objectives:** verify approved answers, generate, review, approve and export the handover.

**Tasks**
1. Migration `0006_handover.sql`: `verification_results`, `handover_documents`, `successor_assignments`, RLS.
2. `verify` job + prompt `verify@v1`; `api-override-verification`.
3. `generate_handover` job + prompt `handover@v1`; JSON → Markdown renderer (code); `api-approve-handover` (creates successor assignments).
4. UI: Verification tab; Handover viewer/editor (S9); export Markdown; print stylesheet for PDF.
5. Eval E5 (incl. conflict set).

**DoD**
- [ ] Every handover statement has ≥ 1 valid citation (automated check).
- [ ] Conflicting answer appears in "Open questions" and on dashboard alerts.
- [ ] Only one approved version per transition (DB constraint test).
- [ ] Markdown export downloads; print view readable.

**Risks / fallback:** rich editor time sink → edit statements as plain textareas.

---

## Day 6 — Successor workspace, assistant, dashboard

**Objectives:** successor learning + cited assistant; manager dashboard.

**Tasks**
1. Migration `0007_assistant_dashboard.sql`: `assistant_queries`, `transition_progress` view (security_invoker), `data_deletion_log`.
2. `api-assistant-query` (FTS retrieval over approved sources, threshold, LLM answer, citation validation), `api-escalate`.
3. UI: Successor workspace (S10), Dashboard (S4) KPIs + table, Audit log (S12).
4. Eval E6 (unanswerable questions → refusal), E7 (prompt injection).
5. Stretch (only if all DoD met): pgvector hybrid search.

**DoD**
- [ ] Successor sees only approved handover/answers (RLS test).
- [ ] Assistant cites sources for answerable questions; returns "not found" for the 10 unanswerable eval questions.
- [ ] Escalation creates a new question visible to employee/manager.
- [ ] Dashboard numbers match a hand count on the demo transition.

**Risks / fallback:** retrieval quality weak → add item titles/area keys to search text; lower threshold carefully; keep refusal behaviour.

---

## Day 7 — Hardening, deploy, demo

**Objectives:** reliability, security checks, deployment, rehearsed demo.

**Tasks**
1. Retention job (`retention_cleanup`) + Data & retention page (S13) — or document as deferred if time is short.
2. Playwright E2E: full journey with LLM provider mocked (deterministic fixtures) + one live run manually.
3. Security pass: checklist in `07-security §6`; `supabase db advisors`/Security Advisor review **[RESEARCH NEEDED: confirm tool name in current Supabase dashboard]**; secret scan of repo.
4. Create production Supabase project; apply migrations; set secrets; deploy functions; configure GitHub App URLs to prod; deploy frontend.
5. Measure and record (not invent): ingestion time, analysis time, tokens/cost for demo transition (E8).
6. Prepare demo data (fresh org), run `11-demo/demo-checklist.md` twice.

**DoD**
- [ ] E2E test green in CI (mocked LLM).
- [ ] Production deploy reachable over HTTPS; post-deploy checklist complete.
- [ ] Demo journey completed live on production with real GitHub test repo.
- [ ] Deferred items list updated honestly.

**Risks / fallback:** deploy issues → demo on dev project, document blocker. Retention job not done → mark deferred, keep manual "Delete transition data" admin action.

---

## Daily routine

- Morning (15 min): re-read the day's DoD; create GitHub issues per task.
- Every 2 hours: commit + push; CI must stay green.
- Evening (20 min): run that day's tests, update `docs/CHANGELOG.md`, tick DoD boxes **only** for verified items, note anything deferred.
