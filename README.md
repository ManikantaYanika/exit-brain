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
