import { ChevronDown, type LucideIcon } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { SiteLink } from './SiteLink'

/**
 * A card that opens to show more detail. The whole header is one button (aria-expanded/aria-controls);
 * the extra text is always in the HTML (prerendered, indexable) and is `inert` while closed.
 * More text only ever comes from copy already approved elsewhere on the site.
 */
export function ExpandCard({
  Icon,
  badge,
  title,
  summary,
  more,
  link,
  tone = 'light',
  className = '',
}: {
  Icon?: LucideIcon
  badge?: ReactNode
  title: string
  summary: ReactNode
  more: ReactNode
  link?: { label: string; href: string }
  tone?: 'light' | 'dark'
  className?: string
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const dark = tone === 'dark'
  return (
    <li
      data-reveal
      className={`eb-card relative rounded-[14px] border ${
        dark ? 'border-white/10 bg-white/[0.04] hover:border-white/25' : 'border-line bg-surface'
      } ${className}`}
    >
      <div className="flex flex-col gap-2 p-5">
        <span className="flex items-start justify-between gap-3">
          <span className="flex items-center gap-3">
            {badge}
            {Icon && (
              <Icon
                aria-hidden
                size={20}
                strokeWidth={1.75}
                className={`shrink-0 ${dark ? 'text-spark' : 'text-brand'}`}
              />
            )}
          </span>
          <ChevronDown
            aria-hidden
            size={18}
            className={`mt-0.5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${
              dark ? 'text-on-ink-muted' : 'text-muted'
            }`}
          />
        </span>
        <h3 className="text-[1.0625rem] font-semibold">
          {/* Accordion pattern: the heading holds the button; its ::after makes the whole card clickable. */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-more`}
            onClick={() => setOpen((o) => !o)}
            className={`cursor-pointer text-left after:absolute after:inset-0 after:rounded-[14px] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 ${
              dark ? 'focus-visible:after:outline-spark' : 'focus-visible:after:outline-brand'
            }`}
          >
            {title}
          </button>
        </h3>
        <p className={`text-[0.94rem] leading-relaxed ${dark ? 'text-on-ink-muted' : 'text-muted'}`}>
          {summary}
        </p>
        <span aria-hidden className={`text-sm font-medium ${dark ? 'text-spark' : 'text-link'}`}>
          {open ? 'Show less' : 'Show more'}
        </span>
      </div>
      <div id={`${id}-more`} className="eb-expand relative z-10" data-open={open}>
        <div inert={!open}>
          <div
            className={`mx-5 mb-5 border-t pt-4 text-[0.94rem] leading-relaxed ${
              dark ? 'border-white/10 text-on-ink-muted' : 'border-line text-muted'
            }`}
          >
            {more}
            {link && (
              <SiteLink
                href={link.href}
                className={`mt-3 inline-flex font-medium underline underline-offset-4 ${dark ? 'text-spark' : 'text-link'}`}
              >
                {link.label}
              </SiteLink>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}
