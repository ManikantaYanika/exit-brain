/**
 * MOCK DATA for the clickable prototype. Fictional company, people and repositories.
 * Nothing here comes from a real GitHub account or a real employee.
 */
import type {
  Answer,
  ChecklistItem,
  Evidence,
  Handover,
  KnowledgeItem,
  Organization,
  Person,
  Question,
  Transition,
  Verification,
} from './types'

export const org: Organization = { id: 'org-acme', name: 'Acme SaaS', sizeBand: '51-150' }

export const people: Person[] = [
  {
    id: 'u-neha',
    name: 'Neha Kapoor',
    email: 'neha@acme.dev',
    role: 'owner',
    title: 'CTO',
  },
  {
    id: 'u-priya',
    name: 'Priya Nair',
    email: 'priya@acme.dev',
    role: 'manager',
    title: 'Engineering Manager',
  },
  {
    id: 'u-ravi',
    name: 'Ravi Kumar',
    email: 'ravi@acme.dev',
    role: 'employee',
    title: 'Senior Engineer, Billing',
  },
  {
    id: 'u-kiran',
    name: 'Kiran Rao',
    email: 'kiran@acme.dev',
    role: 'successor',
    title: 'Engineer, Billing',
  },
  {
    id: 'u-anita',
    name: 'Anita Shah',
    email: 'anita@acme.dev',
    role: 'viewer',
    title: 'HR Business Partner',
  },
]

export const transitions: Transition[] = [
  {
    id: 't-ravi',
    employee: { id: 'e-ravi', name: 'Ravi Kumar', githubLogin: 'ravi-k', title: 'Senior Engineer, Billing' },
    successor: { id: 'u-kiran', name: 'Kiran Rao' },
    lastWorkingDay: '2026-11-14',
    status: 'interviewing',
    repos: ['acme/billing-sync', 'acme/api-gateway', 'acme/infra'],
    evidenceCount: 412,
  },
  {
    id: 't-meera',
    employee: { id: 'e-meera', name: 'Meera Iyer', githubLogin: 'meera-i', title: 'Platform Engineer' },
    successor: null,
    lastWorkingDay: '2026-12-05',
    status: 'analysing',
    repos: ['acme/infra', 'acme/deploy-tools'],
    evidenceCount: 268,
  },
  {
    id: 't-arjun',
    employee: { id: 'e-arjun', name: 'Arjun Mehta', githubLogin: 'arjun-m', title: 'Frontend Lead' },
    successor: { id: 'u-sana', name: 'Sana Khan' },
    lastWorkingDay: '2026-09-30',
    status: 'completed',
    repos: ['acme/web-app'],
    evidenceCount: 530,
  },
]

