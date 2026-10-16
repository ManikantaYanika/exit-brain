import { describe, expect, it } from 'vitest'
import { searchSite } from './engine'
import { buildSiteIndex } from './siteIndex'
import { FOUNDER } from '../content/company'
import { tokenize } from './search'

/** W8 acceptance: the right page in the top 3 for at least 13 of 15 sample questions.
 * Each question lists the pages that genuinely answer it. */
const SAMPLES: [question: string, answeredOn: string[]][] = [
  ['How does verification work?', ['/how-it-works']],
  ['What data do you read?', ['/security#data', '/help#source-code']],
  ['How much does it cost?', ['/#pricing']],
  ['Is it used to evaluate employees?', ['/security', '/help#evaluate', '/about#wont-build']],
  ['Do you store our source code?', ['/security#data', '/help#source-code', '/#faq', '/#trust']],
  ['Can we delete our data?', ['/help#delete', '/security#retention', '/#faq']],
  ['Which tools do you integrate with? Jira? Slack?', ['/features']],
  ['Do you have SOC 2?', ['/security']],
  ['Is there a demo I can try?', ['/help#demo']],
  ['How do I report a security bug?', ['/security']],
  ['What does HR see?', ['/help#hr-sees', '/#roles', '/features']],
  ['What services do you offer?', ['/services']],
  ['Does the AI make decisions?', ['/help#ai-decides', '/security#ai', '/#faq']],
  ['How long do you keep data?', ['/security#retention', '/help#delete', '/privacy', '/#trust']],
  ['How is our data kept separate from other customers?', ['/security']],
]

describe('site guide search', () => {
  it('puts the right page in the top 3 for at least 13 of 15 sample questions', () => {
    const misses: string[] = []
    for (const [q, pages] of SAMPLES) {
      const urls = searchSite(q, 3).map((r) => r.doc.url)
      // A page entry ('/security') accepts any of its sections ('/security#ai').
      if (!urls.some((u) => pages.some((p) => u === p || u.startsWith(`${p}#`))))
        misses.push(`${q} → ${urls.join(', ') || '(none)'}`)
    }
    expect(SAMPLES.length - misses.length, misses.join('\n')).toBeGreaterThanOrEqual(13)
  })

  it('returns nothing for questions the site does not answer', () => {
    expect(searchSite('weather in paris tomorrow')).toEqual([])
    expect(searchSite('   ')).toEqual([])
  })

  it('returns at most three answers', () => {
    expect(searchSite('github data security people').length).toBeLessThanOrEqual(3)
  })

  it('indexes the founder page only when it is published, and has no empty entries', () => {
    const urls = buildSiteIndex().map((d) => d.url)
    expect(urls.includes('/about/founder')).toBe(FOUNDER.published)
    for (const d of buildSiteIndex()) expect(d.text.trim(), d.id).not.toBe('')
  })

  it('answers who is behind Exit Brain from the founder page', () => {
    expect(searchSite('Who is the founder of Exit Brain?').map((r) => r.doc.url)).toContain('/about/founder')
  })

  it('normalises words so variants match', () => {
    expect(tokenize('Approves approving')).toEqual(tokenize('approve approve'))
    expect(tokenize('the price')).toEqual(['cost'])
  })
})
