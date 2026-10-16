import {
  CheckCircle2,
  Circle,
  CircleDashed,
  KeyRound,
  LogOut,
  MonitorSmartphone,
  Plus,
  X,
} from 'lucide-react'
import { useState } from 'react'
import {
  useAudit,
  useRevokeSession,
  useSecurity,
  useSessions,
  useUpdateSecurity,
} from '../../data/admin/hooks'
import type { SecuritySettings } from '../../data/admin/types'
import { Button } from '../../design/primitives/Button'
import { useToast } from '../../design/primitives/Toast'
import { SkeletonRows } from '../../design/states/States'
import { describeAudit } from './describe'
import { selectCls, timeAgo, useNow } from './lib'
import { AdminHeader, Card, Pill, Toggle } from './ui'

/** Honest status of controls (security-and-privacy.md §5, §9). Not a score. */
const CONTROLS: { name: string; status: 'Done' | 'MVP scope' | 'Not started' }[] = [
  { name: 'Row-level security on every customer table', status: 'Done' },
  { name: 'Cross-workspace isolation tests on every change', status: 'Done' },
  { name: 'Secret scanning on every change', status: 'Done' },
  { name: 'Email confirmation before joining a workspace', status: 'Done' },
  { name: 'Audit log of members and roles', status: 'Done' },
  { name: 'Read-only GitHub App with signed webhooks', status: 'MVP scope' },
  { name: 'Automatic retention cleanup', status: 'MVP scope' },
  { name: 'SSO / SAML and SCIM', status: 'Not started' },
  { name: 'Enforced multi-factor sign-in', status: 'Not started' },
  { name: 'SOC 2 / ISO 27001, external penetration test', status: 'Not started' },
]

function Policies() {
  const { data: sec } = useSecurity()
  if (!sec) return <SkeletonRows rows={3} label="Loading policies" />
  return <PolicyForm sec={sec} />
}

