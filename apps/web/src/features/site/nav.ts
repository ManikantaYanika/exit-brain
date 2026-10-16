/**
 * Website navigation. Entries point to real pages once they ship (W4: How it works, Features);
 * the rest still point to sections of the home page until W5–W7 add their pages. Nothing links to
 * a page that doesn't exist. Hidden pages (e.g. the founder page) are never listed here.
 */
export interface NavItem {
  label: string
  href: string
}

export const HEADER_NAV: NavItem[] = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Features', href: '/features' },
  { label: 'Security', href: '/#trust' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
]

export const FOOTER_NAV: { title: string; items: NavItem[] }[] = [
  {
    title: 'Product',
    items: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Features', href: '/features' },
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
