import { Search } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { fmt, usePrefersReducedMotion } from './lib'
import { Button } from '../../design/primitives/Button'
import { Dialog } from '../../design/primitives/Dialog'

/** A number that counts up to its value once (instant under reduced motion). */
export function CountUp({
  value,
  format = (v: number) => fmt.format(Math.round(v)),
}: {
  value: number
  format?: (v: number) => string
}) {
  const reduce = usePrefersReducedMotion()
  const animate = !reduce && typeof requestAnimationFrame !== 'undefined'
  const [shown, setShown] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    if (!animate) return
    const start = performance.now()
    const a = from.current
    let raf = 0
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 700)
      setShown(a + (value - a) * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(step)
      else from.current = value
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, animate])
  return <span className="tabular-nums">{format(animate ? shown : value)}</span>
}

/* ---------- layout ---------- */
export function AdminHeader({
  title,
  description,
  actions,
  live,
}: {
  title: string
  description: ReactNode
  actions?: ReactNode
  live?: boolean
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {live && <LiveBadge />}
        </div>
        <div className="mt-1 max-w-2xl text-muted">{description}</div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

export function LiveBadge({ label = 'Live' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-supported/40 bg-supported-soft px-2 py-0.5 text-xs font-medium text-supported">
      <span aria-hidden className="eb-live-dot h-1.5 w-1.5 rounded-full bg-supported text-supported" />
      {label}
    </span>
  )
}

export function Card({
  title,
  note,
  actions,
  children,
  className = '',
  id,
}: {
  title?: ReactNode
  note?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={`min-w-0 rounded-panel border border-line bg-surface p-5 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold">{title}</h2>}
            {note && <p className="mt-0.5 text-sm text-muted">{note}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export function Stat({
  label,
  value,
  format,
  hint,
  tone,
  spark,
  icon,
}: {
  label: string
  value: number
  format?: (v: number) => string
  hint?: ReactNode
  tone?: 'good' | 'bad' | 'warn'
  spark?: ReactNode
  icon?: ReactNode
}) {
  const color =
    tone === 'bad'
      ? 'text-conflicting'
      : tone === 'warn'
        ? 'text-partial'
        : tone === 'good'
          ? 'text-supported'
          : 'text-ink'
  return (
    <div className="flex min-w-0 flex-col rounded-panel border border-line bg-surface p-4 transition-shadow duration-200 hover:shadow-float">
      <div className="flex items-center justify-between gap-2 text-sm text-muted">
        <span className="truncate">{label}</span>
        {icon}
      </div>
      <div className={`mt-2 text-3xl font-semibold tracking-tight ${color}`}>
        <CountUp value={value} format={format} />
      </div>
      <div className="mt-1 flex items-end justify-between gap-2">
        <span className="text-xs text-muted">{hint}</span>
        {spark}
      </div>
    </div>
  )
}

const PILL: Record<string, string> = {
  good: 'border-supported/40 bg-supported-soft text-supported',
  bad: 'border-conflicting/40 bg-conflicting-soft text-conflicting',
  warn: 'border-partial/40 bg-partial-soft text-partial',
  info: 'border-brand/30 bg-brand-soft text-brand',
  muted: 'border-line bg-surface-sunken text-muted',
}
export function Pill({ tone = 'muted', children }: { tone?: keyof typeof PILL; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${PILL[tone]}`}
    >
      {children}
    </span>
  )
}

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  label,
}: {
  value: T
  onChange: (v: T) => void
  items: { value: T; label: string; count?: number }[]
  label: string
}) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-line">
      {items.map((i) => (
        <button
          key={i.value}
          type="button"
          role="tab"
          aria-selected={value === i.value}
          onClick={() => onChange(i.value)}
          className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm whitespace-nowrap transition-colors ${
            value === i.value
              ? 'border-brand font-medium text-ink'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          {i.label}
          {i.count !== undefined && (
            <span className="rounded-full bg-surface-sunken px-1.5 text-xs text-muted tabular-nums">
              {i.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
  description,
  hideLabel,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  disabled?: boolean
  description?: ReactNode
  hideLabel?: boolean
}) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className={hideLabel ? 'sr-only' : 'text-sm font-medium'}>
          {label}
        </label>
        {description && <p className="text-xs text-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'bg-brand' : 'bg-line-strong'
        }`}
      >
        <span
          aria-hidden
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  )
}

export function SearchBox({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  label: string
  placeholder?: string
}) {
  return (
    <label className="relative block w-full max-w-xs">
      <span className="sr-only">{label}</span>
      <Search aria-hidden size={15} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
        className="h-9 w-full rounded-control border border-line-strong bg-surface pr-3 pl-8 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
      />
    </label>
  )
}

/** Destructive confirm; optionally the person types a word to confirm. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  typeToConfirm,
  busy,
  danger = true,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: ReactNode
  confirmLabel: string
  typeToConfirm?: string
  busy?: boolean
  danger?: boolean
}) {
  const [typed, setTyped] = useState('')
  const id = useId()
  const ok = !typeToConfirm || typed === typeToConfirm
  return (
    <Dialog
      open={open}
      onClose={() => {
        setTyped('')
        onClose()
      }}
      title={title}
      description={description}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            disabled={!ok}
            loading={busy}
            onClick={() => {
              onConfirm()
              setTyped('')
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {typeToConfirm && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={id} className="text-sm">
            Type <strong className="font-mono">{typeToConfirm}</strong> to confirm
          </label>
          <input
            id={id}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            className="h-9 rounded-control border border-line-strong bg-surface px-3 font-mono text-sm"
          />
        </div>
      )}
    </Dialog>
  )
}

/** A thin progress bar; striped and moving while work is running. */
export function Progress({
  value,
  live,
  tone = 'brand',
  label,
}: {
  value: number
  live?: boolean
  tone?: 'brand' | 'good' | 'bad'
  label: string
}) {
  const bg = tone === 'good' ? 'bg-supported' : tone === 'bad' ? 'bg-conflicting' : 'bg-brand'
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 w-full overflow-hidden rounded-full bg-line"
    >
      <div
        className={`h-full rounded-full ${bg} ${live ? 'eb-progress-live' : ''} transition-[width] duration-700 ease-out`}
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export function Th({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={`px-4 py-2.5 text-left text-xs font-medium whitespace-nowrap text-muted ${className}`}
    >
      {children}
    </th>
  )
}
export function Td({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle text-sm ${className}`}>{children}</td>
}
export function TableWrap({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    // Focusable so keyboard users can scroll a wide table (WCAG 2.1.1).
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className="overflow-x-auto rounded-panel border border-line bg-surface focus-visible:outline-2 focus-visible:outline-brand"
    >
      <table className="w-full text-left">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  )
}
