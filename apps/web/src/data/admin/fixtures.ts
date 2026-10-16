/* Admin fixtures for the demo workspace "Acme SaaS". MOCK DATA: fictional people and systems. */
import type {
  AuditEvent,
  Billing,
  DataInventoryRow,
  DeletionRequest,
  HealthPoint,
  Installation,
  Invite,
  Job,
  KnowledgeArea,
  Member,
  Notification,
  Repo,
  SecuritySettings,
  Session,
  WebhookDelivery,
  WorkspaceSettings,
} from './types'

/** Times are relative to page load so the demo always looks current. */
const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString()
const day = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString().slice(0, 10)

export function members(): Member[] {
  const m = (
    id: string,
    name: string,
    role: Member['role'],
    title: string,
    team: string,
    lastMin: number | null,
    joinedDays: number,
    status: Member['status'] = 'active',
    signIn: Member['signIn'] = 'Password',
  ): Member => ({
    id,
    name,
    email: `${name.split(' ')[0]!.toLowerCase()}@acme.dev`,
    role,
    title,
    team,
    status,
    joinedAt: day(joinedDays),
    lastActiveAt: lastMin === null ? null : ago(lastMin),
    signIn,
  })
  return [
    m('u-neha', 'Neha Kapoor', 'owner', 'CTO', 'Leadership', 2, 210),
    m('u-vikram', 'Vikram Rao', 'admin', 'Platform Lead', 'Platform', 34, 205, 'active', 'Magic link'),
    m('u-priya', 'Priya Nair', 'manager', 'Engineering Manager', 'Billing', 11, 190),
    m('u-tom', 'Tom Becker', 'manager', 'Engineering Manager', 'Web', 260, 120),
    m('u-ravi', 'Ravi Kumar', 'employee', 'Senior Engineer, Billing', 'Billing', 48, 160),
    m('u-meera', 'Meera Iyer', 'employee', 'Platform Engineer', 'Platform', 1440, 95, 'active', 'Magic link'),
    m('u-kiran', 'Kiran Rao', 'successor', 'Engineer, Billing', 'Billing', 75, 150),
    m('u-sana', 'Sana Khan', 'successor', 'Frontend Engineer', 'Web', 3100, 80),
    m('u-anita', 'Anita Shah', 'viewer', 'HR Business Partner', 'People', 600, 140, 'active', 'Magic link'),
    m('u-arjun', 'Arjun Mehta', 'employee', 'Frontend Lead (left 30 Sep)', 'Web', 23000, 300, 'deactivated'),
  ]
}

export function invites(): Invite[] {
  return [
    {
      id: 'inv-1',
      email: 'omar@acme.dev',
      role: 'successor',
      invitedBy: 'Priya Nair',
      createdAt: ago(60 * 26),
      expiresAt: new Date(Date.now() + 5 * 86_400_000).toISOString(),
      status: 'pending',
    },
    {
      id: 'inv-2',
      email: 'grace@acme.dev',
      role: 'viewer',
      invitedBy: 'Neha Kapoor',
      createdAt: ago(60 * 70),
      expiresAt: new Date(Date.now() + 2 * 86_400_000).toISOString(),
      status: 'pending',
    },
  ]
}

export function installation(): Installation {
  return {
    account: 'acme (GitHub organisation)',
    installedAt: day(150),
    installedBy: 'Neha Kapoor',
    permissions: ['Metadata', 'Contents', 'Pull requests', 'Issues'].map((name) => ({
      name,
      access: 'read',
    })),
    status: 'connected',
    rateLimitRemaining: 4612,
    rateLimit: 5000,
  }
}

