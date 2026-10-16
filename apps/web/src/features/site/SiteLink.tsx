import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router'

/**
 * Website link.
 * - Routes ('/features') use a client-side NavLink with a view transition; the current page gets
 *   aria-current="page" (styled in SiteLayout).
 * - Home sections ('/#pricing') are plain anchors: '#pricing' on the home page (instant scroll),
 *   '/#pricing' elsewhere (loads the prerendered home and the browser scrolls to the section).
 */
export function SiteLink({
  href,
  className,
  children,
  onClick,
}: {
  href: string
  className?: string
  children: ReactNode
  onClick?: () => void
}) {
  const { pathname } = useLocation()
  if (href.startsWith('/#')) {
    return (
      <a href={pathname === '/' ? href.slice(1) : href} className={className} onClick={onClick}>
        {children}
      </a>
    )
  }
  return (
    <NavLink to={href} end viewTransition className={className} onClick={onClick}>
      {children}
    </NavLink>
  )
}
