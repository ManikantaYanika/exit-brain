/**
 * Small SVG charts for the admin portal. No chart library: each draws in a viewBox and scales
 * with its container. Hover shows a tooltip; every chart has a text alternative (aria-label).
 */
import { useId, useState, type ReactNode } from 'react'

const W = 600

export function Sparkline({
  values,
  tone = 'brand',
  label,
}: {
  values: number[]
  tone?: 'brand' | 'bad' | 'good'
  label: string
}) {
  const id = useId()
  if (values.length < 2) return null
  const max = Math.max(...values)
  const min = Math.min(...values)
  const h = 28
  const w = 84
  const pts = values.map(
    (v, i) => [(i / (values.length - 1)) * w, h - 3 - ((v - min) / (max - min || 1)) * (h - 6)] as const,
  )
  const color =
    tone === 'bad' ? 'var(--eb-conflicting)' : tone === 'good' ? 'var(--eb-supported)' : 'var(--eb-brand)'
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={label}
      className="shrink-0 overflow-visible"
    >
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.25" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d}L${w},${h}L0,${h}Z`} fill={`url(#${id})`} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={pts.at(-1)![0]} cy={pts.at(-1)![1]} r="2.5" fill={color} />
    </svg>
  )
}

function Tip({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-control border border-line bg-surface px-2.5 py-1.5 text-xs whitespace-nowrap shadow-float"
      style={{ left: `${x}%`, top: y }}
    >
      {children}
    </div>
  )
}

export interface Series {
  key: string
  label: string
  color: string
}

/** Line chart over categories (dates), optional dashed goal line. */
export function LineChart<T extends Record<string, string | number>>({
  data,
  x,
  series,
  height = 180,
  format = (v: number) => String(v),
  xLabel = (v: string) => v,
  goal,
  label,
}: {
  data: T[]
  x: keyof T & string
  series: Series[]
  height?: number
  format?: (v: number) => string
  xLabel?: (v: string) => string
  goal?: { value: number; label: string }
  label: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const id = useId()
  const pad = { l: 40, r: 8, t: 10, b: 22 }
  const max =
    Math.max(goal?.value ?? 0, ...data.flatMap((d) => series.map((s) => Number(d[s.key])))) * 1.1 || 1
  const xs = (i: number) => pad.l + (i / Math.max(1, data.length - 1)) * (W - pad.l - pad.r)
  const ys = (v: number) => pad.t + (1 - v / max) * (height - pad.t - pad.b)
  const ticks = [0, max / 2, max].map((v) => +v.toPrecision(2))
  return (
    <div className="relative" onPointerLeave={() => setHover(null)}>
      <svg
        viewBox={`0 0 ${W} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={label}
        preserveAspectRatio="none"
      >
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`${id}-${i}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={s.color} stopOpacity="0.18" />
              <stop offset="1" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={ys(t)} y2={ys(t)} stroke="var(--eb-line)" />
            <text x={pad.l - 6} y={ys(t)} dy="0.32em" textAnchor="end" fontSize="10" fill="var(--eb-muted)">
              {format(t)}
            </text>
          </g>
        ))}
        {goal && (
          <line
            x1={pad.l}
            x2={W - pad.r}
            y1={ys(goal.value)}
            y2={ys(goal.value)}
            stroke="var(--eb-muted)"
            strokeDasharray="4 4"
          />
        )}
        {series.map((s, i) => {
          const d = data
            .map((p, j) => `${j ? 'L' : 'M'}${xs(j).toFixed(1)},${ys(Number(p[s.key])).toFixed(1)}`)
            .join('')
          return (
            <g key={s.key}>
              {i === 0 && (
                <path
                  d={`${d}L${xs(data.length - 1)},${height - pad.b}L${pad.l},${height - pad.b}Z`}
                  fill={`url(#${id}-${i})`}
                />
              )}
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )
        })}
        {[0, Math.floor((data.length - 1) / 2), data.length - 1].map((i) => (
          <text
            key={i}
            x={xs(i)}
            y={height - 6}
            textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
            fontSize="10"
            fill="var(--eb-muted)"
          >
            {xLabel(String(data[i]?.[x] ?? ''))}
          </text>
        ))}
        {hover !== null && (
          <line x1={xs(hover)} x2={xs(hover)} y1={pad.t} y2={height - pad.b} stroke="var(--eb-line-strong)" />
        )}
        {data.map((_, i) => (
          <rect
            key={i}
            x={xs(i) - (W - pad.l - pad.r) / data.length / 2}
            y={0}
            width={(W - pad.l - pad.r) / data.length}
            height={height}
            fill="transparent"
            onPointerEnter={() => setHover(i)}
          />
        ))}
      </svg>
      {hover !== null && data[hover] && (
        <Tip x={(xs(hover) / W) * 100} y={ys(Number(data[hover][series[0]!.key])) - 6}>
          <div className="text-muted">{xLabel(String(data[hover][x]))}</div>
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
              {series.length > 1 && `${s.label}: `}
              <span className="font-medium tabular-nums">{format(Number(data[hover]![s.key]))}</span>
            </div>
          ))}
        </Tip>
      )}
    </div>
  )
}

