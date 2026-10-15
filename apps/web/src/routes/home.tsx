import { LandingPage } from '../features/marketing/LandingPage'
import { pageMeta } from './meta'

export const meta = () =>
  pageMeta({
    path: '/',
    title: 'Exit Brain — knowledge transfer for engineering teams',
    description:
      'Exit Brain reads the work a leaving engineer did on GitHub, asks the questions only they can answer, and gives their successor a cited, human-approved handover.',
  })

export default function Route() {
  return <LandingPage />
}