export const evidence: Evidence[] = [
  {
    id: 'ev-1',
    source: 'github_commit',
    ref: '3f2a9c1',
    repo: 'acme/billing-sync',
    title: 'temporary fix: retry nightly invoice sync when Stripe returns 429',
    excerpt:
      'Wraps the 02:00 IST sync in 3 retries with backoff. TODO: remove once Stripe rate limit is raised.',
    paths: ['billing-sync/cron/nightly.ts', 'billing-sync/lib/retry.ts'],
    occurredAt: '2026-08-21T22:14:00Z',
    url: '#',
  },
  {
    id: 'ev-2',
    source: 'github_commit',
    ref: 'b81d04e',
    repo: 'acme/billing-sync',
    title: 'cron: move nightly sync to 02:00 IST to avoid backup window',
    excerpt: 'DB backups run 00:30–01:30 IST and lock invoice tables.',
    paths: ['billing-sync/cron/schedule.yaml'],
    occurredAt: '2026-03-02T09:40:00Z',
    url: '#',
  },
  {
    id: 'ev-3',
    source: 'github_pr',
    ref: '#418',
    repo: 'acme/billing-sync',
    title: 'Handle duplicate Stripe webhooks idempotently',
    excerpt: 'Stores event IDs for 72h; duplicates are acknowledged and skipped. 3 review comments.',
    paths: ['billing-sync/webhooks/stripe.ts', 'billing-sync/db/processed_events.sql'],
    occurredAt: '2026-06-11T11:05:00Z',
    url: '#',
  },
  {
    id: 'ev-4',
    source: 'github_issue',
    ref: '#402',
    repo: 'acme/billing-sync',
    title: 'Customers charged twice after webhook replay',
    excerpt: 'Assigned to ravi-k. Root cause: Stripe resent events after a 504 from api-gateway.',
    paths: [],
    occurredAt: '2026-06-03T07:20:00Z',
    url: '#',
  },
  {
    id: 'ev-5',
    source: 'github_commit',
    ref: '9c4e7aa',
    repo: 'acme/billing-sync',
    title: 'month-end: regenerate GST summary export for finance',
    excerpt: 'Committed on the 1st of 11 of the last 12 months.',
    paths: ['billing-sync/reports/gst_summary.sql', 'billing-sync/reports/export.ts'],
    occurredAt: '2026-10-01T05:02:00Z',
    url: '#',
  },
  {
    id: 'ev-6',
    source: 'github_commit',
    ref: '51be3d2',
    repo: 'acme/billing-sync',
    title: 'hotfix: GST export rounding for credit notes',
    excerpt: 'Credit notes were rounded per line instead of per invoice.',
    paths: ['billing-sync/reports/gst_summary.sql'],
    occurredAt: '2026-07-01T06:48:00Z',
    url: '#',
  },
  {
    id: 'ev-7',
    source: 'github_pr',
    ref: '#377',
    repo: 'acme/billing-sync',
    title: 'Migration: split invoice_lines by tax region',
    excerpt: 'Run with --lock-timeout=5s during low traffic. Rollback script included.',
    paths: ['billing-sync/db/migrations/0042_tax_region.sql'],
    occurredAt: '2026-04-18T16:30:00Z',
    url: '#',
  },
  {
    id: 'ev-8',
    source: 'github_commit',
    ref: 'e07f912',
    repo: 'acme/billing-sync',
    title: 'Zenith: apply contract price overrides before discounts',
    excerpt: 'Zenith Logistics has per-SKU contract prices. Hard-coded until pricing service exists.',
    paths: ['billing-sync/pricing/overrides/zenith.ts'],
    occurredAt: '2026-05-09T10:12:00Z',
    url: '#',
  },
  {
    id: 'ev-9',
    source: 'github_commit',
    ref: '7aa31f0',
    repo: 'acme/api-gateway',
    title: 'Increase webhook route timeout to 30s for billing',
    excerpt: 'Prevents 504 on large invoice batches.',
    paths: ['api-gateway/routes/webhooks.yaml'],
    occurredAt: '2026-06-04T08:55:00Z',
    url: '#',
  },
  {
    id: 'ev-10',
    source: 'github_commit',
    ref: 'c2d9b64',
    repo: 'acme/billing-sync',
    title: 'legacy: patch PDF invoice renderer font path',
    excerpt: 'Old renderer still used for 3 enterprise customers.',
    paths: ['billing-sync/legacy/pdf_renderer/fonts.ts'],
    occurredAt: '2025-12-12T13:21:00Z',
    url: '#',
  },
]

