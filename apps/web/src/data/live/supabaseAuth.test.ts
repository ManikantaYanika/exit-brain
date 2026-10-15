import { describe, expect, it, vi } from 'vitest'
import { AuthError } from '../auth'
import { createSupabaseAuth, mapSupabaseAuthError, type SupabaseAuthClient } from './supabaseAuth'

function fakeClient(over: {
  session?: unknown
  memberships?: unknown[]
  signInError?: { message: string; code?: string }
}) {
  const calls: Record<string, unknown[]> = {}
  const rec = (k: string) => (arg: unknown) => {
    ;(calls[k] ??= []).push(arg)
  }
  const client = {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: over.session ?? null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(
        async (c: unknown) => (rec('signIn')(c), { error: over.signInError ?? null }),
      ),
      signUp: vi.fn(async (c: unknown) => (rec('signUp')(c), { data: { session: null }, error: null })),
      signInWithOtp: vi.fn(async (c: unknown) => (rec('otp')(c), { error: null })),
      signOut: vi.fn(async () => ({ error: null })),
    },
    functions: {
      invoke: vi.fn(async (_n: string, o: unknown) => (rec('invoke')(o), { data: {}, error: null })),
    },
    from: vi.fn(() => ({
      select: () => ({ eq: () => ({ limit: async () => ({ data: over.memberships ?? [], error: null }) }) }),
    })),
  }
  return { client: client as unknown as SupabaseAuthClient, calls }
}

const user = { id: 'u1', email: 'asha@example.com', user_metadata: { full_name: 'Asha Menon' } }

describe('createSupabaseAuth', () => {
  it('returns null without a session', async () => {
    const { client } = fakeClient({})
    expect(await createSupabaseAuth(client, 'https://app.test').getSession()).toBeNull()
  })

  it('maps a member to a session with role and org', async () => {
    const { client } = fakeClient({
      session: { user },
      memberships: [{ role: 'manager', org_id: 'o1', organizations: { name: 'Acme' } }],
    })
    const s = await createSupabaseAuth(client, 'https://app.test').getSession()
    expect(s).toMatchObject({ name: 'Asha Menon', role: 'manager', orgName: 'Acme', mode: 'live' })
  })

  it('a user with no membership has role null (goes to workspace creation)', async () => {
    const { client } = fakeClient({ session: { user } })
    const s = await createSupabaseAuth(client, 'https://app.test').getSession()
    expect(s?.role).toBeNull()
  })

  it('sign-up normalises email, stores the name and redirects back to sign-in', async () => {
    const { client, calls } = fakeClient({})
    const r = await createSupabaseAuth(client, 'https://app.test').signUp({
      name: ' Asha Menon ',
      email: ' Asha@Example.com',
      password: 'letters123',
    })
    expect(r.needsConfirmation).toBe(true)
    expect(calls.signUp?.[0]).toEqual({
      email: 'asha@example.com',
      password: 'letters123',
      options: { data: { full_name: 'Asha Menon' }, emailRedirectTo: 'https://app.test/signin?confirmed=1' },
    })
  })

  it('magic links never create accounts', async () => {
    const { client, calls } = fakeClient({})
    await createSupabaseAuth(client, 'https://app.test').sendMagicLink('asha@example.com')
    expect(calls.otp?.[0]).toMatchObject({ options: { shouldCreateUser: false } })
  })

  it('workspace creation goes through the api-create-org function', async () => {
    const { client, calls } = fakeClient({})
    await createSupabaseAuth(client, 'https://app.test').createWorkspace!({
      name: ' Acme ',
      sizeBand: '21-50',
    })
    expect(client.functions.invoke).toHaveBeenCalledWith('api-create-org', expect.anything())
    expect(calls.invoke?.[0]).toEqual({ body: { name: 'Acme', size_band: '21-50' } })
  })

  it('wrong credentials surface as a typed AuthError', async () => {
    const { client } = fakeClient({
      signInError: { message: 'Invalid login credentials', code: 'invalid_credentials' },
    })
    await expect(createSupabaseAuth(client, 'https://app.test').signIn('a@b.co', 'x')).rejects.toMatchObject({
      code: 'invalid_credentials',
    })
  })
})

describe('mapSupabaseAuthError', () => {
  it.each([
    [{ message: 'Email not confirmed' }, 'email_not_confirmed'],
    [{ message: 'User already registered' }, 'email_taken'],
    [{ message: 'x', status: 429 }, 'rate_limited'],
    [{ message: 'database exploded at row 7' }, 'unknown'],
  ])('%o → %s', (e, code) => {
    const err = mapSupabaseAuthError(e)
    expect(err).toBeInstanceOf(AuthError)
    expect(err.code).toBe(code)
    expect(err.message).not.toMatch(/database|row/)
  })
})
