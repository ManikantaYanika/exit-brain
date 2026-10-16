import { Ban, Play, RotateCw } from 'lucide-react'
import { useState } from 'react'
import { useCancelJob, useHealth, useJobs, useRetryJob, useStartJob } from '../../data/admin/hooks'
import type { Job, JobStatus, JobType } from '../../data/admin/types'
import { Button } from '../../design/primitives/Button'
import { Dialog } from '../../design/primitives/Dialog'
import { useToast } from '../../design/primitives/Toast'
import { SkeletonRows } from '../../design/states/States'
import { BarChart, Donut, LineChart, Sparkline } from './charts'
import { fmt, selectCls, timeAgo, useNow } from './lib'
import { AdminHeader, Card, Pill, Progress, Stat, TableWrap, Tabs, Td, Th } from './ui'

const TONE: Record<JobStatus, 'info' | 'muted' | 'good' | 'bad'> = {
  running: 'info',
  queued: 'muted',
  succeeded: 'good',
  failed: 'bad',
  cancelled: 'muted',
}
const LABEL: Record<JobStatus, string> = {
  running: 'Running',
  queued: 'Queued',
  succeeded: 'Succeeded',
  failed: 'Failed',
  cancelled: 'Cancelled',
}
const RUNNABLE: JobType[] = [
  'Retention cleanup',
  'Answer verification',
  'Handover draft',
  'Knowledge analysis',
]
const day = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

