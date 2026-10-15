import type { ReactNode } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { AppProviders } from './app/AppProviders'
import { createDemoAuth } from './data/demo/demoAuth'
import { createMockApi } from './data/mockApi'
import './index.css'
import { createQueryClient } from './lib/queryClient'

// SPIKE (W1): demo auth + mock data only. Live Supabase auth wiring is a follow-up (see spike report).
const api = createMockApi()
const auth = createDemoAuth()
const queryClient = createQueryClient()

// Applies the saved theme before first paint (replaces applyThemeChoice in main.tsx).
const themeScript = `try{var t=localStorage.getItem('eb-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/png" href="/brand/mark-32.png" />
        <link rel="apple-touch-icon" href="/brand/mark-192.png" />
        <meta name="theme-color" content="#0d1939" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  return (
    <AppProviders api={api} auth={auth} queryClient={queryClient}>
      <Outlet />
    </AppProviders>
  )
}
