import { ShieldCheck } from 'lucide-react'
import { DemoLabel } from '../../../design/primitives/Demo'
import { RiskBars, VerificationBadge } from '../../../design/primitives/status'

const COMMITS = [
  { n: 1, sha: 'b81d04e', msg: 'cron: move nightly sync to 02:00 IST to avoid backup window', date: '2 Mar' },
  { n: 2, sha: '3f2a9c1', msg: 'temporary fix: retry nightly invoice sync on Stripe 429', date: '21 Aug' },
  { n: 3, sha: '7c19e2b', msg: 'alert #billing-alerts when the sync fails twice', date: '4 Sep' },
]

/**
 * The landing hero's one orchestrated moment: work records resolve into a cited,
 * human-approved handover statement. Plays once (< 1s); static with reduced motion.
 */
export function EvidenceTrace() {
  return (
    <figure
      aria-label="Example: three commits become one cited, approved handover statement"
      className="relative rounded-[14px] border border-line bg-surface p-5 shadow-float sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted">billing-sync/cron</p>
          <p className="mt-0.5 text-sm font-semibold">Nightly invoice sync</p>
        </div>
        <RiskBars level="high" />
      </div>

      <ol className="relative mt-5 flex flex-col gap-3 pl-6">
        <span aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-line-strong" />
        {COMMITS.map((c, i) => (
          <li key={c.sha} className="eb-trace-in relative" style={{ animationDelay: `${i * 110}ms` }}>
            <span
              aria-hidden
              className="absolute top-1.5 -left-6 h-[15px] w-[15px] rounded-full border-2 border-brand bg-surface"
            />
            <p className="flex items-baseline gap-2 text-xs text-muted">
              <span className="min-w-5 rounded-full border border-line-strong px-1 text-center text-[11px] leading-4 font-semibold tabular-nums">
                {c.n}
              </span>
              <span className="font-mono text-ink">{c.sha}</span>
              <span>{c.date}</span>
            </p>
            <p className="mt-0.5 text-sm leading-snug">{c.msg}</p>
          </li>
        ))}
      </ol>

      <div
        className="eb-trace-in mt-5 rounded-[10px] border border-brand/40 bg-brand-soft/60 p-4"
        style={{ animationDelay: '420ms' }}
      >
        <p className="text-xs font-medium text-brand">Handover statement</p>
        <p className="mt-1 text-sm leading-6">
          The nightly sync runs at 02:00 IST and must stay outside the 00:30–01:30 backup window. Failures
          alert #billing-alerts.
          <span className="ml-1 inline-flex gap-0.5 align-middle">
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className="eb-cite-pop min-w-5 rounded-full border border-supported px-1 text-center text-[11px] leading-4 font-semibold text-supported tabular-nums"
                style={{ animationDelay: `${700 + n * 60}ms` }}
              >
                {n}
              </span>
            ))}
          </span>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <VerificationBadge status="supported" />
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <ShieldCheck aria-hidden size={14} className="text-supported" />
            Approved by Priya Nair, Engineering Manager
          </span>
        </div>
      </div>

      <figcaption className="mt-4 flex justify-end">
        <DemoLabel>Example with demo data</DemoLabel>
      </figcaption>
    </figure>
  )
}
