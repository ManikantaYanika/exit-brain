import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../app/testing'

const asOwner = (path = '/app/admin') => renderApp(path, 'neha')

describe('admin portal access', () => {
  it('the owner lands on the admin overview with the workflow flowchart', async () => {
    asOwner('/app')
    expect(
      await screen.findByRole('heading', { level: 1, name: /^Good (morning|afternoon|evening), Neha$/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('Live (simulated)')).toBeInTheDocument()
    for (const stage of [
      'GitHub analysis',
      'Knowledge review',
      'Interview',
      'Verification',
      'Handover approval',
      'Successor onboarding',
    ])
      expect(screen.getAllByText(stage).length).toBeGreaterThan(0)
  })

  it('a manager is kept out of the admin portal', async () => {
    renderApp('/app/admin/people', 'priya')
    expect(
      await screen.findByRole('heading', { name: 'This page isn’t part of your portal' }),
    ).toBeInTheDocument()
  })

  it('clicking a workflow stage lists who is in it', async () => {
    const user = userEvent.setup()
    asOwner()
    await user.click(await screen.findByRole('button', { name: /Interview.*Leaving engineer answers/ }))
    expect(await screen.findByText(/Interview: 1 in this stage/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open transition' })).toHaveAttribute(
      'href',
      '/app/transitions/t-ravi',
    )
  })
})

describe('people & roles', () => {
  it('invites a member, shows the invite, and writes the audit log', async () => {
    const user = userEvent.setup()
    const { adminApi } = asOwner('/app/admin/people?invite=1')
    const dialog = await screen.findByRole('dialog', { name: 'Invite people' })
    await user.type(within(dialog).getByLabelText('Work email'), 'outsider@gmail.com')
    await user.click(within(dialog).getByRole('button', { name: 'Send invite' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('acme.dev')
    await user.clear(within(dialog).getByLabelText('Work email'))
    await user.type(within(dialog).getByLabelText('Work email'), 'new.hire@acme.dev')
    await user.click(within(dialog).getByLabelText(/HR viewer/))
    await user.click(within(dialog).getByRole('button', { name: 'Send invite' }))
    expect(await screen.findByText('Invite sent to new.hire@acme.dev as HR viewer.')).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: /Invites/ }))
    expect(await screen.findByText('new.hire@acme.dev')).toBeInTheDocument()
    expect((await adminApi.listAudit())[0]).toMatchObject({ action: 'member.invited', actor: 'Neha Kapoor' })
  })

  it('making someone an admin asks for confirmation first', async () => {
    const user = userEvent.setup()
    const { adminApi } = asOwner('/app/admin/people')
    const select = await screen.findByRole('combobox', { name: 'Role for Priya Nair' })
    await user.selectOptions(select, 'admin')
    const dialog = await screen.findByRole('dialog', { name: 'Make Priya Nair Admin?' })
    await user.click(within(dialog).getByRole('button', { name: 'Change role' }))
    expect(await screen.findByText('Priya Nair is now Admin.')).toBeInTheDocument()
    expect((await adminApi.listMembers()).find((m) => m.name === 'Priya Nair')!.role).toBe('admin')
  })

  it('shows the permission matrix from the real role rules', async () => {
    const user = userEvent.setup()
    asOwner('/app/admin/people')
    await user.click(await screen.findByRole('tab', { name: 'Roles & permissions' }))
    const row = screen.getByRole('row', { name: /View the audit log/ })
    expect(within(row).getAllByLabelText('Yes')).toHaveLength(2) // owner + admin only
  })
})

describe('integrations, jobs and data', () => {
  it('turning on a repository queues a read-only sync that completes live', async () => {
    const user = userEvent.setup()
    const { adminApi } = asOwner('/app/admin/integrations')
    expect(await screen.findByText('Metadata: read')).toBeInTheDocument()
    await user.click(screen.getByRole('switch', { name: 'Read acme/mobile-app' }))
    expect(await screen.findByText('acme/mobile-app added. First sync queued.')).toBeInTheDocument()
    expect(await screen.findByText('Queued')).toBeInTheDocument()
    for (let i = 0; i < 60; i++) act(() => adminApi.tick())
    // Scheduled syncs keep arriving, so check that a sync finished and records were read.
    await waitFor(async () => {
      const jobs = await adminApi.listJobs()
      expect(jobs.some((j) => j.target === 'acme/mobile-app' && j.status === 'succeeded')).toBe(true)
      expect(
        (await adminApi.listRepos()).find((r) => r.fullName === 'acme/mobile-app')!.records,
      ).toBeGreaterThan(0)
    })
  })

  it('a failed job can be retried from Jobs & health', async () => {
    const user = userEvent.setup()
    asOwner('/app/admin/system')
    await user.click(await screen.findByRole('tab', { name: /Failed/ }))
    await user.click(await screen.findByRole('button', { name: 'Retry' }))
    expect(await screen.findByText(/queued again\./)).toBeInTheDocument()
  })

  it('deleting data needs the word DELETE', async () => {
    const user = userEvent.setup()
    asOwner('/app/admin/data')
    await user.click(await screen.findByRole('button', { name: 'Request deletion' }))
    const dialog = await screen.findByRole('dialog', { name: 'Request data deletion' })
    const go = within(dialog).getByRole('button', { name: 'Delete data' })
    expect(go).toBeDisabled()
    await user.type(within(dialog).getByLabelText(/to confirm/), 'DELETE')
    expect(go).toBeEnabled()
    await user.click(go)
    expect(await screen.findByText(/Deletion del-\d+ scheduled/)).toBeInTheDocument()
  })

  it('shortening retention asks for confirmation and is audited', async () => {
    const user = userEvent.setup()
    const { adminApi } = asOwner('/app/admin/data')
    await user.click(await screen.findByRole('button', { name: '30 days' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    const dialog = await screen.findByRole('dialog', { name: 'Shorten retention to 30 days?' })
    await user.click(within(dialog).getByRole('button', { name: 'Shorten retention' }))
    await waitFor(async () => expect((await adminApi.getSettings()).retentionDays).toBe(30))
    expect((await adminApi.listAudit())[0]!.action).toBe('org.retention_changed')
  })
})

describe('audit, security, billing, settings', () => {
  it('audit log filters by category and opens an event', async () => {
    const user = userEvent.setup()
    asOwner('/app/admin/audit')
    await user.click(await screen.findByRole('button', { name: /^Data/ }))
    const table = screen.getByRole('table', { name: 'Audit events' })
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows.length).toBeGreaterThan(0)
    for (const r of rows) expect(r).toHaveTextContent(/delet|retention/i)
    await user.click(rows[0]!)
    expect(screen.getByRole('complementary', { name: 'Event detail' })).toHaveTextContent('never answer text')
  })

  it('security: rejects a bad domain and lists honest control status', async () => {
    const user = userEvent.setup()
    asOwner('/app/admin/security')
    await user.type(await screen.findByLabelText('Add a domain'), 'not a domain')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText(/isn’t a domain like example.com/)).toBeInTheDocument()
    expect(screen.getByText('SOC 2 / ISO 27001, external penetration test').closest('li')).toHaveTextContent(
      'Not started',
    )
  })

  it('billing says plainly that billing is not live', async () => {
    asOwner('/app/admin/billing')
    expect(await screen.findByText('Billing isn’t live.')).toBeInTheDocument()
    expect(screen.getAllByText('Not billed').length).toBeGreaterThan(0)
  })

  it('settings: renames the workspace', async () => {
    const user = userEvent.setup()
    const { adminApi } = asOwner('/app/admin/settings')
    const name = await screen.findByLabelText('Workspace name')
    await user.clear(name)
    await user.type(name, 'Acme Engineering')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(async () => expect((await adminApi.getSettings()).name).toBe('Acme Engineering'))
  })
})

describe('portal chrome', () => {
  it('Ctrl+K opens search and Enter goes to the result', async () => {
    const user = userEvent.setup()
    const { router } = asOwner()
    await screen.findByRole('heading', { level: 1 })
    await user.keyboard('{Control>}k{/Control}')
    const dialog = await screen.findByRole('dialog', { name: 'Search the admin portal' })
    await user.type(within(dialog).getByRole('combobox'), 'audit')
    await user.keyboard('{Enter}')
    await waitFor(() => expect(router.state.location.pathname).toBe('/app/admin/audit'))
  })

  it('the bell shows unread alerts and marks them read', async () => {
    const user = userEvent.setup()
    asOwner()
    const bell = await screen.findByRole('button', { name: /Notifications, 3 unread/ })
    await user.click(bell)
    await user.click(screen.getByRole('button', { name: 'Mark all read' }))
    expect(await screen.findByRole('button', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('starts a transition with the four-step wizard', async () => {
    const user = userEvent.setup()
    const { api } = asOwner()
    await user.click(await screen.findByRole('button', { name: 'New transition' }))
    const dialog = await screen.findByRole('dialog', { name: 'Start a transition' })
    await user.type(within(dialog).getByLabelText('Full name'), 'Lena Fischer')
    await user.type(within(dialog).getByLabelText('GitHub username'), 'lena-f')
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }))
    const day = new Date(Date.now() + 40 * 86_400_000).toISOString().slice(0, 10)
    await user.type(within(dialog).getByLabelText('Last working day'), day)
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }))
    await user.click(within(dialog).getByRole('checkbox', { name: /acme\/billing-sync/ }))
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }))
    expect(within(dialog).getByText(/Nothing here scores or evaluates them/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Start transition' }))
    await waitFor(async () =>
      expect((await api.listTransitions()).some((t) => t.employee.name === 'Lena Fischer')).toBe(true),
    )
  })
})
