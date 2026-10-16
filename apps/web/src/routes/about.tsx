import { AboutPage } from '../features/site/pages/CompanyPages'
import { pageMeta } from './meta'

export const meta = () =>
  pageMeta({
    path: '/about',
    title: 'About Exit Brain',
    description:
      'Our mission, the principles we build by, and what we won’t build: no surveillance, no performance scoring, no employment decisions.',
  })

export default function Route() {
  return <AboutPage />
}
