import { SecurityPage } from '../features/site/pages/SecurityPage'
import { pageMeta } from './meta'

export const meta = () =>
  pageMeta({
    path: '/security',
    title: 'Security and responsible use — Exit Brain',
    description:
      'Read-only GitHub access, excerpts not source code, row-level isolation tested on every change, AI that suggests while people approve, and an honest status table.',
  })

export default function Route() {
  return <SecurityPage />
}
