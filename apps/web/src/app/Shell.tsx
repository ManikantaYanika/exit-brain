import { NavLink, Outlet, useNavigate } from 'react-router'
import { Logo } from '../design/primitives/Logo'
import { ThemeToggle } from '../design/primitives/ThemeToggle'
import { usePersona } from './persona'
import { personas, type PersonaId } from './personas'

function navFor(role: string) {
  if (role === 'employee') return [{ to: '/interview/t-ravi', label: 'My handover interview' }]
  if (role === 'successor') return [{ to: '/successor/t-ravi', label: 'My onboarding' }]
  const items = [{ to: '/', label: 'Transitions' }]
  if (role === 'manager') items.push({ to: '/onboarding', label: 'Workspace setup' })
  return items
}

export function Shell() {
  const { persona, setPersona } = usePersona()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      <div
        role="note"
        className="border-b border-demo/30 bg-demo-soft px-4 py-1.5 text-center text-xs text-demo"
      >
        <strong className="font-semibold">MOCK DATA</strong>: demo workspace with a fictional company. Nothing
        is connected to GitHub, and AI steps are simulated.
      </div>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3">
          <NavLink to={persona.home} className="flex items-center gap-2 font-semibold tracking-tight">
            <Logo size={26} />
          </NavLink>
          <nav aria-label="Main" className="flex gap-1">
            {navFor(persona.role).map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm ${isActive ? 'bg-brand-soft font-medium text-brand' : 'text-muted hover:text-ink'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <label className="flex items-center gap-2 text-sm text-muted">
              Viewing as
              <select
                value={persona.id}
                onChange={(e) => {
                  const id = e.target.value as PersonaId
                  setPersona(id)
                  navigate(personas[id].home)
                }}
                className="h-8 rounded-control border border-line-strong bg-surface px-2 text-sm text-ink"
              >
                {Object.values(personas).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}, {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
