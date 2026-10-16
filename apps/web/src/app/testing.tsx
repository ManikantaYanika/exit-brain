import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { AuthGateway } from '../data/auth'
import { createDemoAuth } from '../data/demo/demoAuth'
import { createMockAdminApi } from '../data/admin/mockAdminApi'
import { createMockApi } from '../data/mockApi'
import { createQueryClient } from '../lib/queryClient'
import { AppProviders } from './AppProviders'
import { routes } from './routes'

/** Render the full app at `path`, signed in as a demo account (or signed out). */
export function renderApp(path: string, account?: string, auth?: AuthGateway) {
  const api = createMockApi(0)
  // No live loop in tests: they advance the simulation with adminApi.tick().
  const adminApi = createMockAdminApi({ latencyMs: 0, tickMs: 0 })
  const gateway = auth ?? createDemoAuth({ initialAccountId: account, persist: false })
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <AppProviders api={api} auth={gateway} queryClient={createQueryClient()} adminApi={adminApi}>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return { api, adminApi, router, auth: gateway }
}
