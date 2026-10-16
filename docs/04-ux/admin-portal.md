# Admin portal (owner and admin)

> Added 16 Oct 2026. Demo mode runs on an in-memory adapter (MOCK DATA, fictional company "Acme SaaS"). Screens use the `AdminApi` contract only, so a Supabase adapter can replace the mock without UI changes.

## How to see it

Website → Sign in → Explore the demo → **Neha Kapoor, CTO, workspace owner**. Owners and admins now land on `/app/admin`. Managers, leaving engineers, successors and HR see no admin links, and `/app/admin/*` shows "This page isn’t part of your portal" to them (UI gate; RLS stays the security boundary).

## Modules

| Route | Module | What works in the demo |
|---|---|---|
| `/app/admin` | Overview | KPIs with count-up, handover workflow flowchart (click a stage to see who is in it), "needs your attention" list (failed jobs with Retry, near last days, missing successors, repo errors, rejected webhooks, expiring invites), live activity feed, background work progress, upcoming last days, **New transition** 4-step wizard |
| `/app/transitions` | Transitions | Existing list and transition pages |
| `/app/admin/knowledge` | Knowledge risk | Concentration scatter (areas, not people), risk by repository (click to filter), searchable areas table |
| `/app/admin/system` | Jobs & health | Live job queue (3 run at a time), retry/cancel, run a job, p95 latency, queue depth, error rate, jobs by type |
| `/app/admin/people` | People & roles | Members with role change (confirm for owner/admin), deactivate/reactivate, last-owner guard, invites (domain-checked, resend, revoke), permission matrix from `permissions.ts` |
| `/app/admin/security` | Security | Allowed domains, magic link, password length, session timeout, active sessions (sign out others), honest control status, SSO/SCIM marked Later |
| `/app/admin/integrations` | Integrations | Animated data-flow diagram, GitHub App (read-only permissions, API calls left), webhook deliveries with signature result, repository on/off + Sync now with live progress, Slack/Jira/Drive marked Later |
| `/app/admin/audit` | Audit log | Live, filter by category/actor, search, event detail (IDs and counts only), CSV export (formula-injection safe) |
| `/app/admin/data` | Data & privacy | What is / isn’t stored, retention 30–365 days (confirm when shortening), data inventory, deletion requests with typed DELETE confirm and live progress |
| `/app/admin/billing` | Usage & billing | "Billing isn’t live" notice, $149/departure pilot amounts, AI runs and cost per departure, soft-limit meters, statements marked Not billed |
| `/app/admin/settings` | Settings | Workspace name/size/time zone, notification preferences, AI provider "Not chosen yet", close-workspace by request |

Portal chrome: live badge, **Ctrl/⌘+K** search (pages, transitions, people), notification bell with unread count and mark-read.

## Live behaviour

`AdminApi.subscribe()` streams events. The mock runs a loop only while someone is subscribed: jobs progress and finish, scheduled syncs arrive, deletions run, sign-ins appear, and every admin action writes an audit event. In the live build this maps to Supabase Realtime on `jobs`, `audit_logs` and notifications.

## Rules kept

- Every admin action is audited; audit metadata holds IDs and counts only.
- Knowledge risk describes code areas; nothing scores or ranks people.
- GitHub access is read-only; no write permission is shown or requested.
- No unverified claims: SSO/SCIM, SOC 2, pen test and billing are shown as not done.
- Motion is transform/opacity/stroke-dashoffset only and stops under reduced motion.

## Before a live adapter [RECOMMENDATION]

The contract implies tables not yet in `docs/02-architecture/database-schema.md`: `invitations` (exists), `repositories`, `jobs`, `webhook_deliveries`, `notifications`, `data_deletion_log`, org settings (retention, security policy). Each needs `org_id`, RLS and cross-tenant pgTAP tests before use, and `/exit-brain-security-review`.
