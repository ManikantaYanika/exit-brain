import {
  Building2,
  ListChecks,
  MessageSquareText,
  Plug,
  Settings2,
  Users,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '../PageHeader'
import { SiteLink } from '../SiteLink'
import { container, primaryButton, secondaryButton } from '../styles'

type Status = 'mvp' | 'later'

/** Two labels only, so the page never implies something is live that isn't (website-copy.md §3). */
const STATUS: Record<Status, { label: string; cls: string }> = {
  mvp: { label: 'MVP scope', cls: 'bg-brand-soft text-brand' },
  later: { label: 'Later', cls: 'bg-band text-muted border border-line' },
}

interface Feature {
  name: string
  detail: string
  status: Status
}

const GROUPS: { who: string; Icon: LucideIcon; intro: string; features: Feature[] }[] = [
  {
    who: 'Engineering managers',
    Icon: Users,
    intro: 'Run the handover without writing it yourself.',
    features: [
      {
        name: 'Knowledge areas with evidence',
        detail:
          'Areas where one person holds the knowledge, each with its records and risk factors. Confirm, edit or reject.',
        status: 'mvp',
      },
      {
        name: 'Interview progress and open questions',
        detail: 'See what has been answered, what is waiting and where answers conflict with the records.',
        status: 'mvp',
      },
      {
        name: 'Handover editing and approval',
        detail: 'Edit the draft, keep versions, approve it, and export it as Markdown.',
        status: 'mvp',
      },
    ],
  },
  {
    who: 'Leaving engineer',
    Icon: MessageSquareText,
    intro: 'Short, specific questions about your own work.',
    features: [
      {
        name: 'Evidence-based questions with follow-ups',
        detail: 'Each question shows the records that prompted it. Too-general answers get one follow-up.',
        status: 'mvp',
      },
      {
        name: 'Approve before sharing',
        detail: 'Preview exactly what will be shared, correct it, then approve.',
        status: 'mvp',
      },
    ],
  },
  {
    who: 'Successor',
    Icon: ListChecks,
    intro: 'Start with the riskiest knowledge first.',
    features: [
      {
        name: 'Checklist ordered by risk',
        detail: 'Built from the approved handover, so it reflects what was confirmed.',
        status: 'mvp',
      },
      {
        name: 'Assistant with sources',
        detail:
          'Answers only from approved content and shows where each answer came from. When it can’t find an answer, it says so.',
        status: 'mvp',
      },
      {
        name: 'Ask the leaving engineer',
        detail: 'Send a question back to the interview while the engineer is still on the team.',
        status: 'mvp',
      },
    ],
  },
  {
    who: 'HR',
    Icon: UserRound,
    intro: 'Follow progress without reading code.',
    features: [
      {
        name: 'Status and progress',
        detail: 'Transition status and completion, without access to code, answers or handover text.',
        status: 'mvp',
      },
    ],
  },
  {
    who: 'Workspace admins',
    Icon: Settings2,
    intro: 'Control who sees what, and for how long.',
    features: [
      {
        name: 'Members, roles and GitHub access',
        detail: 'Invite people with a role, choose repositories, disconnect at any time.',
        status: 'mvp',
      },
      { name: 'Audit log', detail: 'A record of approvals and role changes.', status: 'mvp' },
      {
        name: 'Retention settings and deletion',
        detail:
          'Set how long data is kept after a handover, and request deletion. Planned for the MVP; may move later.',
        status: 'mvp',
      },
    ],
  },
  {
    who: 'Integrations',
    Icon: Plug,
    intro: 'Where Exit Brain reads from.',
    features: [
      { name: 'GitHub', detail: 'Read-only GitHub App, on the repositories you select.', status: 'mvp' },
      { name: 'Slack, Jira, Google Drive', detail: 'Not part of the MVP.', status: 'later' },
    ],
  },
  {
    who: 'Enterprise',
    Icon: Building2,
    intro: 'For larger rollouts.',
    features: [{ name: 'SSO/SAML and SCIM', detail: 'Not part of the MVP.', status: 'later' }],
  },
]

export const FEATURE_GROUPS = GROUPS

export function FeaturesPage() {
  return (
    <>
      <PageHeader
        kicker="Features"
        title="Built for the people who carry a handover"
        lead="Each role gets the part of the handover it needs. Exit Brain is in early development: “MVP scope” means it is being built for the pilot; “Later” means it is planned but not part of the MVP."
      >
        <SiteLink href="/how-it-works" className={secondaryButton}>
          How it works
        </SiteLink>
      </PageHeader>

      <div className={`${container} py-16 md:py-24`}>
        <div className="flex flex-col">
          {GROUPS.map(({ who, Icon, intro, features }) => (
            <section
              key={who}
              aria-labelledby={`f-${who}`}
              className="grid gap-6 border-b border-line py-10 first:pt-0 last:border-b-0 lg:grid-cols-[1fr_2fr] lg:gap-16"
            >
              <div className="flex gap-3">
                <Icon aria-hidden size={22} strokeWidth={1.75} className="mt-1 shrink-0 text-brand" />
                <div>
                  <h2
                    id={`f-${who}`}
                    className="text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]"
                  >
                    {who}
                  </h2>
                  <p className="mt-2 text-muted">{intro}</p>
                </div>
              </div>
              <ul className="flex flex-col divide-y divide-line">
                {features.map((f) => (
                  <li
                    key={f.name}
                    className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                  >
                    <div className="max-w-[36rem]">
                      <h3 className="font-semibold">{f.name}</h3>
                      <p className="mt-1 text-[0.94rem] leading-relaxed text-muted">{f.detail}</p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 self-start rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS[f.status].cls}`}
                    >
                      {STATUS[f.status].label}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <section className="border-t border-line bg-band">
        <div
          className={`${container} flex flex-col items-start gap-8 py-16 md:flex-row md:items-center md:justify-between`}
        >
          <h2 className="max-w-xl text-[1.75rem] leading-tight font-semibold tracking-[-0.02em] text-balance">
            Want to shape what comes after the MVP? Join the pilot.
          </h2>
          <div className="flex flex-wrap gap-3">
            <SiteLink href="/signup" className={primaryButton}>
              Start a pilot
            </SiteLink>
            <SiteLink href="/demo" className={secondaryButton}>
              Explore the demo
            </SiteLink>
          </div>
        </div>
      </section>
    </>
  )
}
