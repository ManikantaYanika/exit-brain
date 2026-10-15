import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Logo } from '../../design/primitives/Logo'
import { ThemeToggle } from '../../design/primitives/ThemeToggle'

/** Shared frame for sign-in, sign-up, check-email and the demo picker. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,var(--eb-brand-soft),transparent)]"
      />
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" aria-label="Exit Brain home">
          <Logo size={28} />
        </Link>
        <ThemeToggle />
      </header>
      <main id="main" className="relative flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:pt-12">
        <div className={`eb-enter w-full ${wide ? 'max-w-4xl' : 'max-w-md'}`}>
          <div className={wide ? 'text-center' : ''}>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
          </div>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
        </div>
      </main>
    </div>
  )
}

export function AuthCard({ children }: { children: ReactNode }) {
  return <div className="rounded-panel border border-line bg-surface p-6 shadow-float sm:p-7">{children}</div>
}
