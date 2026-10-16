import { PrivacyPage } from '../features/site/pages/LegalPages'
import { pageMeta } from './meta'

export const meta = () =>
  pageMeta({
    path: '/privacy',
    title: 'Privacy notice (draft) — Exit Brain',
    description:
      'What the Exit Brain website and product collect, why, and how to ask for deletion. Draft, pending legal review.',
  })

export default function Route() {
  return <PrivacyPage />
}
