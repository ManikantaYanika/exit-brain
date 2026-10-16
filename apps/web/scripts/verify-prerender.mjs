// CI guard: fails the build if prerendered pages lose their static content or metadata.
// Run after `npm run build`. Usage: node scripts/verify-prerender.mjs [build/client]
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2] ?? 'build/client'
const errors = []
const read = (f) =>
  existsSync(join(dir, f)) ? readFileSync(join(dir, f), 'utf8') : (errors.push(`missing ${f}`), '')
const need = (file, html, re, what) => re.test(html) || errors.push(`${file}: ${what}`)

const home = read('index.html')
need('index.html', home, /<h1[^>]*>[^<]{10,}/, 'no H1 text in static HTML')
need('index.html', home, /<title>[^<]{5,}<\/title>/, 'no <title>')
need('index.html', home, /<meta name="description" content="[^"]{20,}"/, 'no description')
need('index.html', home, /<link rel="canonical" href="https?:\/\/[^"]+\/"/, 'no canonical')
need('index.html', home, /<meta property="og:title" content="[^"]+"/, 'no og:title')
if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(home))
  errors.push('index.html: still loads Google Fonts')

for (const [file, h1] of [
  ['how-it-works/index.html', 'How a handover works'],
  ['features/index.html', 'Built for the people who carry a handover'],
]) {
  const html = read(file)
  need(file, html, new RegExp(`<h1[^>]*>${h1}`), `H1 "${h1}" missing from static HTML`)
  need(file, html, /<link rel="canonical" href="https?:\/\/[^"]+"/, 'no canonical')
  need(file, html, /<meta property="og:title" content="[^"]+"/, 'no og:title')
}
for (const path of ['/how-it-works', '/features']) {
  if (!read('sitemap.xml').includes(`${path}</loc>`)) errors.push(`sitemap.xml: ${path} missing`)
}

const notFound = read('404/index.html')
need('404/index.html', notFound, /Page not found/, 'no "Page not found" text')
need('404/index.html', notFound, /<meta name="robots" content="noindex"/, 'not noindex')

const sitemap = read('sitemap.xml')
need('sitemap.xml', sitemap, /<urlset[^>]*sitemaps\.org/, 'not a sitemap')
need('sitemap.xml', sitemap, /<loc>https?:\/\/[^<]+\/<\/loc>/, 'home URL missing')
if (/\/app\b|\/signin|\/404/.test(sitemap)) errors.push('sitemap.xml: lists non-public pages')

const fallback = read('__spa-fallback.html')
need('__spa-fallback.html', fallback, /<title>Exit Brain<\/title>/, 'no default title')

if (errors.length) {
  console.error(`prerender check FAILED (${errors.length}):\n- ${errors.join('\n- ')}`)
  process.exit(1)
}
console.log(
  'prerender check passed: index.html, how-it-works, features, 404/index.html, sitemap.xml, __spa-fallback.html',
)
