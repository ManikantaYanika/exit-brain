/**
 * The site guide's only knowledge: sections of this website's own pages, built from the same typed
 * content the pages render. The guide therefore can't say anything the site doesn't (D4).
 * Hidden pages (the unpublished founder page) are not indexed.
 */
import { FAQ, PRICING, ROLES, STEPS as HOME_STEPS, TRUST } from '../home/content'
import { FOUNDER, MISSION, PRINCIPLES, SERVICES, WONT_BUILD } from '../content/company'
import { HELP_SECTIONS } from '../content/help'
import { RESPONSIBLE_USE, SECURITY_TOPICS, STATUS } from '../content/security'
import { COMPARE_ROWS, PROTECTS } from '../content/why'
import { FEATURE_GROUPS } from '../content/features'
import { HOW_STEPS } from '../pages/howSteps'
import type { Doc } from './search'

export function buildSiteIndex(): Doc[] {
  const docs: Doc[] = []
  const add = (page: string, url: string, title: string, text: string) =>
    docs.push({ id: `${url}::${title}`, page, url, title, text })

  // Home
  for (const s of HOME_STEPS) add('Home', '/#how', s.title, s.body)
  for (const r of ROLES) add('Home', '/#roles', `For the ${r.who.toLowerCase()}`, r.gets)
  for (const t of TRUST) add('Home', '/#trust', t.title, t.body)
  add(
    'Home',
    '/#pricing',
    PRICING.title,
    [PRICING.price, PRICING.body, ...PRICING.includes, PRICING.note].join(' '),
  )
  for (const f of FAQ) add('Home', '/#faq', f.q, f.a)

  // How it works
  for (const s of HOW_STEPS) add('How it works', '/how-it-works', s.title, `${s.who}. ${s.body} ${s.never}`)

  // Features
  for (const g of FEATURE_GROUPS)
    add(
      'Features',
      '/features',
      `Features for ${g.who.toLowerCase()}`,
      g.features
        .map((f) => `${f.name}: ${f.detail} (${f.status === 'mvp' ? 'MVP scope' : 'Later'})`)
        .join(' '),
    )

  // Security
  for (const t of SECURITY_TOPICS) add('Security', `/security#${t.id}`, t.title, t.body.join(' '))
  add('Security', '/security#responsible-use', 'Responsible use', RESPONSIBLE_USE.join(' '))
  add(
    'Security',
    '/security#status',
    'Security status: what is done and what is not started (SOC 2, SSO, penetration test)',
    STATUS.map((s) => `${s.item}: ${s.status}.`).join(' '),
  )
  add(
    'Security',
    '/security#report',
    'Report a vulnerability',
    'Email the security contact with details of the vulnerability or security bug and how to reproduce it.',
  )

  // Why Exit Brain
  for (const p of PROTECTS) add('Why Exit Brain', '/why-exit-brain#protects', `Why: ${p.title}`, p.body)
  add(
    'Why Exit Brain',
    '/why-exit-brain#compare',
    'How Exit Brain compares with exit interviews, wikis and enterprise search',
    COMPARE_ROWS.map((r) => r.row).join('. '),
  )
  add(
    'Why Exit Brain',
    '/why-exit-brain#worksheet',
    'Work out the cost of a departure',
    'A worksheet for your own numbers: salary, months for a successor to ramp up, manager hours. Your inputs stay in your browser.',
  )

  // Company
  add(
    'About',
    '/about',
    'About Exit Brain: mission',
    `${MISSION} Exit Brain is in early development and founder-led.`,
  )
  for (const p of PRINCIPLES) add('About', '/about#principles', p.title, p.body)
  add('About', '/about#wont-build', 'What we won’t build', WONT_BUILD.join('. '))
  for (const s of SERVICES)
    add('Services', `/services#${s.id}`, s.title, `${s.body} Proposed, founder-led service.`)
  if (FOUNDER.published)
    add(
      'Founder',
      '/about/founder',
      `${FOUNDER.name}, founder of Exit Brain`,
      [FOUNDER.title, FOUNDER.bio, FOUNDER.why].filter(Boolean).join(' '),
    )

  // Help, contact, legal
  for (const s of HELP_SECTIONS) for (const i of s.items) add('Help', `/help#${i.id}`, i.q, i.a)
  add(
    'Contact',
    '/contact',
    'Contact us',
    'Ask about a pilot, a security question, a partnership or anything else by email. The contact form is not active yet.',
  )
  add(
    'Privacy',
    '/privacy',
    'Privacy notice (draft)',
    'What this website and the product collect, why, how long it is kept and how to ask for deletion. No analytics or advertising cookies.',
  )
  add('Terms', '/terms', 'Terms of use (draft)', 'Terms for using the website, the demo and pilots.')
  return docs
}