export function repos(): Repo[] {
  const r = (
    name: string,
    language: string,
    selected: boolean,
    status: Repo['status'],
    syncMin: number | null,
    records: number,
    errors24h = 0,
  ): Repo => ({
    id: `r-${name}`,
    fullName: `acme/${name}`,
    language,
    defaultBranch: 'main',
    selected,
    status: selected ? status : 'not_selected',
    lastSyncAt: syncMin === null ? null : ago(syncMin),
    records,
    errors24h,
  })
  return [
    r('billing-sync', 'TypeScript', true, 'healthy', 12, 18_420),
    r('api-gateway', 'Go', true, 'healthy', 14, 26_310),
    r('infra', 'HCL', true, 'error', 190, 9_870, 3),
    r('deploy-tools', 'Python', true, 'healthy', 31, 4_210),
    r('web-app', 'TypeScript', true, 'healthy', 55, 31_650),
    r('mobile-app', 'Kotlin', false, 'healthy', null, 0),
    r('marketing-site', 'Astro', false, 'healthy', null, 0),
  ]
}

export function webhooks(): WebhookDelivery[] {
  const events = [
    'push',
    'pull_request',
    'issues',
    'push',
    'installation_repositories',
    'pull_request',
    'push',
  ]
  return events.map((event, i) => ({
    id: `wh-${700 + i}`,
    event,
    at: ago(4 + i * 19),
    signatureValid: i !== 4,
    status: i === 4 ? 'rejected' : 'processed',
    ms: 40 + ((i * 37) % 160),
  }))
}

export function jobs(): Job[] {
  const j = (
    id: number,
    type: Job['type'],
    target: string,
    status: Job['status'],
    createdMin: number,
    durMin: number,
    progress = status === 'succeeded' ? 100 : 0,
    error: string | null = null,
    attempts = 1,
  ): Job => ({
    id: `J-${id}`,
    type,
    target,
    status,
    progress,
    createdAt: ago(createdMin),
    startedAt: status === 'queued' ? null : ago(createdMin - 1),
    finishedAt: ['succeeded', 'failed', 'cancelled'].includes(status) ? ago(createdMin - 1 - durMin) : null,
    attempts,
    error,
  })
  return [
    j(4830, 'Answer verification', 'Ravi Kumar', 'running', 3, 0, 46),
    j(4829, 'GitHub sync', 'acme/api-gateway', 'running', 2, 0, 71),
    j(4831, 'Question generation', 'Ravi Kumar', 'queued', 1, 0),
    j(
      4828,
      'GitHub sync',
      'acme/infra',
      'failed',
      190,
      2,
      0,
      'GitHub returned 502 three times. Retrying later is safe.',
      3,
    ),
    j(4827, 'Knowledge analysis', 'Meera Iyer', 'succeeded', 240, 6),
    j(4826, 'GitHub sync', 'acme/billing-sync', 'succeeded', 260, 3),
    j(4825, 'Handover draft', 'Arjun Mehta', 'succeeded', 60 * 30, 4),
    j(4824, 'Retention cleanup', 'Workspace', 'succeeded', 60 * 26, 1),
    j(4823, 'GitHub sync', 'acme/web-app', 'succeeded', 60 * 27, 5),
    j(4822, 'Answer verification', 'Ravi Kumar', 'succeeded', 60 * 28, 2),
  ]
}

export function health(): HealthPoint[] {
  return Array.from({ length: 30 }, (_, i) => {
    const spike = i === 21 || i === 22
    const wobble = Math.sin(i * 1.3) * 18 + ((i * 7) % 11)
    return {
      day: day(29 - i),
      p95Ms: Math.round(210 + wobble + (spike ? 160 : 0)),
      queueDepth: Math.max(0, Math.round(4 + Math.cos(i) * 3 + (spike ? 22 : 0))),
      errorRatePct: +(0.12 + Math.abs(Math.sin(i)) * 0.18 + (spike ? 1.1 : 0)).toFixed(2),
      aiCalls: Math.round(520 + i * 22 + Math.sin(i * 0.7) * 140),
    }
  })
}

