import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { routes as runtimeRoutes } from '../../app/routes'
import { meta as founderMeta } from '../../routes/founder'
import { loader as sitemapLoader } from '../../routes/sitemap'
import { contactSchema, validateContact } from './contact/schema'
import { FOUNDER, SERVICE_LABEL, SERVICES } from './content/company'
import { CONTACT_EMAIL, STATUS } from './content/security'
import { worksheetCost } from './content/why'
import { FOOTER_NAV, HEADER_NAV, PUBLIC_PAGES } from './nav'

function renderSite(path: string) {
  const router = createMemoryRouter([runtimeRoutes[0]!], { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

afterEach(() => localStorage.clear())

const H1: Record<string, string> = {
  '/security': 'Security and responsible use',
  '/why-exit-brain': 'A departure is a predictable risk',
  '/services': 'Services',
  '/about': 'About Exit Brain',
  '/about/founder': FOUNDER.name,
  '/contact': 'Contact',
  '/help': 'Help centre',
  '/privacy': 'Privacy notice',
  '/terms': 'Terms of use',
  '/no-such-page': 'Page not found',
}

describe('website pages', () => {
  it.each(Object.entries(H1))('%s renders one H1 inside the website frame', (path, h1) => {
    renderSite(path)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: h1 })).toBeInTheDocument()
    expect(document.querySelector('.eb-site')).not.toBeNull()
  })

  it('every header and footer link points to a published page, a home section or the product', () => {
    const product = ['/demo', '/signin', '/signup']
    for (const n of [...HEADER_NAV, ...FOOTER_NAV.flatMap((g) => g.items)]) {
      const path = n.href.split('#')[0] || '/'
      expect([...PUBLIC_PAGES, ...product], n.href).toContain(path)
    }
  })
})

describe('security page (W5)', () => {
  it('shows an honest status table, including what is not started', () => {
    renderSite('/security')
    const table = screen.getByRole('table', { name: /Security controls/ })
    for (const s of STATUS) {
      const row = within(table).getByRole('row', { name: new RegExp(s.item.replace(/[()/]/g, '.')) })
      expect(within(row).getByText(s.status)).toBeInTheDocument()
    }
    for (const item of ['SOC 2, ISO 27001', 'External penetration test', 'SSO/SAML, SCIM']) {
      expect(STATUS.find((s) => s.item === item)?.status).toBe('Not started')
    }
  })

  it('makes no certification or training-data claims', () => {
    renderSite('/security')
    const text = document.body.textContent ?? ''
    expect(text).not.toMatch(
      /SOC 2 (certified|compliant)|ISO 27001 certified|not used for training|guarantee/i,
    )
    expect(text).toMatch(/The provider hasn’t been chosen yet/)
  })

  it('gives a working vulnerability contact', () => {
    renderSite('/security')
    const links = screen.getAllByRole('link', { name: CONTACT_EMAIL })
    expect(links[0]).toHaveAttribute('href', `mailto:${CONTACT_EMAIL}`)
  })
})

describe('why exit brain page (W5)', () => {
  it('worksheet starts empty and computes only the visitor’s own numbers', async () => {
    const user = userEvent.setup()
    renderSite('/why-exit-brain')
    expect(screen.getByText('Fill in all five fields to see your number.')).toBeInTheDocument()
    const fields: [RegExp, string][] = [
      [/Yearly salary/, '120000'],
      [/Months for a successor/, '3'],
      [/Share of their time lost/, '50'],
      [/Hours the manager spends/, '20'],
      [/hourly cost/, '100'],
    ]
    for (const [label, v] of fields) await user.type(screen.getByLabelText(label), v)
    // 120000/12 × 3 × 50% = 15,000; 20 × 100 = 2,000
    expect(screen.getByText('17,000')).toBeInTheDocument()
    expect(localStorage.length).toBe(0)
  })

  it('worksheet maths', () => {
    expect(
      worksheetCost({ salary: 120000, rampMonths: 3, rampShare: 50, managerHours: 20, hourlyCost: 100 }),
    ).toEqual({ ramp: 15000, manager: 2000, total: 17000 })
  })

  it('compares categories, not named competitors', () => {
    renderSite('/why-exit-brain')
    const table = screen.getByRole('table', { name: /compared with other approaches/ })
    const cols = within(table)
      .getAllByRole('columnheader')
      .map((c) => c.textContent)
    expect(cols).toEqual(['Exit interview', 'Wiki or docs', 'Enterprise search', 'Exit Brain'])
  })
})

describe('company pages (W6)', () => {
  it('services are the three owner-approved offerings, each labelled proposed', () => {
    renderSite('/services')
    const items = screen.getAllByRole('heading', { level: 2 }).slice(0, 3)
    expect(items.map((h) => h.textContent)).toEqual(SERVICES.map((s) => s.title))
    expect(screen.getAllByText(SERVICE_LABEL)).toHaveLength(3)
  })

  it('founder page shows the approved text, photo and only the links the founder gave', () => {
    renderSite('/about/founder')
    expect(screen.queryByRole('note')).not.toBeInTheDocument()
    expect(screen.queryByText(/Placeholder:/)).not.toBeInTheDocument()
    expect(screen.getByText(FOUNDER.title!)).toBeInTheDocument()
    expect(screen.getByText(FOUNDER.bio!)).toBeInTheDocument()
    expect(screen.getByText(FOUNDER.why!)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: `Photo of ${FOUNDER.name}` })).toHaveAttribute(
      'src',
      FOUNDER.photo,
    )
    expect(screen.getByRole('link', { name: FOUNDER.email })).toHaveAttribute(
      'href',
      `mailto:${FOUNDER.email}`,
    )
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/manikanta-yanika/',
    )
    expect(screen.queryByRole('link', { name: 'GitHub' })).not.toBeInTheDocument()
  })

  it('published founder page is linked from About and the footer, in the sitemap, and indexable', async () => {
    expect(FOUNDER.published).toBe(true)
    expect(PUBLIC_PAGES).toContain('/about/founder')
    expect(FOOTER_NAV.flatMap((g) => g.items).map((n) => n.href)).toContain('/about/founder')
    const xml = await sitemapLoader().text()
    expect(xml.match(/\/about\/founder</g)).toHaveLength(1)
    expect(founderMeta()).not.toContainEqual({ name: 'robots', content: 'noindex' })
    renderSite('/about')
    expect(screen.getByRole('link', { name: 'Meet the founder' })).toHaveAttribute('href', '/about/founder')
  })

  it('sitemap lists every published page', async () => {
    const xml = await sitemapLoader().text()
    for (const p of PUBLIC_PAGES) expect(xml).toContain(`<loc>https://exitbrain.example${p}</loc>`)
  })
})

