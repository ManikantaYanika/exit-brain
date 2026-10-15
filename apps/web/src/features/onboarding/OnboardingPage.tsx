import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { useApi } from '../../data/ApiProvider'
import { useOrganization } from '../../data/hooks'
import type { Role } from '../../data/types'

const ROLES: { value: Exclude<Role, 'owner'>; label: string; help: string }[] = [
  { value: 'manager', label: 'Manager', help: 'Starts transitions, reviews knowledge, approves handovers' },
  { value: 'employee', label: 'Leaving employee', help: 'Answers their own interview' },
  { value: 'successor', label: 'Successor', help: 'Sees approved handovers and the assistant' },
  { value: 'admin', label: 'Admin', help: 'Manages people, GitHub and data retention' },
  { value: 'viewer', label: 'Viewer', help: 'Sees status only, e.g. HR' },
]

const GITHUB_PERMISSIONS = ['Metadata', 'Contents', 'Pull requests', 'Issues']

export function OnboardingPage() {
  const api = useApi()
  const { data: org } = useOrganization()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Exclude<Role, 'owner'>>('manager')
  const [links, setLinks] = useState<{ email: string; role: string; url: string }[]>([])
  const [busy, setBusy] = useState(false)

  return (
    <div className="max-w-3xl space-y-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Set up {org?.name ?? 'your workspace'}</h1>
        <p className="mt-2 text-muted">Three steps. You can come back to any of them later.</p>
      </header>

      <ol className="space-y-6">
        <li className="rounded-lg border border-line bg-surface p-5">
          <h2 className="text-lg font-semibold">1. Workspace</h2>
          <p className="mt-1 text-sm text-muted">
            {org ? `${org.name}, ${org.sizeBand} people. You are the owner.` : 'Loading…'}
          </p>
        </li>

        <li className="rounded-lg border border-line bg-surface p-5">
          <h2 className="text-lg font-semibold">2. Invite your team</h2>
          <form
            className="mt-3 flex flex-wrap items-end gap-2"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!email.trim()) return
              setBusy(true)
              const r = await api.invite({ email: email.trim().toLowerCase(), role })
              setLinks((l) => [...l, { email: email.trim().toLowerCase(), role, url: r.inviteUrl }])
              setEmail('')
              setBusy(false)
            }}
          >
            <label className="min-w-56 flex-1 text-sm">
              <span className="text-muted">Work email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-line px-2 py-1.5"
                placeholder="kiran@acme.dev"
              />
            </label>
            <label className="text-sm">
              <span className="text-muted">Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
                className="mt-1 block rounded-md border border-line bg-surface px-2 py-1.5"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" variant="primary" disabled={busy}>
              Create invite link
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted">{ROLES.find((r) => r.value === role)?.help}</p>
          {links.length > 0 && (
            <ul className="mt-4 space-y-2">
              {links.map((l) => (
                <li key={l.url} className="rounded-md bg-paper px-3 py-2 text-sm">
                  <span className="font-medium">{l.email}</span> as {l.role}
                  <span className="mt-0.5 block truncate font-mono text-xs text-muted">{l.url}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted">
            Invite links work once, expire in 7 days, and only for the invited email address after it is
            confirmed.
          </p>
        </li>

        <li className="rounded-lg border border-line bg-surface p-5">
          <h2 className="text-lg font-semibold">3. Connect GitHub</h2>
          <p className="mt-1 text-sm text-muted">
            Exit Brain installs as a GitHub App with read-only access. You choose which repositories it can
            read, and you can disconnect at any time.
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
            {GITHUB_PERMISSIONS.map((p) => (
              <li key={p}>
                {p} <span className="text-muted">— read</span>
              </li>
            ))}
          </ul>
          <Button className="mt-4" disabled title="Available when GitHub is connected (build day 2)">
            Connect GitHub (coming next)
          </Button>
        </li>
      </ol>
    </div>
  )
}
