import { SiteNotFoundPage } from '../features/site/pages/SiteNotFoundPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Page not found')

export default function Route() {
  return <SiteNotFoundPage />
}
