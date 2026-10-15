import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthGateway, Session } from '../data/auth'

type Status = 'loading' | 'signedOut' | 'signedIn'

interface AuthState {
  gateway: AuthGateway
  session: Session | null
  status: Status
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ gateway, children }: { gateway: AuthGateway; children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  const refresh = useCallback(async () => {
    try {
      const s = await gateway.getSession()
      setSession(s)
      setStatus(s ? 'signedIn' : 'signedOut')
    } catch {
      setSession(null)
      setStatus('signedOut')
    }
  }, [gateway])

  useEffect(() => {
    let active = true
    gateway
      .getSession()
      .catch(() => null)
      .then((s) => {
        if (!active) return
        setSession(s)
        setStatus(s ? 'signedIn' : 'signedOut')
      })
    const unsubscribe = gateway.onChange(() => void refresh())
    return () => {
      active = false
      unsubscribe()
    }
  }, [gateway, refresh])

  const value = useMemo(() => ({ gateway, session, status, refresh }), [gateway, session, status, refresh])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
