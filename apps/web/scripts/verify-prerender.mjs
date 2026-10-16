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

const PAGES = [
  ['how-it-works', 'How a handover works'],
  ['features', 'Built for the people who carry a handover'],
  ['security', 'Security and responsible use'],
  ['why-exit-brain', 'A departure is a predictable risk'],
  ['services', 'Services'],
  ['about', 'About Exit Brain'],
  ['contact', 'Contact'],
  ['help', 'Help centre'],
  ['privacy', 'Privacy notice'],
  ['terms', 'Terms of use'],
]
const sitemapXml = read('sitemap.xml')
for (const [path, h1] of PAGES) {
  const file = `${path}/index.html`
  const html = read(file)
  need(file, html, new RegExp(`<h1[^>]*>${h1}`), `H1 "${h1}" missing from static HTML`)
  need(file, html, /<meta name="description" content="[^"]{20,}"/, 'no description')
  need(file, html, new RegExp(`<link rel="canonical" href="https?://[^"]+/${path}"`), 'no canonical')
  need(file, html, /<meta property="og:title" content="[^"]+"/, 'no og:title')
  if (/<meta name="robots" content="noindex"/.test(html)) errors.push(`${file}: public page is noindex`)
  if (!sitemapXml.includes(`/${path}</loc>`)) errors.push(`sitemap.xml: /${path} missing`)
}
for (const file of ['privacy/index.html', 'terms/index.html'])
  need(file, read(file), /Draft, pending legal review/, 'not marked as a draft')
need('help/index.html', read('help/index.html'), /"@type":"FAQPage"/, 'no FAQPage JSON-LD')
need(
  'contact/index.html',
  read('contact/index.html'),
  /This form isn’t active yet/,
  'inactive notice missing',
)

// Hidden founder page: prerendered for owner preview, but noindex and never in the sitemap.
const founder = read('about/founder/index.html')
need(
  'about/founder/index.html',
  founder,
  /<meta name="robots" content="noindex"/,
  'founder preview not noindex',
)
need('about/founder/index.html', founder, /Preview, not published/, 'founder preview banner missing')
if (sitemapXml.includes('/about/founder')) errors.push('sitemap.xml: lists the unpublished founder page')

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
  `prerender check passed: index.html, ${PAGES.map(([p]) => p).join(', ')}, about/founder (noindex), 404/index.html, sitemap.xml, __spa-fallback.html`,
)
