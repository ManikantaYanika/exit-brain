import type { ReactNode } from 'react'
import { SiteLink } from './SiteLink'
import { container, primaryButton, secondaryButton } from './styles'

/** A titled page section. `band` gives it the alternate peach background. */
export function Section({
  id,
  title,
  lead,
  band,
  children,
}: {
  id?: string
  title: string
  lead?: ReactNode
  band?: boolean
  children: ReactNode
}) {
  return (
    <section id={id} className={`scroll-mt-24 ${band ? 'border-y border-line bg-band' : ''}`}>
      <div className={`${container} py-16 md:py-20`}>
        <h2 className="max-w-3xl text-[1.9rem] leading-tight font-semibold tracking-[-0.025em] text-balance sm:text-[2.25rem]">
          {title}
        </h2>
        {lead && <p className="mt-4 max-w-[42rem] text-[1.0625rem] leading-[1.7] text-muted">{lead}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}

/** A small, factual status pill. Text carries the meaning; colour only supports it. */
export function Pill({
  tone = 'neutral',
  children,
}: {
  tone?: 'done' | 'mvp' | 'neutral'
  children: ReactNode
}) {
  const cls =
    tone === 'done'
      ? 'bg-supported-soft text-supported'
      : tone === 'mvp'
        ? 'bg-brand-soft text-brand'
        : 'border border-line bg-band text-muted'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${cls}`}>
      {children}
    </span>
  )
}

/** Draft / preview banner for pages that are not final (legal drafts, unpublished founder page). */
export function DraftNotice({ children }: { children: ReactNode }) {
  return (
    <div role="note" className="border-b border-line bg-soft">
      <p className={`${container} py-3 text-sm font-medium text-ink`}>{children}</p>
    </div>
  )
}

/** Page-ending call to action, so no page is a dead end. */
export function ClosingCta({
  title,
  primary,
  secondary,
}: {
  title: string
  primary: { label: string; href: string }
  secondary?: { label: string; href: string }
}) {
  return (
    <section
      className={`${container} flex flex-col items-start gap-8 py-20 md:flex-row md:items-center md:justify-between`}
    >
      <h2 className="max-w-xl text-[1.75rem] leading-tight font-semibold tracking-[-0.02em] text-balance">
        {title}
      </h2>
      <div className="flex flex-wrap gap-3">
        <SiteLink href={primary.href} className={primaryButton}>
          {primary.label}
        </SiteLink>
        {secondary && (
          <SiteLink href={secondary.href} className={secondaryButton}>
            {secondary.label}
          </SiteLink>
        )}
      </div>
    </section>
  )
}

/** Plain-language legal/long-form text with readable measure. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[44rem] text-[1.0625rem] leading-[1.75] text-muted [&_a]:font-medium [&_a]:text-link [&_a]:underline [&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:text-[1.4rem] [&_h2]:font-semibold [&_h2]:tracking-[-0.015em] [&_h2]:text-ink [&_li]:mt-1.5 [&_p]:mt-4 [&_strong]:text-ink [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6">
      {children}
    </div>
  )
}
