import { Bell, Command, CornerDownLeft, Search } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router'
import { usePersona } from '../../app/persona'
import { useAdminApi } from '../../data/admin/AdminApiProvider'
import { useAdminLive, useMarkRead, useMembers, useNotifications } from '../../data/admin/hooks'
import type { MockAdminApi } from '../../data/admin/mockAdminApi'
import { useTransitions } from '../../data/hooks'
import { DemoLabel } from '../../design/primitives/Demo'
import { timeAgo, useNow } from './lib'
import { LiveBadge } from './ui'

const PAGES = [
  { label: 'Overview', to: '/app/admin', keywords: 'home dashboard' },
  { label: 'Transitions', to: '/app/transitions', keywords: 'handover leaving' },
  { label: 'Knowledge risk', to: '/app/admin/knowledge', keywords: 'areas concentration bus factor' },
  { label: 'Jobs & health', to: '/app/admin/system', keywords: 'queue sync latency errors' },
  { label: 'People & roles', to: '/app/admin/people', keywords: 'members invite users team' },
  { label: 'Invite people', to: '/app/admin/people?invite=1', keywords: 'add member user' },
  { label: 'Security', to: '/app/admin/security', keywords: 'sessions domains password sso' },
  { label: 'Integrations', to: '/app/admin/integrations', keywords: 'github repositories webhooks' },
  { label: 'Audit log', to: '/app/admin/audit', keywords: 'events history who' },
  { label: 'Data & privacy', to: '/app/admin/data', keywords: 'retention deletion gdpr dpdp' },
  { label: 'Usage & billing', to: '/app/admin/billing', keywords: 'invoices cost plan' },
  { label: 'Settings', to: '/app/admin/settings', keywords: 'workspace name notifications' },
]

/** ⌘K / Ctrl+K: jump to any admin page, transition or member. */
function CommandPalette({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const { data: transitions } = useTransitions()
  const { data: members } = useMembers()
  const inputId = useId()
  const listId = useId()
  const box = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const all = [
      ...PAGES.map((p) => ({ kind: 'Page', label: p.label, to: p.to, hay: `${p.label} ${p.keywords}` })),
      ...(transitions ?? []).map((t) => ({
        kind: 'Transition',
        label: `${t.employee.name} · ${t.employee.title}`,
        to: `/app/transitions/${t.id}`,
        hay: `${t.employee.name} ${t.employee.title} ${t.repos.join(' ')}`,
      })),
      ...(members ?? []).map((m) => ({
        kind: 'Member',
        label: `${m.name} · ${m.email}`,
        to: `/app/admin/people?q=${encodeURIComponent(m.name)}`,
        hay: `${m.name} ${m.email} ${m.team} ${m.role}`,
      })),
    ]
    const words = q.toLowerCase().split(/\s+/).filter(Boolean)
    return all.filter((r) => words.every((w) => r.hay.toLowerCase().includes(w))).slice(0, 9)
  }, [q, transitions, members])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const go = (to: string) => {
    onClose()
    navigate(to)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close search"
        tabIndex={-1}
        className="absolute inset-0 bg-[var(--eb-overlay)]"
        onClick={onClose}
      />
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-label="Search the admin portal"
        className="eb-enter relative w-full max-w-lg overflow-hidden rounded-panel border border-line bg-surface shadow-float"
      >
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search aria-hidden size={16} className="text-muted" />
          <label htmlFor={inputId} className="sr-only">
            Search pages, transitions and people
          </label>
          <input
            id={inputId}
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setActive(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((a) => Math.min(results.length - 1, a + 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((a) => Math.max(0, a - 1))
              } else if (e.key === 'Enter' && results[active]) go(results[active].to)
            }}
            placeholder="Search pages, transitions and people…"
            className="h-12 flex-1 bg-transparent text-sm outline-none"
          />
          <kbd className="rounded border border-line px-1.5 text-[11px] text-muted">Esc</kbd>
        </div>
        <ul id={listId} role="listbox" aria-label="Results" className="max-h-80 overflow-y-auto p-1.5">
          {results.map((r, i) => (
            <li
              key={`${r.kind}-${r.to}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onPointerEnter={() => setActive(i)}
              onClick={() => go(r.to)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-control px-3 py-2 text-sm ${
                i === active ? 'bg-brand-soft text-ink' : 'text-ink'
              }`}
            >
              <span className="truncate">{r.label}</span>
              <span className="flex shrink-0 items-center gap-2 text-xs text-muted">
                {r.kind}
                {i === active && <CornerDownLeft aria-hidden size={12} />}
              </span>
            </li>
          ))}
          {!results.length && <li className="px-3 py-6 text-center text-sm text-muted">No matches.</li>}
        </ul>
      </div>
    </div>
  )
}

