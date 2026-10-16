import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { KnowledgeCircuit } from './motion/KnowledgeCircuit'
import { routes as runtimeRoutes } from '../../app/routes'
import { FEATURE_GROUPS } from './pages/FeaturesPage'
import { HEADER_NAV, PUBLIC_PAGES } from './nav'

function renderSite(path = '/') {
  // The website subtree of the real runtime routes (the product routes need auth providers).
  const router = createMemoryRouter([runtimeRoutes[0]!], { initialEntries: [path] })
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
      .map((a) => a.getAttribute('href')!)
    expect(hrefs).toEqual(HEADER_NAV.map((n) => (n.href.startsWith('/#') ? n.href.slice(1) : n.href)))
    for (const h of hrefs) {
      if (h.startsWith('#')) expect(document.querySelector(h), h).not.toBeNull()
      else expect(PUBLIC_PAGES).toContain(h)
    }
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

describe('how it works page', () => {
  it('shows the five steps in order, each with what Exit Brain never does', () => {
    renderSite('/how-it-works')
    expect(screen.getByRole('heading', { level: 1, name: 'How a handover works' })).toBeInTheDocument()
    const steps = screen
      .getAllByRole('heading', { level: 2 })
      .slice(0, 5)
      .map((h) => h.textContent)
    expect(steps).toEqual([
      'Connect GitHub, read-only',
      'Find what only one person knows',
      'Interview with evidence',
      'Verify against the records',
      'Approve and hand over',
    ])
    expect(screen.getAllByText(/never/i).length).toBeGreaterThanOrEqual(5)
  })

  it('labels every product example as MOCK DATA', () => {
    renderSite('/how-it-works')
    expect(screen.getAllByText('MOCK DATA, fictional company')).toHaveLength(5)
  })

  it('shows all four verification statuses and marks the timeline as an example', () => {
    renderSite('/how-it-works')
    for (const s of ['Supported', 'Partly supported', 'Conflicting', 'Unverified']) {
      expect(screen.getAllByText(s).length).toBeGreaterThan(0)
    }
    expect(screen.getByText(/An illustration, not a promise/)).toBeInTheDocument()
  })

  it('marks the current page in the header', () => {
    renderSite('/how-it-works')
    const nav = screen.getAllByRole('navigation', { name: 'Main' })[0]!
    expect(within(nav).getByRole('link', { name: 'How it works' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Features' })).not.toHaveAttribute('aria-current')
  })

  it('section links on other pages go back to the home page', () => {
    renderSite('/how-it-works')
    const footer = screen.getByRole('navigation', { name: 'Product' })
    expect(within(footer).getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '/#pricing')
  })
})

describe('features page', () => {
  it('uses only the two honest status labels', () => {
    renderSite('/features')
    const statuses = FEATURE_GROUPS.flatMap((g) => g.features.map((f) => f.status))
    expect(new Set(statuses)).toEqual(new Set(['mvp', 'later']))
    expect(screen.getAllByText('MVP scope').length).toBe(statuses.filter((s) => s === 'mvp').length)
    expect(screen.getAllByText('Later').length).toBe(statuses.filter((s) => s === 'later').length)
  })

  it('lists Slack, Jira, Drive and SSO as later, not available', () => {
    renderSite('/features')
    for (const name of ['Slack, Jira, Google Drive', 'SSO/SAML and SCIM']) {
      const item = screen.getByRole('heading', { level: 3, name }).closest('li')!
      expect(within(item).getByText('Later')).toBeInTheDocument()
    }
  })

  it('covers every role', () => {
    renderSite('/features')
    for (const who of ['Engineering managers', 'Leaving engineer', 'Successor', 'HR', 'Workspace admins']) {
      expect(screen.getByRole('heading', { level: 2, name: who })).toBeInTheDocument()
    }
  })
})
