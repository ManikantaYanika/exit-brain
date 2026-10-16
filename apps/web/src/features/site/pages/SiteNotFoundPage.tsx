import { PageHeader } from '../PageHeader'
import { SiteLink } from '../SiteLink'
import { container } from '../styles'

const LINKS = [
  { label: 'Home', href: '/' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Help centre', href: '/help' },
  { label: 'Contact', href: '/contact' },
]

/** Website 404 (website-copy.md §11). Served with HTTP 404 by the host (deploy/nginx). */
export function SiteNotFoundPage() {
  return (
    <>
      <PageHeader kicker="404" title="Page not found" lead="The link may be out of date. Try one of these:" />
      <nav aria-label="Suggested pages" className={`${container} py-14`}>
        <ul className="flex flex-wrap gap-3">
          {LINKS.map((l) => (
            <li key={l.href}>
              <SiteLink
                href={l.href}
                className="inline-flex h-11 items-center rounded-control border border-line-strong bg-surface px-5 font-medium hover:bg-band"
              >
                {l.label}
              </SiteLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
