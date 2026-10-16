/*
 * Help centre (website-copy.md §10). Answers restate what other pages already say; nothing new is claimed here.
 */
export interface HelpItem {
  id: string
  q: string
  a: string
  link?: { label: string; href: string }
}

export const HELP_SECTIONS: { id: string; title: string; items: HelpItem[] }[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    items: [
      {
        id: 'demo',
        q: 'Is there a demo?',
        a: 'Yes. The demo uses a fictional company and needs no account. Every screen in it is labelled MOCK DATA.',
        link: { label: 'Explore the demo', href: '/demo' },
      },
      {
        id: 'pilot',
        q: 'How do we start a pilot?',
        a: 'Exit Brain is in early development and pilots are by invitation. Contact us to talk about a pilot, or create an account to look around.',
        link: { label: 'Contact us', href: '/contact' },
      },
      {
        id: 'cost',
        q: 'How much does it cost?',
        a: 'Pilot pricing is $149 per departure. You pay when someone leaves, not for seats. Billing isn’t live yet, and nothing is charged without a signed agreement.',
        link: { label: 'See pricing', href: '/#pricing' },
      },
    ],
  },
  {
    id: 'accounts',
    title: 'Sign-in and accounts',
    items: [
      {
        id: 'sign-in',
        q: 'How do I sign in?',
        a: 'Use Sign in at the top of any page with the email and password for your account. New accounts confirm their email address first.',
        link: { label: 'Sign in', href: '/signin' },
      },
      {
        id: 'roles',
        q: 'Who sees what?',
        a: 'Each person sees only what their role needs. Managers review and approve, the leaving engineer answers questions about their own work, the successor gets the approved handover, and HR sees status and progress without code, answers or handover text.',
        link: { label: 'Features by role', href: '/features' },
      },
    ],
  },
  {
    id: 'github',
    title: 'GitHub access',
    items: [
      {
        id: 'source-code',
        q: 'Do you read or store our source code?',
        a: 'Exit Brain stores commit messages, pull request and issue titles with shortened descriptions, and file paths. It does not store file contents, and its GitHub access is read-only.',
        link: { label: 'Security', href: '/security#data' },
      },
      {
        id: 'tools',
        q: 'Which tools are supported?',
        a: 'GitHub, in the MVP. Slack, Jira and Google Drive are planned for later; they are not part of the product today.',
        link: { label: 'Features', href: '/features' },
      },
    ],
  },
  {
    id: 'data',
    title: 'Data and privacy',
    items: [
      {
        id: 'delete',
        q: 'Can we delete our data?',
        a: 'Yes. Owners can disconnect GitHub and request deletion of everything ingested. By design, data from a completed transition is deleted after the retention period, 90 days unless you choose 30 to 365.',
        link: { label: 'Retention', href: '/security#retention' },
      },
      {
        id: 'ai-decides',
        q: 'Does the AI decide anything?',
        a: 'No. It suggests knowledge areas, questions and a draft handover. A manager confirms the areas, the leaving engineer approves their answers, and the manager approves the handover. Anything without a source record is marked unverified.',
        link: { label: 'How AI is used', href: '/security#ai' },
      },
      {
        id: 'evaluate',
        q: 'Is Exit Brain used to evaluate employees?',
        a: 'No. It looks at how concentrated knowledge is in systems, not at how well people work. It does not score or rank people and must not be used for performance reviews or employment decisions.',
        link: { label: 'Responsible use', href: '/security#responsible-use' },
      },
    ],
  },
  {
    id: 'managers',
    title: 'For managers',
    items: [
      {
        id: 'manager-role',
        q: 'What do I do as the manager?',
        a: 'Confirm, edit or reject the suggested knowledge areas, follow the interview and resolve open questions, then edit and approve the handover.',
        link: { label: 'How it works', href: '/how-it-works' },
      },
    ],
  },
  {
    id: 'leaving',
    title: 'For leaving engineers',
    items: [
      {
        id: 'leaving-sees',
        q: 'What does the leaving engineer see?',
        a: 'Their own interview: each question shows the commits or pull requests that prompted it. They can edit, skip with a reason, and preview exactly what will be shared before approving.',
      },
    ],
  },
  {
    id: 'successors',
    title: 'For successors',
    items: [
      {
        id: 'assistant',
        q: 'What if the assistant doesn’t know the answer?',
        a: 'It answers only from the approved handover, with sources. When the answer isn’t there, it says so and offers to ask the leaving engineer.',
      },
    ],
  },
  {
    id: 'hr',
    title: 'For HR',
    items: [
      {
        id: 'hr-sees',
        q: 'What does HR see?',
        a: 'Status and progress for every transition, without access to code, answers or handover text.',
      },
    ],
  },
]

export const HELP_ITEMS = HELP_SECTIONS.flatMap((s) => s.items)
