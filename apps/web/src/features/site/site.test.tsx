import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { KnowledgeCircuit } from './motion/KnowledgeCircuit'
import { HomePage } from './home/HomePage'
import { HEADER_NAV } from './nav'
import { SiteLayout } from './SiteLayout'

function renderSite(path = '/') {
  const router = createMemoryRouter(
    [{ path: '/', element: <SiteLayout />, children: [{ index: true, element: <HomePage /> }] }],
    { initialEntries: [path] },
  )
  render(<RouterProvider router={router} />)
}

afterEach(() => localStorage.clear())

describe('website layout', () => {
  it('scopes the page to the website tokens and offers a skip link', () => {
    renderSite()
    expect(document.querySelector('.eb-site')).not.toBeNull()
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main')
    expect(document.getElementById('main')).not.toBeNull()
  })

  it('header links only to things that exist today', () => {
    renderSite()
    const nav = screen.getAllByRole('navigation', { name: 'Main' })[0]!
    const hrefs = within(nav)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(HEADER_NAV.map((n) => n.href.slice(1)))
    for (const h of hrefs) expect(document.querySelector(h!)).not.toBeNull()
  })

  it('mobile menu opens, traps focus, and closes with Escape', async () => {
    const user = userEvent.setup()
    renderSite()
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    expect(dialog.contains(document.activeElement)).toBe(true)
    for (let i = 0; i < 12; i++) await user.tab()
    expect(dialog.contains(document.activeElement)).toBe(true)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument()
  })

  it('states the product stage honestly in the footer', () => {
    renderSite()
    expect(
      screen.getByText('Exit Brain is in early development. Pilots are by invitation.'),
    ).toBeInTheDocument()
  })
})

describe('knowledge circuit', () => {
  it('is described for screen readers and has a visible pause control', () => {
    render(<KnowledgeCircuit />)
    expect(screen.getByRole('img', { name: /Knowledge moving from a leaving engineer/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pause animation' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('pausing stops the motion and is remembered', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<KnowledgeCircuit />)
    await user.click(screen.getByRole('button', { name: 'Pause animation' }))
    expect(document.querySelector('.eb-circuit')).toHaveClass('is-paused')
    expect(localStorage.getItem('eb-motion')).toBe('paused')
    unmount()
    render(<KnowledgeCircuit />)
    expect(screen.getByRole('button', { name: 'Play animation' })).toHaveAttribute('aria-pressed', 'true')
    expect(document.querySelector('.eb-circuit')).toHaveClass('is-paused')
    await user.click(screen.getByRole('button', { name: 'Play animation' }))
    expect(localStorage.getItem('eb-motion')).toBeNull()
  })

  it('stops while the tab is hidden', async () => {
    render(<KnowledgeCircuit />)
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(await screen.findByRole('button', { name: 'Pause animation' })).toBeInTheDocument()
    expect(document.querySelector('.eb-circuit')).toHaveClass('is-paused')
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
    document.dispatchEvent(new Event('visibilitychange'))
  })

  it('has a reduced-motion rule that removes animation and the control', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')
    const block = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce) {\n  .eb-circuit'))
    expect(block).toMatch(/\.eb-circuit \* \{\s*animation: none !important;/)
    expect(block).toMatch(/\.eb-circuit-toggle \{\s*display: none;/)
  })

  it('only animates compositor-friendly properties', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')
    const frames = [...css.matchAll(/@keyframes eb-(signal|node|speed|door|glow) \{([\s\S]*?)\n\}/g)]
    expect(frames).toHaveLength(5)
    for (const [, , body] of frames) {
      const props = [...body!.matchAll(/([a-z-]+):/g)].map((m) => m[1])
      for (const p of props) expect(['transform', 'opacity', 'stroke-dashoffset']).toContain(p)
    }
  })
})
