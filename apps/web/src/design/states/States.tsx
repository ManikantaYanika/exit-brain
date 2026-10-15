import { AlertTriangle, Inbox, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '../primitives/Button'

/** Placeholder shaped like the content it stands in for. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`eb-skeleton rounded-control ${className}`} />
}

export function SkeletonRows({ rows = 3, label = 'Loading' }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="rounded-panel border border-line bg-surface p-5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-3 h-5 w-2/3" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1.5 h-3 w-5/6" />
        </div>
      ))}
    </div>
  )
}

/** Empty is an invitation to act: say what will appear and how to make it appear. */
export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string
  body: ReactNode
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-panel border border-dashed border-line-strong bg-surface px-6 py-8">
      <span className="text-muted">{icon ?? <Inbox aria-hidden size={22} strokeWidth={1.75} />}</span>
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <div className="mt-1 max-w-prose text-sm text-muted">{body}</div>
      </div>
      {action}
    </div>
  )
}

/** Errors say what failed and what to do next; internals never reach the screen. */
export function ErrorState({
  title = 'This didn’t load',
  message,
  onRetry,
}: {
  title?: string
  message: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-panel border border-conflicting/40 bg-conflicting-soft px-5 py-4"
    >
      <AlertTriangle aria-hidden size={20} className="mt-0.5 shrink-0 text-conflicting" />
      <div className="flex-1">
        <p className="font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-sm text-ink">{message}</p>
        {onRetry && (
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={onRetry}
            icon={<RotateCcw aria-hidden size={14} />}
          >
            Try again
          </Button>
        )}
      </div>
    </div>
  )
}
