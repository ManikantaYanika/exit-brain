import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { AuthGateway } from '../data/auth'
import { createDemoAuth } from '../data/demo/demoAuth'
import { createMockApi } from '../data/mockApi'
import { createQueryClient } from '../lib/queryClient'
import { AppProviders } from './AppProviders'
import { routes } from './routes'

/** Render the full app at `path`, signed in as a demo account (or signed out). */
export function renderApp(path: string, account?: string, auth?: AuthGateway) {
  const api = createMockApi(0)
  const gateway = auth ?? createDemoAuth({ initialAccountId: account, persist: false })
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <AppProviders api={api} auth={gateway} queryClient={createQueryClient()}>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return { api, router, auth: gateway }
}
