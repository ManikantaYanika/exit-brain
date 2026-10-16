import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { Logo } from '../../design/primitives/Logo'
import { GetStartedMenu } from './GetStartedMenu'
import { openSiteGuide } from './guide/events'
import { SiteGuide } from './guide/SiteGuide'
import { useReveal } from './motion/useReveal'
import { FOOTER_NAV, HEADER_NAV } from './nav'
import { SiteLink } from './SiteLink'

const navLink =
  'eb-navlink rounded-control px-2.5 py-2 text-[0.94rem] text-muted transition-colors duration-150 hover:text-ink aria-[current=page]:font-medium aria-[current=page]:text-ink'
const cta =
  'inline-flex h-10 items-center rounded-control bg-brand px-4 text-[0.94rem] font-medium text-on-brand transition-colors duration-150 hover:bg-brand-hover'

function MobileMenu({ onClose }: { onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = panel.current
    el?.querySelector<HTMLElement>('a, button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab' || !el) return
      const items = [...el.querySelectorAll<HTMLElement>('a, button')]
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-[var(--eb-overlay)]"
        onClick={onClose}
      />
      <div
        ref={panel}
        className="eb-enter absolute inset-x-0 top-0 border-b border-line bg-canvas px-4 pt-3 pb-6 shadow-float"
      >
        <div className="flex items-center justify-between">
          <Logo size={28} />
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="rounded-control p-2 text-muted hover:text-ink"
          >
            <X aria-hidden size={20} />
          </button>
        </div>
        <nav aria-label="Main" className="mt-4 flex flex-col">
          {HEADER_NAV.map((n) => (
            <SiteLink
              key={n.href}
              href={n.href}
              onClick={onClose}
              className="rounded-control px-2 py-3 text-lg text-ink hover:bg-band"
            >
              {n.label}
            </SiteLink>
          ))}
        </nav>
        <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
          <SiteLink
            href="/signin"
            onClick={onClose}
            className="rounded-control px-2 py-3 text-ink hover:bg-band"
          >
            Sign in
          </SiteLink>
          <SiteLink href="/signup" onClick={onClose} className={`${cta} justify-center`}>
            Start a pilot
          </SiteLink>
        </div>
      </div>
    </div>
  )
}

/** The public website frame. `.eb-site` switches the page to the website's light, peach tokens. */
export function SiteLayout() {
  const { pathname } = useLocation()
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const [scrolled, setScrolled] = useState(false)
  useReveal(pathname)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="eb-site flex min-h-screen flex-col bg-canvas text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-control focus:bg-surface focus:px-3 focus:py-2 focus:shadow-float"
      >
        Skip to content
      </a>
      <header
        data-scrolled={scrolled}
        className="eb-header sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur-md supports-[not(backdrop-filter:blur(1px))]:bg-canvas"
      >
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-4 sm:px-6">
          <Link to="/" viewTransition aria-label="Exit Brain home" className="shrink-0">
            <Logo size={30} />
          </Link>
          <nav aria-label="Main" className="hidden items-center lg:flex">
            {HEADER_NAV.map((n) => (
              <SiteLink key={n.href} href={n.href} className={navLink}>
                {n.label}
              </SiteLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:block">
              <GetStartedMenu />
            </div>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpenOn(pathname)}
              className="rounded-control p-2 text-ink lg:hidden"
            >
              <Menu aria-hidden size={22} />
            </button>
          </div>
        </div>
      </header>
      {open && <MobileMenu onClose={() => setOpenOn(null)} />}

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-band">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 sm:px-6 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo size={28} />
            <p className="mt-4 text-[0.94rem] leading-relaxed text-muted">
              Knowledge transfer for engineering teams, built on evidence and human approval.
            </p>
            <p className="mt-4 text-sm text-ink">
              Exit Brain is in early development. Pilots are by invitation.
            </p>
          </div>
          {FOOTER_NAV.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <h2 className="text-sm font-semibold text-ink">{g.title}</h2>
              <ul className="mt-3 flex flex-col gap-2 text-[0.94rem]">
                {g.items.map((n) => (
                  <li key={n.href}>
                    <SiteLink href={n.href} className="text-muted transition-colors hover:text-ink">
                      {n.label}
                    </SiteLink>
                  </li>
                ))}
                {g.title === 'Help' && (
                  <li>
                    <button
                      type="button"
                      onClick={openSiteGuide}
                      className="text-muted transition-colors hover:text-ink"
                    >
                      Site guide
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mx-auto max-w-[1200px] px-4 pb-24 text-sm text-muted sm:px-6 sm:pb-10">
          © 2026 Exit Brain
        </div>
      </footer>
      <SiteGuide />
    </div>
  )
}