export const knowledgeItems: KnowledgeItem[] = [
  {
    id: 'k-nightly',
    transitionId: 't-ravi',
    title: 'Nightly invoice sync with Stripe',
    summary:
      'A 02:00 IST cron job syncs invoices from Stripe. It has a temporary retry workaround for rate limits and was moved to avoid the backup window.',
    category: 'recurring_task',
    area: 'billing-sync/cron',
    risk: 'high',
    confidence: 'high',
    status: 'confirmed',
    evidenceIds: ['ev-1', 'ev-2'],
    riskFactors: [
      { label: 'Ravi’s share of changes (12 months)', value: '91%' },
      { label: 'Other contributors (12 months)', value: '1' },
      { label: 'Last changed', value: '21 Aug 2026' },
      { label: 'Flags in history', value: '“temporary”, “TODO”, “cron”' },
    ],
  },
  {
    id: 'k-webhooks',
    transitionId: 't-ravi',
    title: 'Duplicate Stripe webhook handling',
    summary:
      'Webhooks are de-duplicated by event ID for 72 hours after a double-charge incident. The gateway timeout was raised to stop replays.',
    category: 'troubleshooting',
    area: 'billing-sync/webhooks',
    risk: 'high',
    confidence: 'high',
    status: 'confirmed',
    evidenceIds: ['ev-3', 'ev-4', 'ev-9'],
    riskFactors: [
      { label: 'Ravi’s share of changes (12 months)', value: '84%' },
      { label: 'Linked incident', value: 'Issue #402' },
      { label: 'Spans repositories', value: 'billing-sync, api-gateway' },
    ],
  },
  {
    id: 'k-gst',
    transitionId: 't-ravi',
    title: 'Month-end GST export for finance',
    summary:
      'On the 1st of each month Ravi regenerates the GST summary export. A rounding hotfix for credit notes was needed in July.',
    category: 'recurring_task',
    area: 'billing-sync/reports',
    risk: 'high',
    confidence: 'medium',
    status: 'suggested',
    evidenceIds: ['ev-5', 'ev-6'],
    riskFactors: [
      { label: 'Recurring pattern', value: '1st of month, 11 of 12 months' },
      { label: 'Ravi’s share of changes (12 months)', value: '100%' },
      { label: 'Flags in history', value: '“hotfix”' },
    ],
  },
  {
    id: 'k-migrations',
    transitionId: 't-ravi',
    title: 'Billing database migrations',
    summary:
      'Invoice table migrations run with a short lock timeout during low traffic and ship with rollback scripts.',
    category: 'deployment',
    area: 'billing-sync/db',
    risk: 'medium',
    confidence: 'medium',
    status: 'suggested',
    evidenceIds: ['ev-7'],
    riskFactors: [
      { label: 'Ravi’s share of changes (12 months)', value: '67%' },
      { label: 'Other contributors (12 months)', value: '2' },
    ],
  },
  {
    id: 'k-zenith',
    transitionId: 't-ravi',
    title: 'Zenith Logistics contract pricing',
    summary: 'Zenith has hard-coded per-SKU contract prices applied before discounts.',
    category: 'client',
    area: 'billing-sync/pricing',
    risk: 'medium',
    confidence: 'low',
    status: 'suggested',
    evidenceIds: ['ev-8'],
    riskFactors: [
      { label: 'Ravi’s share of changes (12 months)', value: '100%' },
      { label: 'Evidence records', value: '1' },
    ],
  },
  {
    id: 'k-pdf',
    transitionId: 't-ravi',
    title: 'Legacy PDF invoice renderer',
    summary: 'An old PDF renderer is still used by three enterprise customers.',
    category: 'dependency',
    area: 'billing-sync/legacy',
    risk: 'low',
    confidence: 'low',
    status: 'suggested',
    evidenceIds: ['ev-10'],
    riskFactors: [
      { label: 'Last changed', value: '12 Dec 2025' },
      { label: 'Evidence records', value: '1' },
    ],
  },
]

export const questions: Question[] = [
  {
    id: 'q-1',
    itemId: 'k-nightly',
    text: 'You made 91% of changes to billing-sync/cron this year. What breaks if the 02:00 nightly sync fails, and how would someone notice?',
    evidenceIds: ['ev-1', 'ev-2'],
    parentId: null,
    depth: 0,
  },
  {
    id: 'q-2',
    itemId: 'k-nightly',
    text: 'Commit 3f2a9c1 calls the retry logic a temporary fix. What has to happen before it can be removed?',
    evidenceIds: ['ev-1'],
    parentId: null,
    depth: 0,
  },
  {
    id: 'q-3',
    itemId: 'k-webhooks',
    text: 'After the double-charge incident (#402), what should someone check first if customers report duplicate charges again?',
    evidenceIds: ['ev-3', 'ev-4', 'ev-9'],
    parentId: null,
    depth: 0,
  },
  {
    id: 'q-4',
    itemId: 'k-webhooks',
    text: 'The 30s gateway timeout in api-gateway was changed for billing. Who else depends on that route?',
    evidenceIds: ['ev-9'],
    parentId: null,
    depth: 0,
  },
]

