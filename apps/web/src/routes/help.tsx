import { HELP_ITEMS } from '../features/site/content/help'
import { HelpPage } from '../features/site/pages/HelpPage'
import { pageMeta } from './meta'

export const meta = () => [
  ...pageMeta({
    path: '/help',
    title: 'Help centre — Exit Brain',
    description:
      'Answers about GitHub access, data and privacy, AI use, roles, pricing and the demo, with links to the pages that explain more.',
  }),
  {
    'script:ld+json': {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: HELP_ITEMS.map((i) => ({
        '@type': 'Question',
        name: i.q,
        acceptedAnswer: { '@type': 'Answer', text: i.a },
      })),
    },
  },
]

export default function Route() {
  return <HelpPage />
}
