import { HowItWorksPage } from '../features/site/pages/HowItWorksPage'
import { pageMeta } from './meta'

export const meta = () =>
  pageMeta({
    path: '/how-it-works',
    title: 'How it works — Exit Brain',
    description:
      'Five steps from resignation to a cited, human-approved handover: read-only GitHub access, knowledge areas with evidence, an evidence-based interview, verification and approval.',
  })

export default function Route() {
  return <HowItWorksPage />
}
