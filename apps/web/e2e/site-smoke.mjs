// Website smoke + accessibility check in a real browser (W9).
// For every public page at 375 and 1280 px: loads without page errors, has one H1, no horizontal scroll,
// and axe-core (WCAG 2.0/2.1/2.2 A + AA rules) finds no serious or critical violations.
// Also drives the site guide and the contact form once.
// Usage: E2E_BASE=http://127.0.0.1:5173 node e2e/site-smoke.mjs [screenshot-dir]
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { chromium } from 'playwright'

const BASE = process.env.E2E_BASE ?? 'http://127.0.0.1:5173'
const SHOTS = process.argv[2]
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')
const PAGES = [
  '/',
  '/how-it-works',
  '/features',
  '/security',
  '/why-exit-brain',
  '/services',
  '/about',
  '/about/founder',
  '/contact',
  '/help',
  '/privacy',
  '/terms',
  '/no-such-page',
]
const WIDTHS = [375, 1280]

let failures = 0
const fail = (msg) => {
  failures++
  console.log(`FAIL ${msg}`)
}

const browser = await chromium.launch()
for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
  for (const path of PAGES) {
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    const res = await page.goto(BASE + path, { waitUntil: 'networkidle' })
    const want = path === '/no-such-page' ? 404 : 200
    if (res?.status() !== want) fail(`${path} @${width}: HTTP ${res?.status()}, want ${want}`)
    const h1 = await page.locator('h1').count()
    if (h1 !== 1) fail(`${path} @${width}: ${h1} H1 elements`)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    if (overflow > 0) fail(`${path} @${width}: horizontal overflow ${overflow}px`)
    // A 404 status logs a console error for the document itself; that one is expected.
    const real = errors.filter((e) => !/404 \(Not Found\)/.test(e))
    if (real.length) fail(`${path} @${width}: ${real.join(' | ')}`)

    await page.addScriptTag({ content: axeSource })
    const result = await page.evaluate(() =>
      // eslint-disable-next-line no-undef
      axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }),
    )
    const bad = result.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    for (const v of bad)
      fail(`${path} @${width}: axe ${v.impact} ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ')}`)
    const minor = result.violations.length - bad.length
    console.log(
      `ok   ${path} @${width}: H1=${h1} overflow=${Math.max(overflow, 0)} axe serious/critical=${bad.length} minor=${minor}`,
    )
    if (SHOTS)
      await page.screenshot({
        path: `${SHOTS}/${path.replace(/\W+/g, '_') || 'home'}-${width}.png`,
        fullPage: true,
      })
    await page.close()
  }
  await ctx.close()
}

// Site guide: open, ask, get page links, Escape returns focus.
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(`${BASE}/security`, { waitUntil: 'networkidle' })
  const launcher = page.getByRole('button', { name: 'Ask about Exit Brain' })
  await launcher.click()
  const dialog = page.getByRole('dialog', { name: 'Site guide' })
  await dialog.getByRole('textbox', { name: 'Your question' }).fill('Do you store our source code?')
  await dialog.getByRole('button', { name: 'Ask' }).click()
  const n = await dialog.getByRole('link', { name: /Open page/ }).count()
  if (n < 1 || n > 3) fail(`site guide: ${n} answer links`)
  else console.log(`ok   site guide: ${n} answer links`)
  await page.keyboard.press('Escape')
  const focused = await page.evaluate(() => document.activeElement?.textContent?.trim())
  if (focused !== 'Ask about Exit Brain') fail(`site guide: focus returned to "${focused}"`)
  else console.log('ok   site guide: Escape returns focus to the launcher')
  if (SHOTS) {
    await launcher.click()
    await dialog.getByRole('button', { name: 'How much does it cost?' }).click()
    await page.screenshot({ path: `${SHOTS}/guide-1280.png` })
  }
  await page.close()
}

// Contact: invalid email is flagged; the form cannot be sent.
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' })
  await page.getByLabel('Work email').fill('nope')
  await page.getByLabel('Message').focus()
  const flagged = await page.getByText('Enter a valid email address.').isVisible()
  const disabled = await page.getByRole('button', { name: 'Send message' }).isDisabled()
  if (!flagged || !disabled) fail(`contact: flagged=${flagged} disabled=${disabled}`)
  else console.log('ok   contact: validation shown, Send disabled')
  await page.close()
}

await browser.close()
console.log(failures ? `\n${failures} failure(s)` : '\nall site checks passed')
process.exit(failures ? 1 : 0)
