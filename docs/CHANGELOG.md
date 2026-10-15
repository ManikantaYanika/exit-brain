# Changelog

Only verified work is recorded here. Numbers are measured, never estimated.

## 2026-10-15 — Day 1 (in progress)

- Repo skeleton, `.gitignore`, `.env.example`, docs (PRD, roadmap, database schema, security & privacy).
- Migrations `20261015000001_core.sql` (7 tenant tables, enums, `private` RLS helpers, policies, column-level grants, `create_organization` + `accept_invitation` RPCs, last-owner + same-org triggers) and `20261015000002_profile_trigger.sql`.
- pgTAP `supabase/tests/rls_core.test.sql`: **44/44 passing** on local Postgres 16 + Supabase auth shim (`scripts/local-db/test-db.sh`). Not yet run under `supabase test db`.
- Security fixes found by tests/review: cross-org probe via transition trigger (refuse non-writers first); removed client-callable `log_audit()` (audit forgery).
- Pending: Vite app, `supabase init`/`start`, Edge Functions, UI, CI.
