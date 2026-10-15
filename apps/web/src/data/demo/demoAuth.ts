/**
 * Demo authentication: fixed, fictional accounts. No account is created and nothing is
 * sent anywhere. Every screen that uses it says so (DemoBar, auth page notices).
 */
import { AuthError, type AuthGateway, type DemoAccount, type Session } from '../auth'

export const DEMO_ORG = 'Acme SaaS'

export const demoAccounts: DemoAccount[] = [
  {
    id: 'neha',
    name: 'Neha Kapoor',
    email: 'neha@acme.dev',
    role: 'owner',
    roleLabel: 'CTO, workspace owner',
    summary: 'Sets up the workspace, team and GitHub, and sees every transition.',
  },
  {
    id: 'priya',
    name: 'Priya Nair',
    email: 'priya@acme.dev',
    role: 'manager',
    roleLabel: 'Engineering Manager',
    summary: 'Reviews what Ravi alone knows, follows the interview and approves the handover.',
  },
  {
    id: 'ravi',
    name: 'Ravi Kumar',
    email: 'ravi@acme.dev',
    role: 'employee',
    roleLabel: 'Leaving engineer',
    summary: 'Answers evidence-based questions and approves what gets shared.',
  },
  {
    id: 'kiran',
    name: 'Kiran Rao',
    email: 'kiran@acme.dev',
    role: 'successor',
    roleLabel: 'Successor',
    summary: 'Works through the checklist and asks the assistant how Ravi handled things.',
  },
  {
    id: 'anita',
    name: 'Anita Shah',
    email: 'anita@acme.dev',
    role: 'viewer',
    roleLabel: 'HR Business Partner',
    summary: 'Follows status and progress without seeing any knowledge content.',
  },
]

const HOME_TRANSITION: Record<string, string | null> = { ravi: 't-ravi', kiran: 't-ravi' }
const STORAGE_KEY = 'eb-demo-session'

function toSession(a: DemoAccount): Session {
  return {
    userId: `demo-${a.id}`,
    name: a.name,
    email: a.email,
    role: a.role,
    roleLabel: a.roleLabel,
    orgName: DEMO_ORG,
    homeTransitionId: HOME_TRANSITION[a.id] ?? null,
    mode: 'demo',
  }
}

/** Demo password shown on the sign-in page; it protects nothing because there is nothing to protect. */
export const DEMO_PASSWORD = 'demo-only-1'

export function createDemoAuth(options: { initialAccountId?: string; persist?: boolean } = {}): AuthGateway {
  const persist = options.persist ?? true
  const listeners = new Set<() => void>()
  let current: string | null = options.initialAccountId ?? null

  if (current === null && persist) {
    try {
      current = sessionStorage.getItem(STORAGE_KEY)
    } catch {
      current = null
    }
  }

  const set = (id: string | null) => {
    current = id
    if (persist) {
      try {
        if (id) sessionStorage.setItem(STORAGE_KEY, id)
        else sessionStorage.removeItem(STORAGE_KEY)
      } catch {
        // Session still works for this page view.
      }
    }
    listeners.forEach((l) => l())
  }

  const byId = (id: string) => demoAccounts.find((a) => a.id === id)

  return {
    mode: 'demo',
    demoAccounts,
    getSession: async () => {
      const a = current ? byId(current) : undefined
      return a ? toSession(a) : null
    },
    onChange(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    async signIn(email, password) {
      const a = demoAccounts.find((x) => x.email === email.trim().toLowerCase())
      if (!a || password !== DEMO_PASSWORD) {
        throw new AuthError('invalid_credentials', 'Email or password is incorrect.')
      }
      set(a.id)
      return toSession(a)
    },
    async signUp() {
      // Nothing is created in demo mode; the check-email screen says so.
      return { needsConfirmation: true }
    },
    async sendMagicLink() {
      // No email is sent in demo mode; the screen says so.
    },
    async signOut() {
      set(null)
    },
    async signInAsDemo(accountId) {
      const a = byId(accountId)
      if (!a) throw new AuthError('unknown', 'That demo account does not exist.')
      set(a.id)
      return toSession(a)
    },
  }
}
