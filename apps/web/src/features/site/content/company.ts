/* About, Founder and Services copy (website-copy.md §6–§8). */

export const MISSION = 'No team should lose what it has learned when someone moves on.'

export const PRINCIPLES = [
  {
    title: 'Evidence before questions',
    body: 'We start from the records of the work, so nobody has to remember what they forgot.',
  },
  {
    title: 'Consent before sharing',
    body: 'The leaving engineer approves their answers before anyone else sees them.',
  },
  {
    title: 'People approve, AI suggests',
    body: 'Every area, answer and handover is approved by a named person.',
  },
  {
    title: 'Read-only by default',
    body: 'Exit Brain reads the repositories you choose and never writes to them.',
  },
  {
    title: 'Honest about what isn’t built',
    body: 'We label features "MVP scope" or "Later", and say plainly what isn’t done.',
  },
]

export const WONT_BUILD = [
  'Employee surveillance or activity monitoring',
  'Performance scoring, ranking or productivity metrics',
  'Tools that make or recommend employment decisions',
]

/**
 * Founder page (hidden until the owner approves text and photo).
 * `null` fields render as clearly marked placeholders. Links render only when the owner provides exact URLs.
 * `photo`: path under /public, used as supplied (crop/compress only). `published` controls nav, sitemap and indexing.
 */
export const FOUNDER = {
  published: false,
  name: 'Manikanta Yanika',
  title: null as string | null,
  bio: null as string | null,
  why: null as string | null,
  email: 'yanikamanikanta@gmail.com',
  photo: null as string | null,
  links: [] as { label: 'LinkedIn' | 'GitHub'; href: string }[],
}

export const SERVICES = [
  {
    id: 'pilot-onboarding',
    title: 'Pilot onboarding and setup',
    body: 'Help installing the GitHub App, choosing which repositories Exit Brain may read, and running your first transition together.',
  },
  {
    id: 'handover-facilitation',
    title: 'Employee knowledge-handover facilitation',
    body: 'Support for a manager running a critical handover: planning the interview with the leaving engineer and reviewing the handover draft.',
  },
  {
    id: 'concentration-review',
    title: 'Knowledge concentration review',
    body: 'A review of repositories you select, based on authorised source records, showing where knowledge sits with one person. It describes systems, and is not an assessment of individuals.',
  },
]

export const SERVICE_LABEL = 'Proposed · founder-led · by arrangement'
