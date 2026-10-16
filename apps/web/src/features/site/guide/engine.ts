import { createIndex } from './search'
import { buildSiteIndex } from './siteIndex'

/** Loaded on first open of the guide, so pages don't pay for it up front. */
export const searchSite = createIndex(buildSiteIndex())
