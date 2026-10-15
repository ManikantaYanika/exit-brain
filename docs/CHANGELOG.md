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
