import { FOUNDER } from '../features/site/content/company'
import { FounderPage } from '../features/site/pages/CompanyPages'
import { appMeta, pageMeta } from './meta'

// Unpublished: a preview for the owner only — noindex, no canonical, not in nav or sitemap.
export const meta = () =>
  FOUNDER.published
    ? pageMeta({
        path: '/about/founder',
        title: `${FOUNDER.name}, founder — Exit Brain`,
        description: `${FOUNDER.name}, founder of Exit Brain.`,
      })
    : appMeta(`${FOUNDER.name} (preview)`)

export default function Route() {
  return <FounderPage />
}
