import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { createMockApi } from '../data/mockApi'
import { createQueryClient } from '../lib/queryClient'
import { AppProviders } from './AppProviders'
import type { PersonaId } from './personas'
import { routes } from './routes'

function renderApp(path: string, persona: PersonaId) {
  const api = createMockApi(0)
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <AppProviders api={api} queryClient={createQueryClient()} persona={persona}>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return api
}

describe('prototype flows', () => {
  it('always shows the MOCK DATA notice', async () => {
    renderApp('/', 'priya')
    expect(screen.getByRole('note')).toHaveTextContent('MOCK DATA')
  })

  it('manager confirms an AI-suggested knowledge area', async () => {
    const user = userEvent.setup()
    renderApp('/transitions/t-ravi', 'priya')
    expect(await screen.findByRole('heading', { name: '4 areas need your review' })).toBeInTheDocument()
    const gst = (await screen.findByRole('heading', { name: 'Month-end GST export for finance' })).closest(
      'li',
    )!
    await user.click(within(gst).getByRole('button', { name: 'Confirm' }))
    expect(await screen.findByRole('heading', { name: '3 areas need your review' })).toBeInTheDocument()
  })

  it('citations name the record they point to', async () => {
    renderApp('/transitions/t-ravi', 'priya')
    expect(
      (
        await screen.findAllByRole('button', {
          name: /Evidence 1: temporary fix: retry nightly invoice sync/,
        })
      ).length,
    ).toBeGreaterThan(0)
  })

  it('a vague interview answer produces a follow-up question', async () => {
    const user = userEvent.setup()
    renderApp('/interview/t-ravi', 'ravi')
    const box = await screen.findByLabelText('Your answer', { selector: '#a-q-2' })
    await user.type(box, 'It depends, usually fine.')
    await user.click(within(box.closest('li')!).getByRole('button', { name: 'Save answer' }))
    expect(await screen.findByText('Follow-up:')).toBeInTheDocument()
  })

  it('successor sees no checklist until the handover is approved', async () => {
    renderApp('/successor/t-ravi', 'kiran')
    expect(
      await screen.findByRole('heading', { name: 'Your checklist appears when Priya approves the handover' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Learning checklist' })).not.toBeInTheDocument()
  })

  it('assistant says when knowledge is missing and offers escalation', async () => {
    const user = userEvent.setup()
    renderApp('/successor/t-ravi', 'kiran')
    await user.type(await screen.findByLabelText('Your question'), 'How do I renew the SSL certificate?')
    await user.click(screen.getByRole('button', { name: 'Ask' }))
    expect(await screen.findByText('I can’t find this in approved knowledge.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ask Ravi' }))
    await waitFor(() => expect(screen.getByText(/Sent to Ravi’s interview/)).toBeInTheDocument())
  })

  it('pages outside a persona’s view are blocked in the UI', async () => {
    renderApp('/transitions/t-ravi', 'kiran')
    expect(await screen.findByRole('heading', { name: /isn’t part of Kiran’s view/ })).toBeInTheDocument()
  })
})
