import type { AuthGateway } from '../auth'

/**
 * Wraps a gateway that can only be created in the browser (live Supabase auth reads browser env
 * and storage). Nothing is loaded at import time, so prerendering on the build machine never
 * touches Supabase; the real gateway is created once, on the first call, in the browser.
 */
export function createLazyGateway(mode: AuthGateway['mode'], load: () => Promise<AuthGateway>): AuthGateway {
  let pending: Promise<AuthGateway> | null = null
  const get = () => (pending ??= load())

  return {
    mode,
    getSession: async () => (await get()).getSession(),
    onChange(listener) {
      let unsubscribe: (() => void) | null = null
      let cancelled = false
      void get().then((g) => {
        if (!cancelled) unsubscribe = g.onChange(listener)
      })
      return () => {
        cancelled = true
        unsubscribe?.()
      }
    },
    signIn: async (email, password) => (await get()).signIn(email, password),
    signUp: async (input) => (await get()).signUp(input),
    sendMagicLink: async (email) => (await get()).sendMagicLink(email),
    signOut: async () => (await get()).signOut(),
    createWorkspace: async (input) => {
      const g = await get()
      if (!g.createWorkspace) throw new Error('This sign-in mode cannot create workspaces')
      return g.createWorkspace(input)
    },
  }
}
