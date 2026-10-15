import {
  BadgeCheck,
  Building2,
  Check,
  Clock,
  FileSearch,
  GitBranch,
  ListChecks,
  Lock,
  MessageSquareText,
  ScrollText,
  ShieldCheck,
  UserRound,
  Users,
  Workflow,
} from 'lucide-react'
import { Link } from 'react-router'
import { EvidenceTrace } from './EvidenceTrace'

const STEPS = [
  {
    Icon: GitBranch,
    title: 'Connect GitHub, read-only',
    body: 'Install the Exit Brain GitHub App and choose which repositories it may read. It reads commits, pull requests and issues. It never writes.',
  },
  {
    Icon: FileSearch,
    title: 'Find what only one person knows',
    body: 'Areas where one engineer made most of the changes, recurring jobs, workarounds and incidents are surfaced with the records behind them.',
  },
  {
    Icon: MessageSquareText,
    title: 'Interview with evidence',
    body: 'The leaving engineer gets specific questions tied to their own work, with follow-ups when an answer is too general to hand over.',
  },
  {
    Icon: BadgeCheck,
    title: 'Verify against the records',
    body: 'Each answer is checked against commits and pull requests and marked supported, partly supported, conflicting or unverified.',
  },
  {
    Icon: ListChecks,
    title: 'Approve and hand over',
    body: 'The manager approves a handover where every statement cites its source. The successor gets a checklist and an assistant that answers only from it.',
  },
]

const ROLES = [
  {
    Icon: Users,
    who: 'Engineering manager',
    gets: 'A reviewed list of knowledge that would leave with the person, interview progress, and a handover to approve.',
  },
  {
    Icon: UserRound,
    who: 'Leaving engineer',
    gets: 'Short, specific questions about their own work. Nothing is shared until they approve it.',
  },
  {
    Icon: ListChecks,
    who: 'Successor',
    gets: 'A checklist ordered by risk, the approved handover, and answers with sources when they ask how something was done.',
  },
  {
    Icon: Building2,
    who: 'CTO or workspace owner',
    gets: 'Team, GitHub access, data retention and an audit trail of who approved what.',
  },
  {
    Icon: Workflow,
    who: 'HR',
    gets: 'Status and progress for every transition, without access to code, answers or handover text.',
  },
]

const TRUST = [
  {
    Icon: GitBranch,
    title: 'Read-only GitHub access',
    body: 'Metadata, contents, pull requests and issues: read permissions only. Disconnect at any time.',
  },
  {
    Icon: ScrollText,
    title: 'Excerpts, not source code',
    body: 'Commit messages, titles, truncated descriptions and file paths. Full files are never stored.',
  },
  {
    Icon: Lock,
    title: 'Each workspace is isolated',
    body: 'Row-level security in the database keeps organisations apart, and isolation tests run on every change.',
  },
  {
    Icon: ShieldCheck,
    title: 'People approve, AI suggests',
    body: 'Knowledge areas, answers and the handover each need a named person’s approval before anyone else sees them.',
  },
  {
    Icon: Clock,
    title: 'You control retention',
    body: 'Data is deleted 90 days after a transition completes by default, or sooner on request.',
  },
  {
    Icon: UserRound,
    title: 'No performance scoring',
    body: 'Exit Brain measures how concentrated knowledge is in code areas. It never rates people.',
  },
]

const FAQ = [
  {
    q: 'Do you read or store our source code?',
    a: 'No. Exit Brain stores commit messages, pull request and issue titles with truncated descriptions, and file paths. It does not store file contents, and its GitHub access is read-only.',
  },
  {
    q: 'Does the AI decide anything?',
    a: 'No. It suggests knowledge areas, questions and a draft handover. A manager confirms the areas, the leaving engineer approves their answers, and the manager approves the handover. Anything without a source record is marked unverified.',
  },
  {
    q: 'What does the leaving engineer see?',
    a: 'Their own interview: each question shows the commits or pull requests that prompted it. They can edit, skip with a reason, and preview exactly what will be shared before approving.',
  },
  {
    q: 'Which tools are supported?',
    a: 'GitHub today. Slack, Jira and Google Drive are planned; they are not part of the current product.',
  },
  {
    q: 'Can we delete our data?',
    a: 'Yes. Owners can disconnect GitHub and request deletion of everything ingested, and completed transitions are deleted after your retention period.',
  },
]

