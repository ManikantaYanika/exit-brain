import {
  CheckCircle2,
  Cpu,
  Database,
  GitBranch,
  Lock,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  Webhook,
  XCircle,
} from 'lucide-react'
import { useMemo } from 'react'
import {
  useInstallation,
  useJobs,
  useRepos,
  useSetRepoSelected,
  useSyncRepo,
  useWebhooks,
} from '../../data/admin/hooks'
import type { Repo } from '../../data/admin/types'
import { Button } from '../../design/primitives/Button'
import { useToast } from '../../design/primitives/Toast'
import { SkeletonRows } from '../../design/states/States'
import { usePersona } from '../../app/persona'
import { can } from '../../domain/permissions'
import { FlowDiagram, Meter } from './charts'
import { dateLabel, fmt, timeAgo, useNow } from './lib'
import { AdminHeader, Card, Pill, Progress, TableWrap, Td, Th, Toggle } from './ui'

const STATUS: Record<Repo['status'], { label: string; tone: 'good' | 'info' | 'bad' | 'muted' }> = {
  healthy: { label: 'Healthy', tone: 'good' },
  syncing: { label: 'Syncing', tone: 'info' },
  error: { label: 'Error', tone: 'bad' },
  not_selected: { label: 'Not read', tone: 'muted' },
}

const LATER = [
  { name: 'Slack', note: 'Deferred: needs Marketplace approval for usable rate limits.' },
  { name: 'Jira', note: 'Planned after the MVP.' },
  { name: 'Google Drive', note: 'Planned after the MVP.' },
]