export function audit(): AuditEvent[] {
  const e = (
    i: number,
    min: number,
    actor: string,
    actorRole: AuditEvent['actorRole'],
    action: string,
    target: string,
    meta: AuditEvent['meta'] = {},
    region = 'IN-KA',
  ): AuditEvent => ({ id: `E-${9100 - i}`, at: ago(min), actor, actorRole, action, target, meta, region })
  return [
    e(1, 3, 'System', 'system', 'ingestion.started', 'repo:acme/api-gateway', { job: 'J-4829' }, 'system'),
    e(2, 9, 'Ravi Kumar', 'employee', 'answers.approved', 'transition:t-ravi', { answers: 6 }),
    e(3, 22, 'Priya Nair', 'manager', 'item.reviewed', 'item:k-gst', { decision: 'confirmed' }),
    e(4, 41, 'Priya Nair', 'manager', 'verification.overridden', 'answer:a-12', {
      from: 'unverified',
      to: 'supported',
    }),
    e(5, 64, 'Neha Kapoor', 'owner', 'member.role_changed', 'member:u-vikram', {
      from: 'manager',
      to: 'admin',
    }),
    e(
      6,
      95,
      'System',
      'system',
      'ingestion.failed',
      'repo:acme/infra',
      { job: 'J-4828', attempts: 3 },
      'system',
    ),
    e(
      7,
      130,
      'Vikram Rao',
      'admin',
      'repos.selected',
      'integration:github',
      { added: 1, removed: 0 },
      'DE-BE',
    ),
    e(8, 240, 'Priya Nair', 'manager', 'transition.created', 'transition:t-meera', { repos: 2 }),
    e(9, 60 * 20, 'Neha Kapoor', 'owner', 'member.invited', 'invite:inv-2', { role: 'viewer' }),
    e(10, 60 * 26, 'System', 'system', 'data.deletion_executed', 'workspace', { records: 1840 }, 'system'),
    e(11, 60 * 30, 'Tom Becker', 'manager', 'handover.approved', 'transition:t-arjun', { version: 3 }),
    e(12, 60 * 31, 'Tom Becker', 'manager', 'handover.exported', 'transition:t-arjun', {
      format: 'markdown',
    }),
    e(13, 60 * 44, 'Neha Kapoor', 'owner', 'auth.login', 'session', {}, 'IN-KA'),
    e(
      14,
      60 * 50,
      'Vikram Rao',
      'admin',
      'integration.connected',
      'integration:github',
      { repos: 5 },
      'DE-BE',
    ),
  ]
}

export function notifications(): Notification[] {
  return [
    {
      id: 'n-1',
      at: ago(6),
      kind: 'risk',
      title: 'Ravi Kumar leaves in 29 days',
      body: '2 high-risk areas still have unanswered questions.',
      href: '/app/transitions/t-ravi',
      read: false,
    },
    {
      id: 'n-2',
      at: ago(95),
      kind: 'job',
      title: 'GitHub sync failed for acme/infra',
      body: 'GitHub returned 502 three times. You can retry it.',
      href: '/app/admin/system',
      read: false,
    },
    {
      id: 'n-3',
      at: ago(130),
      kind: 'security',
      title: 'A webhook was rejected',
      body: 'Its signature didn’t match. Nothing was processed.',
      href: '/app/admin/integrations',
      read: false,
    },
    {
      id: 'n-4',
      at: ago(60 * 30),
      kind: 'approval',
      title: 'Handover approved for Arjun Mehta',
      body: 'Sana Khan’s checklist is ready.',
      href: '/app/transitions/t-arjun',
      read: true,
    },
  ]
}

