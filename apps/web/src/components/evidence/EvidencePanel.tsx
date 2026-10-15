import { useEffect, useRef } from 'react'
import type { Evidence } from '../../data/types'
import { useEvidenceContext } from './EvidenceContext'

const sourceLabel: Record<Evidence['source'], string> = {
  github_commit: 'Commit',
  github_pr: 'Pull request',
  github_issue: 'Issue',
}

function EvidenceRow({ e, n, highlight }: { e: Evidence; n: number; highlight: boolean }) {
  const date = new Date(e.occurredAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return (
    <li
      id={`ev-${e.id}`}
      className={`border-b border-line px-4 py-3 last:border-b-0 ${highlight ? 'cite-flash' : ''}`}
    >
      <div className="flex items-baseline gap-2">
        <span className="min-w-5 rounded-full border border-muted px-1 text-center text-[11px] leading-4 font-semibold text-muted tabular-nums">
          {n}
        </span>
        <span className="text-xs text-muted">
          {sourceLabel[e.source]} <span className="font-mono text-ink">{e.ref}</span> in {e.repo}, {date}
        </span>
      </div>
      <p className="mt-1 text-sm font-medium">{e.title}</p>
      <p className="mt-0.5 text-sm text-muted">{e.excerpt}</p>
      {e.paths.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {e.paths.map((p) => (
            <li key={p} className="truncate font-mono text-xs text-muted">
              {p}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

/** Git-log style list of the records behind the claims on the page. Excerpts only, never file contents. */
export function EvidencePanel({ ids, title = 'Evidence' }: { ids?: string[]; title?: string }) {
  const { all, numberOf, focused, focusKey } = useEvidenceContext()
  const list = ids ? all.filter((e) => ids.includes(e.id)) : all
  const shown = focused.length
    ? [...list].sort((a, b) => Number(focused.includes(b.id)) - Number(focused.includes(a.id)))
    : list
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (focusKey > 0) ref.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [focusKey])

  return (
    <aside aria-label={title} className="rounded-lg border border-line bg-surface">
      <div className="flex items-baseline justify-between border-b border-line px-4 py-2.5">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs text-muted">{list.length} records, read-only from GitHub</span>
      </div>
      <div ref={ref} className="max-h-[70vh] overflow-y-auto">
        <ol key={focusKey}>
          {shown.map((e) => (
            <EvidenceRow key={e.id} e={e} n={numberOf(e.id)} highlight={focused.includes(e.id)} />
          ))}
        </ol>
      </div>
    </aside>
  )
}
