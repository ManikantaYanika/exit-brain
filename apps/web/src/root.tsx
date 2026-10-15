import type { ReactNode } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { AppProviders } from './app/AppProviders'
import { createAuth } from './app/createAuth'
import { createMockApi } from './data/mockApi'
import plexSans400 from './design/fonts/ibm-plex-sans-latin-400-normal.woff2?url'
import plexSans600 from './design/fonts/ibm-plex-sans-latin-600-normal.woff2?url'
import appCss from './index.css?url'
import { createQueryClient } from './lib/queryClient'

// Created once per page load. In live mode, Supabase is loaded lazily in the browser (createAuth).
// Product data stays MOCK DATA until the live data adapter lands (roadmap Days 2–6).
const api = createMockApi()
const auth = createAuth()
const queryClient = createQueryClient()

// Applies the saved theme before first paint, so dark-mode users don't see a light flash.
const themeScript = `try{var t=localStorage.getItem('eb-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`

/** Default metadata; route modules override it (pageMeta / appMeta in routes/meta.ts). */
export const meta = () => [{ title: 'Exit Brain' }]

/**
 * The stylesheet blocks first paint, so it is declared with a React `precedence`: React then emits it
 * ahead of the module preloads it hoists into <head> (measured: see docs/04-ux/website-w1b-report.md).
 * Then the two most-used font faces, so text renders in IBM Plex without a late swap.
 */
export const links = () => [
  { rel: 'stylesheet', href: appCss, precedence: 'default' },
  { rel: 'preload', href: plexSans400, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' as const },
  { rel: 'preload', href: plexSans600, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' as const },
]

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/png" href="/brand/mark-32.png" />
        <link rel="apple-touch-icon" href="/brand/mark-192.png" />
        <meta name="theme-color" content="#0d1939" />
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
