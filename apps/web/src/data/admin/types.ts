/**
 * Admin portal domain types (owner/admin). They describe workspace administration:
 * members, GitHub access, background jobs, audit, retention, security and billing.
 * The mock adapter implements them in memory; a Supabase adapter will implement the same
 * contract (tables: memberships, invitations, integrations, repositories, jobs, audit_logs,
 * data_deletion_log, org settings). MOCK DATA in the prototype.
 */
import type { ItemCategory, Level, Role } from '../types'

export type MemberStatus = 'active' | 'invited' | 'deactivated'
export interface Member {
  id: string
  name: string
  email: string
  role: Role
  title: string
  team: string
  status: MemberStatus
  joinedAt: string
  lastActiveAt: string | null
  signIn: 'Password' | 'Magic link'
}

export interface Invite {
  id: string
  email: string
  role: Exclude<Role, 'owner'>
  invitedBy: string
  createdAt: string
  expiresAt: string
  status: 'pending' | 'revoked' | 'accepted'
}

export type RepoStatus = 'healthy' | 'syncing' | 'error' | 'not_selected'
export interface Repo {
  id: string
  fullName: string
  language: string
  defaultBranch: string
  selected: boolean
  status: RepoStatus
  lastSyncAt: string | null
  records: number
  errors24h: number
}

export interface Installation {
  account: string
  installedAt: string
  installedBy: string
  permissions: { name: string; access: 'read' }[]
  status: 'connected' | 'suspended' | 'disconnected'
  rateLimitRemaining: number
  rateLimit: number
}

export interface WebhookDelivery {
  id: string
  event: string
  at: string
  signatureValid: boolean
  status: 'processed' | 'rejected'
  ms: number
}

export type JobType =
  | 'GitHub sync'
  | 'Knowledge analysis'
  | 'Question generation'
  | 'Answer verification'
  | 'Handover draft'
  | 'Retention cleanup'
  | 'Data deletion'
export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'
export interface Job {
  id: string
  type: JobType
  target: string
  status: JobStatus
  progress: number
  createdAt: string
  startedAt: string | null
  finishedAt: string | null
  attempts: number
  error: string | null
}

export interface HealthPoint {
  day: string
  p95Ms: number
  queueDepth: number
  errorRatePct: number
  aiCalls: number
}

export interface AuditEvent {
  id: string
  at: string
  actor: string
  actorRole: Role | 'system'
  action: string
  target: string
  meta: Record<string, string | number>
  region: string
}

export type NotificationKind = 'risk' | 'job' | 'security' | 'approval' | 'info'
export interface Notification {
  id: string
  at: string
  kind: NotificationKind
  title: string
  body: string
  href: string
  read: boolean
}

export interface DataInventoryRow {
  kind: string
  description: string
  records: number
  sizeMb: number
}

export type DeletionScope = 'GitHub data for one repository' | 'One transition' | 'All ingested data'
export interface DeletionRequest {
  id: string
  scope: DeletionScope
  target: string
  requestedBy: string
  requestedAt: string
  status: 'scheduled' | 'running' | 'completed' | 'cancelled'
  progress: number
  recordsDeleted: number
}

export interface Session {
  id: string
  device: string
  location: string
  lastSeenAt: string
  current: boolean
}

export interface SecuritySettings {
  allowedDomains: string[]
  magicLink: boolean
  passwordMinLength: number
  sessionTimeoutHours: number
  requireEmailConfirmation: true
}

export interface Invoice {
  id: string
  period: string
  departures: number
  amountUsd: number
  status: 'not_billed'
}
export interface Billing {
  plan: 'Pilot'
  pricePerDepartureUsd: number
  periodLabel: string
  departuresThisPeriod: number
  aiRuns: number
  aiRunsSoftLimit: number
  storageMb: number
  storageLimitMb: number
  invoices: Invoice[]
  monthly: { month: string; departures: number; aiRuns: number; aiCostUsd: number }[]
}

export interface NotificationPref {
  key: string
  label: string
  email: boolean
  inApp: boolean
}
export interface WorkspaceSettings {
  name: string
  sizeBand: string
  timezone: string
  retentionDays: number
  aiProvider: string | null
  prefs: NotificationPref[]
}

export interface KnowledgeArea {
  id: string
  title: string
  repo: string
  category: ItemCategory
  risk: Level
  changeShare: number
  daysSinceChange: number
  evidence: number
  transitionId: string
  engineer: string
  status: 'suggested' | 'confirmed' | 'rejected'
}

export type AdminEvent =
  | { kind: 'jobs' }
  | { kind: 'audit'; event: AuditEvent }
  | { kind: 'notifications' }
  | { kind: 'deletions' }
  | { kind: 'repos' }
  | { kind: 'members' }
  | { kind: 'settings' }

/** The admin contract. Screens use it through hooks only. */
export interface AdminApi {
  readonly mode: 'mock' | 'live'
  subscribe(fn: (e: AdminEvent) => void): () => void

  listMembers(): Promise<Member[]>
  listInvites(): Promise<Invite[]>
  inviteMember(input: { email: string; role: Invite['role'] }): Promise<Invite>
  revokeInvite(id: string): Promise<void>
  resendInvite(id: string): Promise<Invite>
  changeRole(memberId: string, role: Role): Promise<Member>
  setMemberActive(memberId: string, active: boolean): Promise<Member>

  getInstallation(): Promise<Installation>
  listRepos(): Promise<Repo[]>
  setRepoSelected(repoId: string, selected: boolean): Promise<Repo>
  syncRepo(repoId: string): Promise<Job>
  listWebhookDeliveries(): Promise<WebhookDelivery[]>

  listJobs(): Promise<Job[]>
  retryJob(id: string): Promise<Job>
  cancelJob(id: string): Promise<Job>
  startJob(input: { type: JobType; target: string }): Promise<Job>
  listHealth(): Promise<HealthPoint[]>

  listAudit(): Promise<AuditEvent[]>

  listNotifications(): Promise<Notification[]>
  markNotificationsRead(ids?: string[]): Promise<void>

  getInventory(): Promise<DataInventoryRow[]>
  listDeletionRequests(): Promise<DeletionRequest[]>
  requestDeletion(input: { scope: DeletionScope; target: string }): Promise<DeletionRequest>
  cancelDeletion(id: string): Promise<DeletionRequest>

  listSessions(): Promise<Session[]>
  revokeSession(id: string): Promise<void>
  getSecurity(): Promise<SecuritySettings>
  updateSecurity(
    patch: Partial<Omit<SecuritySettings, 'requireEmailConfirmation'>>,
  ): Promise<SecuritySettings>

  getBilling(): Promise<Billing>
  getSettings(): Promise<WorkspaceSettings>
  updateSettings(patch: Partial<WorkspaceSettings>): Promise<WorkspaceSettings>

  listKnowledgeAreas(): Promise<KnowledgeArea[]>
}