/** Vertical bars, grouped when several series. */
export function BarChart<T extends Record<string, string | number>>({
  data,
  x,
  series,
  height = 180,
  format = (v: number) => String(v),
  xLabel = (v: string) => v,
  label,
}: {
  data: T[]
  x: keyof T & string
  series: Series[]
  height?: number
  format?: (v: number) => string
  xLabel?: (v: string) => string
  label: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const pad = { l: 40, r: 8, t: 10, b: 22 }
  const max = Math.max(...data.flatMap((d) => series.map((s) => Number(d[s.key])))) * 1.1 || 1
  const band = (W - pad.l - pad.r) / data.length
  const bw = Math.min(28, (band * 0.7) / series.length)
  const ys = (v: number) => pad.t + (1 - v / max) * (height - pad.t - pad.b)
  return (
    <div className="relative" onPointerLeave={() => setHover(null)}>
      <svg
        viewBox={`0 0 ${W} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={label}
        preserveAspectRatio="none"
      >
        {[0, max / 2, max].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={ys(t)} y2={ys(t)} stroke="var(--eb-line)" />
            <text x={pad.l - 6} y={ys(t)} dy="0.32em" textAnchor="end" fontSize="10" fill="var(--eb-muted)">
              {format(+t.toPrecision(2))}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = pad.l + band * i + band / 2
          return (
            <g key={i} onPointerEnter={() => setHover(i)}>
              <rect x={pad.l + band * i} y={0} width={band} height={height} fill="transparent" />
              {series.map((s, j) => {
                const v = Number(d[s.key])
                const bx = cx - (bw * series.length) / 2 + j * bw
                return (
                  <rect
                    key={s.key}
                    x={bx + 1}
                    y={ys(v)}
                    width={bw - 2}
                    height={Math.max(0, height - pad.b - ys(v))}
                    rx="3"
                    fill={s.color}
                    opacity={hover === null || hover === i ? 1 : 0.45}
                    style={{ transition: 'opacity 150ms' }}
                  />
                )
              })}
              <text x={cx} y={height - 6} textAnchor="middle" fontSize="10" fill="var(--eb-muted)">
                {xLabel(String(d[x]))}
              </text>
            </g>
          )
        })}
      </svg>
      {hover !== null && data[hover] && (
        <Tip
          x={((pad.l + band * hover + band / 2) / W) * 100}
          y={ys(Math.max(...series.map((s) => Number(data[hover]![s.key])))) - 6}
        >
          <div className="text-muted">{xLabel(String(data[hover][x]))}</div>
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
              {s.label}:{' '}
              <span className="font-medium tabular-nums">{format(Number(data[hover]![s.key]))}</span>
            </div>
          ))}
        </Tip>
      )}
    </div>
  )
}

/** Donut with a centre total and a legend. */
export function Donut({
  items,
  label,
  center,
}: {
  items: { label: string; value: number; color: string }[]
  label: string
  center?: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const total = items.reduce((s, i) => s + i.value, 0) || 1
  const R = 52
  const r = 34
  const starts = items.map((_, i) => items.slice(0, i).reduce((s, x) => s + x.value, 0))
  const arcs = items.map((it, i) => {
    const a0 = -Math.PI / 2 + (starts[i]! / total) * Math.PI * 2
    const a1 = a0 + (it.value / total) * Math.PI * 2
    const large = a1 - a0 > Math.PI ? 1 : 0
    const p = (a: number, rad: number) => `${60 + rad * Math.cos(a)},${60 + rad * Math.sin(a)}`
    return it.value
      ? `M${p(a0, R)}A${R},${R} 0 ${large} 1 ${p(a1 - 0.0001, R)}L${p(a1 - 0.0001, r)}A${r},${r} 0 ${large} 0 ${p(a0, r)}Z`
      : ''
  })
  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg viewBox="0 0 120 120" width="132" height="132" role="img" aria-label={label}>
        {arcs.map((d, i) => (
          <path
            key={i}
            d={d}
            fill={items[i]!.color}
            opacity={hover === null || hover === i ? 1 : 0.4}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            style={{ transition: 'opacity 150ms' }}
          />
        ))}
        <text x="60" y="58" textAnchor="middle" fontSize="20" fontWeight="600" fill="var(--eb-ink)">
          {hover === null ? (center ?? total) : items[hover]!.value}
        </text>
        <text x="60" y="74" textAnchor="middle" fontSize="9" fill="var(--eb-muted)">
          {hover === null ? 'total' : items[hover]!.label}
        </text>
      </svg>
      <ul className="flex flex-col gap-1.5 text-sm">
        {items.map((it, i) => (
          <li
            key={it.label}
            className="flex items-center gap-2"
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
          >
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: it.color }} />
            <span className="text-muted">{it.label}</span>
            <span className="ml-auto pl-3 font-medium tabular-nums">{it.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** A labelled meter with a soft limit. */
export function Meter({
  label,
  value,
  max,
  format = (v: number) => String(v),
  invert,
}: {
  label: string
  value: number
  max: number
  format?: (v: number) => string
  /** True when the value is what's left (higher is better). */
  invert?: boolean
}) {
  const pct = Math.min(100, (value / max) * 100)
  // A meter of what's used turns amber/red near the limit; one of what's left does so when it runs low.
  const used = invert ? 100 - pct : pct
  const tone = used > 90 ? 'bg-conflicting' : used > 70 ? 'bg-partial' : 'bg-brand'
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted tabular-nums">
          {format(value)} of {format(max)}
        </span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-line"
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`h-full rounded-full ${tone} transition-[width] duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/** Scatter plot; points coloured by group, sized by a weight. */
export function Scatter<T>({
  data,
  x,
  y,
  r,
  color,
  xLabel,
  yLabel,
  xFormat = (v: number) => String(Math.round(v)),
  yFormat = (v: number) => String(v),
  tip,
  label,
  height = 280,
  dim,
}: {
  data: T[]
  x: (d: T) => number
  y: (d: T) => number
  r: (d: T) => number
  color: (d: T) => string
  xLabel: string
  yLabel: string
  xFormat?: (v: number) => string
  yFormat?: (v: number) => string
  tip: (d: T) => ReactNode
  label: string
  height?: number
  dim?: (d: T) => boolean
}) {
  const [hover, setHover] = useState<number | null>(null)
  const pad = { l: 44, r: 12, t: 16, b: 34 }
  const xMax = Math.max(...data.map(x), 1) * 1.08
  const yMin = Math.min(...data.map(y), 0.5)
  const yMax = 1
  const rMax = Math.max(...data.map(r), 1)
  const xs = (v: number) => pad.l + (v / xMax) * (W - pad.l - pad.r)
  const ys = (v: number) => pad.t + (1 - (v - yMin) / (yMax - yMin || 1)) * (height - pad.t - pad.b)
  const rs = (v: number) => 4 + Math.sqrt(v / rMax) * 10
  const yt = [yMin, (yMin + yMax) / 2, yMax]
  const xt = [0, xMax / 3, (2 * xMax) / 3, xMax].map((v) => Math.round(v))
  const order = data.map((d, i) => ({ d, i })).sort((a, b) => r(b.d) - r(a.d))
  return (
    <div className="relative" onPointerLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${height}`} width="100%" height={height} role="img" aria-label={label}>
        {yt.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={ys(t)} y2={ys(t)} stroke="var(--eb-line)" />
            <text x={pad.l - 6} y={ys(t)} dy="0.32em" textAnchor="end" fontSize="10" fill="var(--eb-muted)">
              {yFormat(t)}
            </text>
          </g>
        ))}
        {xt.map((t) => (
          <text key={t} x={xs(t)} y={height - 18} textAnchor="middle" fontSize="10" fill="var(--eb-muted)">
            {xFormat(t)}
          </text>
        ))}
        <text x={W - pad.r} y={height - 3} textAnchor="end" fontSize="10" fill="var(--eb-muted)">
          {xLabel} →
        </text>
        <text x={pad.l} y={9} fontSize="10" fill="var(--eb-muted)">
          ↑ {yLabel}
        </text>
        {order.map(({ d, i }) => (
          <circle
            key={i}
            cx={xs(x(d))}
            cy={ys(y(d))}
            r={rs(r(d))}
            fill={color(d)}
            fillOpacity={dim?.(d) ? 0.12 : hover === null || hover === i ? 0.78 : 0.3}
            stroke="var(--eb-surface)"
            strokeWidth="1.5"
            className="eb-node-pop"
            onPointerEnter={() => setHover(i)}
          />
        ))}
      </svg>
      {hover !== null && data[hover] && (
        <Tip x={(xs(x(data[hover])) / W) * 100} y={ys(y(data[hover])) - rs(r(data[hover])) - 4}>
          {tip(data[hover])}
        </Tip>
      )}
    </div>
  )
}

/** Horizontal stacked bars with a legend. */
export function StackedBars({
  rows,
  series,
  label,
  format = (v: number) => String(v),
  onSelect,
}: {
  rows: { label: string; values: number[] }[]
  series: { label: string; color: string }[]
  label: string
  format?: (v: number) => string
  onSelect?: (rowLabel: string) => void
}) {
  const max = Math.max(...rows.map((r) => r.values.reduce((a, b) => a + b, 0)), 1)
  return (
    <div role="group" aria-label={label}>
      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-hidden>
        {series.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>
      <ul className="flex flex-col gap-2.5">
        {rows.map((r) => {
          const total = r.values.reduce((a, b) => a + b, 0)
          return (
            <li key={r.label}>
              <button
                type="button"
                disabled={!onSelect}
                onClick={() => onSelect?.(r.label)}
                className="grid w-full grid-cols-[minmax(6rem,11rem)_1fr_2.5rem] items-center gap-3 text-left text-sm disabled:cursor-default"
              >
                <span className="truncate font-mono text-xs">{r.label}</span>
                <span className="flex h-3 overflow-hidden rounded-full bg-line">
                  {r.values.map((v, i) =>
                    v ? (
                      <span
                        key={i}
                        title={`${series[i]!.label}: ${format(v)}`}
                        className="h-full transition-[width] duration-700 ease-out first:rounded-l-full last:rounded-r-full"
                        style={{ width: `${(v / max) * 100}%`, background: series[i]!.color }}
                      />
                    ) : null,
                  )}
                </span>
                <span className="text-right text-xs text-muted tabular-nums">{format(total)}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * Left-to-right system diagram with animated connectors. A node "pulses" when `pulse` changes,
 * so live events visibly travel through the system. Stacks vertically on small screens.
 */
export function FlowDiagram({
  nodes,
  label,
  activeEdges,
}: {
  nodes: {
    key: string
    title: string
    detail: string
    icon: ReactNode
    tone?: 'brand' | 'good' | 'warn' | 'bad'
  }[]
  label: string
  /** Index of edges (node i → i+1) currently carrying traffic. */
  activeEdges: number[]
}) {
  const ring = {
    brand: 'border-brand/40',
    good: 'border-supported/50',
    warn: 'border-partial/60',
    bad: 'border-conflicting/60',
  }
  const chip = {
    brand: 'bg-brand-soft text-brand',
    good: 'bg-supported-soft text-supported',
    warn: 'bg-partial-soft text-partial',
    bad: 'bg-conflicting-soft text-conflicting',
  }
  return (
    <ol
      aria-label={label}
      className="eb-stagger flex flex-col items-stretch gap-0 lg:flex-row lg:items-stretch"
    >
      {nodes.map((n, i) => {
        const tone = n.tone ?? 'brand'
        const on = activeEdges.includes(i)
        return [
          <li
            key={n.key}
            className={`flex min-w-0 flex-1 flex-col gap-1.5 rounded-panel border bg-surface p-3 ${ring[tone]}`}
          >
            <span className={`flex h-8 w-8 items-center justify-center rounded-full ${chip[tone]}`}>
              {n.icon}
            </span>
            <span className="text-sm leading-tight font-semibold">{n.title}</span>
            <span className="text-xs text-muted">{n.detail}</span>
          </li>,
          i < nodes.length - 1 && (
            <li key={`${n.key}-e`} aria-hidden className="flex shrink-0 items-center justify-center lg:w-8">
              <svg viewBox="0 0 40 12" className="hidden h-3 w-full lg:block" preserveAspectRatio="none">
                <line
                  x1="0"
                  y1="6"
                  x2="34"
                  y2="6"
                  stroke={on ? 'var(--eb-brand)' : 'var(--eb-line-strong)'}
                  strokeWidth="2"
                  className={on ? 'eb-flow-line' : ''}
                />
                <path
                  d="M33 1 L39 6 L33 11"
                  fill="none"
                  stroke={on ? 'var(--eb-brand)' : 'var(--eb-line-strong)'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <svg viewBox="0 0 12 24" className="h-6 w-3 lg:hidden">
                <line
                  x1="6"
                  y1="0"
                  x2="6"
                  y2="18"
                  stroke={on ? 'var(--eb-brand)' : 'var(--eb-line-strong)'}
                  strokeWidth="2"
                  className={on ? 'eb-flow-line' : ''}
                />
                <path
                  d="M1 17 L6 23 L11 17"
                  fill="none"
                  stroke={on ? 'var(--eb-brand)' : 'var(--eb-line-strong)'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </li>
          ),
        ]
      })}
    </ol>
  )
}
