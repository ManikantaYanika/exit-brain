import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createMemoryRouter, RouterProvider } from 'react-router'
import { AppProviders } from './app/AppProviders'
import { routes } from './app/routes'
import { createMockApi } from './data/mockApi'
import { applyThemeChoice, readThemeChoice } from './design/theme'
import './index.css'
import { createQueryClient } from './lib/queryClient'

// Memory routing lets the prototype run inside a sandboxed single-file page (no URL state needed).
const router =
  import.meta.env.VITE_ROUTER === 'memory' ? createMemoryRouter(routes) : createBrowserRouter(routes)

// Prototype: in-memory MOCK DATA adapter. The Supabase adapter replaces this in the real build.
const api = createMockApi()

applyThemeChoice(readThemeChoice())

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found')

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders api={api} queryClient={createQueryClient()}>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
)
