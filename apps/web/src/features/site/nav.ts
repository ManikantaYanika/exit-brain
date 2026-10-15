/**
 * Website navigation. Until W4–W7 add their pages, header links point to sections of the home page.
 * Each entry gets a route (e.g. '/how-it-works') when its page ships; nothing links to a page that
 * doesn't exist yet.
 */
export interface NavItem {
  label: string
  href: string
}

export const HEADER_NAV: NavItem[] = [
  { label: 'How it works', href: '/#how' },
  { label: 'For each role', href: '/#roles' },
  { label: 'Security', href: '/#trust' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
]

export const FOOTER_NAV: { title: string; items: NavItem[] }[] = [
  {
    title: 'Product',
    items: [
      { label: 'How it works', href: '/#how' },
      { label: 'Security', href: '/#trust' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'Explore the demo', href: '/demo' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Sign in', href: '/signin' },
      { label: 'Start a pilot', href: '/signup' },
    ],
  },
]
