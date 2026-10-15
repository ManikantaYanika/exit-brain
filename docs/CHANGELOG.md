# Changelog

Only verified work is recorded here. Numbers are measured, never estimated.

## 2026-10-15 — Day 1 (in progress)

- Repo skeleton, `.gitignore`, `.env.example`, docs (PRD, roadmap, database schema, security & privacy).
- Migrations `20261015000001_core.sql` (7 tenant tables, enums, `private` RLS helpers, policies, column-level grants, `create_organization` + `accept_invitation` RPCs, last-owner + same-org triggers) and `20261015000002_profile_trigger.sql`.
- pgTAP `supabase/tests/rls_core.test.sql`: **44/44 passing** on local Postgres 16 + Supabase auth shim (`scripts/local-db/test-db.sh`). Not yet run under `supabase test db`.
- Security fixes found by tests/review: cross-org probe via transition trigger (refuse non-writers first); removed client-callable `log_audit()` (audit forgery).
- Pending: Vite app, `supabase init`/`start`, Edge Functions, UI, CI.
- Frontend `apps/web`: Vite 8 + React 19 + TS 6 (strict, `noUncheckedIndexedAccess`), Tailwind 4, React Router 8, TanStack Query 5, Zod 4, supabase-js 2, Vitest 5 + Testing Library, Prettier, oxlint.
- `src/lib/env.ts` validates frontend env and **refuses to start with a service-role / `sb_secret_` key** (T3). Verified: lint, typecheck, format:check, `vitest run` **9/9**, `vite build` all exit 0; build output scanned clean of secret material.
- Decision: template ships **oxlint instead of ESLint** — kept (roadmap Day 1 task 2 said ESLint; update `05-plan/7-day-roadmap.md`).
- **[FACT] Supabase breaking change (changelog 2026-04-28):** new `public` tables are no longer auto-exposed to the Data API (all projects from 2026-10-30). Core migration now grants explicitly; local shim mirrors the new behaviour. Verified: removing the grants drops the suite to 4/44.
- Edge Functions on `npm:@supabase/server@1.9.2` (`withSupabase`, `auth: 'user'`, CORS = `APP_ORIGIN` only): `api-create-org`, `api-invite`, `api-accept-invite` + `_shared` (error envelope, SQLSTATE→HTTP map, zod body validation with size limits, tokens, audit helper). **No Day-1 function uses the service role.**
- Migrations `…03_invite_rpc.sql` (`create_invitation`: role check + sha256 token hash + `member.invited` audit, atomic) and `…04_audit_triggers.sql` (role change, removal, invite revoke, transition created).
- Security review fixes: role changes / removals / transition creation were unaudited (FR-25) → triggers; invite acceptance now requires a **confirmed** email (T11); body size checked before buffering; unexpected-error logs truncated.
- Tests: pgTAP **62/62** (3 files), Deno **20/20**, `deno check` + `deno lint` clean. Not yet run against a live Supabase stack (`supabase test db` / `functions serve`).
- CI (`.github/workflows/ci.yml`, all actions pinned): **web** (oxlint, prettier, typecheck, vitest, build, bundle secret scan), **functions** (deno fmt/lint/check/test), **database** (`supabase db start` + `supabase test db` on CLI 2.121.0, plus a gate failing if any `public` table lacks RLS), **secrets** (gitleaks 8.30.1, full history). Verified locally: bundle scanner flags a planted service_role JWT; RLS gate fails on a table without RLS; gitleaks clean (2 fake test keys allow-listed).
- `supabase init` (CLI 2.121.0, Postgres 17): local auth hardened — Vite site URL, min password 8 + letters/digits, **email confirmations on**, secure password change.

## 2026-10-15 — Day 1.5: clickable prototype

- Decision: in-app prototype before real data wiring (roadmap updated). Screens use the `ExitBrainApi` interface; prototype runs on `createMockApi()` with **MOCK DATA** fixtures (fictional Acme SaaS, Ravi/Priya/Kiran/Anita).
- Screens: transitions dashboard, knowledge review (confirm / edit / reject, risk factors), answers + verification, handover document (approve, copy as Markdown), employee interview (evidence-based questions, follow-ups, skip with reason, approve), successor checklist + cited assistant with refusal and "Ask Ravi" escalation, workspace setup.
- Design: evidence-first — inline citation pills coloured by verification status open a git-log style evidence panel; risk shown as bars, not colour. IBM Plex Sans + Plex Mono (code evidence only).
- Tests: vitest **26/26** (mock adapter rules 12, UI flows 7, env 7). lint, typecheck, format, build exit 0.
- Shareable single-file build (`npm run build:prototype`, memory router) published as a private claude.ai Artifact. Visual review in a browser not done in the build environment.

## 2026-10-15 — P0: design system (UX plan phase 0)

- Palette sampled from the Exit Brain logo (ink `#0D1939`, blue `#1F5DF0`, violet `#733AEA`, cyan `#46C2FE`); tokens in `src/design/tokens.css`, light + dark (system setting and in-app toggle).
- `tokens.test.ts` parses the token file and enforces WCAG AA for 17 text/background pairs per theme and 3:1 for control borders — **37 tests**; verified it fails on a bad token (light blue brand → 4 failures).
- Logo assets: transparent full logo, mark, 32/192/512 px icons (`public/brand/`); live wordmark so "Exit" stays legible on dark.
- Primitives: Button (variants, sizes, loading), Field/TextInput/TextArea/SelectInput (label/hint/error wired with ARIA), Dialog (native `<dialog>`), Toast (polite live region), ThemeToggle, Logo, DemoLabel, SimulatedStepNotice; states: Skeleton, EmptyState, ErrorState. Icons: lucide-react 1.49.0 (pinned).
- `domain/permissions.ts` mirrors the security role matrix; 19 tests pin it.
- Prototype migrated to tokens (no literal colours left in components); MOCK DATA bar uses the `demo` token.
- Tests: vitest **90/90**; lint, typecheck, format, build, bundle scan exit 0. Visual review in a real browser still not done in the build environment.
