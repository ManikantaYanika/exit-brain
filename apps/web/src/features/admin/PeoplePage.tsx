import { Check, MailPlus, RotateCw, UserMinus, UserPlus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { usePersona } from '../../app/persona'
import {
  useChangeRole,
  useInviteMember,
  useInvites,
  useMembers,
  useResendInvite,
  useRevokeInvite,
  useSetMemberActive,
} from '../../data/admin/hooks'
import type { Invite, Member } from '../../data/admin/types'
import type { Role } from '../../data/types'
import { Button } from '../../design/primitives/Button'
import { Dialog } from '../../design/primitives/Dialog'
import { useToast } from '../../design/primitives/Toast'
import { SkeletonRows } from '../../design/states/States'
import { can, capabilitiesOf, type Capability } from '../../domain/permissions'
import { ROLE_LABEL, selectCls, timeAgo, useNow } from './lib'
import { AdminHeader, ConfirmDialog, Pill, SearchBox, Stat, TableWrap, Tabs, Td, Th } from './ui'

const ROLES: Role[] = ['owner', 'admin', 'manager', 'employee', 'successor', 'viewer']
const INVITABLE: Exclude<Role, 'owner'>[] = ['admin', 'manager', 'employee', 'successor', 'viewer']

/** Human names for capabilities in the permission matrix (security §4). */
const CAP: Partial<Record<Capability, string>> = {
  'org.edit': 'Edit workspace settings',
  'members.invite': 'Invite people',
  'members.changeRole': 'Change roles',
  'members.grantOwner': 'Make someone an owner',
  'integrations.manage': 'Manage GitHub access',
  'data.requestDeletion': 'Request data deletion',
  'audit.view': 'View the audit log',
  'transition.create': 'Start transitions',
  'transition.viewAll': 'See all transitions',
  'transition.viewSummary': 'See transition status',
  'evidence.view': 'See GitHub evidence',
  'items.review': 'Review knowledge areas',
  'interview.answer': 'Answer their own interview',
  'answers.viewApproved': 'Read approved answers',
  'verification.override': 'Override a verification',
  'handover.approve': 'Approve the handover',
  'handover.viewApproved': 'Read the approved handover',
  'assistant.ask': 'Ask the handover assistant',
}

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Exclude<Role, 'owner'>>('manager')
  const [error, setError] = useState<string | null>(null)
  const invite = useInviteMember()
  const toast = useToast()
  const close = () => {
    setEmail('')
    setError(null)
    onClose()
  }
  return (
    <Dialog
      open={open}
      onClose={close}
      title="Invite people"
      description="They get an email link that expires in 7 days. Only addresses at your allowed domains can join."
      footer={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button
            variant="primary"
            loading={invite.isPending}
            icon={<MailPlus aria-hidden size={16} />}
            onClick={() =>
              invite.mutate(
                { email, role },
                {
                  onSuccess: (i) => {
                    toast(`Invite sent to ${i.email} as ${ROLE_LABEL[i.role]}.`)
                    close()
                  },
                  onError: (e) => setError(e.message),
                },
              )
            }
          >
            Send invite
          </Button>
        </>
      }
    >
      <label className="flex flex-col gap-1 text-sm">
        Work email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@acme.dev"
          aria-invalid={!!error}
          className="h-9 rounded-control border border-line-strong bg-surface px-3 text-sm aria-[invalid=true]:border-conflicting"
        />
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm">Role</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {INVITABLE.map((r) => (
            <label
              key={r}
              className={`flex cursor-pointer flex-col gap-0.5 rounded-control border p-2.5 text-sm transition-colors ${
                role === r ? 'border-brand bg-brand-soft' : 'border-line hover:border-line-strong'
              }`}
            >
              <span className="flex items-center gap-2 font-medium">
                <input type="radio" name="invite-role" checked={role === r} onChange={() => setRole(r)} />
                {ROLE_LABEL[r]}
              </span>
              <span className="pl-5 text-xs text-muted">{capabilitiesOf(r).length} permissions</span>
            </label>
          ))}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm font-medium text-conflicting">
          {error}
        </p>
      )}
    </Dialog>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
  return (
    <span
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand"
    >
      {initials}
    </span>
  )
}

