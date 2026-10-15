/**
 * Real authentication on Supabase Auth. Enabled with VITE_AUTH_MODE=live once a Supabase
 * project exists. Sign-up requires email confirmation (config.toml, security T11).
 * The browser only ever holds the publishable/anon key; RLS decides what this user can read.
 */
import { AuthError, type AuthGateway, type Session } from '../auth'
import type { Role } from '../types'

/** The slice of supabase-js this adapter uses — kept narrow so it can be unit-tested with a fake. */
export interface SupabaseAuthClient {
  auth: {
    getSession(): Promise<{
      data: {
        session: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } } | null
      }
    }>
    onAuthStateChange(cb: (event: string) => void): { data: { subscription: { unsubscribe(): void } } }
    signInWithPassword(c: {
      email: string
      password: string
    }): Promise<{ error: { message: string; code?: string; status?: number } | null }>
    signUp(c: {
      email: string
      password: string
      options?: { data?: Record<string, unknown>; emailRedirectTo?: string }
    }): Promise<{
      data: { session: unknown | null }
      error: { message: string; code?: string; status?: number } | null
    }>
    signInWithOtp(c: {
      email: string
      options?: { emailRedirectTo?: string; shouldCreateUser?: boolean }
    }): Promise<{ error: { message: string; code?: string; status?: number } | null }>
    signOut(): Promise<{ error: { message: string } | null }>
  }
  functions: {
    invoke(
      name: 'api-create-org',
      options: { body: { name: string; size_band?: string } },
    ): Promise<{ data: unknown; error: { message: string; context?: unknown } | null }>
  }
  from(table: 'memberships'): {
    select(columns: string): {
      eq(
        column: string,
        value: string,
      ): {
        limit(n: number): PromiseLike<{
          data: { role: Role; org_id: string; organizations: { name: string } | null }[] | null
          error: { message: string } | null
        }>
      }
    }
  }
}

const ROLE_LABEL: Record<Role, string> = {
  owner: 'Workspace owner',
  admin: 'Admin',
  manager: 'Manager',
  employee: 'Leaving engineer',
  successor: 'Successor',
  viewer: 'Viewer',
}

/** Map Supabase Auth errors to messages that say what to do, without leaking internals. */
export function mapSupabaseAuthError(e: { message: string; code?: string; status?: number }): AuthError {
  const code = e.code ?? ''
  const msg = e.message.toLowerCase()
  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) {
    return new AuthError('invalid_credentials', 'Email or password is incorrect.')
  }
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return new AuthError('email_not_confirmed', 'Confirm your email first. The link is in your inbox.')
  }
  if (code === 'user_already_exists' || msg.includes('already registered')) {
    return new AuthError('email_taken', 'An account with this email already exists. Sign in instead.')
  }
  if (code === 'weak_password' || msg.includes('password')) {
    return new AuthError('weak_password', 'Use at least 8 characters with letters and numbers.')
  }
  if (e.status === 429 || code.includes('rate_limit')) {
    return new AuthError('rate_limited', 'Too many attempts. Wait a minute and try again.')
  }
  return new AuthError('unknown', 'Something went wrong. Try again.')
}

export function createSupabaseAuth(client: SupabaseAuthClient, appOrigin: string): AuthGateway {
  async function load(): Promise<Session | null> {
    const { data } = await client.auth.getSession()
    const user = data.session?.user
    if (!user) return null
    const { data: rows, error } = await client
      .from('memberships')
      .select('role, org_id, organizations(name)')
      .eq('user_id', user.id)
      .limit(1)
    if (error) throw new AuthError('unknown', 'Couldn’t load your workspace. Try again.')
    const m = rows?.[0]
    const fullName = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : ''
    return {
      userId: user.id,
      name: fullName || (user.email ?? ''),
      email: user.email ?? '',
      role: m?.role ?? null,
      roleLabel: m ? ROLE_LABEL[m.role] : 'No workspace yet',
      orgName: m?.organizations?.name ?? null,
      homeTransitionId: null, // resolved from transitions in live data mode (roadmap Days 2–6)
      mode: 'live',
    }
  }

  return {
    mode: 'live',
    getSession: load,
    onChange(listener) {
      const { data } = client.auth.onAuthStateChange(() => listener())
      return () => data.subscription.unsubscribe()
    },
    async signIn(email, password) {
      const { error } = await client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
      if (error) throw mapSupabaseAuthError(error)
      const s = await load()
      if (!s) throw new AuthError('unknown', 'Signed in, but no session was returned. Try again.')
      return s
    },
    async signUp({ name, email, password }) {
      const { data, error } = await client.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: name.trim() }, emailRedirectTo: `${appOrigin}/signin?confirmed=1` },
      })
      if (error) throw mapSupabaseAuthError(error)
      return { needsConfirmation: data.session === null }
    },
    async sendMagicLink(email) {
      const { error } = await client.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: `${appOrigin}/app`, shouldCreateUser: false },
      })
      if (error) throw mapSupabaseAuthError(error)
    },
    async signOut() {
      await client.auth.signOut()
    },
    async createWorkspace({ name, sizeBand }) {
      // Goes through the api-create-org Edge Function (validation + audit), never a direct insert.
      const { error } = await client.functions.invoke('api-create-org', {
        body: { name: name.trim(), ...(sizeBand ? { size_band: sizeBand } : {}) },
      })
      if (error) throw new AuthError('unknown', 'Couldn’t create the workspace. Try again.')
    },
  }
}
