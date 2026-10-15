import { SITE_URL } from './meta'

// SPIKE (W1): resource route, prerendered to build/client/sitemap.xml at build time.
const PATHS = ['/', '/spike-about']

export function loader() {
  const urls = PATHS.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
