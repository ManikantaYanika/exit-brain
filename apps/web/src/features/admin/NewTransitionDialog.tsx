import { Check, GitBranch, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAdminApi } from '../../data/admin/AdminApiProvider'
import { useMembers, useRepos } from '../../data/admin/hooks'
import { useCreateTransition } from '../../data/hooks'
import { Button } from '../../design/primitives/Button'
import { Dialog } from '../../design/primitives/Dialog'
import { useToast } from '../../design/primitives/Toast'
import { selectCls } from './lib'

const STEPS = ['Who is leaving', 'Successor and date', 'Repositories', 'Review']
const today = () => new Date().toISOString().slice(0, 10)

/** Four-step wizard that starts a transition and queues read-only GitHub ingestion. */
export function NewTransitionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '',
    title: '',
    login: '',
    successorId: '',
    day: '',
    repos: [] as string[],
  })
  const [error, setError] = useState<string | null>(null)
  const { data: members } = useMembers()
  const { data: repos } = useRepos()
  const create = useCreateTransition()
  const admin = useAdminApi()
  const toast = useToast()
  const navigate = useNavigate()
  const selectedRepos = repos?.filter((r) => r.selected) ?? []
  const successors = members?.filter((m) => m.status === 'active' && m.role !== 'viewer') ?? []

  const close = () => {
    setStep(0)
    setError(null)
    setForm({ name: '', title: '', login: '', successorId: '', day: '', repos: [] })
    onClose()
  }
  const valid = [
    form.name.trim().length > 1 && /^[a-z\d][a-z\d-]{0,38}$/i.test(form.login.trim()),
    !!form.day && form.day >= today(),
    form.repos.length > 0,
    true,
  ]
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))
  const input = 'h-9 w-full rounded-control border border-line-strong bg-surface px-3 text-sm'

  async function start() {
    setError(null)
    try {
      const t = await create.mutateAsync({
        employeeName: form.name,
        title: form.title,
        githubLogin: form.login,
        successorId: form.successorId || null,
        lastWorkingDay: form.day,
        repos: form.repos,
      })
      await Promise.all(form.repos.map((r) => admin.startJob({ type: 'GitHub sync', target: r })))
      await admin.startJob({ type: 'Knowledge analysis', target: t.employee.name })
      toast(`Transition started for ${t.employee.name}. Reading ${form.repos.length} repositories.`)
      close()
      navigate('/app/admin/system')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The transition couldn’t be started.')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Start a transition"
      description="Exit Brain will read the leaving engineer’s work in the repositories you choose. It never writes to GitHub."
      footer={
        <>
          {step > 0 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
          {step < 3 ? (
            <Button variant="primary" disabled={!valid[step]} onClick={() => setStep(step + 1)}>
              Continue
            </Button>
          ) : (
            <Button variant="primary" loading={create.isPending} onClick={() => void start()}>
              Start transition
            </Button>
          )}
        </>
      }
    >
      <ol className="flex items-center gap-1.5" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 flex-col gap-1">
            <span
              className={`h-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-brand' : 'bg-line'}`}
            />
            <span
              className={`text-[11px] ${i === step ? 'font-medium text-ink' : 'text-muted'}`}
              aria-current={i === step ? 'step' : undefined}
            >
              {s}
            </span>
          </li>
        ))}
      </ol>

      <div key={step} className="eb-enter flex flex-col gap-3">
        {step === 0 && (
          <>
            <label className="flex flex-col gap-1 text-sm">
              Full name
              <input className={input} value={form.name} onChange={set('name')} autoComplete="off" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Role or title <span className="text-xs text-muted">(optional)</span>
              <input className={input} value={form.title} onChange={set('title')} autoComplete="off" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              GitHub username
              <input
                className={`${input} font-mono`}
                value={form.login}
                onChange={set('login')}
                placeholder="ravi-k"
                autoComplete="off"
              />
            </label>
          </>
        )}
        {step === 1 && (
          <>
            <label className="flex flex-col gap-1 text-sm">
              Successor
              <select className={selectCls} value={form.successorId} onChange={set('successorId')}>
                <option value="">Assign later</option>
                {successors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} · {m.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Last working day
              <input type="date" className={input} min={today()} value={form.day} onChange={set('day')} />
            </label>
          </>
        )}
        {step === 2 && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm">
              Repositories to read (only those selected in Integrations)
            </legend>
            {selectedRepos.map((r) => (
              <label
                key={r.id}
                className="flex items-center gap-2.5 rounded-control border border-line px-3 py-2 text-sm hover:bg-surface-sunken"
              >
                <input
                  type="checkbox"
                  checked={form.repos.includes(r.fullName)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      repos: e.target.checked
                        ? [...f.repos, r.fullName]
                        : f.repos.filter((x) => x !== r.fullName),
                    }))
                  }
                />
                <GitBranch aria-hidden size={14} className="text-muted" />
                <span className="font-mono">{r.fullName}</span>
              </label>
            ))}
          </fieldset>
        )}
        {step === 3 && (
          <div className="flex flex-col gap-3 text-sm">
            <dl className="grid grid-cols-[8rem_1fr] gap-y-1.5">
              <dt className="text-muted">Leaving</dt>
              <dd>
                {form.name} {form.login && <span className="font-mono text-muted">@{form.login}</span>}
              </dd>
              <dt className="text-muted">Successor</dt>
              <dd>{successors.find((m) => m.id === form.successorId)?.name ?? 'Assign later'}</dd>
              <dt className="text-muted">Last day</dt>
              <dd>{form.day}</dd>
              <dt className="text-muted">Repositories</dt>
              <dd className="font-mono">{form.repos.join(', ')}</dd>
            </dl>
            <p className="flex items-start gap-2 rounded-control bg-surface-sunken p-3 text-xs text-muted">
              <ShieldCheck aria-hidden size={16} className="mt-0.5 shrink-0 text-supported" />
              Read-only. The leaving engineer sees why each question is asked and approves what is shared.
              Nothing here scores or evaluates them.
            </p>
            <ul className="flex flex-col gap-1 text-xs text-muted">
              {[
                'GitHub sync for each repository',
                'Knowledge analysis',
                'Manager review of suggested areas',
              ].map((x) => (
                <li key={x} className="flex items-center gap-1.5">
                  <Check aria-hidden size={13} className="text-brand" /> {x}
                </li>
              ))}
            </ul>
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm font-medium text-conflicting">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  )
}
