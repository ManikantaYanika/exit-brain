/*
 * Security page copy (website-copy.md §4). Every statement traces to docs/07-security/security-and-privacy.md
 * or a cited source; `src` records where (kept in code, not shown on the page).
 * This page describes the MVP design. What isn't built yet is said in STATUS.
 */
export const CONTACT_EMAIL = 'yanikamanikanta@gmail.com' // owner-confirmed public contact, 16 Oct 2026

export const GITHUB_TOKEN_DOC =
  'https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app'

export interface SecurityTopic {
  id: string
  title: string
  body: string[]
  src: string
}

export const SECURITY_TOPICS: SecurityTopic[] = [
  {
    id: 'access',
    title: 'Access to GitHub',
    body: [
      'Exit Brain connects through a GitHub App with read-only permissions to the repositories you select: metadata, contents, pull requests and issues.',
      'GitHub issues the app short-lived installation tokens that expire after one hour. Exit Brain requests them per job and does not store them.',
      'It requests no write permission, so it can’t push code, comment or change settings. Only the repositories you select are read.',
    ],
    src: 'security §5.5; PRD NFR-02; GitHub Docs (installation access tokens)',
  },
  {
    id: 'data',
    title: 'What data we read and store',
    body: [
      'Excerpts only: commit messages, pull request and issue titles, shortened descriptions, file paths, timestamps and links.',
      'Exit Brain does not store the contents of your files.',
    ],
    src: 'security §5.8 Data minimisation; NFR-04',
  },
  {
    id: 'isolation',
    title: 'Isolation between customers',
    body: [
      'Every customer table carries an organisation ID and is protected by row-level security in Postgres.',
      'Automated tests check that a user in one organisation can’t read another organisation’s data. They run on every change, and a change can’t be merged while they fail.',
    ],
    src: 'security §5.1; NFR-01; CI database job (pgTAP) + branch ruleset',
  },
  {
    id: 'ai',
    title: 'How AI is used',
    body: [
      'AI suggests; people approve. Knowledge areas, answers and the handover each need a person’s approval.',
      'Every AI statement shows its sources and a verification status. Citations are checked against the records of that handover, and unknown ones are dropped.',
      'Records are treated as data, never as instructions to the AI. The AI has no write access to any of your systems.',
      'Only excerpts and answers are sent to the AI provider, never secrets. The provider hasn’t been chosen yet; this page will name it, with its data-use terms, once it is.',
    ],
    src: 'security §5.6; NFR-05',
  },
  {
    id: 'secrets',
    title: 'Keys and secrets',
    body: [
      'Private keys and service credentials live only in server-side secret storage, never in the browser or in source control.',
      'Every change is scanned for leaked secrets, and the built website is checked for server keys before release.',
    ],
    src: 'security §5.4; CI secret-scan job (gitleaks) + bundle scan',
  },
  {
    id: 'retention',
    title: 'Retention and deletion',
    body: [
      'By design, evidence, answers and AI records are deleted 90 days after a handover is completed. A workspace can choose 30 to 365 days.',
      'Owners can disconnect GitHub and request deletion of everything ingested from it.',
    ],
    src: 'security §5.8 Retention, Deletion on disconnect',
  },
]

export const RESPONSIBLE_USE = [
  'Exit Brain looks at how concentrated knowledge is in systems, not at how well people work.',
  'It does not score, rank or compare people, and produces no productivity metrics.',
  'It must not be used for performance reviews or employment decisions.',
  'The leaving engineer sees why each question is asked and approves what is shared.',
]

export type StatusTone = 'done' | 'mvp' | 'neutral'

/** Honest status. "Done" only where it exists and is tested today (CHANGELOG Day 1, CI). */
export const STATUS: { item: string; status: string; tone: StatusTone }[] = [
  { item: 'Row-level security with cross-customer tests', status: 'Done, tested in CI', tone: 'done' },
  { item: 'Secret scanning on every change', status: 'Done, runs in CI', tone: 'done' },
  {
    item: 'Audit log of approvals and role changes',
    status: 'Done for members and roles; the rest in MVP scope',
    tone: 'done',
  },
  { item: 'Read-only GitHub App', status: 'MVP scope', tone: 'mvp' },
  { item: 'Retention job', status: 'MVP scope', tone: 'mvp' },
  { item: 'SSO/SAML, SCIM', status: 'Not started', tone: 'neutral' },
  { item: 'SOC 2, ISO 27001', status: 'Not started', tone: 'neutral' },
  { item: 'External penetration test', status: 'Not started', tone: 'neutral' },
  { item: 'Data Processing Agreement', status: 'Not started', tone: 'neutral' },
  { item: 'Choice of data residency', status: 'Not started', tone: 'neutral' },
]
