import { Check, Lock, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import type { VerificationStatus } from '../../../data/types'
import { DemoLabel } from '../../../design/primitives/Demo'
import { RiskBars, VerificationBadge } from '../../../design/primitives/status'
import { PageHeader } from '../PageHeader'
import { HOW_STEPS } from './howSteps'
import { SiteLink } from '../SiteLink'
import { container, primaryButton, secondaryButton, sectionTitle } from '../styles'

/** A product artefact shown on the website: real UI pieces, fictional data, always labelled. */
function Artefact({ children }: { children: ReactNode }) {
  return (
    <figure className="m-0 rounded-[16px] border border-line bg-surface p-5 shadow-float sm:p-6">
      {children}
      <figcaption className="mt-4 flex justify-end">
        <DemoLabel>MOCK DATA, fictional company</DemoLabel>
      </figcaption>
    </figure>
  )
}

const Cite = ({ n }: { n: number }) => (
  <span className="inline-block min-w-5 rounded-full border border-supported px-1 text-center text-[11px] leading-4 font-semibold text-supported tabular-nums">
    {n}
  </span>
)

function GitHubAccess() {
  return (
    <Artefact>
      <p className="text-sm font-semibold">Exit Brain GitHub App requests</p>
      <ul className="mt-3 divide-y divide-line rounded-[10px] border border-line text-sm">
        {['Metadata', 'Contents', 'Pull requests', 'Issues'].map((p) => (
          <li key={p} className="flex items-center justify-between px-3 py-2">
            {p}
            <span className="inline-flex items-center gap-1 rounded-full bg-band px-2 py-0.5 text-xs text-muted">
              <Lock aria-hidden size={11} /> Read-only
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm font-semibold">Repositories you chose</p>
      <ul className="mt-2 flex flex-col gap-1.5 font-mono text-[13px]">
        <li className="flex items-center gap-2">
          <Check aria-hidden size={14} className="text-supported" /> acme/billing-sync
        </li>
        <li className="flex items-center gap-2">
          <Check aria-hidden size={14} className="text-supported" /> acme/api-gateway
        </li>
        <li className="flex items-center gap-2 text-muted">
          <span aria-hidden className="inline-block w-3.5" /> acme/marketing-site{' '}
          <span className="font-sans">(not shared)</span>
        </li>
      </ul>
    </Artefact>
  )
}

function KnowledgeArea() {
  return (
    <Artefact>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted">billing-sync/cron</p>
          <p className="mt-0.5 font-semibold">Nightly invoice sync with Stripe</p>
        </div>
        <RiskBars level="high" />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Ravi made 91% of the changes to this area this year. Recent records mention a temporary retry and a
        schedule moved around the backup window.
      </p>
      <ul className="mt-3 flex flex-col gap-1.5 text-[13px]">
        {[
          ['3f2a9c1', 'temporary fix: retry nightly invoice sync on Stripe 429'],
          ['b81d04e', 'cron: move nightly sync to 02:00 IST to avoid backup window'],
        ].map(([sha, msg]) => (
          <li key={sha} className="flex gap-2">
            <span className="font-mono text-ink">{sha}</span>
            <span className="text-muted">{msg}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted">
        Suggested by Exit Brain. Waiting for the manager to confirm, edit or reject.
      </p>
    </Artefact>
  )
}

function InterviewQuestion() {
  return (
    <Artefact>
      <p className="font-semibold leading-snug">
        Commit 3f2a9c1 calls the retry logic a temporary fix. What has to happen before it can be removed?
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
        Why are we asking? Based on record <Cite n={1} />
      </p>
      <div className="mt-4 rounded-[10px] bg-band p-3 text-sm">
        <p className="text-muted">Ravi’s answer</p>
        <p className="mt-1">It depends on Stripe’s limits, usually fine.</p>
      </div>
      <div className="mt-3 rounded-[10px] border border-dashed border-line-strong p-3 text-sm">
        <p className="font-medium">Follow-up</p>
        <p className="mt-1 text-muted">Which limit, and how would Kiran know it has been raised?</p>
      </div>
      <p className="mt-4 text-xs text-muted">Nothing is shared until Ravi approves his answers.</p>
    </Artefact>
  )
}

const STATES: { status: VerificationStatus; meaning: string }[] = [
  { status: 'supported', meaning: 'The records agree with the answer.' },
  {
    status: 'partially_supported',
    meaning: 'Some of it is in the records; the rest relies on the engineer.',
  },
  { status: 'conflicting', meaning: 'The records say something different. It becomes an open question.' },
  { status: 'unverified', meaning: 'No record covers it. It is kept, and clearly marked.' },
]

function Verification() {
  return (
    <Artefact>
      <ul className="flex flex-col gap-3">
        {STATES.map(({ status, meaning }) => (
          <li key={status} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <span className="w-36 shrink-0">
              <VerificationBadge status={status} />
            </span>
            <span className="text-sm text-muted">{meaning}</span>
          </li>
        ))}
      </ul>
    </Artefact>
  )
}

function Handover() {
  return (
    <Artefact>
      <p className="text-xs font-medium text-brand">Handover statement</p>
      <p className="mt-1 text-sm leading-6">
        The nightly sync runs at 02:00 IST and must stay outside the 00:30–01:30 backup window. Failures alert
        #billing-alerts.{' '}
        <span className="inline-flex gap-0.5 align-middle">
          <Cite n={1} />
          <Cite n={2} />
        </span>
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <VerificationBadge status="supported" />
        <span className="inline-flex items-center gap-1.5 text-xs text-muted">
          <ShieldCheck aria-hidden size={14} className="text-supported" />
          Approved by Priya Nair, Engineering Manager
        </span>
      </div>
      <div className="mt-5 border-t border-line pt-4">
        <p className="text-sm font-medium">Kiran asks: How do I renew the SSL certificate?</p>
        <p className="mt-1 text-sm text-muted">
          I can’t find this in the approved handover. Ask Ravi before his last day?
        </p>
      </div>
    </Artefact>
  )
}

const ARTEFACTS: ReactNode[] = [
  <GitHubAccess key="GitHubAccess" />,
  <KnowledgeArea key="KnowledgeArea" />,
  <InterviewQuestion key="InterviewQuestion" />,
  <Verification key="Verification" />,
  <Handover key="Handover" />,
]

const STEPS = HOW_STEPS.map((s, i) => ({ ...s, artefact: ARTEFACTS[i] }))

const TIMELINE = [
  { when: 'Day 1', what: 'Connect GitHub and start the transition' },
  { when: 'Days 2–4', what: 'Manager reviews the suggested knowledge areas' },
  { when: 'Days 5–20', what: 'Interview, about 15 minutes a day' },
  { when: 'Days 21–25', what: 'Verification and handover draft' },
  { when: 'Days 26–28', what: 'Manager approves; successor starts the checklist' },
  { when: 'Last day', what: 'Open questions are answered while the engineer is still here' },
]

export function HowItWorksPage() {
  return (
    <>
      <PageHeader
        kicker="How it works"
        title="How a handover works"
        lead="Exit Brain starts from the work itself, so the questions are about the parts only the leaving engineer has touched. People approve every step."
      >
        <SiteLink href="/demo" className={primaryButton}>
          Explore the demo
        </SiteLink>
        <SiteLink href="/features" className={secondaryButton}>
          See the features
        </SiteLink>
      </PageHeader>

      {/* The steps are a real sequence, so they are numbered. */}
      <ol className={`${container} flex flex-col py-16 md:py-24`}>
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            data-reveal
            className="grid gap-8 border-b border-line py-12 first:pt-0 last:border-b-0 lg:grid-cols-[1fr_1.05fr] lg:gap-16"
          >
            <div className="flex gap-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-[0.94rem] font-semibold text-surface tabular-nums">
                {i + 1}
              </span>
              <div className="max-w-[34rem]">
                <h2 className="text-[1.75rem] leading-tight font-semibold tracking-[-0.02em]">{s.title}</h2>
                <p className="mt-2 text-[0.94rem] font-medium text-accent-ink">{s.who}</p>
                <p className="mt-4 text-[1.0625rem] leading-[1.7] text-muted">{s.body}</p>
                <p className="mt-5 flex items-start gap-2 text-[0.94rem] text-ink">
                  <ShieldCheck aria-hidden size={18} className="mt-0.5 shrink-0 text-brand" />
                  {s.never}
                </p>
              </div>
            </div>
            <div className="min-w-0">{s.artefact}</div>
          </li>
        ))}
      </ol>

      <section className="border-y border-line bg-band">
        <div className={`${container} grid gap-10 py-16 md:py-20 lg:grid-cols-[1fr_1.6fr]`}>
          <div>
            <h2 className={sectionTitle}>A 30-day notice period, for example</h2>
            <p className="mt-4 text-[1.0625rem] text-muted">
              An illustration, not a promise. Real timing depends on the team and how much the engineer owns.
            </p>
          </div>
          <ol className="flex flex-col">
            {TIMELINE.map((t) => (
              <li
                key={t.when}
                className="grid grid-cols-[7rem_1fr] gap-4 border-b border-line py-4 last:border-b-0"
              >
                <span className="font-medium tabular-nums">{t.when}</span>
                <span className="text-muted">{t.what}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className={`${container} flex flex-col items-start gap-8 py-20 md:flex-row md:items-center md:justify-between`}
      >
        <h2 className="max-w-xl text-[1.75rem] leading-tight font-semibold tracking-[-0.02em] text-balance">
          See each step with a fictional company, no account needed.
        </h2>
        <div className="flex flex-wrap gap-3">
          <SiteLink href="/demo" className={primaryButton}>
            Explore the demo
          </SiteLink>
          <SiteLink href="/signup" className={secondaryButton}>
            Start a pilot
          </SiteLink>
        </div>
      </section>
    </>
  )
}
