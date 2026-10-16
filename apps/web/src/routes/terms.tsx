import { TermsPage } from '../features/site/pages/LegalPages'
import { pageMeta } from './meta'

export const meta = () =>
  pageMeta({
    path: '/terms',
    title: 'Terms of use (draft) — Exit Brain',
    description: 'Draft terms for the Exit Brain website, demo and pilots, pending legal review.',
  })

export default function Route() {
  return <TermsPage />
}
