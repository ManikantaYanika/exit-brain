/**
 * Page metadata for route modules.
 * SITE_URL is a PLACEHOLDER until the domain is bought (ux-plan §11); canonical and OG URLs use it.
 */
export const SITE_URL = 'https://exitbrain.example'
export const SITE_NAME = 'Exit Brain'

/** Public, indexable page: title, description, canonical, Open Graph, Twitter. */
export function pageMeta({ path, title, description }: { path: string; title: string; description: string }) {
  const url = `${SITE_URL}${path}`
  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { name: 'twitter:card', content: 'summary_large_image' },
  ]
}

/** Signed-in or utility page: a clear tab title, and kept out of search results. */
export function appMeta(title: string) {
  return [{ title: `${title} — ${SITE_NAME}` }, { name: 'robots', content: 'noindex' }]
}