function NotificationBell() {
  const { data: notes } = useNotifications()
  const markRead = useMarkRead()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const now = useNow()
  const unread = notes?.filter((n) => !n.read).length ?? 0
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const down = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('keydown', key)
    }
  }, [open])

  const dot = {
    risk: 'bg-conflicting',
    job: 'bg-partial',
    security: 'bg-partial',
    approval: 'bg-supported',
    info: 'bg-brand',
  }
  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-control p-2 text-muted transition-colors hover:bg-surface-sunken hover:text-ink"
      >
        <Bell aria-hidden size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-conflicting px-1 text-[10px] font-semibold text-white tabular-nums">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div
          id={panelId}
          className="eb-enter absolute right-0 z-40 mt-2 w-[min(92vw,22rem)] overflow-hidden rounded-panel border border-line bg-surface shadow-float"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <p className="text-sm font-semibold">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markRead.mutate(undefined)}
                className="text-xs font-medium text-brand hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-96 divide-y divide-line overflow-y-auto">
            {(notes ?? []).slice(0, 8).map((n) => (
              <li key={n.id}>
                <Link
                  to={n.href}
                  onClick={() => {
                    setOpen(false)
                    if (!n.read) markRead.mutate([n.id])
                  }}
                  className={`flex gap-3 px-4 py-3 hover:bg-surface-sunken ${n.read ? '' : 'bg-brand-soft/40'}`}
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot[n.kind]}`} />
                  <span className="min-w-0">
                    <span className={`block text-sm ${n.read ? '' : 'font-medium'}`}>{n.title}</span>
                    <span className="block text-xs text-muted">{n.body}</span>
                    <span className="block text-[11px] text-muted">{timeAgo(n.at, now)}</span>
                  </span>
                </Link>
              </li>
            ))}
            {!notes?.length && (
              <li className="px-4 py-6 text-center text-sm text-muted">You’re all caught up.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * Frame for every /app/admin page: live connection, search (⌘K) and notifications.
 * It keeps one live subscription for the whole portal and records the signed-in person as the
 * actor for audit entries.
 */
export function AdminShell() {
  const { persona } = usePersona()
  const api = useAdminApi()
  const [palette, setPalette] = useState(false)
  useAdminLive()

  useEffect(() => {
    ;(api as Partial<MockAdminApi>).setActor?.(persona.name, persona.role)
  }, [api, persona.name, persona.role])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((p) => !p)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="-mt-3 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="font-medium text-ink">Admin portal</span>
          <LiveBadge label={api.mode === 'mock' ? 'Live (simulated)' : 'Live'} />
          {api.mode === 'mock' && <DemoLabel>MOCK DATA</DemoLabel>}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPalette(true)}
            aria-label="Search the admin portal (Ctrl+K)"
            className="inline-flex h-9 items-center gap-2 rounded-control border border-line bg-surface px-3 text-sm text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <Search aria-hidden size={15} />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden items-center gap-0.5 rounded border border-line px-1 text-[11px] sm:inline-flex">
              <Command aria-hidden size={10} />K
            </kbd>
          </button>
          <NotificationBell />
        </div>
      </div>
      <Outlet />
      {palette && <CommandPalette onClose={() => setPalette(false)} />}
    </div>
  )
}
