import type { Level, TransitionStatus, VerificationStatus } from '../../data/types'

const verificationStyle: Record<VerificationStatus, { label: string; cls: string; dot: string }> = {
  supported: { label: 'Supported', cls: 'bg-supported-soft text-supported', dot: 'bg-supported' },
  partially_supported: { label: 'Partly supported', cls: 'bg-partial-soft text-partial', dot: 'bg-partial' },
  conflicting: { label: 'Conflicting', cls: 'bg-conflicting-soft text-conflicting', dot: 'bg-conflicting' },
  unverified: { label: 'Unverified', cls: 'bg-unverified-soft text-unverified', dot: 'bg-unverified' },
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const v = verificationStyle[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${v.cls}`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${v.dot}`} />
      {v.label}
    </span>
  )
}

/** Risk is shown as filled bars, not colour, so it never competes with verification status. */
export function RiskBars({ level, showLabel = true }: { level: Level; showLabel?: boolean }) {
  const filled = level === 'high' ? 3 : level === 'medium' ? 2 : 1
  return (
    <span className="inline-flex items-center gap-1.5" title={`${level} risk`}>
      <span aria-hidden className="inline-flex items-end gap-0.5">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`w-1 rounded-sm ${n <= filled ? 'bg-ink' : 'bg-line'}`}
            style={{ height: `${4 + n * 3}px` }}
          />
        ))}
      </span>
      {showLabel ? (
        <span className="text-xs text-muted capitalize">{level} risk</span>
      ) : (
        <span className="sr-only">{level} risk</span>
      )}
    </span>
  )
}

export function ConfidenceText({ level }: { level: Level }) {
  return <span className="text-xs text-muted">{level[0]!.toUpperCase() + level.slice(1)} confidence</span>
}

const statusLabel: Record<TransitionStatus, string> = {
  draft: 'Draft',
  ingesting: 'Reading GitHub',
  analysing: 'Reviewing knowledge areas',
  interviewing: 'Interview in progress',
  verifying: 'Verifying answers',
  handover_review: 'Handover review',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function TransitionStatusText({ status }: { status: TransitionStatus }) {
  const done = status === 'completed'
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${done ? 'text-supported' : 'text-ink'}`}>
      <span aria-hidden className={`h-2 w-2 rounded-full ${done ? 'bg-supported' : 'bg-brand'}`} />
      {statusLabel[status]}
    </span>
  )
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-muted">
        <span>{label}</span>
        <span className="tabular-nums text-ink">{value}%</span>
      </div>
      <div
        className="mt-1 h-1.5 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
