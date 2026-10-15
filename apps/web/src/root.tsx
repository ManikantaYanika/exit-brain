import type { ReactNode } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { api, queryClient } from './app/runtime'
import { ApiProvider } from './data/ApiProvider'
import { ToastProvider } from './design/primitives/Toast'
import plexSans400 from './design/fonts/ibm-plex-sans-latin-400-normal.woff2?url'
import plexSans600 from './design/fonts/ibm-plex-sans-latin-600-normal.woff2?url'
import appCss from './index.css?url'

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
    // AuthProvider lives in routes/auth-scope.tsx, around sign-in and app routes only.
    <QueryClientProvider client={queryClient}>
      <ApiProvider api={api}>
        <ToastProvider>
          <Outlet />
        </ToastProvider>
      </ApiProvider>
    </QueryClientProvider>
  )
}
