import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DEMO_PASSWORD } from '../data/demo/demoAuth'
import { renderApp } from './testing'

describe('landing page', () => {
  it('leads to sign-in, sign-up and the demo', async () => {
    renderApp('/')
    expect(
      await screen.findByRole('heading', { level: 1, name: /When a senior engineer leaves/ }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Sign in' })[0]).toHaveAttribute('href', '/signin')
    expect(screen.getAllByRole('link', { name: 'Start a pilot' })[0]).toHaveAttribute('href', '/signup')
    expect(screen.getAllByRole('link', { name: /demo/i })[0]).toHaveAttribute('href', '/demo')
  })

  it('shows per-departure pricing honestly', async () => {
    renderApp('/')
    expect(await screen.findByText('$149')).toBeInTheDocument()
    expect(screen.getByText(/Billing isn’t live yet/)).toBeInTheDocument()
  })
})

describe('auth portal', () => {
  it('signed-out visitors to /app are sent to sign-in', async () => {
    renderApp('/app/transitions')
    expect(await screen.findByRole('heading', { name: 'Sign in to Exit Brain' })).toBeInTheDocument()
  })

  it('validates the sign-in form before calling auth', async () => {
    const user = userEvent.setup()
    renderApp('/signin')
    await user.click(await screen.findByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Enter a valid work email.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
  })

  it('rejects a wrong password without saying which part was wrong', async () => {
    const user = userEvent.setup()
    renderApp('/signin')
    await user.type(await screen.findByLabelText('Work email'), 'priya@acme.dev')
    await user.type(screen.getByLabelText('Password'), 'wrong-pass-1')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Email or password is incorrect.')).toBeInTheDocument()
  })

  it('email + password sign-in lands the manager on transitions', async () => {
    const user = userEvent.setup()
    renderApp('/signin')
    await user.type(await screen.findByLabelText('Work email'), 'Priya@acme.dev ')
    await user.type(screen.getByLabelText('Password'), DEMO_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('heading', { name: 'Knowledge transitions' })).toBeInTheDocument()
  })

  it('returns to the page the visitor originally asked for', async () => {
    const user = userEvent.setup()
    renderApp('/app/team')
    await user.type(await screen.findByLabelText('Work email'), 'neha@acme.dev')
    await user.type(screen.getByLabelText('Password'), DEMO_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('heading', { name: 'Team' })).toBeInTheDocument()
  })

  it('sign-up enforces the password policy, then shows check-email', async () => {
    const user = userEvent.setup()
    renderApp('/signup')
    await user.type(await screen.findByLabelText('Full name'), 'Asha Menon')
    await user.type(screen.getByLabelText('Work email'), 'asha@example.com')
    await user.type(screen.getByLabelText('Password'), 'onlyletters')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('Include at least one number.')).toBeInTheDocument()
    await user.clear(screen.getByLabelText('Password'))
    await user.type(screen.getByLabelText('Password'), 'letters123')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument()
    expect(screen.getByText('asha@example.com')).toBeInTheDocument()
    expect(screen.getByText(/no account was created/)).toBeInTheDocument()
  })
})

describe('role portals', () => {
  const cases: [string, string, string | RegExp][] = [
    ['CTO, workspace owner', 'neha', /^Good (morning|afternoon|evening), Neha$/],
    ['Engineering Manager', 'priya', 'Knowledge transitions'],
    ['Leaving engineer', 'ravi', 'Your handover interview'],
    ['Successor', 'kiran', 'Your checklist appears when Priya approves the handover'],
    ['HR Business Partner', 'anita', 'Knowledge transitions'],
  ]

  it.each(cases)('demo picker: %s lands in their own portal', async (roleLabel, _id, heading) => {
    const user = userEvent.setup()
    renderApp('/demo')
    await user.click(await screen.findByRole('button', { name: new RegExp(roleLabel) }))
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
  })

  it('each role sees only its own navigation', async () => {
    renderApp('/app', 'neha')
    const nav = await screen.findByRole('navigation', { name: 'Portal' })
    for (const name of [
      'Overview',
      'People & roles',
      'Integrations',
      'Audit log',
      'Data & privacy',
      'Setup guide',
    ])
      expect(within(nav).getByRole('link', { name })).toBeInTheDocument()
  })

  it('managers get no admin portal links', async () => {
    renderApp('/app', 'priya')
    const nav = await screen.findByRole('navigation', { name: 'Portal' })
    expect(within(nav).getByRole('link', { name: 'Team' })).toBeInTheDocument()
    for (const name of ['Overview', 'Audit log', 'Integrations'])
      expect(within(nav).queryByRole('link', { name })).not.toBeInTheDocument()
  })

  it('the successor has no transitions or team links', async () => {
    renderApp('/app', 'kiran')
    const nav = await screen.findByRole('navigation', { name: 'Portal' })
    expect(within(nav).queryByRole('link', { name: 'Transitions' })).not.toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'My onboarding' })).toBeInTheDocument()
  })

  it('HR cannot open a transition’s knowledge content', async () => {
    renderApp('/app/transitions/t-ravi', 'anita')
    expect(
      await screen.findByRole('heading', { name: 'This page isn’t part of your portal' }),
    ).toBeInTheDocument()
  })

  it('the leaving employee cannot open setup', async () => {
    renderApp('/app/setup', 'ravi')
    expect(
      await screen.findByRole('heading', { name: 'This page isn’t part of your portal' }),
    ).toBeInTheDocument()
  })

  it('switching demo accounts moves to that person’s portal', async () => {
    const user = userEvent.setup()
    renderApp('/app/transitions', 'priya')
    await user.selectOptions(await screen.findByLabelText('View as'), 'ravi')
    expect(await screen.findByRole('heading', { name: 'Your handover interview' })).toBeInTheDocument()
  })

  it('sign out returns to sign-in and protects /app again', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/app/transitions', 'priya')
    await user.click((await screen.findAllByRole('button', { name: 'Sign out' }))[0]!)
    await waitFor(() => expect(router.state.location.pathname).toBe('/signin'))
  })
})