export const answers: Answer[] = [
  {
    id: 'a-1',
    questionId: 'q-1',
    body: 'If it fails, invoices created in Stripe after midnight are missing from our DB, so the customer portal shows stale balances and the morning finance report is short. The job posts to #billing-alerts on failure; rerun with `npm run sync:nightly -- --since=yesterday`. It must not run during the 00:30–01:30 backup window.',
    classification: 'complete',
    status: 'approved',
  },
  {
    id: 'a-3',
    questionId: 'q-3',
    body: 'Check processed_events for the Stripe event ID first. If it is missing, check api-gateway logs for 504s on /webhooks/stripe — that is what caused #402. Refunds go through finance, never directly in Stripe.',
    classification: 'complete',
    status: 'approved',
  },
]

export const verifications: Verification[] = [
  {
    answerId: 'a-1',
    status: 'supported',
    explanation:
      'Schedule and backup-window constraint match commit b81d04e; retry behaviour matches 3f2a9c1.',
    evidenceIds: ['ev-1', 'ev-2'],
  },
  {
    answerId: 'a-3',
    status: 'partially_supported',
    explanation:
      'De-duplication by event ID and the 504 root cause are in PR #418 and issue #402. The refund process is not in any record.',
    evidenceIds: ['ev-3', 'ev-4'],
  },
]

export const handover: Handover = {
  transitionId: 't-ravi',
  version: 1,
  status: 'draft',
  approvedAt: null,
  sections: [
    {
      id: 's-summary',
      title: 'Role and transition',
      statements: [
        {
          id: 'st-1',
          text: 'Ravi Kumar owns billing integrations. Last working day 14 Nov 2026; Kiran Rao takes over.',
          evidenceIds: [],
          confidence: 'high',
          verification: 'supported',
        },
      ],
    },
    {
      id: 's-recurring',
      title: 'Recurring operational tasks',
      statements: [
        {
          id: 'st-2',
          text: 'The nightly invoice sync runs at 02:00 IST and must stay outside the 00:30–01:30 backup window.',
          evidenceIds: ['ev-2'],
          confidence: 'high',
          verification: 'supported',
        },
        {
          id: 'st-3',
          text: 'On failure it alerts #billing-alerts; rerun with npm run sync:nightly -- --since=yesterday.',
          evidenceIds: ['ev-1'],
          confidence: 'high',
          verification: 'supported',
        },
      ],
    },
    {
      id: 's-troubleshooting',
      title: 'Troubleshooting',
      statements: [
        {
          id: 'st-4',
          text: 'For duplicate charges, check processed_events for the Stripe event ID, then api-gateway 504s on /webhooks/stripe.',
          evidenceIds: ['ev-3', 'ev-4', 'ev-9'],
          confidence: 'high',
          verification: 'supported',
        },
        {
          id: 'st-5',
          text: 'Refunds are issued by finance, never directly in Stripe.',
          evidenceIds: [],
          confidence: 'medium',
          verification: 'unverified',
        },
      ],
    },
    {
      id: 's-open',
      title: 'Open questions',
      statements: [
        {
          id: 'st-6',
          text: 'Month-end GST export: awaiting manager review of the detected knowledge area.',
          evidenceIds: ['ev-5'],
          confidence: 'medium',
          verification: 'unverified',
        },
      ],
    },
  ],
}

export const checklist: ChecklistItem[] = [
  {
    id: 'c-1',
    itemId: 'k-nightly',
    title: 'Shadow one nightly sync and a manual rerun',
    risk: 'high',
    done: true,
    sectionId: 's-recurring',
  },
  {
    id: 'c-2',
    itemId: 'k-webhooks',
    title: 'Walk through the duplicate-charge runbook',
    risk: 'high',
    done: false,
    sectionId: 's-troubleshooting',
  },
  {
    id: 'c-3',
    itemId: 'k-gst',
    title: 'Run the 1 Dec GST export with finance',
    risk: 'high',
    done: false,
    sectionId: 's-open',
  },
  {
    id: 'c-4',
    itemId: 'k-migrations',
    title: 'Review migration 0042 and its rollback script',
    risk: 'medium',
    done: false,
    sectionId: 's-open',
  },
]