export function inventory(): DataInventoryRow[] {
  return [
    {
      kind: 'Evidence excerpts',
      description: 'Commit messages, PR/issue titles, short descriptions, paths',
      records: 1210,
      sizeMb: 38.4,
    },
    { kind: 'Knowledge areas', description: 'Suggested and reviewed areas', records: 41, sizeMb: 0.3 },
    { kind: 'Interview answers', description: 'Answers, with approval state', records: 96, sizeMb: 1.1 },
    {
      kind: 'Verification results',
      description: 'Status and cited evidence per answer',
      records: 88,
      sizeMb: 0.4,
    },
    { kind: 'Handovers', description: 'Versions and approvals', records: 7, sizeMb: 0.6 },
    {
      kind: 'AI run records',
      description: 'Prompt version, inputs (IDs), outputs',
      records: 2310,
      sizeMb: 22.7,
    },
    { kind: 'Audit log', description: 'IDs and counts only, no answer text', records: 4120, sizeMb: 3.2 },
  ]
}

export function deletions(): DeletionRequest[] {
  return [
    {
      id: 'del-3',
      scope: 'One transition',
      target: 'Arjun Mehta (completed 30 Sep)',
      requestedBy: 'System (retention)',
      requestedAt: day(1) + 'T03:00:00.000Z',
      status: 'scheduled',
      progress: 0,
      recordsDeleted: 0,
    },
    {
      id: 'del-2',
      scope: 'GitHub data for one repository',
      target: 'acme/legacy-billing',
      requestedBy: 'Neha Kapoor',
      requestedAt: day(12) + 'T09:12:00.000Z',
      status: 'completed',
      progress: 100,
      recordsDeleted: 1840,
    },
  ]
}

export function sessions(): Session[] {
  return [
    { id: 's-1', device: 'Chrome on macOS', location: 'Bengaluru, IN', lastSeenAt: ago(0), current: true },
    {
      id: 's-2',
      device: 'Safari on iPhone',
      location: 'Bengaluru, IN',
      lastSeenAt: ago(60 * 9),
      current: false,
    },
    {
      id: 's-3',
      device: 'Firefox on Windows',
      location: 'Pune, IN',
      lastSeenAt: ago(60 * 52),
      current: false,
    },
  ]
}

export function security(): SecuritySettings {
  return {
    allowedDomains: ['acme.dev'],
    magicLink: true,
    passwordMinLength: 12,
    sessionTimeoutHours: 12,
    requireEmailConfirmation: true,
  }
}

export function billing(): Billing {
  const monthly = [
    { month: '2026-05', departures: 1, aiRuns: 820, aiCostUsd: 14 },
    { month: '2026-06', departures: 1, aiRuns: 1180, aiCostUsd: 19 },
    { month: '2026-07', departures: 2, aiRuns: 2100, aiCostUsd: 35 },
    { month: '2026-08', departures: 1, aiRuns: 1650, aiCostUsd: 27 },
    { month: '2026-09', departures: 2, aiRuns: 3020, aiCostUsd: 49 },
    { month: '2026-10', departures: 2, aiRuns: 2410, aiCostUsd: 40 },
  ]
  return {
    plan: 'Pilot',
    pricePerDepartureUsd: 149,
    periodLabel: 'October 2026',
    departuresThisPeriod: 2,
    aiRuns: 2410,
    aiRunsSoftLimit: 5000,
    storageMb: 66.7,
    storageLimitMb: 1024,
    invoices: monthly
      .slice()
      .reverse()
      .map((m) => ({
        id: `PI-${m.month.replace('-', '')}`,
        period: m.month,
        departures: m.departures,
        amountUsd: m.departures * 149,
        status: 'not_billed' as const,
      })),
    monthly,
  }
}

export function settings(): WorkspaceSettings {
  return {
    name: 'Acme SaaS',
    sizeBand: '51-150',
    timezone: 'Asia/Kolkata',
    retentionDays: 90,
    aiProvider: null,
    prefs: [
      { key: 'risk', label: 'A last day is near and high-risk areas are open', email: true, inApp: true },
      { key: 'approval', label: 'Something is waiting for my approval', email: true, inApp: true },
      { key: 'job', label: 'A background job failed', email: false, inApp: true },
      { key: 'security', label: 'Security events (rejected webhook, new admin)', email: true, inApp: true },
      { key: 'digest', label: 'Weekly summary', email: true, inApp: false },
    ],
  }
}

