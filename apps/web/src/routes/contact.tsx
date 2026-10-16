import { ContactPage } from '../features/site/contact/ContactPage'
import { pageMeta } from './meta'

export const meta = () =>
  pageMeta({
    path: '/contact',
    title: 'Contact — Exit Brain',
    description: 'Ask about a pilot, a security question, a partnership or anything else.',
  })

export default function Route() {
  return <ContactPage />
}
