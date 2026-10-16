/**
 * In-memory AdminApi for the demo. MOCK DATA ONLY.
 * While anything is subscribed, a small loop advances background jobs and deletions and adds
 * audit events, so the portal behaves like a live system. Nothing leaves the browser.
 */
import type { Role } from '../types'
import * as fx from './fixtures'
import type {
  AdminApi,
  AdminEvent,
  AuditEvent,
  DeletionRequest,
  Invite,
  Job,
  JobType,
  Notification,
} from './types'

const clone = <T>(v: T): T => structuredClone(v)
const now = () => new Date().toISOString()
const wait = (ms = 120) => new Promise((r) => setTimeout(r, ms))
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class AdminError extends Error {}

function freshState() {
  return {
    members: fx.members(),
    invites: fx.invites(),
    installation: fx.installation(),
    repos: fx.repos(),
    webhooks: fx.webhooks(),
    jobs: fx.jobs(),
    health: fx.health(),
    audit: fx.audit(),
    notifications: fx.notifications(),
    inventory: fx.inventory(),
    deletions: fx.deletions(),
    sessions: fx.sessions(),
    security: fx.security(),
    billing: fx.billing(),
    settings: fx.settings(),
    areas: fx.knowledgeAreas(),
  }
}

export interface MockAdminApi extends AdminApi {
  /** Who is acting, for audit entries (the signed-in demo persona). */
  setActor(name: string, role: Role): void
  /** Advance the simulation one step (the live loop calls this; tests call it directly). */
  tick(): void
  reset(): void
}

