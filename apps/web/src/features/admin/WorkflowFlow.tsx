import {
  BadgeCheck,
  ClipboardCheck,
  FileSearch,
  GitBranch,
  GraduationCap,
  MessageSquareText,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import type { Transition, TransitionStatus } from '../../data/types'

/** The handover workflow as a flowchart; each stage shows who is in it right now. */
const STAGES: { key: string; label: string; who: string; Icon: LucideIcon; statuses: TransitionStatus[] }[] =
  [
    {
      key: 'ingest',
      label: 'GitHub analysis',
      who: 'Exit Brain, read-only',
      Icon: GitBranch,
      statuses: ['draft', 'ingesting'],
    },
    {
      key: 'review',
      label: 'Knowledge review',
      who: 'Manager confirms areas',
      Icon: FileSearch,
      statuses: ['analysing'],
    },
    {
      key: 'interview',
      label: 'Interview',
      who: 'Leaving engineer answers',
      Icon: MessageSquareText,
      statuses: ['interviewing'],
    },
    {
      key: 'verify',
      label: 'Verification',
      who: 'Checked against records',
      Icon: BadgeCheck,
      statuses: ['verifying'],
    },
    {
      key: 'approve',
      label: 'Handover approval',
      who: 'Manager approves',
      Icon: ClipboardCheck,
      statuses: ['handover_review'],
    },
    {
      key: 'onboard',
      label: 'Successor onboarding',
      who: 'Checklist + assistant',
      Icon: GraduationCap,
      statuses: ['completed'],
    },
  ]

function Connector({ active }: { active: boolean }) {
  const stroke = active ? 'var(--eb-brand)' : 'var(--eb-line-strong)'
  return (
    <>
      {/* horizontal on wide screens */}
      <svg
        aria-hidden
        viewBox="0 0 40 12"
        className="hidden h-3 w-full min-w-6 self-center lg:block"
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          y1="6"
          x2="34"
          y2="6"
          stroke={stroke}
          strokeWidth="2"
          className={active ? 'eb-flow-line' : ''}
        />
        <path
          d="M33 1 L39 6 L33 11"
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* vertical when stacked */}
      <svg aria-hidden viewBox="0 0 12 28" className="mx-auto h-7 w-3 lg:hidden">
        <line
          x1="6"
          y1="0"
          x2="6"
          y2="22"
          stroke={stroke}
          strokeWidth="2"
          className={active ? 'eb-flow-line' : ''}
        />
        <path
          d="M1 21 L6 27 L11 21"
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  )
}

export function WorkflowFlow({ transitions }: { transitions: Transition[] }) {
  const [open, setOpen] = useState<string | null>(null)
  const live = transitions.filter((t) => t.status !== 'cancelled')
  const by = STAGES.map((s) => live.filter((t) => s.statuses.includes(t.status)))
  const lastActive = by.reduce((n, list, i) => (list.length ? i : n), -1)
  const selected = STAGES.findIndex((s) => s.key === open)

  return (
    <div>
      <ol className="eb-stagger grid grid-cols-1 lg:grid-cols-[repeat(5,minmax(0,1fr)_2.25rem)_minmax(0,1fr)] lg:items-stretch">
        {STAGES.map((s, i) => {
          const people = by[i]!
          const busy = people.length > 0
          return [
            <li key={s.key} className="min-w-0 lg:w-full">
              <button
                type="button"
                aria-expanded={open === s.key}
                onClick={() => setOpen(open === s.key ? null : s.key)}
                className={`eb-node-pop flex h-full w-full flex-col gap-2 rounded-panel border p-3 text-left transition-colors duration-200 ${
                  open === s.key
                    ? 'border-brand bg-brand-soft'
                    : busy
                      ? 'border-brand/40 bg-surface hover:border-brand'
                      : 'border-line bg-surface hover:border-line-strong'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${busy ? 'bg-brand text-on-brand' : 'bg-surface-sunken text-muted'}`}
                  >
                    <s.Icon aria-hidden size={16} />
                  </span>
                  <span
                    className={`text-2xl font-semibold tabular-nums ${busy ? 'text-ink' : 'text-muted'}`}
                    aria-label={`${people.length} in ${s.label}`}
                  >
                    {people.length}
                  </span>
                </span>
                <span className="text-sm font-semibold leading-tight">{s.label}</span>
                <span className="text-xs text-muted">{s.who}</span>
                {busy && (
                  <span className="flex -space-x-1.5">
                    {people.slice(0, 4).map((t) => (
                      <span
                        key={t.id}
                        title={t.employee.name}
                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-ink text-[10px] font-semibold text-surface"
                      >
                        {t.employee.name
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)}
                      </span>
                    ))}
                  </span>
                )}
              </button>
            </li>,
            i < STAGES.length - 1 && (
              <li key={`${s.key}-c`} aria-hidden className="flex items-center justify-center lg:px-1">
                <Connector active={i < lastActive} />
              </li>
            ),
          ]
        })}
      </ol>
      {selected >= 0 && (
        <div className="eb-enter mt-4 rounded-panel border border-line bg-surface-sunken p-4">
          <p className="text-sm font-medium">
            {STAGES[selected]!.label}:{' '}
            {by[selected]!.length ? `${by[selected]!.length} in this stage` : 'no one in this stage now'}
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {by[selected]!.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  <span className="font-medium">{t.employee.name}</span>
                  <span className="text-muted"> · {t.employee.title}</span>
                </span>
                <Link to={`/app/transitions/${t.id}`} className="font-medium text-brand hover:underline">
                  Open transition
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
