import { FeaturesPage } from '../features/site/pages/FeaturesPage'
import { pageMeta } from './meta'

export const meta = () =>
  pageMeta({
    path: '/features',
    title: 'Features — Exit Brain',
    description:
      'What Exit Brain gives managers, leaving engineers, successors, HR and admins, with what is in the MVP and what comes later.',
  })

export default function Route() {
  return <FeaturesPage />
}
