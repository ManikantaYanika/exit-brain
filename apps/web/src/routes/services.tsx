import { ServicesPage } from '../features/site/pages/CompanyPages'
import { pageMeta } from './meta'

export const meta = () =>
  pageMeta({
    path: '/services',
    title: 'Services — Exit Brain',
    description:
      'Proposed, founder-led services: pilot onboarding and setup, knowledge-handover facilitation, and a knowledge concentration review.',
  })

export default function Route() {
  return <ServicesPage />
}
