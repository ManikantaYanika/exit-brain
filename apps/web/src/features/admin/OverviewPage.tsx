import {
  Activity,
  AlertTriangle,
  CalendarClock,
  GitBranch,
  Plus,
  ShieldAlert,
  UserPlus,
  Users,
  Workflow,
  Zap,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { usePersona } from '../../app/persona'
import {
  useAudit,
  useHealth,
  useInvites,
  useJobs,
  useKnowledgeAreas,
  useNotifications,
  useRepos,
  useRetryJob,
  useWebhooks,
} from '../../data/admin/hooks'
import { useTransitions } from '../../data/hooks'
import { Button } from '../../design/primitives/Button'
import { useToast } from '../../design/primitives/Toast'
import { SkeletonRows } from '../../design/states/States'
import { Sparkline } from './charts'
import { describeAudit } from './describe'
import { dateLabel, timeAgo, useNow } from './lib'
import { NewTransitionDialog } from './NewTransitionDialog'
import { AdminHeader, Card, Pill, Progress, Stat } from './ui'
import { WorkflowFlow } from './WorkflowFlow'

const daysUntil = (iso: string, now: number) =>
  Math.ceil((new Date(`${iso}T23:59:59`).getTime() - now) / 86_400_000)

function greeting(now: number) {
  const h = new Date(now).getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

interface Attention {
  id: string
  tone: 'bad' | 'warn' | 'info'
  icon: ReactNode
  title: string
  body: string
  action: ReactNode
}

export function OverviewPage() {
  const { persona } = usePersona()
  const now = useNow()
  const navigate = useNavigate()
  const toast = useToast()
  const [creating, setCreating] = useState(false)
  const { data: transitions } = useTransitions()
  const { data: jobs } = useJobs()
  const { data: repos } = useRepos()
  const { data: areas } = useKnowledgeAreas()
  const { data: audit } = useAudit()
  const { data: notes } = useNotifications()
  const { data: health } = useHealth()
  const { data: invites } = useInvites()
  const { data: hooks } = useWebhooks()
  const retry = useRetryJob()
  // Events that arrive after the page opened are highlighted.
  const [openedAt] = useState(() => Date.now())

  if (!transitions || !jobs || !repos || !areas) return <SkeletonRows rows={3} label="Loading overview" />

  const active = transitions.filter((t) => t.status !== 'completed' && t.status !== 'cancelled')
  const upcoming = active
    .map((t) => ({ t, left: daysUntil(t.lastWorkingDay, now) }))
    .sort((a, b) => a.left - b.left)
  const openIds = new Set(active.map((t) => t.id))
  const highRisk = areas.filter(
    (a) => a.risk === 'high' && a.status !== 'rejected' && openIds.has(a.transitionId),
  )
  const running = jobs.filter((j) => j.status === 'running' || j.status === 'queued')
  const failed = jobs.filter((j) => j.status === 'failed')
  const unread = notes?.filter((n) => !n.read).length ?? 0

  const attention: Attention[] = [
    ...failed.map<Attention>((j) => ({
      id: j.id,
      tone: 'bad',
      icon: <Zap aria-hidden size={16} />,
      title: `${j.type} failed: ${j.target}`,
      body: j.error ?? 'The job stopped.',
      action: (
        <Button
          size="sm"
          loading={retry.isPending && retry.variables === j.id}
          onClick={() => retry.mutate(j.id, { onSuccess: () => toast(`${j.id} queued again.`) })}
        >
          Retry
        </Button>
      ),
    })),
    ...upcoming
      .filter(
        ({ t, left }) => left <= 35 && ['draft', 'ingesting', 'analysing', 'interviewing'].includes(t.status),
      )
      .map<Attention>(({ t, left }) => ({
        id: `due-${t.id}`,
        tone: left <= 14 ? 'bad' : 'warn',
        icon: <CalendarClock aria-hidden size={16} />,
        title: `${t.employee.name} leaves in ${left} days`,
        body: 'The handover isn’t verified yet. Interview time is running out.',
        action: (
          <Link to={`/app/transitions/${t.id}`} className="text-sm font-medium text-brand hover:underline">
            Open
          </Link>
        ),
      })),
    ...active
      .filter((t) => !t.successor)
      .map<Attention>((t) => ({
        id: `succ-${t.id}`,
        tone: 'warn',
        icon: <Users aria-hidden size={16} />,
        title: `No successor for ${t.employee.name}`,
        body: 'Assign one so they can start the checklist before the last day.',
        action: (
          <Link to={`/app/transitions/${t.id}`} className="text-sm font-medium text-brand hover:underline">
            Assign
          </Link>
        ),
      })),
    ...repos
      .filter((r) => r.status === 'error')
      .map<Attention>((r) => ({
        id: `repo-${r.id}`,
        tone: 'bad',
        icon: <GitBranch aria-hidden size={16} />,
        title: `${r.fullName} isn’t syncing`,
        body: `${r.errors24h} errors in the last 24 hours.`,
        action: (
          <Link to="/app/admin/integrations" className="text-sm font-medium text-brand hover:underline">
            Check
          </Link>
        ),
      })),
    ...(hooks?.some((h) => h.status === 'rejected')
      ? [
          {
            id: 'webhook',
            tone: 'warn' as const,
            icon: <ShieldAlert aria-hidden size={16} />,
            title: 'A webhook was rejected',
            body: 'Its signature didn’t match, so nothing was processed.',
            action: (
              <Link to="/app/admin/integrations" className="text-sm font-medium text-brand hover:underline">
                Review
              </Link>
            ),
          },
        ]
      : []),
    ...(invites ?? [])
      .filter((i) => new Date(i.expiresAt).getTime() - now < 3 * 86_400_000)
      .map<Attention>((i) => ({
        id: i.id,
        tone: 'info',
        icon: <UserPlus aria-hidden size={16} />,
        title: `Invite for ${i.email} expires soon`,
        body: `Sent by ${i.invitedBy} ${timeAgo(i.createdAt, now)}.`,
        action: (
          <Link to="/app/admin/people?tab=invites" className="text-sm font-medium text-brand hover:underline">
            Resend
          </Link>
        ),
      })),
  ]
  const toneCls = {
    bad: 'text-conflicting bg-conflicting-soft',
    warn: 'text-partial bg-partial-soft',
    info: 'text-brand bg-brand-soft',
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        live
        title={`${greeting(now)}, ${persona.firstName}`}
        description={`${active.length} transitions in progress${upcoming[0] ? `; the next last day is ${dateLabel(upcoming[0].t.lastWorkingDay)}` : ''}. ${attention.length ? `${attention.length} things need your attention.` : 'Nothing needs your attention.'}`}
        actions={
          <>
            <Button
              icon={<UserPlus aria-hidden size={16} />}
              onClick={() => navigate('/app/admin/people?invite=1')}
            >
              Invite people
            </Button>
            <Button variant="primary" icon={<Plus aria-hidden size={16} />} onClick={() => setCreating(true)}>
              New transition
            </Button>
          </>
        }
      />

      <div className="eb-stagger grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat
          label="Active transitions"
          value={active.length}
          hint={`${transitions.length} in total`}
          icon={<Workflow aria-hidden size={16} />}
        />
        <Stat
          label="Next last day"
          value={upcoming[0]?.left ?? 0}
          format={(v) => `${Math.round(v)} days`}
          tone={upcoming[0] && upcoming[0].left <= 30 ? 'warn' : undefined}
          hint={upcoming[0]?.t.employee.name ?? '—'}
          icon={<CalendarClock aria-hidden size={16} />}
        />
        <Stat
          label="High-risk areas open"
          value={highRisk.length}
          tone={highRisk.length ? 'bad' : 'good'}
          hint="Held mostly by one person"
          icon={<AlertTriangle aria-hidden size={16} />}
        />
        <Stat
          label="Jobs running"
          value={running.length}
          hint={`${failed.length} failed`}
          tone={failed.length ? 'warn' : undefined}
          icon={<Activity aria-hidden size={16} />}
        />
        <Stat
          label="AI runs today"
          value={health?.at(-1)?.aiCalls ?? 0}
          hint="Simulated"
          spark={
            health && (
              <Sparkline values={health.slice(-14).map((h) => h.aiCalls)} label="AI runs, last 14 days" />
            )
          }
        />
        <Stat
          label="Unread alerts"
          value={unread}
          tone={unread ? 'warn' : 'good'}
          hint="In the bell, top right"
          icon={<ShieldAlert aria-hidden size={16} />}
        />
      </div>

      <Card
        title="Handover workflow"
        note="Every transition moves through these stages. Click a stage to see who is in it."
        actions={
          <Link to="/app/transitions" className="text-sm font-medium text-brand hover:underline">
            All transitions
          </Link>
        }
      >
        <WorkflowFlow transitions={transitions} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Card title="Needs your attention" note={attention.length ? 'Most urgent first' : undefined}>
          {attention.length ? (
            <ul className="eb-stagger flex flex-col divide-y divide-line">
              {attention
                .sort(
                  (a, b) => ['bad', 'warn', 'info'].indexOf(a.tone) - ['bad', 'warn', 'info'].indexOf(b.tone),
                )
                .map((a) => (
                  <li key={a.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toneCls[a.tone]}`}
                    >
                      {a.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted">{a.body}</p>
                    </div>
                    <div className="shrink-0">{a.action}</div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">All clear. New alerts appear here as they happen.</p>
          )}
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              Live activity{' '}
              <span
                aria-hidden
                className="eb-live-dot h-1.5 w-1.5 rounded-full bg-supported text-supported"
              />
            </span>
          }
          note="From the audit log, as it happens"
          actions={
            <Link to="/app/admin/audit" className="text-sm font-medium text-brand hover:underline">
              Audit log
            </Link>
          }
        >
          <ol aria-live="polite" className="flex flex-col gap-3">
            {(audit ?? []).slice(0, 7).map((e) => {
              const d = describeAudit(e)
              return (
                <li
                  key={e.id}
                  className={`flex gap-3 rounded-control ${new Date(e.at).getTime() > openedAt ? 'eb-row-new' : ''}`}
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{e.actor}</span> {d.text}
                    </p>
                    <p className="text-xs text-muted">{timeAgo(e.at, now)}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Background work"
          note="Ingestion, analysis and verification jobs"
          actions={
            <Link to="/app/admin/system" className="text-sm font-medium text-brand hover:underline">
              Jobs and health
            </Link>
          }
        >
          {running.length ? (
            <ul className="flex flex-col gap-3">
              {running.slice(0, 5).map((j) => (
                <li key={j.id}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">
                      {j.type} <span className="text-muted">· {j.target}</span>
                    </span>
                    {j.status === 'queued' ? (
                      <Pill>Queued</Pill>
                    ) : (
                      <span className="text-xs text-muted tabular-nums">{j.progress}%</span>
                    )}
                  </div>
                  <Progress
                    value={j.status === 'queued' ? 0 : j.progress}
                    live={j.status === 'running'}
                    label={`${j.type} ${j.target}`}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Nothing running right now.</p>
          )}
        </Card>

        <Card title="Upcoming last days" note="Open transitions, nearest first">
          <ul className="flex flex-col gap-3">
            {upcoming.map(({ t, left }) => (
              <li key={t.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
                <Link
                  to={`/app/transitions/${t.id}`}
                  className="truncate text-sm font-medium hover:underline"
                >
                  {t.employee.name}
                  <span className="font-normal text-muted">
                    {' '}
                    · {t.successor ? `to ${t.successor.name}` : 'no successor yet'}
                  </span>
                </Link>
                <span className={`text-sm tabular-nums ${left <= 30 ? 'text-partial' : 'text-muted'}`}>
                  {left} days · {dateLabel(t.lastWorkingDay)}
                </span>
                <div className="col-span-2">
                  <Progress
                    value={Math.max(4, 100 - (left / 60) * 100)}
                    tone={left <= 14 ? 'bad' : 'brand'}
                    label={`Time used before ${t.employee.name}'s last day`}
                  />
                </div>
              </li>
            ))}
            {!upcoming.length && <li className="text-sm text-muted">No open transitions.</li>}
          </ul>
        </Card>
      </div>

      <NewTransitionDialog open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
