import { useState } from 'react'
import { useParams } from 'react-router'
import { Citations } from '../../components/evidence/Citations'
import { Button } from '../../design/primitives/Button'
import { ConfidenceText, RiskBars } from '../../design/primitives/status'
import { useKnowledgeItems, useReviewItem } from '../../data/hooks'
import type { ItemCategory, KnowledgeItem } from '../../data/types'

const categoryLabel: Record<ItemCategory, string> = {
  system: 'System',
  recurring_task: 'Recurring task',
  deployment: 'Deployment',
  troubleshooting: 'Troubleshooting',
  dependency: 'Dependency',
  client: 'Client-specific',
  other: 'Other',
}

const riskRank = { high: 0, medium: 1, low: 2 }

function ItemRow({ item, transitionId }: { item: KnowledgeItem; transitionId: string }) {
  const review = useReviewItem(transitionId)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(item.title)
  const [summary, setSummary] = useState(item.summary)
  const decided = item.status !== 'suggested'

  return (
    <li className="rounded-lg border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <RiskBars level={item.risk} />
        <ConfidenceText level={item.confidence} />
        <span className="text-xs text-muted">{categoryLabel[item.category]}</span>
        <span className="font-mono text-xs text-muted">{item.area}</span>
        <span className="ml-auto text-xs font-medium">
          {item.status === 'confirmed' && <span className="text-supported">Confirmed</span>}
          {item.status === 'edited' && <span className="text-supported">Confirmed with edits</span>}
          {item.status === 'rejected' && <span className="text-muted">Rejected</span>}
          {item.status === 'suggested' && <span className="text-brand">AI-suggested, needs your review</span>}
        </span>
      </div>

      {editing ? (
        <form
          className="mt-3 space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            review.mutate(
              { itemId: item.id, decision: { edit: { title, summary } } },
              { onSuccess: () => setEditing(false) },
            )
          }}
        >
          <label className="block text-sm">
            <span className="text-muted">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border border-line px-2 py-1.5"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Summary</span>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-line px-2 py-1.5"
            />
          </label>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={review.isPending}>
              Save and confirm
            </Button>
            <Button onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <>
          <h3
            className={`mt-2 text-lg font-semibold ${item.status === 'rejected' ? 'text-muted line-through' : ''}`}
          >
            {item.title}
          </h3>
          <p className="mt-1 max-w-prose text-sm leading-6">
            {item.summary}
            <Citations ids={item.evidenceIds} />
          </p>
        </>
      )}

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-muted hover:text-ink">Why is this {item.risk} risk?</summary>
        <dl className="mt-2 grid max-w-md grid-cols-[1fr_auto] gap-x-6 gap-y-1">
          {item.riskFactors.map((f) => (
            <div key={f.label} className="contents">
              <dt className="text-muted">{f.label}</dt>
              <dd className="text-right tabular-nums">{f.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-muted">
          Risk is computed from the records above, not by AI. It describes how concentrated the knowledge is —
          not how well anyone works.
        </p>
      </details>

      {!editing && (
        <div className="mt-4 flex flex-wrap gap-2">
          {!decided && (
            <Button
              variant="primary"
              disabled={review.isPending}
              onClick={() => review.mutate({ itemId: item.id, decision: 'confirm' })}
            >
              Confirm
            </Button>
          )}
          {item.status !== 'rejected' && <Button onClick={() => setEditing(true)}>Edit</Button>}
          {item.status !== 'rejected' && (
            <Button
              variant="danger"
              disabled={review.isPending}
              onClick={() => review.mutate({ itemId: item.id, decision: 'reject' })}
            >
              Reject
            </Button>
          )}
          {item.status === 'rejected' && (
            <Button variant="ghost" onClick={() => review.mutate({ itemId: item.id, decision: 'confirm' })}>
              Restore and confirm
            </Button>
          )}
        </div>
      )}
    </li>
  )
}

export function KnowledgeReview() {
  const { id = '' } = useParams()
  const { data: items = [] } = useKnowledgeItems(id)
  const pending = items
    .filter((i) => i.status === 'suggested')
    .sort((a, b) => riskRank[a.risk] - riskRank[b.risk])
  const decided = items
    .filter((i) => i.status !== 'suggested')
    .sort((a, b) => riskRank[a.risk] - riskRank[b.risk])

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold">
          {pending.length > 0 ? `${pending.length} areas need your review` : 'All areas reviewed'}
        </h2>
        <p className="mt-1 max-w-prose text-sm text-muted">
          These are places where the work records show knowledge held mostly by one person. Only confirmed
          areas turn into interview questions. Click a number to see the record behind a claim.
        </p>
        <ul className="mt-4 space-y-4">
          {pending.map((i) => (
            <ItemRow key={i.id} item={i} transitionId={id} />
          ))}
        </ul>
      </section>
      {decided.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-muted">Reviewed</h2>
          <ul className="mt-3 space-y-4">
            {decided.map((i) => (
              <ItemRow key={i.id} item={i} transitionId={id} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
