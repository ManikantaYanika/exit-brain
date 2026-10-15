import type { Role } from './types'

export type SizeBand = '1-20' | '21-50' | '51-150' | '151+'

/** The signed-in person as the UI needs them. Authorization itself is enforced by RLS. */
export interface Session {
  userId: string
  name: string
  email: string
  /** null = signed in but not a member of any organisation yet (goes to workspace setup). */
  role: Role | null
  roleLabel: string
  orgName: string | null
  /** Transition this person is the leaving employee or successor of, if any. */
  homeTransitionId: string | null
  mode: 'demo' | 'live'
}

export interface DemoAccount {
  id: string
  name: string
  email: string
  role: Role
  roleLabel: string
  summary: string
}

export type AuthErrorCode =
  'invalid_credentials' | 'email_not_confirmed' | 'email_taken' | 'weak_password' | 'rate_limited' | 'unknown'

export class AuthError extends Error {
  readonly code: AuthErrorCode
  constructor(code: AuthErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'AuthError'
  }
}

/**
 * The single contract between screens and authentication.
 * demoAuth: fixed demo accounts, nothing leaves the browser.
 * supabaseAuth: real Supabase Auth (sign-up, email confirmation, password, magic link).
 */
export interface AuthGateway {
  readonly mode: 'demo' | 'live'
  getSession(): Promise<Session | null>
  /** Subscribe to sign-in / sign-out. Returns an unsubscribe function. */
  onChange(listener: () => void): () => void
  signIn(email: string, password: string): Promise<Session>
  signUp(input: { name: string; email: string; password: string }): Promise<{ needsConfirmation: boolean }>
  sendMagicLink(email: string): Promise<void>
  signOut(): Promise<void>
  /** Signed-in users without a workspace create one and become its owner (live mode). */
  createWorkspace?(input: { name: string; sizeBand?: SizeBand }): Promise<void>
  /** Demo mode only. */
  readonly demoAccounts?: DemoAccount[]
  signInAsDemo?(accountId: string): Promise<Session>
}
