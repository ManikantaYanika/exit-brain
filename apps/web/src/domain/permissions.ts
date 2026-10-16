/**
 * UI capability map — mirrors docs/07-security/security-and-privacy.md §4 (role matrix).
 * It decides what the interface OFFERS. Postgres RLS decides what is ALLOWED; if the two
 * ever disagree, RLS wins and this file is the bug. permissions.test.ts pins the matrix.
 */
import type { Role } from '../data/types'

export type Capability =
  | 'org.view'
  | 'org.edit'
  | 'members.invite'
  | 'members.changeRole'
  | 'members.grantOwner'
  | 'integrations.manage'
  | 'data.requestDeletion'
  | 'audit.view'
  | 'transition.create'
  | 'transition.viewAll'
  | 'transition.viewSummary'
  | 'evidence.view'
  | 'items.review'
  | 'interview.answer'
  | 'answers.viewApproved'
  | 'verification.override'
  | 'handover.edit'
  | 'handover.approve'
  | 'handover.viewApproved'
  | 'handover.export'
  | 'successor.workspace'
  | 'assistant.ask'
  | 'assistant.escalate'

const STAFF: Capability[] = [
  'org.view',
  'transition.create',
  'transition.viewAll',
  'transition.viewSummary',
  'evidence.view',
  'items.review',
  'answers.viewApproved',
  'verification.override',
  'handover.edit',
  'handover.approve',
  'handover.viewApproved',
  'handover.export',
]

const MATRIX: Record<Role, ReadonlySet<Capability>> = {
  owner: new Set<Capability>([
    ...STAFF,
    'org.edit',
    'members.invite',
    'members.changeRole',
    'members.grantOwner',
    'integrations.manage',
    'data.requestDeletion',
    'audit.view',
  ]),
  admin: new Set<Capability>([
    ...STAFF,
    'org.edit',
    'members.invite',
    'members.changeRole',
    'integrations.manage',
    'data.requestDeletion',
    'audit.view',
  ]),
  manager: new Set<Capability>(STAFF),
  // Leaving employee: only their own interview (RLS scopes to their transition).
  employee: new Set<Capability>(['org.view', 'interview.answer']),
  successor: new Set<Capability>([
    'org.view',
    'handover.viewApproved',
    'handover.export',
    'successor.workspace',
    'assistant.ask',
    'assistant.escalate',
  ]),
  // HR / viewer: status only — no evidence, answers or handover text.
  viewer: new Set<Capability>(['org.view', 'transition.viewSummary']),
}

export function can(role: Role, capability: Capability): boolean {
  return MATRIX[role].has(capability)
}

export function capabilitiesOf(role: Role): Capability[] {
  return [...MATRIX[role]].sort()
}

/** Where each role lands after sign-in (ux-plan §5.2). */
export function homePathFor(role: Role, transitionId?: string): string {
  if (role === 'employee') return transitionId ? `/app/interview/${transitionId}` : '/app'
  if (role === 'successor') return transitionId ? `/app/onboarding/${transitionId}` : '/app'
  if (role === 'owner' || role === 'admin') return '/app/admin'
  return '/app/transitions'
}
