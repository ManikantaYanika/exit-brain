import { WhyPage } from '../features/site/pages/WhyPage'
import { pageMeta } from './meta'

export const meta = () =>
  pageMeta({
    path: '/why-exit-brain',
    title: 'Why Exit Brain',
    description:
      'Why a departure needs more than an exit interview and a document, how Exit Brain compares with other approaches, and a worksheet for your own numbers.',
  })

export default function Route() {
  return <WhyPage />
}
