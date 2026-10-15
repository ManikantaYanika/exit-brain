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
