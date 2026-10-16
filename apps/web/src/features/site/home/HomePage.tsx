import { Check } from 'lucide-react'
import { FEATURE_GROUPS } from '../content/features'
import { RESPONSIBLE_USE, SECURITY_TOPICS } from '../content/security'
import { ExpandCard } from '../ExpandCard'
import { KnowledgeCircuit } from '../motion/KnowledgeCircuit'
import { HOW_STEPS } from '../pages/howSteps'
import { SiteLink } from '../SiteLink'
import { FAQ, PRICING, ROLES, STEPS, TRUST } from './content'
import { EvidenceTrace } from './EvidenceTrace'

const primary =
  'inline-flex h-12 items-center rounded-control bg-brand px-6 font-medium text-on-brand transition-colors duration-150 hover:bg-brand-hover'
const secondary =
  'inline-flex h-12 items-center rounded-control border border-line-strong bg-surface px-6 font-medium text-ink transition-colors duration-150 hover:bg-band'
const wrap = 'mx-auto max-w-[1200px] px-4 sm:px-6'

/** Home role card → its group on the Features page (more detail comes from approved copy only). */
const ROLE_GROUP: Record<string, string> = {
  'Engineering manager': 'Engineering managers',
  'Leaving engineer': 'Leaving engineer',
  Successor: 'Successor',
  'CTO or workspace owner': 'Workspace admins',
  HR: 'HR',
}

/** Home trust card → the Security page section that explains it (no id → responsible use). */
const TRUST_TOPIC: Record<string, string> = {
  'Read-only GitHub access': 'access',
  'Excerpts, not source code': 'data',
  'Each workspace is isolated': 'isolation',
  'People approve, AI suggests': 'ai',
  'Retention you set': 'retention',
}