function PolicyForm({ sec }: { sec: SecuritySettings }) {
  const update = useUpdateSecurity()
  const toast = useToast()
  const [domain, setDomain] = useState('')
  const [minLen, setMinLen] = useState(sec.passwordMinLength)
  const save = (patch: Parameters<typeof update.mutate>[0], msg: string) =>
    update.mutate(patch, { onSuccess: () => toast(msg), onError: (e) => toast(e.message, 'error') })

  return (
    <Card title="Sign-in policies" note="Applies to everyone in this workspace">
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-sm font-medium">Allowed email domains</p>
          <p className="text-xs text-muted">Only addresses at these domains can be invited or join.</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {sec.allowedDomains.map((d) => (
              <li key={d}>
                <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-sunken py-0.5 pr-1 pl-2.5 text-xs">
                  {d}
                  <button
                    type="button"
                    aria-label={`Remove ${d}`}
                    onClick={() =>
                      save({ allowedDomains: sec.allowedDomains.filter((x) => x !== d) }, `${d} removed.`)
                    }
                    className="rounded-full p-0.5 text-muted hover:bg-line hover:text-ink"
                  >
                    <X aria-hidden size={12} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const d = domain.trim().toLowerCase()
              if (!d) return
              save({ allowedDomains: [...sec.allowedDomains, d] }, `${d} added.`)
              setDomain('')
            }}
          >
            <label className="sr-only" htmlFor="sec-domain">
              Add a domain
            </label>
            <input
              id="sec-domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="h-9 w-48 rounded-control border border-line-strong bg-surface px-3 text-sm"
            />
            <Button type="submit" size="md" icon={<Plus aria-hidden size={15} />}>
              Add
            </Button>
          </form>
        </div>
        <Toggle
          label="Magic-link sign-in"
          description="Let people sign in with a one-time email link as well as a password."
          checked={sec.magicLink}
          onChange={(v) => save({ magicLink: v }, v ? 'Magic links turned on.' : 'Magic links turned off.')}
        />
        <Toggle
          label="Email confirmation"
          description="Always on. New accounts confirm their email before joining."
          checked
          disabled
          onChange={() => undefined}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Minimum password length
            <span className="flex gap-2">
              <input
                type="number"
                min={8}
                max={64}
                value={minLen}
                onChange={(e) => setMinLen(Number(e.target.value))}
                className="h-9 w-24 rounded-control border border-line-strong bg-surface px-3 text-sm tabular-nums"
              />
              <Button
                disabled={minLen === sec.passwordMinLength}
                onClick={() =>
                  save({ passwordMinLength: minLen }, `Minimum password length is now ${minLen}.`)
                }
              >
                Save
              </Button>
            </span>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Sign people out after
            <select
              className={selectCls}
              value={sec.sessionTimeoutHours}
              onChange={(e) =>
                save({ sessionTimeoutHours: Number(e.target.value) }, 'Session length updated.')
              }
            >
              {[1, 4, 12, 24, 72, 168].map((h) => (
                <option key={h} value={h}>
                  {h < 24 ? `${h} hours idle` : `${h / 24} days idle`}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </Card>
  )
}

export function SecurityPage() {
  const now = useNow()
  const toast = useToast()
  const { data: sessions } = useSessions()
  const { data: audit } = useAudit()
  const revoke = useRevokeSession()
  const security = (audit ?? []).filter((e) => {
    const g = describeAudit(e).group
    return (
      g === 'Access' ||
      e.action.startsWith('member.role') ||
      e.action.startsWith('org.security') ||
      e.action === 'verification.overridden'
    )
  })
  const done = CONTROLS.filter((c) => c.status === 'Done').length

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Security"
        description="Sign-in rules, active sessions and the honest state of security controls. No badges, no certifications we don’t have."
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Policies />
        <Card title="Security controls" note={`${done} of ${CONTROLS.length} in place today`}>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
            <div
              className="h-full rounded-full bg-supported transition-[width] duration-700"
              style={{ width: `${(done / CONTROLS.length) * 100}%` }}
            />
          </div>
          <ul className="eb-stagger flex flex-col gap-2.5">
            {CONTROLS.map((c) => (
              <li key={c.name} className="flex items-start gap-2.5 text-sm">
                {c.status === 'Done' ? (
                  <CheckCircle2 aria-hidden size={16} className="mt-0.5 shrink-0 text-supported" />
                ) : c.status === 'MVP scope' ? (
                  <CircleDashed aria-hidden size={16} className="mt-0.5 shrink-0 text-partial" />
                ) : (
                  <Circle aria-hidden size={16} className="mt-0.5 shrink-0 text-line-strong" />
                )}
                <span className="flex-1">{c.name}</span>
                <Pill tone={c.status === 'Done' ? 'good' : c.status === 'MVP scope' ? 'warn' : 'muted'}>
                  {c.status}
                </Pill>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Your active sessions" note="Sign out devices you don’t recognise">
          {!sessions ? (
            <SkeletonRows rows={2} label="Loading sessions" />
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-muted">
                    <MonitorSmartphone aria-hidden size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {s.device} {s.current && <Pill tone="good">This device</Pill>}
                    </p>
                    <p className="text-xs text-muted">
                      {s.location} · {s.current ? 'active now' : timeAgo(s.lastSeenAt, now)}
                    </p>
                  </div>
                  {!s.current && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<LogOut aria-hidden size={14} />}
                      loading={revoke.isPending && revoke.variables === s.id}
                      onClick={() =>
                        revoke.mutate(s.id, { onSuccess: () => toast(`Signed out ${s.device}.`) })
                      }
                    >
                      Sign out
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Recent security events" note="Sign-ins, role changes, overrides and policy changes">
          <ol className="flex flex-col gap-3">
            {security.slice(0, 7).map((e) => {
              const d = describeAudit(e)
              return (
                <li key={e.id} className="flex gap-3">
                  <KeyRound aria-hidden size={14} className="mt-1 shrink-0 text-muted" />
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{e.actor}</span> {d.text}
                    </p>
                    <p className="text-xs text-muted">
                      {timeAgo(e.at, now)} · {e.region}
                    </p>
                  </div>
                </li>
              )
            })}
            {!security.length && <li className="text-sm text-muted">No security events yet.</li>}
          </ol>
        </Card>
      </div>

      <Card title="Single sign-on (SSO) and SCIM" note="Enterprise identity">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-sm text-muted">
            SAML SSO and automatic provisioning with SCIM are planned for after the MVP. Until then, people
            sign in with email and password or a magic link, limited to your allowed domains.
          </p>
          <Pill>Later</Pill>
        </div>
      </Card>
    </div>
  )
}
