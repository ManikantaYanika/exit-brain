import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAdminApi } from './AdminApiProvider'
import type { AdminApi, AuditEvent, DeletionScope, JobType } from './types'
import type { Role } from '../types'

export const adminKeys = {
  members: ['admin', 'members'] as const,
  invites: ['admin', 'invites'] as const,
  installation: ['admin', 'installation'] as const,
  repos: ['admin', 'repos'] as const,
  webhooks: ['admin', 'webhooks'] as const,
  jobs: ['admin', 'jobs'] as const,
  health: ['admin', 'health'] as const,
  audit: ['admin', 'audit'] as const,
  notifications: ['admin', 'notifications'] as const,
  inventory: ['admin', 'inventory'] as const,
  deletions: ['admin', 'deletions'] as const,
  sessions: ['admin', 'sessions'] as const,
  security: ['admin', 'security'] as const,
  billing: ['admin', 'billing'] as const,
  settings: ['admin', 'settings'] as const,
  areas: ['admin', 'areas'] as const,
}

const q = <K extends readonly unknown[], T>(key: K, fn: (api: AdminApi) => Promise<T>) =>
  function useIt() {
    const api = useAdminApi()
    return useQuery({ queryKey: key, queryFn: () => fn(api) })
  }

export const useMembers = q(adminKeys.members, (a) => a.listMembers())
export const useInvites = q(adminKeys.invites, (a) => a.listInvites())
export const useInstallation = q(adminKeys.installation, (a) => a.getInstallation())
export const useRepos = q(adminKeys.repos, (a) => a.listRepos())
export const useWebhooks = q(adminKeys.webhooks, (a) => a.listWebhookDeliveries())
export const useJobs = q(adminKeys.jobs, (a) => a.listJobs())
export const useHealth = q(adminKeys.health, (a) => a.listHealth())
export const useAudit = q(adminKeys.audit, (a) => a.listAudit())
export const useNotifications = q(adminKeys.notifications, (a) => a.listNotifications())
export const useInventory = q(adminKeys.inventory, (a) => a.getInventory())
export const useDeletions = q(adminKeys.deletions, (a) => a.listDeletionRequests())
export const useSessions = q(adminKeys.sessions, (a) => a.listSessions())
export const useSecurity = q(adminKeys.security, (a) => a.getSecurity())
export const useBilling = q(adminKeys.billing, (a) => a.getBilling())
export const useSettings = q(adminKeys.settings, (a) => a.getSettings())
export const useKnowledgeAreas = q(adminKeys.areas, (a) => a.listKnowledgeAreas())

/** A mutation that refreshes the given lists afterwards. */
function m<V, R>(fn: (api: AdminApi, v: V) => Promise<R>, ...refresh: (readonly unknown[])[]) {
  return function useIt() {
    const api = useAdminApi()
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (v: V) => fn(api, v),
      onSettled: () =>
        Promise.all([...refresh, adminKeys.audit].map((k) => qc.invalidateQueries({ queryKey: k }))),
    })
  }
}

export const useInviteMember = m(
  (a, v: { email: string; role: Exclude<Role, 'owner'> }) => a.inviteMember(v),
  adminKeys.invites,
)
export const useRevokeInvite = m((a, id: string) => a.revokeInvite(id), adminKeys.invites)
export const useResendInvite = m((a, id: string) => a.resendInvite(id), adminKeys.invites)
export const useChangeRole = m(
  (a, v: { id: string; role: Role }) => a.changeRole(v.id, v.role),
  adminKeys.members,
  adminKeys.notifications,
)
export const useSetMemberActive = m(
  (a, v: { id: string; active: boolean }) => a.setMemberActive(v.id, v.active),
  adminKeys.members,
)
export const useSetRepoSelected = m(
  (a, v: { id: string; selected: boolean }) => a.setRepoSelected(v.id, v.selected),
  adminKeys.repos,
  adminKeys.jobs,
)
export const useSyncRepo = m((a, id: string) => a.syncRepo(id), adminKeys.repos, adminKeys.jobs)
export const useRetryJob = m((a, id: string) => a.retryJob(id), adminKeys.jobs)
export const useCancelJob = m((a, id: string) => a.cancelJob(id), adminKeys.jobs, adminKeys.repos)
export const useStartJob = m((a, v: { type: JobType; target: string }) => a.startJob(v), adminKeys.jobs)
export const useMarkRead = m(
  (a, ids: string[] | undefined) => a.markNotificationsRead(ids),
  adminKeys.notifications,
)
export const useRequestDeletion = m(
  (a, v: { scope: DeletionScope; target: string }) => a.requestDeletion(v),
  adminKeys.deletions,
)
export const useCancelDeletion = m((a, id: string) => a.cancelDeletion(id), adminKeys.deletions)
export const useRevokeSession = m((a, id: string) => a.revokeSession(id), adminKeys.sessions)
export const useUpdateSecurity = m(
  (a, v: Parameters<AdminApi['updateSecurity']>[0]) => a.updateSecurity(v),
  adminKeys.security,
)
export const useUpdateSettings = m(
  (a, v: Parameters<AdminApi['updateSettings']>[0]) => a.updateSettings(v),
  adminKeys.settings,
)

/**
 * Keeps admin screens live: refreshes what an event touches and returns the newest audit
 * event ids so lists can highlight what just arrived.
 */
export function useAdminLive() {
  const api = useAdminApi()
  const qc = useQueryClient()
  const [fresh, setFresh] = useState<AuditEvent[]>([])
  useEffect(
    () =>
      api.subscribe((e) => {
        const map: Record<string, (readonly unknown[])[]> = {
          jobs: [adminKeys.jobs, adminKeys.repos],
          notifications: [adminKeys.notifications],
          deletions: [adminKeys.deletions],
          repos: [adminKeys.repos],
          members: [adminKeys.members, adminKeys.invites],
          settings: [adminKeys.settings, adminKeys.security, adminKeys.sessions],
          audit: [adminKeys.audit],
        }
        for (const k of map[e.kind] ?? []) void qc.invalidateQueries({ queryKey: k })
        if (e.kind === 'audit') setFresh((f) => [e.event, ...f].slice(0, 20))
      }),
    [api, qc],
  )
  return fresh
}