export function createMockAdminApi({ latencyMs = 120, tickMs = 3000 } = {}): MockAdminApi {
  let s = freshState()
  let seq = 9200
  let jobSeq = 4840
  let ticks = 0
  let actor = { name: 'Neha Kapoor', role: 'owner' as Role }
  const listeners = new Set<(e: AdminEvent) => void>()
  let timer: ReturnType<typeof setInterval> | null = null
  const delay = () => wait(latencyMs)

  const emit = (e: AdminEvent) => listeners.forEach((fn) => fn(e))
  const log = (
    action: string,
    target: string,
    meta: AuditEvent['meta'] = {},
    who: { name: string; role: AuditEvent['actorRole'] } = actor,
  ) => {
    const ev: AuditEvent = {
      id: `E-${seq++}`,
      at: now(),
      actor: who.name,
      actorRole: who.role,
      action,
      target,
      meta,
      region: who.role === 'system' ? 'system' : 'IN-KA',
    }
    s.audit.unshift(ev)
    emit({ kind: 'audit', event: ev })
  }
  const notify = (n: Omit<Notification, 'id' | 'at' | 'read'>) => {
    s.notifications.unshift({ ...n, id: `n-${seq++}`, at: now(), read: false })
    emit({ kind: 'notifications' })
  }
  const SYSTEM = { name: 'System', role: 'system' as const }
  const member = (id: string) => {
    const m = s.members.find((x) => x.id === id)
    if (!m) throw new AdminError('That member no longer exists.')
    return m
  }
  const activeOwners = () => s.members.filter((m) => m.role === 'owner' && m.status === 'active').length

  function newJob(type: JobType, target: string): Job {
    const j: Job = {
      id: `J-${jobSeq++}`,
      type,
      target,
      status: 'queued',
      progress: 0,
      createdAt: now(),
      startedAt: null,
      finishedAt: null,
      attempts: 1,
      error: null,
    }
    s.jobs.unshift(j)
    emit({ kind: 'jobs' })
    return j
  }

  function finishJob(j: Job) {
    j.status = 'succeeded'
    j.progress = 100
    j.finishedAt = now()
    if (j.type === 'GitHub sync') {
      const r = s.repos.find((x) => x.fullName === j.target)
      if (r) {
        r.status = 'healthy'
        r.errors24h = 0
        r.lastSyncAt = now()
        r.records += 40 + Math.floor(Math.random() * 160)
        emit({ kind: 'repos' })
      }
      log('ingestion.completed', `repo:${j.target}`, { job: j.id }, SYSTEM)
    } else {
      log('job.completed', `job:${j.id}`, { type: j.type }, SYSTEM)
    }
  }

  const tick = () => {
    ticks++
    const running = s.jobs.filter((j) => j.status === 'running')
    for (const j of running) {
      j.progress = Math.min(100, j.progress + 9 + Math.floor(Math.random() * 16))
      if (j.progress >= 100) finishJob(j)
    }
    const slots = 3 - s.jobs.filter((j) => j.status === 'running').length
    s.jobs
      .filter((j) => j.status === 'queued')
      .reverse()
      .slice(0, Math.max(0, slots))
      .forEach((j) => {
        j.status = 'running'
        j.startedAt = now()
        if (j.type === 'GitHub sync') {
          const r = s.repos.find((x) => x.fullName === j.target)
          if (r) r.status = 'syncing'
          log('ingestion.started', `repo:${j.target}`, { job: j.id }, SYSTEM)
        }
      })
    // Scheduled work keeps arriving, as it would on a real workspace.
    if (ticks % 6 === 0) {
      const selected = s.repos.filter((r) => r.selected && r.status !== 'error')
      const r = selected[ticks % Math.max(1, selected.length)]
      if (r) newJob('GitHub sync', r.fullName)
    }
    if (ticks % 9 === 0) newJob('Answer verification', 'Ravi Kumar')
    if (ticks % 7 === 0) {
      const who = s.members.filter((m) => m.status === 'active')[ticks % 5]!
      log('auth.login', 'session', {}, { name: who.name, role: who.role })
    }
    for (const d of s.deletions) {
      if (d.status === 'scheduled' && d.requestedBy !== 'System (retention)') d.status = 'running'
      if (d.status === 'running') {
        d.progress = Math.min(100, d.progress + 20 + Math.floor(Math.random() * 20))
        d.recordsDeleted = Math.round((d.progress / 100) * (d.scope === 'All ingested data' ? 4120 : 640))
        if (d.progress >= 100) {
          d.status = 'completed'
          log('data.deletion_executed', d.target, { request: d.id, records: d.recordsDeleted }, SYSTEM)
          notify({
            kind: 'info',
            title: 'Data deletion finished',
            body: `${d.recordsDeleted.toLocaleString('en')} records deleted: ${d.target}.`,
            href: '/app/admin/data',
          })
        }
        emit({ kind: 'deletions' })
      }
    }
    emit({ kind: 'jobs' })
  }

  const api: MockAdminApi = {
    mode: 'mock',
    setActor(name, role) {
      actor = { name, role }
    },
    tick,
    reset() {
      s = freshState()
    },
    subscribe(fn) {
      listeners.add(fn)
      if (!timer && tickMs > 0 && typeof window !== 'undefined') timer = setInterval(tick, tickMs)
      return () => {
        listeners.delete(fn)
        if (!listeners.size && timer) {
          clearInterval(timer)
          timer = null
        }
      }
    },

    async listMembers() {
      await delay()
      return clone(s.members)
    },
    async listInvites() {
      await delay()
      return clone(s.invites.filter((i) => i.status === 'pending'))
    },
    async inviteMember({ email, role }) {
      await delay()
      const e = email.trim().toLowerCase()
      if (!EMAIL.test(e)) throw new AdminError('Enter a valid email address.')
      const domain = e.split('@')[1]!
      if (!s.security.allowedDomains.includes(domain))
        throw new AdminError(
          `Only addresses at ${s.security.allowedDomains.join(', ')} can be invited. Change this in Security.`,
        )
      if (s.members.some((m) => m.email === e)) throw new AdminError('That person is already a member.')
      if (s.invites.some((i) => i.email === e && i.status === 'pending'))
        throw new AdminError('That person already has a pending invite.')
      const inv: Invite = {
        id: `inv-${seq++}`,
        email: e,
        role,
        invitedBy: actor.name,
        createdAt: now(),
        expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
        status: 'pending',
      }
      s.invites.unshift(inv)
      log('member.invited', `invite:${inv.id}`, { role })
      emit({ kind: 'members' })
      return clone(inv)
    },
    async revokeInvite(id) {
      await delay()
      const inv = s.invites.find((i) => i.id === id)
      if (!inv) throw new AdminError('That invite no longer exists.')
      inv.status = 'revoked'
      log('member.invite_revoked', `invite:${id}`)
      emit({ kind: 'members' })
    },
    async resendInvite(id) {
      await delay()
      const inv = s.invites.find((i) => i.id === id)
      if (!inv) throw new AdminError('That invite no longer exists.')
      inv.createdAt = now()
      inv.expiresAt = new Date(Date.now() + 7 * 86_400_000).toISOString()
      log('member.invite_resent', `invite:${id}`)
      emit({ kind: 'members' })
      return clone(inv)
    },
    async changeRole(memberId, role) {
      await delay()
      const m = member(memberId)
      if (m.role === role) return clone(m)
      if (m.role === 'owner' && activeOwners() <= 1)
        throw new AdminError('A workspace needs at least one owner. Make someone else owner first.')
      const from = m.role
      m.role = role
      log('member.role_changed', `member:${m.id}`, { from, to: role })
      emit({ kind: 'members' })
      if (role === 'owner' || role === 'admin')
        notify({
          kind: 'security',
          title: `${m.name} is now ${role === 'owner' ? 'an owner' : 'an admin'}`,
          body: `Changed by ${actor.name}.`,
          href: '/app/admin/people',
        })
      return clone(m)
    },
    async setMemberActive(memberId, active) {
      await delay()
      const m = member(memberId)
      if (!active && m.role === 'owner' && activeOwners() <= 1)
        throw new AdminError('You can’t deactivate the only owner.')
      m.status = active ? 'active' : 'deactivated'
      log(active ? 'member.reactivated' : 'member.removed', `member:${m.id}`)
      emit({ kind: 'members' })
      return clone(m)
    },

    async getInstallation() {
      await delay()
      return clone(s.installation)
    },
    async listRepos() {
      await delay()
      return clone(s.repos)
    },
    async setRepoSelected(repoId, selected) {
      await delay()
      const r = s.repos.find((x) => x.id === repoId)
      if (!r) throw new AdminError('That repository is no longer available.')
      r.selected = selected
      r.status = selected ? 'syncing' : 'not_selected'
      log('repos.selected', 'integration:github', selected ? { added: r.fullName } : { removed: r.fullName })
      emit({ kind: 'repos' })
      if (selected) newJob('GitHub sync', r.fullName)
      return clone(r)
    },
    async syncRepo(repoId) {
      await delay()
      const r = s.repos.find((x) => x.id === repoId)
      if (!r || !r.selected) throw new AdminError('Select the repository before syncing it.')
      const existing = s.jobs.find(
        (j) =>
          j.type === 'GitHub sync' &&
          j.target === r.fullName &&
          (j.status === 'queued' || j.status === 'running'),
      )
      if (existing) return clone(existing)
      log('ingestion.requested', `repo:${r.fullName}`)
      return clone(newJob('GitHub sync', r.fullName))
    },
    async listWebhookDeliveries() {
      await delay()
      return clone(s.webhooks)
    },

    async listJobs() {
      await delay()
      return clone(s.jobs)
    },
    async retryJob(id) {
      await delay()
      const j = s.jobs.find((x) => x.id === id)
      if (!j || j.status !== 'failed') throw new AdminError('Only failed jobs can be retried.')
      j.status = 'queued'
      j.progress = 0
      j.error = null
      j.attempts += 1
      j.finishedAt = null
      log('job.retried', `job:${id}`, { attempt: j.attempts })
      emit({ kind: 'jobs' })
      return clone(j)
    },
    async cancelJob(id) {
      await delay()
      const j = s.jobs.find((x) => x.id === id)
      if (!j || (j.status !== 'queued' && j.status !== 'running'))
        throw new AdminError('Only queued or running jobs can be cancelled.')
      j.status = 'cancelled'
      j.finishedAt = now()
      if (j.type === 'GitHub sync') {
        const r = s.repos.find((x) => x.fullName === j.target)
        if (r && r.status === 'syncing') r.status = 'healthy'
      }
      log('job.cancelled', `job:${id}`)
      emit({ kind: 'jobs' })
      return clone(j)
    },
    async startJob({ type, target }) {
      await delay()
      log('job.requested', target, { type })
      return clone(newJob(type, target))
    },
    async listHealth() {
      await delay()
      return clone(s.health)
    },

    async listAudit() {
      await delay()
      return clone(s.audit)
    },

    async listNotifications() {
      await wait(0)
      return clone(s.notifications)
    },
    async markNotificationsRead(ids) {
      s.notifications.forEach((n) => {
        if (!ids || ids.includes(n.id)) n.read = true
      })
      emit({ kind: 'notifications' })
    },

    async getInventory() {
      await delay()
      return clone(s.inventory)
    },
    async listDeletionRequests() {
      await delay()
      return clone(s.deletions)
    },
    async requestDeletion({ scope, target }) {
      await delay()
      if (!target.trim()) throw new AdminError('Choose what to delete.')
      const d: DeletionRequest = {
        id: `del-${seq++}`,
        scope,
        target: target.trim(),
        requestedBy: actor.name,
        requestedAt: now(),
        status: 'scheduled',
        progress: 0,
        recordsDeleted: 0,
      }
      s.deletions.unshift(d)
      log('data.deletion_requested', d.target, { request: d.id, scope })
      emit({ kind: 'deletions' })
      return clone(d)
    },
    async cancelDeletion(id) {
      await delay()
      const d = s.deletions.find((x) => x.id === id)
      if (!d || d.status !== 'scheduled') throw new AdminError('Only scheduled deletions can be cancelled.')
      d.status = 'cancelled'
      log('data.deletion_cancelled', d.target, { request: d.id })
      emit({ kind: 'deletions' })
      return clone(d)
    },

    async listSessions() {
      await delay()
      return clone(s.sessions)
    },
    async revokeSession(id) {
      await delay()
      const x = s.sessions.find((v) => v.id === id)
      if (!x || x.current) throw new AdminError('You can’t sign out the session you are using.')
      s.sessions = s.sessions.filter((v) => v.id !== id)
      log('auth.session_revoked', `session:${id}`, { device: x.device })
      emit({ kind: 'settings' })
    },
    async getSecurity() {
      await delay()
      return clone(s.security)
    },
    async updateSecurity(patch) {
      await delay()
      if (patch.allowedDomains) {
        const bad = patch.allowedDomains.find((d) => !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d))
        if (bad) throw new AdminError(`“${bad}” isn’t a domain like example.com.`)
        if (!patch.allowedDomains.length) throw new AdminError('Keep at least one allowed domain.')
      }
      if (
        patch.passwordMinLength !== undefined &&
        (patch.passwordMinLength < 8 || patch.passwordMinLength > 64)
      )
        throw new AdminError('Minimum password length must be between 8 and 64.')
      s.security = { ...s.security, ...patch }
      log('org.security_changed', 'org', Object.fromEntries(Object.keys(patch).map((k) => [k, 'changed'])))
      emit({ kind: 'settings' })
      return clone(s.security)
    },

    async getBilling() {
      await delay()
      return clone(s.billing)
    },
    async getSettings() {
      await delay()
      return clone(s.settings)
    },
    async updateSettings(patch) {
      await delay()
      if (patch.retentionDays !== undefined && (patch.retentionDays < 30 || patch.retentionDays > 365))
        throw new AdminError('Retention must be between 30 and 365 days.')
      if (patch.name !== undefined && !patch.name.trim()) throw new AdminError('The workspace needs a name.')
      const before = s.settings.retentionDays
      s.settings = { ...s.settings, ...patch }
      if (patch.retentionDays !== undefined && patch.retentionDays !== before)
        log('org.retention_changed', 'org', { from: before, to: patch.retentionDays })
      else
        log('org.settings_changed', 'org', Object.fromEntries(Object.keys(patch).map((k) => [k, 'changed'])))
      emit({ kind: 'settings' })
      return clone(s.settings)
    },

    async listKnowledgeAreas() {
      await delay()
      return clone(s.areas)
    },
  }
  return api
}