describe('contact (W7)', () => {
  const valid = {
    topic: 'Pilot' as const,
    name: 'Asha',
    email: 'asha@example.com',
    company: '',
    message: 'We would like to try a pilot.',
    website: '',
  }

  it('schema accepts a valid message and rejects bad input', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true)
    const r = validateContact({ ...valid, name: ' ', email: 'nope', message: 'hi', topic: 'Spam' as never })
    expect(Object.keys(r.errors).sort()).toEqual(['email', 'message', 'name', 'topic'])
    expect(validateContact({ ...valid, message: 'x'.repeat(4001) }).errors.message).toMatch(/4,000/)
  })

  it('schema rejects a filled honeypot', () => {
    expect(validateContact({ ...valid, website: 'http://spam.example' }).ok).toBe(false)
  })

  it('form validates on blur, cannot be sent, and says how to reach us', async () => {
    const user = userEvent.setup()
    renderSite('/contact')
    const email = screen.getByLabelText('Work email')
    await user.type(email, 'not-an-email')
    await user.tab()
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(email).toHaveAttribute('aria-invalid', 'true')
    const send = screen.getByRole('button', { name: 'Send message' })
    expect(send).toBeDisabled()
    expect(screen.getByText(/This form isn’t active yet/)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: CONTACT_EMAIL })[0]).toHaveAttribute(
      'href',
      `mailto:${CONTACT_EMAIL}`,
    )
    expect(screen.getByRole('link', { name: /privacy notice/ })).toHaveAttribute('href', '/privacy')
  })
})

describe('help and legal (W7)', () => {
  it('help search filters answers and reports the count', async () => {
    const user = userEvent.setup()
    renderSite('/help')
    await user.type(screen.getByRole('searchbox', { name: 'Search help' }), 'delete')
    expect(screen.getByText(/1 answer found|answers found/)).toBeInTheDocument()
    expect(screen.getByText('Can we delete our data?')).toBeInTheDocument()
    expect(screen.queryByText('What does HR see?')).not.toBeInTheDocument()
    await user.clear(screen.getByRole('searchbox', { name: 'Search help' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search help' }), 'zebra')
    expect(screen.getByText(/No answers found/)).toBeInTheDocument()
  })

  it.each(['/privacy', '/terms'])('%s is clearly marked as a draft', (path) => {
    renderSite(path)
    expect(screen.getByRole('note')).toHaveTextContent('Draft, pending legal review')
  })
})

describe('site guide (W8)', () => {
  it('opens as a dialog, answers from site pages, and handles no match', async () => {
    const user = userEvent.setup()
    renderSite('/')
    const launcher = screen.getByRole('button', { name: 'Ask about Exit Brain' })
    await user.click(launcher)
    const dialog = screen.getByRole('dialog', { name: 'Site guide' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(within(dialog).getByText(/doesn’t use AI and doesn’t store your questions/)).toBeInTheDocument()
    const input = within(dialog).getByRole('textbox', { name: 'Your question' })
    expect(input).toHaveFocus()
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Ask' })).toBeEnabled())

    await user.type(input, 'How much does it cost?{Enter}')
    const log = within(dialog).getByRole('log', { name: 'Answers' })
    expect(log).toHaveAttribute('aria-live', 'polite')
    const answers = within(log).getByRole('list', { name: /Answers for: How much does it cost/ })
    const links = within(answers).getAllByRole('link', { name: /Open page/ })
    expect(links.length).toBeGreaterThan(0)
    expect(links.length).toBeLessThanOrEqual(3)

    await user.type(input, 'weather in paris{Enter}')
    expect(within(log).getByText(/I couldn’t find that on our site/)).toBeInTheDocument()
    expect(within(log).getByRole('link', { name: 'Contact page' })).toHaveAttribute('href', '/contact')
  })

  it('traps focus, closes with Escape and returns focus to the launcher', async () => {
    const user = userEvent.setup()
    renderSite('/')
    const launcher = screen.getByRole('button', { name: 'Ask about Exit Brain' })
    await user.click(launcher)
    const dialog = screen.getByRole('dialog', { name: 'Site guide' })
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Ask' })).toBeEnabled())
    for (let i = 0; i < 10; i++) await user.tab()
    expect(dialog.contains(document.activeElement)).toBe(true)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Site guide' })).not.toBeInTheDocument()
    await waitFor(() => expect(launcher).toHaveFocus())
  })

  it('the help centre can open it', async () => {
    const user = userEvent.setup()
    renderSite('/help')
    await user.click(screen.getByRole('button', { name: 'Ask the site guide' }))
    expect(screen.getByRole('dialog', { name: 'Site guide' })).toBeInTheDocument()
  })
})
