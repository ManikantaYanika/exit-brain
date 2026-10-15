import { describe, expect, it } from 'vitest'
import type { Role } from '../data/types'
import { can, homePathFor, type Capability } from './permissions'

const ROLES: Role[] = ['owner', 'admin', 'manager', 'employee', 'successor', 'viewer']

/** Rows from security-and-privacy.md §4 — who may do what. */
const EXPECTED: [Capability, Role[]][] = [
  ['org.edit', ['owner', 'admin']],
  ['members.invite', ['owner', 'admin']],
  ['members.grantOwner', ['owner']],
  ['integrations.manage', ['owner', 'admin']],
  ['data.requestDeletion', ['owner', 'admin']],
  ['audit.view', ['owner', 'admin']],
  ['transition.create', ['owner', 'admin', 'manager']],
  ['transition.viewSummary', ['owner', 'admin', 'manager', 'viewer']],
  ['evidence.view', ['owner', 'admin', 'manager']],
  ['items.review', ['owner', 'admin', 'manager']],
  ['interview.answer', ['employee']],
  ['answers.viewApproved', ['owner', 'admin', 'manager']],
  ['verification.override', ['owner', 'admin', 'manager']],
  ['handover.approve', ['owner', 'admin', 'manager']],
  ['handover.viewApproved', ['owner', 'admin', 'manager', 'successor']],
  ['successor.workspace', ['successor']],
  ['assistant.escalate', ['successor']],
]

describe('permissions mirror the security role matrix', () => {
  it.each(EXPECTED)('%s is granted to exactly %j', (cap, allowed) => {
    for (const role of ROLES) expect(can(role, cap), `${role} / ${cap}`).toBe(allowed.includes(role))
  })

  it('HR (viewer) never sees evidence, answers or handover text', () => {
    for (const cap of ['evidence.view', 'answers.viewApproved', 'handover.viewApproved'] as Capability[]) {
      expect(can('viewer', cap)).toBe(false)
    }
  })

  it('routes each role to its own home', () => {
    expect(homePathFor('manager')).toBe('/app/transitions')
    expect(homePathFor('employee', 't-1')).toBe('/app/interview/t-1')
    expect(homePathFor('successor', 't-1')).toBe('/app/onboarding/t-1')
    expect(homePathFor('viewer')).toBe('/app/transitions')
  })
})
