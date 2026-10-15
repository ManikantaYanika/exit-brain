import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// Vitest runs from apps/web; CSS module imports are stubbed in tests, so read the file directly.
const css = readFileSync(resolve(process.cwd(), 'src/design/tokens.css'), 'utf8')

function block(selectorStart: string): Record<string, string> {
  const start = css.indexOf(selectorStart)
  if (start < 0) throw new Error(`block not found: ${selectorStart}`)
  const open = css.indexOf('{', start + selectorStart.length - 1)
  const close = css.indexOf('}', open)
  const out: Record<string, string> = {}
  for (const m of css.slice(open + 1, close).matchAll(/--eb-([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)) {
    out[m[1]!] = m[2]!.toLowerCase()
  }
  return out
}

function luminance(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)) as [
    number,
    number,
    number,
  ]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

const light = block(':root {')
const darkMedia = block(":root:not([data-theme='light'])")
const darkAttr = block(":root[data-theme='dark']")

// [foreground, background, minimum ratio]
const TEXT_PAIRS: [string, string, number][] = [
  ['ink', 'canvas', 4.5],
  ['ink', 'surface', 4.5],
  ['muted', 'canvas', 4.5],
  ['muted', 'surface', 4.5],
  ['brand', 'surface', 4.5],
  ['brand', 'canvas', 4.5],
  ['brand', 'brand-soft', 4.5],
  ['on-brand', 'brand', 4.5],
  ['on-brand', 'brand-hover', 4.5],
  ['brand-2', 'surface', 4.5],
  ['supported', 'supported-soft', 4.5],
  ['partial', 'partial-soft', 4.5],
  ['conflicting', 'conflicting-soft', 4.5],
  ['conflicting', 'surface', 4.5],
  ['unverified', 'unverified-soft', 4.5],
  ['demo', 'demo-soft', 4.5],
  ['line-strong', 'surface', 3], // control boundaries (WCAG 1.4.11)
]

describe('design tokens', () => {
  it('dark values are identical in the media query and the data-theme block', () => {
    expect(darkAttr).toEqual(darkMedia)
  })

  it('every light token has a dark counterpart', () => {
    expect(Object.keys(darkMedia).sort()).toEqual(Object.keys(light).sort())
  })

  for (const [name, theme] of [
    ['light', light],
    ['dark', darkMedia],
  ] as const) {
    it.each(TEXT_PAIRS)(`${name}: %s on %s meets %s:1`, (fg, bg, min) => {
      const ratio = contrast(theme[fg]!, theme[bg]!)
      expect(ratio, `${fg} ${theme[fg]} on ${bg} ${theme[bg]} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(
        min,
      )
    })
  }

  it('brand colours come from the logo', () => {
    expect(light.ink).toBe('#0d1939')
    expect(light.brand).toBe('#1f5df0')
    expect(light['brand-2']).toBe('#733aea')
  })
})
