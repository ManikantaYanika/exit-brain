import type { AuthGateway } from '../data/auth'
import { createDemoAuth } from '../data/demo/demoAuth'
import { createLazyGateway } from '../data/live/lazyGateway'
import type { SupabaseAuthClient } from '../data/live/supabaseAuth'

/**
 * VITE_AUTH_MODE=live → real Supabase Auth (needs VITE_SUPABASE_URL + publishable key).
 * Anything else → demo accounts, clearly labelled. Supabase code is only loaded in live mode
 * and only in the browser; the demo build never needs (or ships) project configuration.
 */
export function createAuth(): AuthGateway {
  if (import.meta.env.VITE_AUTH_MODE === 'live') {
    return createLazyGateway('live', async () => {
      const [{ supabase }, { createSupabaseAuth }] = await Promise.all([
        import('../lib/supabase'),
        import('../data/live/supabaseAuth'),
      ])
      // supabase-js satisfies the narrow interface structurally; the cast avoids coupling to its generics.
      return createSupabaseAuth(supabase as unknown as SupabaseAuthClient, window.location.origin)
    })
  }
  return createDemoAuth()
}
