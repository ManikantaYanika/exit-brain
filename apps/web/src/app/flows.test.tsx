import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from './testing'

describe('prototype flows', () => {
  it('always shows the MOCK DATA notice', async () => {
    renderApp('/app/transitions', 'priya')
    expect(await screen.findByRole('note')).toHaveTextContent('MOCK DATA')
  })

  it('manager confirms an AI-suggested knowledge area', async () => {
    const user = userEvent.setup()
    renderApp('/app/transitions/t-ravi', 'priya')
    expect(await screen.findByRole('heading', { name: '4 areas need your review' })).toBeInTheDocument()
    const gst = (await screen.findByRole('heading', { name: 'Month-end GST export for finance' })).closest(
      'li',
    )!
    await user.click(within(gst).getByRole('button', { name: 'Confirm' }))
    expect(await screen.findByRole('heading', { name: '3 areas need your review' })).toBeInTheDocument()
  })

  it('citations name the record they point to', async () => {
    renderApp('/app/transitions/t-ravi', 'priya')
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
    renderApp('/app/interview/t-ravi', 'ravi')
    const box = await screen.findByLabelText('Your answer', { selector: '#a-q-2' })
    await user.type(box, 'It depends, usually fine.')
    await user.click(within(box.closest('li')!).getByRole('button', { name: 'Save answer' }))
    expect(await screen.findByText('Follow-up:')).toBeInTheDocument()
  })

  it('successor sees no checklist until the handover is approved', async () => {
    renderApp('/app/onboarding/t-ravi', 'kiran')
    expect(
      await screen.findByRole('heading', { name: 'Your checklist appears when Priya approves the handover' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Learning checklist' })).not.toBeInTheDocument()
  })

  it('assistant says when knowledge is missing and offers escalation', async () => {
    const user = userEvent.setup()
    renderApp('/app/onboarding/t-ravi', 'kiran')
    await user.type(await screen.findByLabelText('Your question'), 'How do I renew the SSL certificate?')
    await user.click(screen.getByRole('button', { name: 'Ask' }))
    expect(await screen.findByText('I can’t find this in approved knowledge.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ask Ravi' }))
    await waitFor(() => expect(screen.getByText(/Sent to Ravi’s interview/)).toBeInTheDocument())
  })

  it('pages outside a role’s portal are blocked in the UI', async () => {
    renderApp('/app/transitions/t-ravi', 'kiran')
    expect(
      await screen.findByRole('heading', { name: 'This page isn’t part of your portal' }),
    ).toBeInTheDocument()
  })
})
