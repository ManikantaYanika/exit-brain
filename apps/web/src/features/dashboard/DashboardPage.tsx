import { Link } from 'react-router'
import { usePersona } from '../../app/persona'
import { ProgressBar, TransitionStatusText } from '../../design/primitives/status'
import { useProgress, useTransitions } from '../../data/hooks'
import type { Transition } from '../../data/types'

const TODAY = new Date('2026-10-15T12:00:00+05:30')

function daysLeft(iso: string) {
  return Math.ceil((new Date(`${iso}T23:59:59+05:30`).getTime() - TODAY.getTime()) / 86_400_000)
}

function Row({ t, canOpen }: { t: Transition; canOpen: boolean }) {
  const { data: p } = useProgress(t.id)
  const left = daysLeft(t.lastWorkingDay)
  const name = canOpen ? (
    <Link to={`/transitions/${t.id}`} className="font-medium text-brand hover:underline">
      {t.employee.name}
    </Link>
  ) : (
    <span className="font-medium">{t.employee.name}</span>
  )
  return (
    <tr className="border-t border-line align-top">
      <td className="py-4 pr-4">
        {name}
        <div className="text-sm text-muted">{t.employee.title}</div>
      </td>
      <td className="py-4 pr-4">
        <TransitionStatusText status={t.status} />
        <div className="mt-0.5 text-sm text-muted">
          {left > 0 ? `${left} days to last day` : 'Left the company'}
        </div>
      </td>
      <td className="py-4 pr-4 text-sm">
        {t.successor?.name ?? <span className="text-muted">Not assigned</span>}
      </td>
      <td className="w-56 py-4 pr-4">
        {p && t.status !== 'completed' ? (
          <div className="space-y-2">
            <ProgressBar value={p.itemsReviewedPct} label="Areas reviewed" />
            <ProgressBar value={p.answersApprovedPct} label="Answers approved" />
          </div>
        ) : (
          <span className="text-sm text-muted">{t.status === 'completed' ? 'Handover approved' : '—'}</span>
        )}
      </td>
      <td className="py-4 text-sm">
        {p && p.unverified + p.conflicting > 0 ? (
          <span>
            {p.unverified > 0 && <span className="block text-unverified">{p.unverified} unverified</span>}
            {p.conflicting > 0 && <span className="block text-conflicting">{p.conflicting} conflicting</span>}
          </span>
        ) : (
          <span className="text-muted">None</span>
        )}
      </td>
    </tr>
  )
}

export function DashboardPage() {
  const { persona } = usePersona()
  const { data: transitions, isLoading } = useTransitions()
  const active = transitions?.filter((t) => t.status !== 'completed' && t.status !== 'cancelled') ?? []
  const soonest = active.map((t) => daysLeft(t.lastWorkingDay)).sort((a, b) => a - b)[0]

  return (
    <div className="space-y-8">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Knowledge transitions</h1>
        <p className="mt-2 text-muted">
          {isLoading
            ? 'Loading…'
            : `${active.length} people are handing over their work.${soonest !== undefined ? ` The next last day is in ${soonest} days.` : ''}`}
        </p>
        {persona.role === 'viewer' && (
          <p className="mt-2 text-sm text-muted">
            You see status and progress only. Evidence and answers stay with the manager and the people
            involved.
          </p>
        )}
      </section>

      <div className="overflow-x-auto rounded-lg border border-line bg-surface px-5">
        <table className="w-full min-w-[760px] text-left">
          <caption className="sr-only">Transitions</caption>
          <thead>
            <tr className="text-xs text-muted">
              <th scope="col" className="py-3 pr-4 font-medium">
                Leaving
              </th>
              <th scope="col" className="py-3 pr-4 font-medium">
                Status
              </th>
              <th scope="col" className="py-3 pr-4 font-medium">
                Successor
              </th>
              <th scope="col" className="py-3 pr-4 font-medium">
                Progress
              </th>
              <th scope="col" className="py-3 font-medium">
                Needs attention
              </th>
            </tr>
          </thead>
          <tbody>
            {transitions?.map((t) => (
              <Row key={t.id} t={t} canOpen={persona.role === 'manager'} />
            ))}
          </tbody>
        </table>
      </div>
      {persona.role === 'manager' && (
        <p className="text-sm text-muted">
          Starting a transition reads the leaving person’s commits, pull requests and issues from the
          repositories you selected. Exit Brain never writes to GitHub.
        </p>
      )}
    </div>
  )
}
