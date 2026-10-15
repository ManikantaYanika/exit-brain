import type { ReactNode } from 'react'
import { Link } from 'react-router'

/** Route links get a view transition; same-page section links stay plain anchors. */
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
  if (href.startsWith('/#')) {
    return (
      <a href={href.slice(1)} className={className} onClick={onClick}>
        {children}
      </a>
    )
  }
  return (
    <Link to={href} viewTransition className={className} onClick={onClick}>
      {children}
    </Link>
  )
}
