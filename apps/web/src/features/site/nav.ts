import { FOUNDER } from './content/company'

/**
 * Website navigation (website-plan.md §4). Nothing links to a page that doesn't exist.
 * Hidden pages (the founder page, until FOUNDER.published) are never listed here.
 */
export interface NavItem {
  label: string
  href: string
}

export const HEADER_NAV: NavItem[] = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Features', href: '/features' },
  { label: 'Security', href: '/security' },
  { label: 'Why Exit Brain', href: '/why-exit-brain' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
]

export const FOOTER_NAV: { title: string; items: NavItem[] }[] = [
  {
    title: 'Product',
    items: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Features', href: '/features' },
      { label: 'Security', href: '/security' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'Explore the demo', href: '/demo' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'About', href: '/about' },
      ...(FOUNDER.published ? [{ label: 'Founder', href: '/about/founder' }] : []),
      { label: 'Why Exit Brain', href: '/why-exit-brain' },
      { label: 'Services', href: '/services' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Help',
    items: [
      { label: 'Help centre', href: '/help' },
      { label: 'Sign in', href: '/signin' },
      { label: 'Start a pilot', href: '/signup' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy (draft)', href: '/privacy' },
      { label: 'Terms (draft)', href: '/terms' },
    ],
  },
]

/** Every prerendered, published website page. Used by the sitemap and checked by tests. */
export const PUBLIC_PAGES = [
  '/',
  '/how-it-works',
  '/features',
  '/security',
  '/why-exit-brain',
  '/services',
  '/about',
  '/contact',
  '/help',
  '/privacy',
  '/terms',
  ...(FOUNDER.published ? ['/about/founder'] : []),
]
