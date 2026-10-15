import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createMemoryRouter, RouterProvider } from 'react-router'
import { AppProviders } from './app/AppProviders'
import { routes } from './app/routes'
import type { AuthGateway } from './data/auth'
import type { SupabaseAuthClient } from './data/live/supabaseAuth'
import { createDemoAuth } from './data/demo/demoAuth'
import { createMockApi } from './data/mockApi'
import { applyThemeChoice, readThemeChoice } from './design/theme'
import './index.css'
import { createQueryClient } from './lib/queryClient'

/**
 * VITE_AUTH_MODE=live → real Supabase Auth (needs VITE_SUPABASE_URL + publishable key).
 * Anything else → demo accounts, clearly labelled. The Supabase client is only loaded in live
 * mode, so the demo build never needs (or ships) project configuration.
 */
async function createAuth(): Promise<AuthGateway> {
  if (import.meta.env.VITE_AUTH_MODE === 'live') {
    const [{ supabase }, { createSupabaseAuth }] = await Promise.all([
      import('./lib/supabase'),
      import('./data/live/supabaseAuth'),
    ])
    // supabase-js satisfies the narrow interface structurally; the cast avoids coupling to its generics.
    return createSupabaseAuth(supabase as unknown as SupabaseAuthClient, window.location.origin)
  }
  return createDemoAuth()
}

async function bootstrap() {
  // Memory routing lets the prototype run inside a sandboxed single-file page.
  const router =
    import.meta.env.VITE_ROUTER === 'memory' ? createMemoryRouter(routes) : createBrowserRouter(routes)
  // Data is MOCK DATA until the live adapter lands (roadmap Days 2–6); the UI labels it either way.
  const api = createMockApi()
  const auth = await createAuth()

  applyThemeChoice(readThemeChoice())

  const rootElement = document.getElementById('root')
  if (!rootElement) throw new Error('Root element #root not found')

  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders api={api} auth={auth} queryClient={createQueryClient()}>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  )
}

void bootstrap()