export function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div>
          <p className="text-sm font-medium text-brand">Knowledge transfer for engineering teams</p>
          <h1 className="mt-3 text-[2.4rem] leading-[1.08] font-semibold tracking-[-0.025em] sm:text-[3.2rem]">
            When a senior engineer leaves, their knowledge doesn’t have to.
          </h1>
          <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-muted">
            Exit Brain reads the work they did on GitHub, asks them the questions only they can answer, and
            gives their successor a handover where every line points to its source and was approved by a
            person.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="inline-flex h-11 items-center rounded-control bg-brand px-5 font-medium text-on-brand hover:bg-brand-hover"
            >
              Start a pilot
            </Link>
            <Link
              to="/demo"
              className="inline-flex h-11 items-center rounded-control border border-line-strong bg-surface px-5 font-medium hover:bg-surface-sunken"
            >
              Try the demo
            </Link>
          </div>
          <ul className="mt-8 flex flex-col gap-2 text-sm text-muted sm:flex-row sm:flex-wrap sm:gap-x-6">
            {['Read-only GitHub access', 'People approve every step', 'Each workspace isolated'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check aria-hidden size={16} className="text-supported" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <EvidenceTrace />
      </section>

      {/* Problem */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1fr_1.4fr]">
          <h2 className="text-2xl font-semibold tracking-tight">
            Exit interviews ask what people remember. Most of what matters, they don’t think to mention.
          </h2>
          <div className="flex flex-col gap-4 text-muted">
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

      {/* How it works — a real sequence, so it is numbered */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">How a handover works</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Five steps from resignation to a successor who can answer “how did Ravi handle this?” with a source.
        </p>
        <ol className="mt-12 grid gap-8 md:grid-cols-5 md:gap-6">
          {STEPS.map(({ Icon, title, body }, i) => (
            <li key={title} className="relative flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-sm font-semibold tabular-nums">
                  {i + 1}
                </span>
                {i < STEPS.length - 1 && (
                  <span aria-hidden className="hidden h-px flex-1 bg-line-strong md:block" />
                )}
              </div>
              <Icon aria-hidden size={20} strokeWidth={1.75} className="text-brand" />
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Roles */}
      <section id="roles" className="scroll-mt-20 border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">
            A portal for each person in the handover
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Everyone signs in to their own view. Nobody sees more than their role needs.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES.map(({ Icon, who, gets }) => (
              <li key={who} className="rounded-panel border border-line bg-canvas p-5">
                <Icon aria-hidden size={20} strokeWidth={1.75} className="text-brand" />
                <h3 className="mt-3 font-semibold">{who}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{gets}</p>
              </li>
            ))}
            <li className="flex flex-col justify-between rounded-panel border border-dashed border-line-strong p-5">
              <p className="text-sm text-muted">
                See every portal with a fictional company, no account needed.
              </p>
              <Link to="/demo" className="mt-4 text-sm font-medium text-brand hover:underline">
                Open the demo
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Built for code you can’t afford to leak</h2>
            <p className="mt-3 text-muted">
              Exit Brain handles knowledge about your systems and your clients. These rules are enforced in
              the product, not just written in a policy.
            </p>
          </div>
          <ul className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {TRUST.map(({ Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <Icon aria-hidden size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-brand" />
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">One price per handover</h2>
            <p className="mt-3 max-w-md text-muted">
              You pay when someone leaves, not for seats. Managers, successors and HR are included.
            </p>
          </div>
          <div className="rounded-[14px] border border-line bg-canvas p-6">
            <p className="flex items-baseline gap-2">
              <span className="text-5xl font-semibold tracking-tight tabular-nums">$149</span>
              <span className="text-muted">per departure</span>
            </p>
            <ul className="mt-5 flex flex-col gap-2 text-sm">
              {[
                'GitHub analysis of the leaving engineer’s work',
                'Evidence-based interview with follow-ups',
                'Verified handover with citations',
                'Successor checklist and assistant',
                'Unlimited managers, successors and HR viewers',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check aria-hidden size={16} className="mt-0.5 shrink-0 text-supported" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-control bg-brand font-medium text-on-brand hover:bg-brand-hover"
            >
              Start a pilot
            </Link>
            <p className="mt-3 text-xs text-muted">
              Pilot pricing. Billing isn’t live yet, and nothing is charged without a signed agreement.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-20 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight">Questions teams ask first</h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {q}
                <span
                  aria-hidden
                  className="text-muted transition-transform duration-150 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-2 text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight">
            Someone resigned this week? Start the handover while they’re still here.
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="inline-flex h-11 items-center rounded-control bg-brand px-5 font-medium text-on-brand hover:bg-brand-hover"
            >
              Start a pilot
            </Link>
            <Link
              to="/demo"
              className="inline-flex h-11 items-center rounded-control border border-line-strong bg-surface px-5 font-medium hover:bg-surface-sunken"
            >
              Try the demo
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
