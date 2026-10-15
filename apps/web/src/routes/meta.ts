// SPIKE (W1): per-page metadata. SITE_URL is a placeholder until the domain is bought.
export const SITE_URL = 'https://exitbrain.example'

export function pageMeta({ path, title, description }: { path: string; title: string; description: string }) {
  const url = `${SITE_URL}${path}`
  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Exit Brain' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { name: 'twitter:card', content: 'summary_large_image' },
  ]
}
