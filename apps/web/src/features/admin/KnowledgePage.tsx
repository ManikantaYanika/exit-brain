import { Info } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useKnowledgeAreas } from '../../data/admin/hooks'
import type { KnowledgeArea } from '../../data/admin/types'
import type { Level } from '../../data/types'
import { SkeletonRows } from '../../design/states/States'
import { Scatter, StackedBars } from './charts'
import { AdminHeader, Card, Pill, SearchBox, Stat, TableWrap, Td, Th } from './ui'

const RISK_COLOR: Record<Level, string> = {
  high: 'var(--eb-conflicting)',
  medium: 'var(--eb-partial)',
  low: 'var(--eb-muted)',
}
const RISK_LABEL: Record<Level, string> = { high: 'High', medium: 'Medium', low: 'Low' }
const CATEGORY: Record<KnowledgeArea['category'], string> = {
  system: 'System',
  recurring_task: 'Recurring job',
  deployment: 'Deployment',
  troubleshooting: 'Troubleshooting',
  dependency: 'Dependency',
  client: 'Client-specific',
  other: 'Other',
}
const pct = (v: number) => `${Math.round(v * 100)}%`

export function KnowledgePage() {
  const { data: areas } = useKnowledgeAreas()
  const [risk, setRisk] = useState<Level | 'all'>('all')
  const [repo, setRepo] = useState<string | null>(null)
  const [q, setQ] = useState('')

  const rows = useMemo(
    () =>
      (areas ?? [])
        .filter(
          (a) =>
            (risk === 'all' || a.risk === risk) &&
            (!repo || a.repo === repo) &&
            `${a.title} ${a.repo} ${a.engineer}`.toLowerCase().includes(q.toLowerCase()),
        )
        .sort((a, b) => b.changeShare - a.changeShare),
    [areas, risk, repo, q],
  )
  if (!areas) return <SkeletonRows rows={4} label="Loading knowledge areas" />
  const open = areas.filter((a) => a.status !== 'rejected')
  const high = open.filter((a) => a.risk === 'high')
  const pending = areas.filter((a) => a.status === 'suggested')
  const repos = [...new Set(areas.map((a) => a.repo))].sort()
  const byRepo = repos.map((r) => ({
    label: r,
    values: (['high', 'medium', 'low'] as Level[]).map(
      (l) => open.filter((a) => a.repo === r && a.risk === l).length,
    ),
  }))

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Knowledge risk"
        description="Code areas where knowledge sits with one person, across every open transition. Suggested by Exit Brain from GitHub records; managers confirm or reject them."
      />
      <p className="flex items-start gap-2 rounded-panel border border-line bg-surface-sunken p-3 text-sm text-muted">
        <Info aria-hidden size={16} className="mt-0.5 shrink-0 text-brand" />
        This measures how concentrated knowledge is in systems, not how well anyone works. Nothing here is
        used to evaluate, rank or compare people.
      </p>

      <div className="eb-stagger grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Areas tracked" value={open.length} hint={`${areas.length - open.length} rejected`} />
        <Stat
          label="High risk"
          value={high.length}
          tone={high.length ? 'bad' : 'good'}
          hint="One person made most changes"
        />
        <Stat
          label="Waiting for review"
          value={pending.length}
          tone={pending.length ? 'warn' : 'good'}
          hint="Suggested, not yet confirmed"
        />
        <Stat
          label="Evidence records"
          value={open.reduce((s, a) => s + a.evidence, 0)}
          hint="Commits, PRs and issues cited"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card
          title="Concentration map"
          note="Each dot is an area. Higher = more of its changes by one person; size = evidence records. Hover for detail."
        >
          <Scatter
            data={open}
            x={(a) => a.daysSinceChange}
            y={(a) => a.changeShare}
            r={(a) => a.evidence}
            color={(a) => RISK_COLOR[a.risk]}
            dim={(a) => (risk !== 'all' && a.risk !== risk) || (!!repo && a.repo !== repo)}
            xLabel="Days since last change"
            yLabel="Share of changes by one engineer"
            yFormat={pct}
            label="Knowledge areas by change share and days since last change"
            tip={(a) => (
              <>
                <div className="font-medium">{a.title}</div>
                <div className="text-muted">
                  {a.repo} · {RISK_LABEL[a.risk]} risk
                </div>
                <div>
                  {pct(a.changeShare)} of changes · {a.daysSinceChange} days ago · {a.evidence} records
                </div>
              </>
            )}
          />
          <ul className="mt-2 flex gap-4 text-xs text-muted" aria-hidden>
            {(['high', 'medium', 'low'] as Level[]).map((l) => (
              <li key={l} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: RISK_COLOR[l] }} />{' '}
                {RISK_LABEL[l]}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="By repository" note="Click a repository to filter">
          <StackedBars
            rows={byRepo}
            series={(['high', 'medium', 'low'] as Level[]).map((l) => ({
              label: RISK_LABEL[l],
              color: RISK_COLOR[l],
            }))}
            label="Knowledge areas per repository by risk"
            onSelect={(r) => setRepo(repo === r ? null : r)}
          />
          {repo && (
            <button
              type="button"
              onClick={() => setRepo(null)}
              className="mt-3 text-sm font-medium text-brand hover:underline"
            >
              Clear filter: {repo}
            </button>
          )}
        </Card>
      </div>

      <Card
        title="Areas"
        note="Highest concentration first"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1" role="group" aria-label="Filter by risk">
              {(['all', 'high', 'medium', 'low'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={risk === l}
                  onClick={() => setRisk(l)}
                  className={`rounded-full border px-3 py-1 text-xs ${risk === l ? 'border-ink bg-ink text-surface' : 'border-line text-muted hover:border-line-strong'}`}
                >
                  {l === 'all' ? 'All' : RISK_LABEL[l]}
                </button>
              ))}
            </div>
            <SearchBox value={q} onChange={setQ} label="Search areas" />
          </div>
        }
      >
        <TableWrap caption="Knowledge areas">
          <thead className="border-b border-line">
            <tr>
              <Th>Area</Th>
              <Th className="hidden md:table-cell">Kind</Th>
              <Th className="w-44">Change share</Th>
              <Th className="hidden text-right lg:table-cell">Last change</Th>
              <Th className="hidden text-right md:table-cell">Evidence</Th>
              <Th>Risk</Th>
              <Th>Review</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((a) => (
              <tr
                key={a.id}
                className={`hover:bg-surface-sunken ${a.status === 'rejected' ? 'bg-surface-sunken/60' : ''}`}
              >
                <Td>
                  <span className="block font-medium">{a.title}</span>
                  <span className="text-xs text-muted">
                    <span className="font-mono">{a.repo}</span> ·{' '}
                    <Link to={`/app/transitions/${a.transitionId}`} className="text-brand hover:underline">
                      {a.engineer}’s transition
                    </Link>
                  </span>
                </Td>
                <Td className="hidden text-muted md:table-cell">{CATEGORY[a.category]}</Td>
                <Td>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: pct(a.changeShare), background: RISK_COLOR[a.risk] }}
                      />
                    </span>
                    <span className="w-9 text-right text-xs tabular-nums">{pct(a.changeShare)}</span>
                  </span>
                </Td>
                <Td className="hidden text-right text-muted tabular-nums lg:table-cell">
                  {a.daysSinceChange} d
                </Td>
                <Td className="hidden text-right tabular-nums md:table-cell">{a.evidence}</Td>
                <Td>
                  <Pill tone={a.risk === 'high' ? 'bad' : a.risk === 'medium' ? 'warn' : 'muted'}>
                    {RISK_LABEL[a.risk]}
                  </Pill>
                </Td>
                <Td>
                  <Pill
                    tone={a.status === 'confirmed' ? 'good' : a.status === 'suggested' ? 'info' : 'muted'}
                  >
                    {a.status === 'confirmed'
                      ? 'Confirmed'
                      : a.status === 'suggested'
                        ? 'To review'
                        : 'Rejected'}
                  </Pill>
                </Td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <Td className="py-8 text-center text-muted">No areas match.</Td>
              </tr>
            )}
          </tbody>
        </TableWrap>
      </Card>
    </div>
  )
}
