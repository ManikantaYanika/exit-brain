/**
 * Data-mode entry used ONLY by the single-file prototype artifact (`npm run build:prototype`,
 * vite.prototype.config.ts + index.prototype.html, memory router). The website and app build
 * through React Router framework mode instead: src/root.tsx + src/routes.ts.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createMemoryRouter, RouterProvider } from 'react-router'
import { AppProviders } from './app/AppProviders'
import { createAuth } from './app/createAuth'
import { routes } from './app/routes'
import { createMockApi } from './data/mockApi'
import { applyThemeChoice, readThemeChoice } from './design/theme'
import './index.css'
import { createQueryClient } from './lib/queryClient'

async function bootstrap() {
  // Memory routing lets the prototype run inside a sandboxed single-file page.
  const router =
    import.meta.env.VITE_ROUTER === 'memory' ? createMemoryRouter(routes) : createBrowserRouter(routes)
  // Data is MOCK DATA until the live adapter lands (roadmap Days 2–6); the UI labels it either way.
  const api = createMockApi()
  const auth = createAuth()

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
