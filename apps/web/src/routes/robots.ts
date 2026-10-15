import { SITE_URL } from './meta'

// Prerendered to build/client/robots.txt. Product routes are noindex and listed here as disallowed.
export function loader() {
  const body = `User-agent: *\nAllow: /\nDisallow: /app\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