function MembersTab({ members, query }: { members: Member[]; query: string }) {
  const { persona } = usePersona()
  const now = useNow()
  const toast = useToast()
  const changeRole = useChangeRole()
  const setActive = useSetMemberActive()
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [pending, setPending] = useState<{ m: Member; role: Role } | null>(null)
  const [removing, setRemoving] = useState<Member | null>(null)
  const canChange = can(persona.role, 'members.changeRole')
  const canOwner = can(persona.role, 'members.grantOwner')

  const rows = members.filter(
    (m) =>
      (roleFilter === 'all' || m.role === roleFilter) &&
      `${m.name} ${m.email} ${m.team} ${m.title}`.toLowerCase().includes(query.toLowerCase()),
  )
  const apply = (m: Member, role: Role) =>
    changeRole.mutate(
      { id: m.id, role },
      {
        onSuccess: (x) => toast(`${x.name} is now ${ROLE_LABEL[x.role]}.`),
        onError: (e) => toast(e.message, 'error'),
      },
    )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by role">
        {(['all', ...ROLES] as const).map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={roleFilter === r}
            onClick={() => setRoleFilter(r)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              roleFilter === r
                ? 'border-ink bg-ink text-surface'
                : 'border-line text-muted hover:border-line-strong'
            }`}
          >
            {r === 'all' ? 'All roles' : ROLE_LABEL[r]}
            <span className="ml-1.5 tabular-nums opacity-70">
              {r === 'all' ? members.length : members.filter((m) => m.role === r).length}
            </span>
          </button>
        ))}
      </div>
      <TableWrap caption="Workspace members">
        <thead className="border-b border-line">
          <tr>
            <Th>Member</Th>
            <Th>Role</Th>
            <Th className="hidden md:table-cell">Team</Th>
            <Th className="hidden lg:table-cell">Sign-in</Th>
            <Th>Last active</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody className="eb-stagger divide-y divide-line">
          {rows.map((m) => {
            const self = m.name === persona.name
            return (
              <tr
                key={m.id}
                className={`transition-colors hover:bg-surface-sunken ${m.status === 'deactivated' ? 'opacity-60' : ''}`}
              >
                <Td>
                  <span className="flex items-center gap-3">
                    <Avatar name={m.name} />
                    <span className="min-w-0">
                      <span className="block font-medium">
                        {m.name} {self && <span className="text-xs font-normal text-muted">(you)</span>}
                      </span>
                      <span className="block truncate text-xs text-muted">{m.email}</span>
                    </span>
                  </span>
                </Td>
                <Td>
                  {canChange && !self && m.status === 'active' ? (
                    <select
                      aria-label={`Role for ${m.name}`}
                      value={m.role}
                      className={`${selectCls} h-8 text-xs`}
                      onChange={(e) => {
                        const role = e.target.value as Role
                        if (role === 'owner' || role === 'admin' || m.role === 'owner')
                          setPending({ m, role })
                        else apply(m, role)
                      }}
                    >
                      {ROLES.filter((r) => r !== 'owner' || canOwner || m.role === 'owner').map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Pill tone={m.role === 'owner' || m.role === 'admin' ? 'info' : 'muted'}>
                      {ROLE_LABEL[m.role]}
                    </Pill>
                  )}
                </Td>
                <Td className="hidden text-muted md:table-cell">{m.team}</Td>
                <Td className="hidden text-muted lg:table-cell">{m.signIn}</Td>
                <Td className="text-muted">{timeAgo(m.lastActiveAt, now)}</Td>
                <Td>
                  <Pill tone={m.status === 'active' ? 'good' : m.status === 'invited' ? 'warn' : 'muted'}>
                    {m.status === 'active' ? 'Active' : m.status === 'invited' ? 'Invited' : 'Deactivated'}
                  </Pill>
                </Td>
                <Td className="text-right">
                  {canChange && !self && (
                    <Button
                      size="sm"
                      variant={m.status === 'active' ? 'ghost' : 'secondary'}
                      icon={
                        m.status === 'active' ? (
                          <UserMinus aria-hidden size={14} />
                        ) : (
                          <RotateCw aria-hidden size={14} />
                        )
                      }
                      onClick={() =>
                        m.status === 'active'
                          ? setRemoving(m)
                          : setActive.mutate(
                              { id: m.id, active: true },
                              {
                                onSuccess: () => toast(`${m.name} can sign in again.`),
                                onError: (e) => toast(e.message, 'error'),
                              },
                            )
                      }
                    >
                      {m.status === 'active' ? 'Deactivate' : 'Reactivate'}
                    </Button>
                  )}
                </Td>
              </tr>
            )
          })}
          {!rows.length && (
            <tr>
              <Td className="py-8 text-center text-muted">No members match.</Td>
            </tr>
          )}
        </tbody>
      </TableWrap>

      <ConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        danger={false}
        busy={changeRole.isPending}
        title={pending ? `Make ${pending.m.name} ${ROLE_LABEL[pending.role]}?` : ''}
        description={
          pending && (pending.role === 'owner' || pending.role === 'admin')
            ? `${ROLE_LABEL[pending.role]}s can manage people, GitHub access, data deletion and the audit log. This is recorded in the audit log.`
            : 'They will lose owner permissions. A workspace always keeps at least one owner.'
        }
        confirmLabel="Change role"
        onConfirm={() => {
          if (pending) apply(pending.m, pending.role)
          setPending(null)
        }}
      />
      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        busy={setActive.isPending}
        title={removing ? `Deactivate ${removing.name}?` : ''}
        description="They are signed out and can’t sign in. Their approved answers and audit history stay. You can reactivate them later."
        confirmLabel="Deactivate"
        onConfirm={() => {
          if (removing)
            setActive.mutate(
              { id: removing.id, active: false },
              {
                onSuccess: () => toast(`${removing.name} was deactivated.`),
                onError: (e) => toast(e.message, 'error'),
              },
            )
          setRemoving(null)
        }}
      />
    </div>
  )
}

function InvitesTab({ invites }: { invites: Invite[] }) {
  const now = useNow()
  const toast = useToast()
  const revoke = useRevokeInvite()
  const resend = useResendInvite()
  if (!invites.length) return <p className="py-8 text-center text-sm text-muted">No pending invites.</p>
  return (
    <TableWrap caption="Pending invites">
      <thead className="border-b border-line">
        <tr>
          <Th>Email</Th>
          <Th>Role</Th>
          <Th className="hidden md:table-cell">Invited by</Th>
          <Th>Expires</Th>
          <Th className="text-right">Actions</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {invites.map((i) => {
          const soon = new Date(i.expiresAt).getTime() - now < 3 * 86_400_000
          return (
            <tr key={i.id} className="hover:bg-surface-sunken">
              <Td className="font-medium">{i.email}</Td>
              <Td>
                <Pill>{ROLE_LABEL[i.role]}</Pill>
              </Td>
              <Td className="hidden text-muted md:table-cell">
                {i.invitedBy} · {timeAgo(i.createdAt, now)}
              </Td>
              <Td className={soon ? 'text-partial' : 'text-muted'}>{timeAgo(i.expiresAt, now)}</Td>
              <Td className="text-right whitespace-nowrap">
                <Button
                  size="sm"
                  variant="ghost"
                  loading={resend.isPending && resend.variables === i.id}
                  onClick={() =>
                    resend.mutate(i.id, { onSuccess: () => toast(`Invite resent to ${i.email}.`) })
                  }
                >
                  Resend
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<X aria-hidden size={14} />}
                  loading={revoke.isPending && revoke.variables === i.id}
                  onClick={() =>
                    revoke.mutate(i.id, { onSuccess: () => toast(`Invite for ${i.email} revoked.`) })
                  }
                >
                  Revoke
                </Button>
              </Td>
            </tr>
          )
        })}
      </tbody>
    </TableWrap>
  )
}

function MatrixTab() {
  const caps = Object.keys(CAP) as Capability[]
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted">
        What each role can do in the interface. The database enforces the same rules with row-level security,
        so a role can never read more than this.
      </p>
      <TableWrap caption="Permission matrix">
        <thead className="border-b border-line">
          <tr>
            <Th>Permission</Th>
            {ROLES.map((r) => (
              <Th key={r} className="text-center">
                {ROLE_LABEL[r]}
              </Th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {caps.map((c) => (
            <tr key={c} className="hover:bg-surface-sunken">
              <Td>{CAP[c]}</Td>
              {ROLES.map((r) => (
                <Td key={r} className="text-center">
                  {can(r, c) ? (
                    <Check aria-label="Yes" size={16} className="mx-auto text-supported" />
                  ) : (
                    <span aria-label="No" className="text-line-strong">
                      –
                    </span>
                  )}
                </Td>
              ))}
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  )
}

export function PeoplePage() {
  const [params, setParams] = useSearchParams()
  const { persona } = usePersona()
  const { data: members } = useMembers()
  const { data: invites } = useInvites()
  const now = useNow()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const tab = (params.get('tab') as 'members' | 'invites' | 'roles' | null) ?? 'members'
  const inviting = params.get('invite') === '1'
  const set = (k: string, v: string | null) => {
    const p = new URLSearchParams(params)
    if (v === null) p.delete(k)
    else p.set(k, v)
    setParams(p, { replace: true })
  }
  const stats = useMemo(() => {
    const m = members ?? []
    return {
      total: m.length,
      active: m.filter((x) => x.status === 'active').length,
      admins: m.filter((x) => (x.role === 'owner' || x.role === 'admin') && x.status === 'active').length,
      seen: m.filter((x) => x.lastActiveAt && now - new Date(x.lastActiveAt).getTime() < 7 * 86_400_000)
        .length,
    }
  }, [members, now])

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="People & roles"
        description="Who is in the workspace, what their role lets them do, and pending invites. Every change is written to the audit log."
        actions={
          can(persona.role, 'members.invite') && (
            <Button
              variant="primary"
              icon={<UserPlus aria-hidden size={16} />}
              onClick={() => set('invite', '1')}
            >
              Invite people
            </Button>
          )
        }
      />
      <div className="eb-stagger grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Members" value={stats.total} hint={`${stats.active} active`} />
        <Stat label="Owners & admins" value={stats.admins} hint="Can manage the workspace" />
        <Stat label="Active this week" value={stats.seen} tone="good" hint="Signed in in the last 7 days" />
        <Stat
          label="Pending invites"
          value={invites?.length ?? 0}
          tone={invites?.length ? 'warn' : undefined}
          hint="Expire after 7 days"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          label="People"
          value={tab}
          onChange={(v) => set('tab', v)}
          items={[
            { value: 'members', label: 'Members', count: members?.length },
            { value: 'invites', label: 'Invites', count: invites?.length },
            { value: 'roles', label: 'Roles & permissions' },
          ]}
        />
        {tab === 'members' && (
          <SearchBox
            value={query}
            onChange={setQuery}
            label="Search members"
            placeholder="Search name, email, team"
          />
        )}
      </div>

      {!members || !invites ? (
        <SkeletonRows rows={4} label="Loading people" />
      ) : tab === 'members' ? (
        <MembersTab members={members} query={query} />
      ) : tab === 'invites' ? (
        <InvitesTab invites={invites} />
      ) : (
        <MatrixTab />
      )}
      <InviteDialog open={inviting} onClose={() => set('invite', null)} />
    </div>
  )
}
