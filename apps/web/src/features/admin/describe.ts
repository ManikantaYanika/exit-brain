import type { AuditEvent } from '../../data/admin/types'

/** Plain-language line for an audit event, plus a colour by kind. IDs and counts only, never content. */
export function describeAudit(e: AuditEvent): { text: string; color: string; group: AuditGroup } {
  const m = e.meta
  const target = e.target.replace(/^[a-z]+:/, '')
  const C = {
    access: 'var(--eb-brand)',
    data: 'var(--eb-conflicting)',
    work: 'var(--eb-supported)',
    system: 'var(--eb-muted)',
    security: 'var(--eb-partial)',
  }
  switch (e.action) {
    case 'auth.login':
      return { text: 'signed in', color: C.access, group: 'Access' }
    case 'auth.session_revoked':
      return { text: `signed out a session (${m.device ?? target})`, color: C.security, group: 'Access' }
    case 'member.invited':
      return { text: `invited someone as ${m.role ?? 'member'}`, color: C.access, group: 'Members' }
    case 'member.invite_revoked':
      return { text: 'revoked an invite', color: C.access, group: 'Members' }
    case 'member.invite_resent':
      return { text: 'resent an invite', color: C.access, group: 'Members' }
    case 'member.role_changed':
      return { text: `changed a role from ${m.from} to ${m.to}`, color: C.security, group: 'Members' }
    case 'member.removed':
      return { text: 'deactivated a member', color: C.security, group: 'Members' }
    case 'member.reactivated':
      return { text: 'reactivated a member', color: C.access, group: 'Members' }
    case 'repos.selected':
      return {
        text:
          m.added && typeof m.added === 'string'
            ? `added ${m.added} to GitHub access`
            : m.removed && typeof m.removed === 'string'
              ? `removed ${m.removed} from GitHub access`
              : 'changed the repositories Exit Brain reads',
        color: C.access,
        group: 'Integrations',
      }
    case 'integration.connected':
      return { text: 'connected the GitHub App (read-only)', color: C.access, group: 'Integrations' }
    case 'ingestion.requested':
      return { text: `asked for a sync of ${target}`, color: C.system, group: 'Jobs' }
    case 'ingestion.started':
      return { text: `started reading ${target}`, color: C.system, group: 'Jobs' }
    case 'ingestion.completed':
      return { text: `finished reading ${target}`, color: C.work, group: 'Jobs' }
    case 'ingestion.failed':
      return {
        text: `couldn’t read ${target} after ${m.attempts ?? 'several'} attempts`,
        color: C.data,
        group: 'Jobs',
      }
    case 'job.requested':
      return { text: `queued ${m.type ?? 'a job'} for ${target}`, color: C.system, group: 'Jobs' }
    case 'job.completed':
      return { text: `finished ${m.type ?? 'a job'}`, color: C.work, group: 'Jobs' }
    case 'job.retried':
      return { text: `retried ${target} (attempt ${m.attempt})`, color: C.system, group: 'Jobs' }
    case 'job.cancelled':
      return { text: `cancelled ${target}`, color: C.system, group: 'Jobs' }
    case 'transition.created':
      return { text: `started a transition (${target})`, color: C.work, group: 'Handover' }
    case 'item.reviewed':
      return { text: `${m.decision ?? 'reviewed'} a knowledge area`, color: C.work, group: 'Handover' }
    case 'answers.approved':
      return {
        text: `approved ${m.answers ?? ''} interview answers`.replace('  ', ' '),
        color: C.work,
        group: 'Handover',
      }
    case 'verification.overridden':
      return {
        text: `changed a verification from ${m.from} to ${m.to}`,
        color: C.security,
        group: 'Handover',
      }
    case 'handover.approved':
      return { text: `approved a handover (version ${m.version})`, color: C.work, group: 'Handover' }
    case 'handover.exported':
      return { text: `exported a handover as ${m.format}`, color: C.work, group: 'Handover' }
    case 'data.deletion_requested':
      return { text: `requested deletion: ${target}`, color: C.data, group: 'Data' }
    case 'data.deletion_cancelled':
      return { text: `cancelled a deletion: ${target}`, color: C.data, group: 'Data' }
    case 'data.deletion_executed':
      return { text: `deleted ${m.records ?? ''} records: ${target}`, color: C.data, group: 'Data' }
    case 'org.retention_changed':
      return { text: `changed retention from ${m.from} to ${m.to} days`, color: C.data, group: 'Data' }
    case 'org.security_changed':
      return { text: 'changed security settings', color: C.security, group: 'Settings' }
    case 'org.settings_changed':
      return { text: 'changed workspace settings', color: C.system, group: 'Settings' }
    default:
      return { text: `${e.action} on ${target}`, color: C.system, group: 'Settings' }
  }
}

export type AuditGroup = 'Access' | 'Members' | 'Integrations' | 'Jobs' | 'Handover' | 'Data' | 'Settings'
export const AUDIT_GROUPS: AuditGroup[] = [
  'Access',
  'Members',
  'Integrations',
  'Jobs',
  'Handover',
  'Data',
  'Settings',
]
