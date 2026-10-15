import { NavLink, Outlet, useParams } from 'react-router'
import { EvidenceProvider } from '../../components/evidence/EvidenceContext'
import { EvidencePanel } from '../../components/evidence/EvidencePanel'
import { TransitionStatusText } from '../../design/primitives/status'
import { useEvidence, useTransition } from '../../data/hooks'

const tabs = [
  { to: '', label: 'Knowledge areas' },
  { to: 'answers', label: 'Answers and verification' },
  { to: 'handover', label: 'Handover document' },
]

export function TransitionPage() {
  const { id = '' } = useParams()
  const { data: t, isError } = useTransition(id)
  const { data: evidence = [] } = useEvidence(id)

  if (isError)
    return <p className="text-conflicting">This transition doesn’t exist or you don’t have access to it.</p>
  if (!t) return <p className="text-muted">Loading…</p>

  const lastDay = new Date(`${t.lastWorkingDay}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <EvidenceProvider evidence={evidence}>
      <header className="max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight">{t.employee.name}’s handover</h1>
        <p className="mt-2 text-muted">
          {t.employee.title}. Last working day {lastDay}.{' '}
          {t.successor ? `${t.successor.name} takes over.` : 'No successor assigned yet.'}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <TransitionStatusText status={t.status} />
          <span className="text-muted">
            {t.evidenceCount} records read from{' '}
            {t.repos.map((r, i) => (
              <span key={r}>
                <span className="font-mono text-ink">{r}</span>
                {i < t.repos.length - 1 ? ', ' : ''}
              </span>
            ))}
          </span>
        </div>
      </header>

      <nav aria-label="Transition sections" className="mt-6 flex gap-1 border-b border-line">
        {tabs.map((tab) => (
          <NavLink
            key={tab.label}
            to={tab.to}
            end
            className={({ isActive }) =>
              `-mb-px border-b-2 px-3 py-2 text-sm ${isActive ? 'border-brand font-medium text-ink' : 'border-transparent text-muted hover:text-ink'}`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <Outlet />
        </div>
        <div className="lg:sticky lg:top-6 lg:self-start">
          <EvidencePanel />
        </div>
      </div>
    </EvidenceProvider>
  )
}
