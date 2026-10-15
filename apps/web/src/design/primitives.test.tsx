import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from './primitives/Button'
import { Dialog } from './primitives/Dialog'
import { TextInput } from './primitives/Field'
import { ThemeToggle } from './primitives/ThemeToggle'
import { ToastProvider, useToast } from './primitives/Toast'
import { EmptyState, ErrorState } from './states/States'
import { applyThemeChoice } from './theme'

afterEach(() => {
  document.documentElement.removeAttribute('data-theme')
  vi.useRealTimers()
})

describe('Field', () => {
  it('links label, hint and error to the control', () => {
    render(<TextInput label="Work email" hint="We send a confirmation link" error="Enter a valid email" />)
    const input = screen.getByLabelText('Work email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Enter a valid email')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email')
  })
})

describe('Button', () => {
  it('is disabled and busy while loading', () => {
    render(<Button loading>Approve</Button>)
    const b = screen.getByRole('button', { name: 'Approve' })
    expect(b).toBeDisabled()
    expect(b).toHaveAttribute('aria-busy', 'true')
  })
})

describe('Dialog', () => {
  function Harness() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Approve handover</Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Approve this handover?"
          footer={<Button onClick={() => setOpen(false)}>Cancel</Button>}
        >
          <p>Kiran will be able to read it.</p>
        </Dialog>
      </>
    )
  }
  it('opens with a labelled title and closes', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Approve handover' }))
    expect(screen.getByRole('heading', { name: 'Approve this handover?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('heading', { name: 'Approve this handover?' })).not.toBeInTheDocument()
  })
})

describe('Toast', () => {
  function Trigger() {
    const toast = useToast()
    return <Button onClick={() => toast('Handover approved. Kiran can see it now.')}>Go</Button>
  }
  it('announces and auto-dismisses after 5 seconds', async () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    )
    act(() => screen.getByRole('button', { name: 'Go' }).click())
    expect(screen.getByRole('status')).toHaveTextContent('Handover approved')
    act(() => vi.advanceTimersByTime(5000))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})

describe('States', () => {
  it('empty state names what appears and offers the action', () => {
    render(
      <EmptyState
        title="No transitions yet"
        body="Start one when someone resigns."
        action={<Button>Start a transition</Button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Start a transition' })).toBeInTheDocument()
  })
  it('error state offers retry', async () => {
    const onRetry = vi.fn()
    render(<ErrorState message="Check your connection and try again." onRetry={onRetry} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})

describe('theme', () => {
  it('system removes data-theme; explicit choices set it', () => {
    applyThemeChoice('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    applyThemeChoice('system')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })
  it('toggle exposes a radio group', async () => {
    render(<ThemeToggle />)
    await userEvent.setup().click(screen.getByRole('radio', { name: 'Dark theme' }))
    expect(screen.getByRole('radio', { name: 'Dark theme' })).toHaveAttribute('aria-checked', 'true')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
