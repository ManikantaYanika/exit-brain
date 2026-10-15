import { NotFound } from '../app/pages'

export const meta = () => [{ title: 'Page not found — Exit Brain' }, { name: 'robots', content: 'noindex' }]

export default function Route() {
  return <NotFound />
}
