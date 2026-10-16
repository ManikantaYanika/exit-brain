import { MessageCircleQuestion, Search } from 'lucide-react'
import { useId, useState } from 'react'
import { ClosingCta } from '../blocks'
import { HELP_SECTIONS } from '../content/help'
import { openSiteGuide } from '../guide/events'
import { tokenize } from '../guide/search'
import { PageHeader } from '../PageHeader'
import { SiteLink } from '../SiteLink'
import { container, secondaryButton } from '../styles'

/** Every query word must appear in the question or answer (after the guide's stemming). */
function matches(query: string, text: string) {
  const q = tokenize(query)
  if (!q.length) return true
  const words = new Set(tokenize(text))
  return q.every((w) => words.has(w))
}

export function HelpPage() {
  const searchId = useId()
  const [query, setQuery] = useState('')
  const sections = HELP_SECTIONS.map((s) => ({
    ...s,
    items: s.items.filter((i) => matches(query, `${s.title} ${i.q} ${i.a}`)),
  })).filter((s) => s.items.length)
  const count = sections.reduce((n, s) => n + s.items.length, 0)

  return (
    <>
      <PageHeader
        kicker="Help"
        title="Help centre"
        lead="Short answers to the questions people ask first, with a link to the page that explains more."
      >
        <button type="button" onClick={openSiteGuide} className={`${secondaryButton} gap-2`}>
          <MessageCircleQuestion aria-hidden size={18} className="text-brand" /> Ask the site guide
        </button>
      </PageHeader>

      <div className={`${container} py-14 md:py-16`}>
        <div role="search" className="max-w-xl">
          <label htmlFor={searchId} className="text-sm font-medium">
            Search help
          </label>
          <div className="relative mt-1.5">
            <Search aria-hidden size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="For example: delete data"
              aria-describedby={`${searchId}-count`}
              className="h-12 w-full rounded-control border border-line-strong bg-surface pr-3 pl-10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
            />
          </div>
          <p id={`${searchId}-count`} aria-live="polite" className="mt-2 text-sm text-muted">
            {query.trim()
              ? count
                ? `${count} ${count === 1 ? 'answer' : 'answers'} found`
                : 'No answers found. Try other words, ask the site guide, or contact us.'
              : null}
          </p>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          {sections.map((s) => (
            <section key={s.id} aria-labelledby={`help-${s.id}`}>
              <h2 id={`help-${s.id}`} className="text-[1.3rem] font-semibold tracking-[-0.015em]">
                {s.title}
              </h2>
              <div className="mt-3 divide-y divide-line border-y border-line">
                {s.items.map((i) => (
                  <details
                    key={i.id}
                    id={i.id}
                    className="group scroll-mt-24 py-4"
                    open={Boolean(query.trim())}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                      {i.q}
                      <span
                        aria-hidden
                        className="text-xl text-muted transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-2 leading-relaxed text-muted">{i.a}</p>
                    {i.link && (
                      <SiteLink
                        href={i.link.href}
                        className="mt-2 inline-flex text-sm font-medium text-link underline"
                      >
                        {i.link.label}
                      </SiteLink>
                    )}
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <ClosingCta
        title="Didn’t find your answer?"
        primary={{ label: 'Contact us', href: '/contact' }}
        secondary={{ label: 'Read Security', href: '/security' }}
      />
    </>
  )
}
