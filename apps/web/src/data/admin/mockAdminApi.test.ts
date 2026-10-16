import { describe, expect, it, vi } from 'vitest'
import { createMockAdminApi } from './mockAdminApi'
import type { AdminEvent } from './types'

const make = () => createMockAdminApi({ latencyMs: 0, tickMs: 0 })

describe('mock admin API: people', () => {
  it('invites only valid addresses at allowed domains, once', async () => {
    const api = make()
    await expect(api.inviteMember({ email: 'nope', role: 'manager' })).rejects.toThrow('valid email')
    await expect(api.inviteMember({ email: 'x@gmail.com', role: 'manager' })).rejects.toThrow('acme.dev')
    const inv = await api.inviteMember({ email: 'New.Person@acme.dev ', role: 'manager' })
    expect(inv.email).toBe('new.person@acme.dev')
    await expect(api.inviteMember({ email: 'new.person@acme.dev', role: 'viewer' })).rejects.toThrow(
      'pending invite',
    )
    expect((await api.listInvites()).some((i) => i.id === inv.id)).toBe(true)
  })

  it('records role changes in the audit log, and never removes the last owner', async () => {
    const api = make()
    const members = await api.listMembers()
    const owner = members.filter((m) => m.role === 'owner' && m.status === 'active')
    expect(owner).toHaveLength(1)
    await expect(api.changeRole(owner[0]!.id, 'manager')).rejects.toThrow('at least one owner')
    await expect(api.setMemberActive(owner[0]!.id, false)).rejects.toThrow('only owner')
    const manager = members.find((m) => m.role === 'manager')!
    await api.changeRole(manager.id, 'admin')
    const [latest] = await api.listAudit()
    expect(latest).toMatchObject({
      action: 'member.role_changed',
      target: `member:${manager.id}`,
      meta: { to: 'admin' },
    })
    // Audit metadata is IDs and labels only, never content.
    expect(JSON.stringify(latest!.meta)).not.toMatch(/@/)
  })
})

describe('mock admin API: live simulation', () => {
  it('selecting a repository queues a sync that runs to completion as the clock ticks', async () => {
    const api = make()
    const repo = (await api.listRepos()).find((r) => !r.selected)!
    await api.setRepoSelected(repo.id, true)
    let job = (await api.listJobs()).find((j) => j.target === repo.fullName)!
    expect(job.status).toBe('queued')
    for (let i = 0; i < 30 && job.status !== 'succeeded'; i++) {
      api.tick()
      job = (await api.listJobs()).find((j) => j.id === job.id)!
    }
    expect(job.status).toBe('succeeded')
    const after = (await api.listRepos()).find((r) => r.id === repo.id)!
    expect(after.status).toBe('healthy')
    expect(after.records).toBeGreaterThan(0)
    expect(
      (await api.listAudit()).some(
        (e) => e.action === 'ingestion.completed' && e.target === `repo:${repo.fullName}`,
      ),
    ).toBe(true)
  })

  it('retries only failed jobs and cancels only active ones', async () => {
    const api = make()
    const failed = (await api.listJobs()).find((j) => j.status === 'failed')!
    const retried = await api.retryJob(failed.id)
    expect(retried).toMatchObject({ status: 'queued', attempts: failed.attempts + 1, error: null })
    await expect(api.retryJob(failed.id)).rejects.toThrow('Only failed')
    await api.cancelJob(failed.id)
    await expect(api.cancelJob(failed.id)).rejects.toThrow('queued or running')
  })

  it('a deletion request runs, logs the result and notifies', async () => {
    const api = make()
    const d = await api.requestDeletion({ scope: 'GitHub data for one repository', target: 'acme/infra' })
    for (let i = 0; i < 10; i++) api.tick()
    const done = (await api.listDeletionRequests()).find((x) => x.id === d.id)!
    expect(done.status).toBe('completed')
    expect(done.recordsDeleted).toBeGreaterThan(0)
    expect((await api.listAudit()).some((e) => e.action === 'data.deletion_executed')).toBe(true)
    expect((await api.listNotifications())[0]!.title).toBe('Data deletion finished')
  })

  it('streams events to subscribers and stops when they leave', async () => {
    const api = make()
    const seen: AdminEvent['kind'][] = []
    const off = api.subscribe((e) => seen.push(e.kind))
    await api.inviteMember({ email: 'a@acme.dev', role: 'viewer' })
    expect(seen).toContain('audit')
    expect(seen).toContain('members')
    off()
    seen.length = 0
    await api.inviteMember({ email: 'b@acme.dev', role: 'viewer' })
    expect(seen).toEqual([])
  })

  it('runs the live loop only while someone is subscribed', async () => {
    // Fake only the interval; API calls still resolve on real timeouts.
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    try {
      const api = createMockAdminApi({ latencyMs: 0, tickMs: 1000 })
      const events: string[] = []
      const off = api.subscribe((e) => events.push(e.kind))
      vi.advanceTimersByTime(3000)
      expect(events.filter((k) => k === 'jobs').length).toBeGreaterThanOrEqual(3)
      off()
      events.length = 0
      const before = (await api.listJobs()).length
      vi.advanceTimersByTime(10_000)
      expect((await api.listJobs()).length).toBe(before)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('mock admin API: settings and security', () => {
  it('keeps retention between 30 and 365 days and logs changes', async () => {
    const api = make()
    await expect(api.updateSettings({ retentionDays: 10 })).rejects.toThrow('between 30 and 365')
    await api.updateSettings({ retentionDays: 60 })
    expect((await api.getSettings()).retentionDays).toBe(60)
    expect((await api.listAudit())[0]).toMatchObject({
      action: 'org.retention_changed',
      meta: { from: 90, to: 60 },
    })
  })

  it('validates security policy changes', async () => {
    const api = make()
    await expect(api.updateSecurity({ allowedDomains: ['not a domain'] })).rejects.toThrow('isn’t a domain')
    await expect(api.updateSecurity({ allowedDomains: [] })).rejects.toThrow('at least one')
    await expect(api.updateSecurity({ passwordMinLength: 4 })).rejects.toThrow('between 8 and 64')
    await api.updateSecurity({ allowedDomains: ['acme.dev', 'acme.io'] })
    await api.inviteMember({ email: 'z@acme.io', role: 'manager' })
  })

  it('never signs out the current session', async () => {
    const api = make()
    const [current, other] = await api.listSessions()
    await expect(api.revokeSession(current!.id)).rejects.toThrow('you are using')
    await api.revokeSession(other!.id)
    expect((await api.listSessions()).map((s) => s.id)).not.toContain(other!.id)
  })
})