export function knowledgeAreas(): KnowledgeArea[] {
  const a = (
    id: string,
    title: string,
    repo: string,
    category: KnowledgeArea['category'],
    risk: KnowledgeArea['risk'],
    changeShare: number,
    daysSinceChange: number,
    evidence: number,
    transitionId: string,
    engineer: string,
    status: KnowledgeArea['status'],
  ): KnowledgeArea => ({
    id,
    title,
    repo,
    category,
    risk,
    changeShare,
    daysSinceChange,
    evidence,
    transitionId,
    engineer,
    status,
  })
  return [
    a(
      'k-nightly',
      'Nightly invoice sync with Stripe',
      'acme/billing-sync',
      'recurring_task',
      'high',
      0.91,
      56,
      14,
      't-ravi',
      'Ravi Kumar',
      'confirmed',
    ),
    a(
      'k-webhooks',
      'Stripe webhook retries',
      'acme/billing-sync',
      'troubleshooting',
      'high',
      0.86,
      33,
      11,
      't-ravi',
      'Ravi Kumar',
      'confirmed',
    ),
    a(
      'k-gst',
      'GST rounding for invoices',
      'acme/billing-sync',
      'system',
      'medium',
      0.78,
      120,
      7,
      't-ravi',
      'Ravi Kumar',
      'confirmed',
    ),
    a(
      'k-migrations',
      'Billing schema migrations',
      'acme/api-gateway',
      'deployment',
      'medium',
      0.72,
      41,
      9,
      't-ravi',
      'Ravi Kumar',
      'suggested',
    ),
    a(
      'k-zenith',
      'Zenith Retail custom pricing',
      'acme/api-gateway',
      'client',
      'high',
      0.95,
      18,
      6,
      't-ravi',
      'Ravi Kumar',
      'confirmed',
    ),
    a(
      'k-pdf',
      'Invoice PDF renderer',
      'acme/billing-sync',
      'dependency',
      'low',
      0.61,
      210,
      4,
      't-ravi',
      'Ravi Kumar',
      'rejected',
    ),
    a(
      'm-tfstate',
      'Terraform state locking',
      'acme/infra',
      'deployment',
      'high',
      0.88,
      12,
      19,
      't-meera',
      'Meera Iyer',
      'suggested',
    ),
    a(
      'm-backup',
      'Database backup window',
      'acme/infra',
      'recurring_task',
      'high',
      0.93,
      64,
      8,
      't-meera',
      'Meera Iyer',
      'suggested',
    ),
    a(
      'm-certs',
      'Certificate rotation',
      'acme/deploy-tools',
      'recurring_task',
      'medium',
      0.8,
      88,
      5,
      't-meera',
      'Meera Iyer',
      'suggested',
    ),
    a(
      'm-release',
      'Release pipeline gates',
      'acme/deploy-tools',
      'deployment',
      'medium',
      0.74,
      23,
      12,
      't-meera',
      'Meera Iyer',
      'suggested',
    ),
    a(
      'm-alerts',
      'Pager alert routing',
      'acme/infra',
      'troubleshooting',
      'low',
      0.58,
      140,
      3,
      't-meera',
      'Meera Iyer',
      'suggested',
    ),
    a(
      'a-flags',
      'Feature flag cleanup',
      'acme/web-app',
      'system',
      'medium',
      0.82,
      45,
      10,
      't-arjun',
      'Arjun Mehta',
      'confirmed',
    ),
    a(
      'a-i18n',
      'Translations pipeline',
      'acme/web-app',
      'recurring_task',
      'low',
      0.64,
      160,
      6,
      't-arjun',
      'Arjun Mehta',
      'confirmed',
    ),
    a(
      'a-perf',
      'Bundle size budget',
      'acme/web-app',
      'troubleshooting',
      'medium',
      0.77,
      70,
      8,
      't-arjun',
      'Arjun Mehta',
      'confirmed',
    ),
  ]
}
