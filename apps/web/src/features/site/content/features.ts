/* Features by role (website-copy.md §3). Shared by the Features page, home cards and the site guide. */
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

export type Status = 'mvp' | 'later'

/** Two labels only, so the page never implies something is live that isn't (website-copy.md §3). */
export const STATUS: Record<Status, { label: string; cls: string }> = {
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
