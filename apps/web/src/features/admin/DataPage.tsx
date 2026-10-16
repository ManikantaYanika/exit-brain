import { Ban, Check, Clock, FileX2, ShieldCheck, Trash2, X } from 'lucide-react'
import { useId, useState } from 'react'
import { usePersona } from '../../app/persona'
import {
  useCancelDeletion,
  useDeletions,
  useInventory,
  useRepos,
  useRequestDeletion,
  useSettings,
  useUpdateSettings,
} from '../../data/admin/hooks'
import type { DeletionScope, WorkspaceSettings } from '../../data/admin/types'
import { useTransitions } from '../../data/hooks'
import { Button } from '../../design/primitives/Button'
import { Dialog } from '../../design/primitives/Dialog'
import { useToast } from '../../design/primitives/Toast'
import { SkeletonRows } from '../../design/states/States'
import { can } from '../../domain/permissions'
import { Donut } from './charts'
import { fmt, selectCls, timeAgo, useNow } from './lib'
import { AdminHeader, Card, ConfirmDialog, Pill, Progress, TableWrap, Td, Th } from './ui'

const STORED = [
  'Commit messages, pull request and issue titles',
  'Shortened descriptions and file paths',
  'Interview answers, after the engineer approves them',
  'Handover versions and who approved them',
]
const NOT_STORED = [
  'Source code or file contents',
  'GitHub tokens (short-lived, never saved)',
  'Performance scores of any kind',
  'Answer text in the audit log',
]
const PRESETS = [30, 60, 90, 180, 365]

function RetentionCard() {
  const { data: settings } = useSettings()
  if (!settings) return <SkeletonRows rows={2} label="Loading retention" />
  return <RetentionForm settings={settings} />
}

function RetentionForm({ settings }: { settings: WorkspaceSettings }) {
  const update = useUpdateSettings()
  const toast = useToast()
  const [days, setDays] = useState(settings.retentionDays)
  const [confirm, setConfirm] = useState(false)
  const id = useId()
  const changed = days !== settings.retentionDays
  const shorter = days < settings.retentionDays
  return (
    <Card
      title="Retention"
      note="How long data from a completed handover is kept before it is deleted automatically"
    >
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight tabular-nums">{days}</span>
        <span className="text-muted">days after a handover is completed</span>
      </div>
      <label htmlFor={id} className="sr-only">
        Retention in days
      </label>
      <input
        id={id}
        type="range"
        min={30}
        max={365}
        step={5}
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
        className="mt-4 w-full accent-[var(--eb-brand)]"
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={days === p}
            onClick={() => setDays(p)}
            className={`rounded-full border px-2.5 py-0.5 text-xs ${days === p ? 'border-brand bg-brand-soft text-brand' : 'border-line text-muted hover:border-line-strong'}`}
          >
            {p} days
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">
        Evidence, answers and AI records are deleted; the approved handover stays with the successor until you
        delete the transition. Each deletion is logged.
      </p>
      <div className="mt-4 flex gap-2">
        <Button
          variant="primary"
          disabled={!changed}
          loading={update.isPending}
          onClick={() =>
            shorter
              ? setConfirm(true)
              : update.mutate(
                  { retentionDays: days },
                  { onSuccess: () => toast(`Retention set to ${days} days.`) },
                )
          }
        >
          Save
        </Button>
        {changed && <Button onClick={() => setDays(settings.retentionDays)}>Reset</Button>}
      </div>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title={`Shorten retention to ${days} days?`}
        description="Completed handovers older than this will be deleted at the next nightly cleanup. This can’t be undone."
        confirmLabel="Shorten retention"
        onConfirm={() => {
          update.mutate({ retentionDays: days }, { onSuccess: () => toast(`Retention set to ${days} days.`) })
          setConfirm(false)
        }}
      />
    </Card>
  )
}

function DeletionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [scope, setScope] = useState<DeletionScope>('GitHub data for one repository')
  const [target, setTarget] = useState('')
  const [typed, setTyped] = useState('')
  const { data: repos } = useRepos()
  const { data: transitions } = useTransitions()
  const request = useRequestDeletion()
  const toast = useToast()
  const options =
    scope === 'GitHub data for one repository'
      ? (repos ?? []).map((r) => r.fullName)
      : scope === 'One transition'
        ? (transitions ?? []).map((t) => `${t.employee.name} (${t.id})`)
        : ['Everything ingested from GitHub']
  const chosen = target || options[0] || ''
  const close = () => {
    setTarget('')
    setTyped('')
    onClose()
  }
  return (
    <Dialog
      open={open}
      onClose={close}
      title="Request data deletion"
      description="Deletion runs in the background and can’t be undone once it starts. Audit entries are kept."
      footer={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button
            variant="danger"
            icon={<Trash2 aria-hidden size={15} />}
            disabled={typed !== 'DELETE'}
            loading={request.isPending}
            onClick={() =>
              request.mutate(
                { scope, target: chosen },
                {
                  onSuccess: (d) => {
                    toast(`Deletion ${d.id} scheduled: ${d.target}.`)
                    close()
                  },
                  onError: (e) => toast(e.message, 'error'),
                },
              )
            }
          >
            Delete data
          </Button>
        </>
      }
    >
      <label className="flex flex-col gap-1 text-sm">
        What to delete
        <select
          className={selectCls}
          value={scope}
          onChange={(e) => {
            setScope(e.target.value as DeletionScope)
            setTarget('')
          }}
        >
          <option>GitHub data for one repository</option>
          <option>One transition</option>
          <option>All ingested data</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Which
        <select className={selectCls} value={chosen} onChange={(e) => setTarget(e.target.value)}>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>
          Type <strong className="font-mono">DELETE</strong> to confirm
        </span>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          className="h-9 rounded-control border border-line-strong bg-surface px-3 font-mono text-sm"
        />
      </label>
    </Dialog>
  )
}

