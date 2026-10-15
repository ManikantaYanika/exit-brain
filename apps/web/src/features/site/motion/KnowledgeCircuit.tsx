import { Pause, Play } from 'lucide-react'
import { useId, useRef } from 'react'
import { CHIPS, DOOR, LOBES, TRACES, VIAS } from './circuit'
import { useAmbientMotion } from './useAmbientMotion'

const CHIP_H = 26
const chipWidth = (label: string) => 22 + label.length * 6.6

export function KnowledgeCircuit() {
  const ref = useRef<HTMLDivElement>(null)
  const { userPaused, running, toggle } = useAmbientMotion(ref)
  const id = useId().replace(/[^a-zA-Z0-9-]/g, '')
  const { x: dx, top, bottom, depth } = DOOR

  return (
    <div ref={ref} className={`eb-circuit ${running ? '' : 'is-paused'}`}>
      <svg
        viewBox="0 0 620 420"
        role="img"
        aria-labelledby={`${id}-t`}
        className="relative block h-auto w-full"
      >
        <title id={`${id}-t`}>
          Knowledge moving from a leaving engineer’s work, through a door, to an approved handover for the
          person taking over.
        </title>
        <defs>
          <linearGradient id={`${id}-brain`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e3ebff" />
            <stop offset="1" stopColor="#eee6fd" />
          </linearGradient>
          <linearGradient id={`${id}-door`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--eb-brand)" />
            <stop offset="1" stopColor="var(--eb-brand-2)" />
          </linearGradient>
          <linearGradient id={`${id}-sig`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--eb-brand-2)" />
            <stop offset="1" stopColor="var(--eb-brand)" />
          </linearGradient>
          <radialGradient id={`${id}-glow`}>
            <stop offset="0" stopColor="var(--eb-glow)" stopOpacity="0.28" />
            <stop offset="1" stopColor="var(--eb-glow)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse className="eb-circuit-glow" cx="250" cy="215" rx="250" ry="200" fill={`url(#${id}-glow)`} />

        {/* Brain */}
        <g fill={`url(#${id}-brain)`}>
          {LOBES.map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>

        {/* Evidence chips and their leaders */}
        {CHIPS.map((c) => {
          const [tx, ty] = c.target
          const w = chipWidth(c.label)
          const ax = c.x + 18
          const ay = c.y < ty ? c.y + CHIP_H : c.y
          const end = tx > ax ? `L${tx - 8} ${ty}` : ''
          return (
            <g key={c.label}>
              <path
                d={`M${ax} ${ay} L${ax} ${ty} ${end}`}
                fill="none"
                stroke="var(--eb-line-strong)"
                strokeDasharray="2 4"
                strokeOpacity="0.7"
              />
              <rect
                x={c.x}
                y={c.y}
                width={w}
                height={CHIP_H}
                rx="13"
                fill="var(--eb-surface)"
                stroke="var(--eb-line)"
              />
              <text x={c.x + 11} y={c.y + 17} fontSize="11" className="fill-ink font-mono">
                {c.label}
              </text>
            </g>
          )
        })}

        {/* Circuit traces */}
        <g fill="none" stroke="var(--eb-brand)" strokeOpacity="0.55" strokeWidth="2" strokeLinejoin="round">
          {VIAS.map((v) => (
            <path key={v.d} d={v.d} />
          ))}
          {TRACES.map((t) => (
            <path key={t.d} d={t.d} />
          ))}
        </g>
        <g fill="var(--eb-surface)" stroke="var(--eb-brand)" strokeOpacity="0.55" strokeWidth="2">
          {VIAS.map((v) => (
            <circle key={v.d} cx={v.end[0]} cy={v.end[1]} r="3.5" />
          ))}
        </g>
        <g fill="none" strokeWidth="3.2" strokeLinecap="round" stroke={`url(#${id}-sig)`}>
          {TRACES.map((t, i) => (
            <path
              key={t.d}
              d={t.d}
              pathLength={100}
              className="eb-signal"
              style={{ animationDelay: `${i * -1.1}s` }}
            />
          ))}
        </g>
        {TRACES.map((t, i) => (
          <circle
            key={t.d}
            cx={t.start[0]}
            cy={t.start[1]}
            r="7"
            fill="var(--eb-surface)"
            stroke={i % 2 ? 'var(--eb-brand-2)' : 'var(--eb-brand)'}
            strokeWidth="2.6"
            className="eb-node"
            style={{ animationDelay: `${i * -0.9}s` }}
          />
        ))}

        {/* Door, as in the mark */}
        <path
          d={`M${dx} ${top} L${dx + depth} ${top - 22} L${dx + depth} ${bottom + 22} L${dx} ${bottom} Z`}
          fill={`url(#${id}-door)`}
        />
        <path
          className="eb-door-light"
          d={`M${dx + 10} ${top + 12} L${dx + depth - 10} ${top - 4} L${dx + depth - 10} ${bottom + 4} L${dx + 10} ${bottom - 12} Z`}
          fill="#eaf6ff"
        />

        {/* Speed lines */}
        <g stroke="var(--eb-spark)" strokeWidth="7" strokeLinecap="round">
          <line className="eb-speed" x1="500" y1="200" x2="560" y2="200" />
          <line
            className="eb-speed"
            x1="500"
            y1="230"
            x2="584"
            y2="230"
            style={{ animationDelay: '-0.7s' }}
          />
          <line
            className="eb-speed"
            x1="500"
            y1="260"
            x2="548"
            y2="260"
            style={{ animationDelay: '-1.4s' }}
          />
        </g>

        {/* What arrives on the other side */}
        <g transform="translate(470 318)">
          <rect width="146" height="44" rx="12" fill="var(--eb-surface)" stroke="var(--eb-line)" />
          <circle cx="22" cy="22" r="9" fill="var(--eb-supported)" />
          <path
            d="M17.5 22.2 L20.8 25.3 L26.6 19.2"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="38" y="20" fontSize="11.5" fontWeight="600" className="fill-ink">
            Approved handover
          </text>
          <text x="38" y="34" fontSize="10.5" className="fill-muted">
            every line cited
          </text>
        </g>
      </svg>

      <button
        type="button"
        onClick={toggle}
        aria-pressed={userPaused}
        className="eb-circuit-toggle mt-2 ml-1 inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface/90 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur transition-colors hover:bg-surface"
      >
        {userPaused ? <Play aria-hidden size={13} /> : <Pause aria-hidden size={13} />}
        {userPaused ? 'Play animation' : 'Pause animation'}
      </button>
    </div>
  )
}