export function HomePage() {
  return (
    <>
      {/* Hero: the one bold element on the page is the knowledge circuit, drawn from the logo. */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(48rem_28rem_at_88%_8%,var(--eb-soft),transparent_70%),radial-gradient(36rem_24rem_at_8%_0%,var(--eb-brand-soft),transparent_70%)]"
        />
        <div
          className={`${wrap} relative grid items-center gap-10 pt-12 pb-16 lg:grid-cols-[1.02fr_1fr] lg:gap-6 lg:pt-20 lg:pb-24`}
        >
          <div>
            <p className="text-[0.94rem] font-medium text-accent-ink">
              Knowledge transfer for engineering teams
            </p>
            <h1 className="mt-4 text-[2.5rem] leading-[1.04] font-semibold tracking-[-0.03em] text-balance sm:text-[3.4rem] lg:text-[3.9rem]">
              When a senior engineer leaves, their knowledge doesn’t have to.
            </h1>
            <p className="mt-6 max-w-[33rem] text-[1.125rem] leading-[1.65] text-muted">
              Exit Brain reads the work they did on GitHub, asks them the questions only they can answer, and
              gives their successor a handover where every line points to its source and was approved by a
              person.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <SiteLink href="/signup" className={primary}>
                Start a pilot
              </SiteLink>
              <SiteLink href="/demo" className={secondary}>
                Try the demo
              </SiteLink>
            </div>
            <ul className="mt-9 grid gap-2.5 text-[0.94rem] text-muted sm:grid-cols-[auto_auto] sm:gap-x-8">
              {[
                'Read-only GitHub access',
                'People approve every step',
                'Each workspace isolated',
                'No scoring of people',
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check aria-hidden size={16} className="shrink-0 text-supported" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="mx-auto w-full max-w-[560px] lg:max-w-none">
            <KnowledgeCircuit />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-y border-line bg-band">
        <div className={`${wrap} grid gap-8 py-16 md:grid-cols-[1fr_1.25fr] md:py-20`}>
          <h2 className="text-[1.75rem] leading-tight font-semibold tracking-[-0.02em] text-balance">
            Exit interviews ask what people remember. Most of what matters, they don’t think to mention.
          </h2>
          <div className="flex max-w-[36rem] flex-col gap-4 text-[1.0625rem] leading-[1.7] text-muted">
            <p>
              The script that has to run on the first of the month. The retry someone added during an incident
              and never wrote down. The client whose invoices are priced by hand. People rarely list these,
              because to them it is just how the work gets done.
            </p>
            <p className="text-ink">
              Exit Brain starts from the work itself, so the questions are about the parts only that person
              has touched.
            </p>
          </div>
        </div>
      </section>

      {/* How it works: a real sequence, so it is numbered. */}
      <section id="how" className={`${wrap} scroll-mt-24 py-20 md:py-28`}>
        <h2 className="max-w-2xl text-[2.25rem] leading-tight font-semibold tracking-[-0.025em]">
          How a handover works
        </h2>
        <p className="mt-4 max-w-2xl text-[1.0625rem] text-muted">
          Five steps from resignation to a successor who can answer “how did Ravi handle this?” with a source.
        </p>
        <SiteLink
          href="/how-it-works"
          className="mt-4 inline-block font-medium text-link underline-offset-4 hover:underline"
        >
          See the full workflow
        </SiteLink>
        <ol className="mt-14 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map(({ Icon, title, body }, i) => (
            <ExpandCard
              key={title}
              Icon={Icon}
              badge={
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-surface tabular-nums">
                  {i + 1}
                </span>
              }
              title={title}
              summary={body}
              more={
                <>
                  <p className="font-medium text-ink">{HOW_STEPS[i]!.who}</p>
                  <p className="mt-1">{HOW_STEPS[i]!.body}</p>
                  <p className="mt-2 text-ink">{HOW_STEPS[i]!.never}</p>
                </>
              }
              link={{ label: 'See this step', href: '/how-it-works' }}
            />
          ))}
        </ol>
      </section>

      {/* Evidence */}
      <section className="border-y border-line bg-surface">
        <div className={`${wrap} grid items-center gap-12 py-20 md:py-24 lg:grid-cols-[1fr_1.1fr]`}>
          <div className="max-w-[30rem]">
            <h2 className="text-[2.25rem] leading-tight font-semibold tracking-[-0.025em]">
              Every line points to where it came from.
            </h2>
            <p className="mt-4 text-[1.0625rem] leading-[1.7] text-muted">
              Statements in a handover link to the commits, pull requests and issues behind them, with a
              verification status. If the records don’t support an answer, Exit Brain says so.
            </p>
          </div>
          <EvidenceTrace />
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className={`${wrap} scroll-mt-24 py-20 md:py-28`}>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="text-[2.25rem] leading-tight font-semibold tracking-[-0.025em]">
              A portal for each person in the handover
            </h2>
            <p className="mt-4 text-[1.0625rem] text-muted">
              Everyone signs in to their own view. Nobody sees more than their role needs.
            </p>
            <SiteLink
              href="/demo"
              className="mt-6 inline-block font-medium text-link underline-offset-4 hover:underline"
            >
              See every portal with a fictional company
            </SiteLink>
          </div>
          <ul className="grid items-start gap-4 sm:grid-cols-2">
            {ROLES.map(({ Icon, who, gets }) => {
              const group = FEATURE_GROUPS.find((g) => g.who === ROLE_GROUP[who])
              return (
                <ExpandCard
                  key={who}
                  Icon={Icon}
                  title={who}
                  summary={gets}
                  more={
                    <ul className="flex flex-col gap-2">
                      {group?.features.map((f) => (
                        <li key={f.name}>
                          <span className="font-medium text-ink">{f.name}.</span> {f.detail}
                        </li>
                      ))}
                    </ul>
                  }
                  link={{ label: 'All features by role', href: '/features' }}
                />
              )
            })}
          </ul>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="scroll-mt-24 bg-ink text-surface">
        <div className={`${wrap} grid gap-12 py-20 md:py-24 lg:grid-cols-[1fr_1.6fr]`}>
          <div>
            <h2 className="text-[2.25rem] leading-tight font-semibold tracking-[-0.025em]">
              Built for code you can’t afford to leak
            </h2>
            <p className="mt-4 text-[1.0625rem] leading-[1.7] text-on-ink-muted">
              Exit Brain handles knowledge about your systems and your clients. These are the rules the
              product is built on.
            </p>
          </div>
          <ul className="grid items-start gap-4 sm:grid-cols-2">
            {TRUST.map(({ Icon, title, body }) => {
              const topic = SECURITY_TOPICS.find((t) => t.id === TRUST_TOPIC[title])
              return (
                <ExpandCard
                  key={title}
                  tone="dark"
                  Icon={Icon}
                  title={title}
                  summary={body}
                  more={(topic ? topic.body : RESPONSIBLE_USE).map((line) => (
                    <p key={line} className="mt-2 first:mt-0">
                      {line}
                    </p>
                  ))}
                  link={{
                    label: 'Read Security',
                    href: topic ? `/security#${topic.id}` : '/security#responsible-use',
                  }}
                />
              )
            })}
          </ul>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={`${wrap} scroll-mt-24 py-20 md:py-28`}>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-[2.25rem] leading-tight font-semibold tracking-[-0.025em]">
              {PRICING.title}
            </h2>
            <p className="mt-4 max-w-md text-[1.0625rem] text-muted">{PRICING.body}</p>
          </div>
          <div className="rounded-[20px] border border-line bg-surface p-7 shadow-float">
            <p className="flex items-baseline gap-2">
              <span className="text-[3.25rem] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                $149
              </span>
              <span className="text-muted">per departure</span>
            </p>
            <ul className="mt-6 flex flex-col gap-2.5 text-[0.94rem]">
              {PRICING.includes.map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check aria-hidden size={16} className="mt-1 shrink-0 text-supported" />
                  {t}
                </li>
              ))}
            </ul>
            <SiteLink href="/signup" className={`${primary} mt-7 w-full justify-center`}>
              Start a pilot
            </SiteLink>
            <p className="mt-3 text-sm text-muted">{PRICING.note}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 border-t border-line bg-band">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 md:py-24">
          <h2 className="text-[2.25rem] leading-tight font-semibold tracking-[-0.025em]">
            Questions teams ask first
          </h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[1.0625rem] font-medium">
                  {q}
                  <span
                    aria-hidden
                    className="text-xl text-muted transition-transform duration-150 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section
        className={`${wrap} flex flex-col items-start gap-8 py-20 md:flex-row md:items-center md:justify-between`}
      >
        <h2 className="max-w-xl text-[1.75rem] leading-tight font-semibold tracking-[-0.02em] text-balance">
          Someone resigned this week? Start the handover while they’re still here.
        </h2>
        <div className="flex flex-wrap gap-3">
          <SiteLink href="/signup" className={primary}>
            Start a pilot
          </SiteLink>
          <SiteLink href="/demo" className={secondary}>
            Try the demo
          </SiteLink>
        </div>
      </section>
    </>
  )
}
