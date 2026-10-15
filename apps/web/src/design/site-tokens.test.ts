import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/design/site-tokens.css'), 'utf8')
const tokens: Record<string, string> = {}
for (const m of css.matchAll(/--eb-([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)) tokens[m[1]!] = m[2]!.toLowerCase()

function luminance(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)) as [
    number,
    number,
    number,
  ]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

// [foreground, background, minimum]. Text 4.5:1 (WCAG 1.4.3), control borders 3:1 (1.4.11).
const PAIRS: [string, string, number][] = [
  ['ink', 'canvas', 4.5],
  ['ink', 'band', 4.5],
  ['ink', 'soft', 4.5],
  ['ink', 'surface', 4.5],
  ['muted', 'canvas', 4.5],
  ['muted', 'band', 4.5],
  ['muted', 'soft', 4.5],
  ['muted', 'surface', 4.5],
  ['brand', 'canvas', 4.5],
  ['brand', 'surface', 4.5],
  ['link', 'band', 4.5],
  ['link', 'soft', 4.5],
  ['accent-ink', 'canvas', 4.5],
  ['accent-ink', 'band', 4.5],
  ['accent-ink', 'soft', 4.5],
  ['on-brand', 'brand', 4.5],
  ['on-brand', 'brand-hover', 4.5],
  ['brand-2', 'canvas', 4.5],
  ['surface', 'ink', 4.5], // headings on the navy trust band
  ['on-ink-muted', 'ink', 4.5],
  ['spark', 'ink', 3], // icons on the navy band (non-text, 1.4.11)
  ['line-strong', 'canvas', 3],
  ['line-strong', 'surface', 3],
]

describe('website tokens', () => {
  it.each(PAIRS)('%s on %s ≥ %s:1', (fg, bg, min) => {
    expect(tokens[fg], fg).toBeDefined()
    expect(tokens[bg], bg).toBeDefined()
    expect(contrast(tokens[fg]!, tokens[bg]!)).toBeGreaterThanOrEqual(min)
  })

  it('brand blue is not used as text on the soft peach well (measured 4.39:1)', () => {
    expect(contrast(tokens.brand!, tokens.soft!)).toBeLessThan(4.5)
  })

  it('is light only: no dark-mode blocks', () => {
    expect(css).not.toMatch(/prefers-color-scheme|data-theme/)
    expect(css).toMatch(/color-scheme:\s*light/)
  })

  it('is scoped to website pages', () => {
    expect(css).toMatch(/:root:has\(\.eb-site\),\s*\n\.eb-site\s*\{/)
  })
})
