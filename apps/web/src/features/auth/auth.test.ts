import { describe, expect, it } from 'vitest'
import type { Session } from '../../data/auth'
import { destinationFor } from './redirect'
import { signUpSchema } from './schemas'

const base: Session = {
  userId: 'u',
  name: 'P',
  email: 'p@x.co',
  role: 'manager',
  roleLabel: 'Manager',
  orgName: 'Acme',
  homeTransitionId: null,
  mode: 'demo',
}

describe('destinationFor', () => {
  it('returns to an in-app page', () => expect(destinationFor(base, '/app/team')).toBe('/app/team'))
  it('ignores external or protocol-relative targets', () => {
    expect(destinationFor(base, '//evil.example/app/')).toBe('/app/transitions')
    expect(destinationFor(base, 'https://evil.example')).toBe('/app/transitions')
  })
  it('sends members without a workspace to /app', () =>
    expect(destinationFor({ ...base, role: null }, '/app/team')).toBe('/app'))
  it('sends the successor to their onboarding', () =>
    expect(destinationFor({ ...base, role: 'successor', homeTransitionId: 't1' }, undefined)).toBe(
      '/app/onboarding/t1',
    ))
})

describe('signUpSchema', () => {
  it('matches the Supabase password policy', () => {
    expect(signUpSchema.safeParse({ name: 'Asha', email: 'a@b.co', password: 'short1' }).success).toBe(false)
    expect(signUpSchema.safeParse({ name: 'Asha', email: 'a@b.co', password: '12345678' }).success).toBe(
      false,
    )
    expect(signUpSchema.safeParse({ name: 'Asha', email: 'a@b.co', password: 'abc12345' }).success).toBe(true)
  })
})