export function IntegrationsPage() {
  const { persona } = usePersona()
  const now = useNow()
  const toast = useToast()
  const { data: inst } = useInstallation()
  const { data: repos } = useRepos()
  const { data: hooks } = useWebhooks()
  const { data: jobs } = useJobs()
  const select = useSetRepoSelected()
  const sync = useSyncRepo()
  const manage = can(persona.role, 'integrations.manage')

  const syncing = useMemo(
    () =>
      new Map(
        (jobs ?? [])
          .filter((j) => j.type === 'GitHub sync' && (j.status === 'running' || j.status === 'queued'))
          .map((j) => [j.target, j]),
      ),
    [jobs],
  )
  const active = [
    (hooks ?? []).some((h) => now - new Date(h.at).getTime() < 15 * 60_000) ? 0 : -1,
    syncing.size ? 1 : -1,
    syncing.size ? 2 : -1,
    syncing.size ? 3 : -1,
    4,
  ].filter((i) => i >= 0)

  if (!inst || !repos) return <SkeletonRows rows={4} label="Loading integrations" />
  const selected = repos.filter((r) => r.selected)

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Integrations"
        description="Exit Brain reads only the GitHub repositories you select, with read-only permissions. It never writes to GitHub."
      />

      <Card title="How data moves" note="Live: the connectors light up while webhooks and syncs are running">
        <FlowDiagram
          label="Data flow from GitHub to the portal"
          activeEdges={active}
          nodes={[
            {
              key: 'gh',
              title: 'GitHub App',
              detail: 'Read-only, selected repos',
              icon: <GitBranch aria-hidden size={16} />,
            },
            {
              key: 'wh',
              title: 'Webhook',
              detail: 'HMAC signature checked first',
              icon: <Webhook aria-hidden size={16} />,
              tone: hooks?.some((h) => h.status === 'rejected') ? 'warn' : 'good',
            },
            {
              key: 'q',
              title: 'Job queue',
              detail: `${syncing.size} sync ${syncing.size === 1 ? 'job' : 'jobs'} active`,
              icon: <RefreshCw aria-hidden size={16} />,
            },
            {
              key: 'fn',
              title: 'Edge Functions',
              detail: 'Short-lived tokens, never stored',
              icon: <Cpu aria-hidden size={16} />,
            },
            {
              key: 'db',
              title: 'Postgres + RLS',
              detail: 'Excerpts only, per workspace',
              icon: <Database aria-hidden size={16} />,
              tone: 'good',
            },
            {
              key: 'ui',
              title: 'Portals',
              detail: 'Each role sees what it needs',
              icon: <MonitorSmartphone aria-hidden size={16} />,
            },
          ]}
        />
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card
          title={
            <span className="flex items-center gap-2">
              <GitBranch aria-hidden size={18} /> GitHub
            </span>
          }
          actions={
            <Pill tone={inst.status === 'connected' ? 'good' : 'bad'}>
              {inst.status === 'connected' ? 'Connected' : inst.status}
            </Pill>
          }
        >
          <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
            <dt className="text-muted">Installed on</dt>
            <dd>{inst.account}</dd>
            <dt className="text-muted">Installed by</dt>
            <dd>
              {inst.installedBy}, {dateLabel(inst.installedAt)}
            </dd>
            <dt className="text-muted">Repositories</dt>
            <dd>
              {selected.length} of {repos.length} selected
            </dd>
          </dl>
          <p className="mt-4 mb-2 text-sm font-medium">Permissions</p>
          <ul className="flex flex-wrap gap-1.5">
            {inst.permissions.map((p) => (
              <li key={p.name}>
                <Pill tone="info">
                  <Lock aria-hidden size={11} /> {p.name}: read
                </Pill>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <Meter
              label="GitHub API calls left this hour"
              value={inst.rateLimitRemaining}
              max={inst.rateLimit}
              format={(v) => fmt.format(v)}
              invert
            />
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs text-muted">
            <ShieldCheck aria-hidden size={14} className="mt-0.5 shrink-0 text-supported" />
            No write permission is requested, so Exit Brain can’t push code, comment or change settings.
          </p>
        </Card>

        <Card title="Recent webhook deliveries" note="Rejected deliveries are dropped before any processing">
          <ul className="flex flex-col divide-y divide-line">
            {(hooks ?? []).map((h) => (
              <li key={h.id} className="flex items-center gap-3 py-2.5 text-sm first:pt-0 last:pb-0">
                {h.signatureValid ? (
                  <CheckCircle2 aria-label="Signature valid" size={16} className="shrink-0 text-supported" />
                ) : (
                  <XCircle aria-label="Signature invalid" size={16} className="shrink-0 text-conflicting" />
                )}
                <span className="font-mono text-xs">{h.event}</span>
                <span className="ml-auto text-xs text-muted tabular-nums">{h.ms} ms</span>
                <Pill tone={h.status === 'processed' ? 'good' : 'bad'}>
                  {h.status === 'processed' ? 'Processed' : 'Rejected'}
                </Pill>
                <span className="w-24 text-right text-xs text-muted">{timeAgo(h.at, now)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card
        title="Repositories"
        note="Turn a repository on to let Exit Brain read it. Turning it off stops reading; delete its data in Data & privacy."
      >
        <TableWrap caption="GitHub repositories">
          <thead className="border-b border-line">
            <tr>
              <Th>Repository</Th>
              <Th className="hidden md:table-cell">Language</Th>
              <Th>Status</Th>
              <Th className="hidden md:table-cell">Last sync</Th>
              <Th className="hidden text-right lg:table-cell">Records</Th>
              <Th>Read</Th>
              <Th className="text-right">Sync</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {repos.map((r) => {
              const job = syncing.get(r.fullName)
              return (
                <tr key={r.id} className="hover:bg-surface-sunken">
                  <Td>
                    <span className="font-mono text-xs">{r.fullName}</span>
                    {job && (
                      <div className="mt-1.5 w-40">
                        <Progress
                          value={job.status === 'queued' ? 0 : job.progress}
                          live={job.status === 'running'}
                          label={`Sync of ${r.fullName}`}
                        />
                      </div>
                    )}
                  </Td>
                  <Td className="hidden text-muted md:table-cell">{r.language}</Td>
                  <Td>
                    <Pill tone={job ? 'info' : STATUS[r.status].tone}>
                      {job
                        ? job.status === 'queued'
                          ? 'Queued'
                          : `Syncing ${job.progress}%`
                        : STATUS[r.status].label}
                    </Pill>
                    {r.errors24h > 0 && (
                      <span className="ml-2 text-xs text-conflicting">{r.errors24h} errors</span>
                    )}
                  </Td>
                  <Td className="hidden text-muted md:table-cell">{timeAgo(r.lastSyncAt, now)}</Td>
                  <Td className="hidden text-right tabular-nums lg:table-cell">{fmt.format(r.records)}</Td>
                  <Td>
                    <Toggle
                      label={`Read ${r.fullName}`}
                      hideLabel
                      checked={r.selected}
                      disabled={!manage || (select.isPending && select.variables?.id === r.id)}
                      onChange={(v) =>
                        select.mutate(
                          { id: r.id, selected: v },
                          {
                            onSuccess: () =>
                              toast(
                                v
                                  ? `${r.fullName} added. First sync queued.`
                                  : `${r.fullName} is no longer read.`,
                              ),
                          },
                        )
                      }
                    />
                  </Td>
                  <Td className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={
                        <RefreshCw
                          aria-hidden
                          size={14}
                          className={
                            job?.status === 'running' ? 'animate-spin motion-reduce:animate-none' : ''
                          }
                        />
                      }
                      disabled={!r.selected || !manage || !!job}
                      onClick={() =>
                        sync.mutate(r.id, {
                          onSuccess: (j) => toast(`Sync queued for ${r.fullName} (${j.id}).`),
                          onError: (e) => toast(e.message, 'error'),
                        })
                      }
                    >
                      Sync now
                    </Button>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </TableWrap>
      </Card>

      <Card title="More sources" note="Not part of the MVP. Shown so you know what’s planned.">
        <ul className="grid gap-3 md:grid-cols-3">
          {LATER.map((l) => (
            <li
              key={l.name}
              className="flex flex-col gap-1 rounded-panel border border-dashed border-line-strong p-4"
            >
              <span className="flex items-center justify-between">
                <span className="font-medium">{l.name}</span>
                <Pill>Later</Pill>
              </span>
              <span className="text-xs text-muted">{l.note}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
