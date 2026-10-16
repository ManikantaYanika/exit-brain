import {
  Activity,
  CreditCard,
  Database,
  FlaskConical,
  Gauge,
  Webhook,
  LayoutDashboard,
  LayoutList,
  ListChecks,
  LogOut,
  Menu,
  MessageSquareText,
  Radar,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { useState, type ComponentType } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useApi } from '../data/ApiProvider'
import type { Role } from '../data/types'
import { Logo } from '../design/primitives/Logo'
import { ThemeToggle } from '../design/primitives/ThemeToggle'
import { homePathFor } from '../domain/permissions'
import { useAuth } from './auth'
import { usePersona } from './persona'

interface NavItem {
  to: string
  label: string
  Icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean; strokeWidth?: number }>
  end?: boolean
  /** Section heading shown above the first item of a group (admin portal). */
  group?: string
}

function navFor(role: Role, transitionId: string | null): NavItem[] {
  const transitions: NavItem = { to: '/app/transitions', label: 'Transitions', Icon: LayoutList }
  const team: NavItem = { to: '/app/team', label: 'Team', Icon: Users }
  switch (role) {
    case 'owner':
    case 'admin':
      // The admin portal (owner/admin): grouped like an operations console.
      return [
        { to: '/app/admin', label: 'Overview', Icon: LayoutDashboard, end: true },
        { ...transitions, group: 'Operate' },
        { to: '/app/admin/knowledge', label: 'Knowledge risk', Icon: Radar },
        { to: '/app/admin/system', label: 'Jobs & health', Icon: Activity },
        { to: '/app/admin/people', label: 'People & roles', Icon: Users, group: 'Access' },
        { to: '/app/admin/security', label: 'Security', Icon: ShieldCheck },
        { to: '/app/admin/integrations', label: 'Integrations', Icon: Webhook },
        { to: '/app/admin/audit', label: 'Audit log', Icon: ScrollText, group: 'Govern' },
        { to: '/app/admin/data', label: 'Data & privacy', Icon: Database },
        { to: '/app/admin/billing', label: 'Usage & billing', Icon: CreditCard, group: 'Workspace' },
        { to: '/app/admin/settings', label: 'Settings', Icon: Settings },
        { to: '/app/setup', label: 'Setup guide', Icon: Gauge },
      ]
    case 'manager':
      return [transitions, team]
    case 'employee':
      return transitionId
        ? [{ to: `/app/interview/${transitionId}`, label: 'My handover interview', Icon: MessageSquareText }]
        : []
    case 'successor':
      return transitionId
        ? [{ to: `/app/onboarding/${transitionId}`, label: 'My onboarding', Icon: ListChecks }]
        : []
    case 'viewer':
      return [transitions]
  }
}

/** Persistent notice in demo mode, with a role switcher for walkthroughs (ux-plan §6). */
function DemoBar() {
  const { gateway, session } = useAuth()
  const api = useApi()
  const navigate = useNavigate()
  const switcher = gateway.mode === 'demo' && gateway.demoAccounts && gateway.signInAsDemo
  if (!switcher && api.mode !== 'mock') return null
  const current = gateway.demoAccounts?.find((a) => a.email === session?.email)?.id ?? ''
  return (
    <div role="note" className="border-b border-demo/30 bg-demo-soft text-demo">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5 text-xs sm:px-6">
        <p className="flex items-center gap-1.5">
          <FlaskConical aria-hidden size={14} />
          <span>
            <strong className="font-semibold">MOCK DATA</strong>:{' '}
            {switcher ? 'demo workspace for a fictional company' : 'transitions shown are demo data'}. Nothing
            is connected to GitHub and AI steps are simulated.
          </span>
        </p>
        {switcher && (
          <label className="flex items-center gap-2">
            <span>View as</span>
            <select
              value={current}
              onChange={async (e) => {
                const s = await gateway.signInAsDemo!(e.target.value)
                navigate(homePathFor(s.role!, s.homeTransitionId ?? undefined))
              }}
              className="h-7 rounded-control border border-demo/40 bg-surface px-2 text-xs text-ink"
            >
              {gateway.demoAccounts!.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}, {a.roleLabel}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  )
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { session, gateway } = useAuth()
  const { persona } = usePersona()
  const navigate = useNavigate()
  const items = navFor(persona.role, session?.homeTransitionId ?? null)

  return (
    <div className="flex h-full flex-col gap-6 px-3 py-5">
      <div className="px-2">
        <NavLink to={persona.home} onClick={onNavigate} aria-label="Exit Brain home">
          <Logo size={28} />
        </NavLink>
        {session?.orgName && <p className="mt-3 truncate text-sm font-medium text-ink">{session.orgName}</p>}
      </div>

      <nav aria-label="Portal" className="flex flex-col gap-0.5">
        {items.map(({ to, label, Icon, end, group }) => [
          group && (
            <p
              key={`${to}-g`}
              className="mt-4 mb-1 px-2.5 text-[11px] font-semibold tracking-wide text-muted uppercase"
            >
              {group}
            </p>
          ),
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-control px-2.5 py-2 text-sm transition-colors duration-150 ${
                isActive
                  ? 'bg-brand-soft font-medium text-brand'
                  : 'text-muted hover:bg-surface-sunken hover:text-ink'
              }`
            }
          >
            <Icon aria-hidden size={17} strokeWidth={1.75} />
            {label}
          </NavLink>,
        ])}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-line px-2 pt-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{persona.name}</p>
          <p className="truncate text-xs text-muted">{persona.label}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={async () => {
              await gateway.signOut()
              navigate('/signin')
            }}
            className="inline-flex items-center gap-1.5 rounded-control px-2 py-1.5 text-sm text-muted hover:bg-surface-sunken hover:text-ink"
          >
            <LogOut aria-hidden size={15} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

/** The signed-in portal: role-specific sidebar on desktop, drawer on small screens. */
export function AppLayout() {
  // The drawer belongs to the page it was opened on, so navigating closes it without an effect.
  const { pathname } = useLocation()
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const setOpen = (v: boolean) => setOpenOn(v ? pathname : null)

  return (
    // App shell is viewport-height: demo bar + sidebar stay put, only the content column scrolls.
    <div className="flex h-svh flex-col">
      <DemoBar />
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-62 shrink-0 overflow-y-auto border-r border-line bg-surface lg:block">
          <Sidebar />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-2.5 lg:hidden">
            <Logo size={24} />
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="rounded-control p-2 text-muted hover:text-ink"
            >
              <Menu aria-hidden size={20} />
            </button>
          </header>

          {open && (
            <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
              <button
                type="button"
                aria-label="Close menu"
                className="absolute inset-0 bg-[var(--eb-overlay)]"
                onClick={() => setOpen(false)}
              />
              <div className="eb-enter absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-surface shadow-float">
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-3 rounded-control p-1.5 text-muted hover:text-ink"
                >
                  <X aria-hidden size={18} />
                </button>
                <Sidebar onNavigate={() => setOpen(false)} />
              </div>
            </div>
          )}

          <main
            id="main"
            className={`mx-auto w-full flex-1 px-4 py-8 sm:px-6 lg:px-10 ${pathname.startsWith('/app/admin') ? 'max-w-7xl' : 'max-w-6xl'}`}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
