import { Link, Outlet } from 'react-router'
import { Logo } from '../../design/primitives/Logo'
import { ThemeToggle } from '../../design/primitives/ThemeToggle'

const NAV = [
  { href: '#how', label: 'How it works' },
  { href: '#roles', label: 'For each role' },
  { href: '#trust', label: 'Security' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export function MarketingLayout() {
  return (
    <div className="min-h-screen bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 sm:px-6">
          <Link to="/" aria-label="Exit Brain home">
            <Logo size={30} />
          </Link>
          <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="rounded-control px-2.5 py-1.5 text-sm text-muted hover:text-ink"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <Link
              to="/signin"
              className="rounded-control px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-sunken"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="inline-flex h-9 items-center rounded-control bg-brand px-3.5 text-sm font-medium text-on-brand hover:bg-brand-hover"
            >
              Start a pilot
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="max-w-xs">
            <Logo size={26} />
            <p className="mt-3 text-sm text-muted">
              Knowledge transfer for engineering teams, built on evidence and human approval.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
            <a href="#how" className="text-muted hover:text-ink">
              How it works
            </a>
            <Link to="/demo" className="text-muted hover:text-ink">
              Try the demo
            </Link>
            <a href="#trust" className="text-muted hover:text-ink">
              Security
            </a>
            <Link to="/signin" className="text-muted hover:text-ink">
              Sign in
            </Link>
            <a href="#pricing" className="text-muted hover:text-ink">
              Pricing
            </a>
            <Link to="/signup" className="text-muted hover:text-ink">
              Start a pilot
            </Link>
          </nav>
        </div>
        <p className="mx-auto max-w-6xl px-4 pb-8 text-xs text-muted sm:px-6">© 2026 Exit Brain</p>
      </footer>
    </div>
  )
}
