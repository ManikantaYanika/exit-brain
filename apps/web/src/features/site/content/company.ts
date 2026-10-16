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
// Text, photo and link supplied and approved by the founder, 16 Oct 2026. Photo: cropped and compressed only.
export const FOUNDER = {
  published: true,
  name: 'Manikanta Yanika',
  title: 'Founder & Builder, Exit Brain' as string | null,
  bio: 'I’m Manikanta Yanika, a software developer and product builder with a background in computer science and hands-on experience building web applications, backend systems, and AI-powered solutions. I focus on turning real-world business problems into practical, secure, and scalable software products.' as
    string | null,
  why: 'When employees leave an organization, critical knowledge, technical decisions, and undocumented workflows often leave with them. I’m building Exit Brain to capture, structure, and preserve that knowledge, helping teams make smoother transitions through evidence-backed AI, reliable handovers, and contextual answers grounded in documented knowledge.' as
    string | null,
  tagline: 'Preserving organizational knowledge beyond employee departures.',
  email: 'yanikamanikanta@gmail.com',
  photo: '/images/founder-manikanta-yanika.webp' as string | null,
  links: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/manikanta-yanika/' }] as {
    label: 'LinkedIn' | 'GitHub'
    href: string
  }[],
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