function duration(j: Job, now: number) {
  if (!j.startedAt) return '—'
  const s = Math.round(
    ((j.finishedAt ? new Date(j.finishedAt).getTime() : now) - new Date(j.startedAt).getTime()) / 1000,
  )
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${Math.max(1, s)}s`
}

function RunJobDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [type, setType] = useState<JobType>('Retention cleanup')
  const [target, setTarget] = useState('Workspace')
  const start = useStartJob()
  const toast = useToast()
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Run a job now"
      description="Jobs normally run on a schedule. Running one now adds it to the queue."
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            icon={<Play aria-hidden size={15} />}
            loading={start.isPending}
            onClick={() =>
              start.mutate(
                { type, target },
                {
                  onSuccess: (j) => {
                    toast(`${j.type} queued as ${j.id}.`)
                    onClose()
                  },
                },
              )
            }
          >
            Queue job
          </Button>
        </>
      }
    >
      <label className="flex flex-col gap-1 text-sm">
        Job
        <select className={selectCls} value={type} onChange={(e) => setType(e.target.value as JobType)}>
          {RUNNABLE.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Target
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="h-9 rounded-control border border-line-strong bg-surface px-3 text-sm"
        />
      </label>
    </Dialog>
  )
}

export function SystemPage() {
  const now = useNow(5000)
  const toast = useToast()
  const { data: jobs } = useJobs()
  const { data: health } = useHealth()
  const retry = useRetryJob()
  const cancel = useCancelJob()
  const [filter, setFilter] = useState<'active' | 'failed' | 'all'>('active')
  const [running, setRunning] = useState(false)

  if (!jobs || !health) return <SkeletonRows rows={4} label="Loading jobs" />
  const active = jobs.filter((j) => j.status === 'running' || j.status === 'queued')
  const failed = jobs.filter((j) => j.status === 'failed')
  const shown = filter === 'active' ? active : filter === 'failed' ? failed : jobs
  const last = health.at(-1)!
  const series = health as unknown as Record<string, string | number>[]
  const byType = Object.entries(
    jobs.reduce<Record<string, number>>((m, j) => ({ ...m, [j.type]: (m[j.type] ?? 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1])
  const colors = [
    'var(--eb-brand)',
    'var(--eb-supported)',
    'var(--eb-partial)',
    'var(--eb-brand-2)',
    'var(--eb-spark)',
    'var(--eb-conflicting)',
    'var(--eb-muted)',
  ]

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        live
        title="Jobs & health"
        description="Background work that reads GitHub, analyses it, verifies answers and enforces retention, and how the system is holding up."
        actions={
          <Button icon={<Play aria-hidden size={15} />} onClick={() => setRunning(true)}>
            Run a job
          </Button>
        }
      />

      <div className="eb-stagger grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          label="Running now"
          value={jobs.filter((j) => j.status === 'running').length}
          hint={`${jobs.filter((j) => j.status === 'queued').length} queued`}
        />
        <Stat
          label="Failed"
          value={failed.length}
          tone={failed.length ? 'bad' : 'good'}
          hint="Retried up to 3 times"
        />
        <Stat
          label="API latency (p95)"
          value={last.p95Ms}
          format={(v) => `${Math.round(v)} ms`}
          tone={last.p95Ms > 400 ? 'bad' : 'good'}
          hint="Goal: under 400 ms"
          spark={
            <Sparkline values={health.slice(-14).map((h) => h.p95Ms)} label="p95 latency, last 14 days" />
          }
        />
        <Stat
          label="Error rate"
          value={last.errorRatePct}
          format={(v) => `${v.toFixed(2)}%`}
          tone={last.errorRatePct > 1 ? 'bad' : 'good'}
          hint="Limit: 1%"
          spark={
            <Sparkline
              values={health.slice(-14).map((h) => h.errorRatePct)}
              tone="bad"
              label="Error rate, last 14 days"
            />
          }
        />
      </div>

      <Card
        title="Job queue"
        note="Updates live. Three jobs run at a time; the rest wait."
        actions={
          <Tabs
            label="Job filter"
            value={filter}
            onChange={setFilter}
            items={[
              { value: 'active', label: 'Active', count: active.length },
              { value: 'failed', label: 'Failed', count: failed.length },
              { value: 'all', label: 'All', count: jobs.length },
            ]}
          />
        }
      >
        <TableWrap caption="Jobs">
          <thead className="border-b border-line">
            <tr>
              <Th>Job</Th>
              <Th>Target</Th>
              <Th>Status</Th>
              <Th className="w-48">Progress</Th>
              <Th className="hidden md:table-cell">Created</Th>
              <Th className="hidden md:table-cell">Duration</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.slice(0, 25).map((j) => (
              <tr key={j.id} className="hover:bg-surface-sunken">
                <Td>
                  <span className="block font-medium">{j.type}</span>
                  <span className="font-mono text-xs text-muted">{j.id}</span>
                </Td>
                <Td className="max-w-48 truncate font-mono text-xs">{j.target}</Td>
                <Td>
                  <Pill tone={TONE[j.status]}>{LABEL[j.status]}</Pill>
                  {j.attempts > 1 && <span className="ml-1.5 text-xs text-muted">try {j.attempts}</span>}
                </Td>
                <Td>
                  {j.status === 'failed' ? (
                    <span className="text-xs text-conflicting">{j.error}</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Progress
                        value={j.progress}
                        live={j.status === 'running'}
                        tone={j.status === 'succeeded' ? 'good' : 'brand'}
                        label={`${j.id} progress`}
                      />
                      <span className="w-9 text-right text-xs text-muted tabular-nums">{j.progress}%</span>
                    </span>
                  )}
                </Td>
                <Td className="hidden text-muted md:table-cell">{timeAgo(j.createdAt, now)}</Td>
                <Td className="hidden text-muted tabular-nums md:table-cell">{duration(j, now)}</Td>
                <Td className="text-right whitespace-nowrap">
                  {j.status === 'failed' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<RotateCw aria-hidden size={14} />}
                      loading={retry.isPending && retry.variables === j.id}
                      onClick={() => retry.mutate(j.id, { onSuccess: () => toast(`${j.id} queued again.`) })}
                    >
                      Retry
                    </Button>
                  )}
                  {(j.status === 'queued' || j.status === 'running') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Ban aria-hidden size={14} />}
                      loading={cancel.isPending && cancel.variables === j.id}
                      onClick={() => cancel.mutate(j.id, { onSuccess: () => toast(`${j.id} cancelled.`) })}
                    >
                      Cancel
                    </Button>
                  )}
                </Td>
              </tr>
            ))}
            {!shown.length && (
              <tr>
                <Td className="py-8 text-center text-muted">
                  {filter === 'failed' ? 'No failed jobs.' : 'Nothing in the queue.'}
                </Td>
              </tr>
            )}
          </tbody>
        </TableWrap>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="API latency (p95)" note="Milliseconds, last 30 days. Dashed line: 400 ms goal.">
          <LineChart
            data={series}
            x="day"
            series={[{ key: 'p95Ms', label: 'p95', color: 'var(--eb-brand)' }]}
            goal={{ value: 400, label: 'Goal' }}
            format={(v) => `${Math.round(v)}`}
            xLabel={day}
            label="API p95 latency over 30 days"
          />
        </Card>
        <Card title="Queue depth" note="Jobs waiting at the daily peak">
          <BarChart
            data={series.slice(-14)}
            x="day"
            series={[{ key: 'queueDepth', label: 'Waiting', color: 'var(--eb-brand-2)' }]}
            xLabel={(d) => day(d).split(' ')[0]!}
            label="Job queue depth, last 14 days"
          />
        </Card>
        <Card title="Error rate" note="% of requests failing per day. Dashed line: 1% limit.">
          <LineChart
            data={series}
            x="day"
            series={[{ key: 'errorRatePct', label: 'Error rate', color: 'var(--eb-conflicting)' }]}
            goal={{ value: 1, label: 'Limit' }}
            format={(v) => `${v.toFixed(1)}%`}
            xLabel={day}
            label="Error rate over 30 days"
          />
        </Card>
        <Card title="Jobs by type" note="Recent jobs in the queue history">
          <Donut
            items={byType.map(([label, value], i) => ({ label, value, color: colors[i % colors.length]! }))}
            label="Jobs by type"
            center={fmt.format(jobs.length)}
          />
        </Card>
      </div>
      <RunJobDialog open={running} onClose={() => setRunning(false)} />
    </div>
  )
}
