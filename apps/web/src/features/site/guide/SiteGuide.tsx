import { ArrowRight, MessageCircleQuestion, X } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { SiteLink } from '../SiteLink'
import { OPEN_GUIDE_EVENT, SUGGESTED } from './events'
import type { Ranked } from './search'

type Search = (q: string, limit?: number) => Ranked[]
interface Turn {
  q: string
  results: Ranked[]
}

const snippet = (t: string) => (t.length > 220 ? `${t.slice(0, 217).replace(/\s+\S*$/, '')}…` : t)

function Panel({ onClose }: { onClose: () => void }) {
  const titleId = useId()
  const panel = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const search = useRef<Search | null>(null)
  const [ready, setReady] = useState(false)
  const [q, setQ] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])

  useEffect(() => {
    let live = true
    void import('./engine').then((m) => {
      if (!live) return
      search.current = m.searchSite
      setReady(true)
    })
    input.current?.focus()
    return () => {
      live = false
    }
  }, [])

  useEffect(() => {
    const el = panel.current
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab' || !el) return
      const items = [...el.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input')]
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

  const ask = (question: string) => {
    const text = question.trim()
    if (!text || !search.current) return
    setTurns((t) => [...t, { q: text, results: search.current!(text, 3) }])
    setQ('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end sm:p-6">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close site guide"
        className="absolute inset-0 bg-[var(--eb-overlay)] sm:bg-transparent"
        onClick={onClose}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="eb-enter relative flex max-h-[85vh] w-full flex-col rounded-t-[20px] border border-line bg-surface shadow-float sm:max-h-[min(40rem,85vh)] sm:w-[25rem] sm:rounded-[20px]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 pt-4 pb-3">
          <div>
            <h2 id={titleId} className="font-semibold">
              Site guide
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              Answers come from pages on this website. It doesn’t use AI and doesn’t store your questions.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close site guide"
            onClick={onClose}
            className="rounded-control p-1.5 text-muted hover:text-ink"
          >
            <X aria-hidden size={18} />
          </button>
        </div>

        <div role="log" aria-live="polite" aria-label="Answers" className="flex-1 overflow-y-auto px-5 py-4">
          {turns.length === 0 ? (
            <div>
              <p className="text-sm text-muted">Try one of these:</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {SUGGESTED.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      disabled={!ready}
                      onClick={() => ask(s)}
                      className="rounded-full border border-line-strong px-3 py-1.5 text-left text-sm hover:bg-band disabled:opacity-60"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ol className="flex flex-col gap-5">
              {turns.map((t, i) => (
                <li key={i}>
                  <p className="ml-auto w-fit max-w-[85%] rounded-[12px] bg-brand-soft px-3 py-2 text-sm">
                    {t.q}
                  </p>
                  {t.results.length ? (
                    <ul className="mt-3 flex flex-col gap-2" aria-label={`Answers for: ${t.q}`}>
                      {t.results.map(({ doc }) => (
                        <li key={doc.id} className="rounded-[12px] border border-line bg-canvas p-3">
                          <p className="text-xs font-medium text-accent-ink">{doc.page}</p>
                          <p className="mt-0.5 text-sm font-semibold">{doc.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-muted">{snippet(doc.text)}</p>
                          <SiteLink
                            href={doc.url}
                            onClick={onClose}
                            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-link underline"
                          >
                            Open page <ArrowRight aria-hidden size={14} />
                          </SiteLink>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 rounded-[12px] border border-line bg-canvas p-3 text-sm text-muted">
                      I couldn’t find that on our site. You can ask us directly on the{' '}
                      <SiteLink href="/contact" onClick={onClose} className="font-medium text-link underline">
                        Contact page
                      </SiteLink>
                      .
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>

        <form
          className="flex gap-2 border-t border-line p-3"
          onSubmit={(e) => {
            e.preventDefault()
            ask(q)
          }}
        >
          <label htmlFor={`${titleId}-q`} className="sr-only">
            Your question
          </label>
          <input
            ref={input}
            id={`${titleId}-q`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask about Exit Brain"
            maxLength={200}
            autoComplete="off"
            className="h-10 min-w-0 flex-1 rounded-control border border-line-strong bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
          />
          <button
            type="submit"
            disabled={!ready}
            className="h-10 rounded-control bg-brand px-4 text-sm font-medium text-on-brand disabled:opacity-60"
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  )
}

/** Launcher + panel. No AI, no network: it ranks sections of this site's own pages (D4). */
export function SiteGuide() {
  const [open, setOpen] = useState(false)
  const launcher = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)
  const close = useCallback(() => setOpen(false), [])
  // Return focus to the launcher when the panel closes (WCAG 2.4.3).
  useEffect(() => {
    if (wasOpen.current && !open) launcher.current?.focus()
    wasOpen.current = open
  }, [open])

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(OPEN_GUIDE_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_GUIDE_EVENT, onOpen)
  }, [])

  return (
    <>
      <button
        ref={launcher}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-40 inline-flex h-12 items-center gap-2 rounded-full border border-line bg-surface px-4 text-[0.94rem] font-medium text-ink shadow-float hover:bg-band sm:right-6 sm:bottom-6"
      >
        <MessageCircleQuestion aria-hidden size={18} className="text-brand" />
        Ask about Exit Brain
      </button>
      {open && <Panel onClose={close} />}
    </>
  )
}
