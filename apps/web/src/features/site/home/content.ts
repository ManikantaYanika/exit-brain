/* Home page copy (approved P1 landing copy, with the honesty fixes from website-copy.md). */
import {
  BadgeCheck,
  Building2,
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

export const STEPS = [
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

export const ROLES = [
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

export const TRUST = [
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
    title: 'Retention you set',
    body: 'By design, data is deleted 90 days after a transition completes, or sooner on request.',
  },
  {
    Icon: UserRound,
    title: 'No performance scoring',
    body: 'Exit Brain measures how concentrated knowledge is in code areas. It never rates people.',
  },
]

export const FAQ = [
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