export function DataPage() {
  const { persona } = usePersona()
  const now = useNow(5000)
  const toast = useToast()
  const { data: inventory } = useInventory()
  const { data: deletions } = useDeletions()
  const cancel = useCancelDeletion()
  const [asking, setAsking] = useState(false)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const colors = [
    'var(--eb-brand)',
    'var(--eb-supported)',
    'var(--eb-partial)',
    'var(--eb-brand-2)',
    'var(--eb-spark)',
    'var(--eb-muted)',
    'var(--eb-conflicting)',
  ]

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Data & privacy"
        description="What Exit Brain keeps, for how long, and how to delete it. Data is used only for knowledge transfer, never to evaluate people."
        actions={
          can(persona.role, 'data.requestDeletion') && (
            <Button variant="danger" icon={<Trash2 aria-hidden size={15} />} onClick={() => setAsking(true)}>
              Request deletion
            </Button>
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="What we keep, and what we don’t">
          <div className="grid gap-5 sm:grid-cols-2">
            <ul className="flex flex-col gap-2 text-sm">
              {STORED.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <Check aria-hidden size={16} className="mt-0.5 shrink-0 text-supported" /> {s}
                </li>
              ))}
            </ul>
            <ul className="flex flex-col gap-2 text-sm">
              {NOT_STORED.map((s) => (
                <li key={s} className="flex items-start gap-2 text-muted">
                  <X aria-hidden size={16} className="mt-0.5 shrink-0 text-conflicting" /> {s}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-control bg-surface-sunken p-3 text-xs text-muted">
            <ShieldCheck aria-hidden size={14} className="mt-0.5 shrink-0 text-supported" />
            Each workspace is isolated by row-level security in the database. Only excerpts and answers go to
            the AI provider; the provider will be named here once chosen.
          </p>
        </Card>
        <RetentionCard />
      </div>

      <Card title="Data inventory" note="Everything stored for this workspace, by kind">
        {!inventory ? (
          <SkeletonRows rows={3} label="Loading inventory" />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start">
            <Donut
              items={inventory.map((r, i) => ({
                label: r.kind,
                value: Math.round(r.sizeMb * 10) / 10,
                color: colors[i % colors.length]!,
              }))}
              label="Storage by kind of data, in MB"
              center={`${inventory.reduce((s, r) => s + r.sizeMb, 0).toFixed(1)} MB`}
            />
            <TableWrap caption="Data inventory">
              <thead className="border-b border-line">
                <tr>
                  <Th>Kind</Th>
                  <Th className="hidden md:table-cell">What it is</Th>
                  <Th className="text-right">Records</Th>
                  <Th className="text-right">Size</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {inventory.map((r) => (
                  <tr key={r.kind}>
                    <Td className="font-medium">{r.kind}</Td>
                    <Td className="hidden text-muted md:table-cell">{r.description}</Td>
                    <Td className="text-right tabular-nums">{fmt.format(r.records)}</Td>
                    <Td className="text-right tabular-nums">{r.sizeMb.toFixed(1)} MB</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        )}
      </Card>

      <Card title="Deletion requests" note="Retention cleanups and manual requests. Progress updates live.">
        {!deletions ? (
          <SkeletonRows rows={2} label="Loading deletions" />
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {deletions.map((d) => (
              <li
                key={d.id}
                className="grid gap-2 py-3 first:pt-0 last:pb-0 md:grid-cols-[1fr_14rem_auto] md:items-center"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${d.status === 'completed' ? 'bg-supported-soft text-supported' : d.status === 'cancelled' ? 'bg-surface-sunken text-muted' : 'bg-conflicting-soft text-conflicting'}`}
                  >
                    {d.status === 'scheduled' ? (
                      <Clock aria-hidden size={15} />
                    ) : d.status === 'cancelled' ? (
                      <Ban aria-hidden size={15} />
                    ) : (
                      <FileX2 aria-hidden size={15} />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{d.target}</p>
                    <p className="text-xs text-muted">
                      {d.scope} · {d.requestedBy} · {timeAgo(d.requestedAt, now)} ·{' '}
                      <span className="font-mono">{d.id}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {d.status === 'running' || d.status === 'completed' ? (
                    <>
                      <Progress
                        value={d.progress}
                        live={d.status === 'running'}
                        tone={d.status === 'completed' ? 'good' : 'bad'}
                        label={`Deletion ${d.id}`}
                      />
                      <span className="w-20 text-right text-xs text-muted tabular-nums">
                        {fmt.format(d.recordsDeleted)} rec.
                      </span>
                    </>
                  ) : (
                    <Pill tone={d.status === 'scheduled' ? 'warn' : 'muted'}>
                      {d.status === 'scheduled' ? 'Scheduled' : 'Cancelled'}
                    </Pill>
                  )}
                </div>
                <div className="md:text-right">
                  {d.status === 'scheduled' && can(persona.role, 'data.requestDeletion') && (
                    <Button size="sm" variant="ghost" onClick={() => setCancelling(d.id)}>
                      Cancel
                    </Button>
                  )}
                  {d.status === 'completed' && <Pill tone="good">Done</Pill>}
                  {d.status === 'running' && <Pill tone="bad">Deleting</Pill>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <DeletionDialog open={asking} onClose={() => setAsking(false)} />
      <ConfirmDialog
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        danger={false}
        title="Cancel this deletion?"
        description="The data stays until the next retention cleanup or a new request."
        confirmLabel="Cancel deletion"
        onConfirm={() => {
          if (cancelling)
            cancel.mutate(cancelling, {
              onSuccess: () => toast('Deletion cancelled.'),
              onError: (e) => toast(e.message, 'error'),
            })
          setCancelling(null)
        }}
      />
    </div>
  )
}
