# Exit Brain

AI-assisted knowledge transfer for engineering offboarding. Exit Brain reads authorised work records (GitHub, read-only), finds knowledge concentrated in one person, runs an evidence-based interview, verifies answers, and produces a human-approved handover with citations, plus a cited assistant for the successor.

> Status: **Day 1 of the 7-day MVP build.** Nothing is production-ready. See `docs/05-plan/7-day-roadmap.md`.

## Repository layout

```
apps/web/              React + TypeScript + Vite + Tailwind frontend
supabase/migrations/   SQL migrations (every tenant table: org_id + RLS)
supabase/tests/        pgTAP tests (cross-tenant isolation, roles)
supabase/functions/    Edge Functions (Deno/TypeScript)
prompts/               Versioned LLM prompts (Day 3+)
evals/                 AI evaluation sets (Day 3+)
scripts/               Dev scripts
docs/                  Product, architecture, security, plan
```

## Local development

```bash
# Database + auth (Docker required)
supabase start                 # applies supabase/migrations, prints URL + anon key
supabase test db               # pgTAP: tenant isolation, roles, audit

# Edge Functions
cp supabase/functions/.env.example supabase/functions/.env
supabase functions serve       # http://127.0.0.1:54321/functions/v1/<name>

# Frontend
cd apps/web && cp .env.example .env.local   # paste URL + anon/publishable key from `supabase status`
npm install && npm run dev                  # http://localhost:5173
```

No Docker? `scripts/local-db/test-db.sh` runs migrations + pgTAP against a plain Postgres 15+ with pgTAP (emulates the Supabase auth pieces; CI still runs the real stack).

## Git workflow

- `main` is production. **No direct pushes.**
- Every change: branch (`feat/…`, `fix/…`, `ci/…`, `docs/…`) → PR with test evidence → CI green → **Squash and merge** → delete branch.
- CI (`.github/workflows/ci.yml`): web lint/types/tests/build + bundle secret scan, Edge Function fmt/lint/check/tests, migrations + pgTAP on the Supabase local stack + RLS coverage gate, gitleaks over full history.

## Non-negotiables

- Every tenant table has `org_id` and RLS; cross-tenant tests must pass before any demo.
- Service-role key, GitHub private key and LLM keys never go to the frontend or Git.
- Integrations are read-only. No performance evaluation, no employment decisions.
- Every AI output cites evidence and shows confidence / verification status; humans approve.
- Mock data is labelled **MOCK DATA** (`is_mock = true`).

## Docs

| Doc | Path |
|---|---|
| PRD | `docs/01-product/PRD.md` |
| Database schema & RLS | `docs/02-architecture/database-schema.md` |
| 7-day roadmap | `docs/05-plan/7-day-roadmap.md` |
| Security & privacy | `docs/07-security/security-and-privacy.md` |
| Changelog | `docs/CHANGELOG.md` |
