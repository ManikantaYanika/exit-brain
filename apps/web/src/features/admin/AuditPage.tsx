import { Download, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAudit } from '../../data/admin/hooks'
import type { AuditEvent } from '../../data/admin/types'
import { Button } from '../../design/primitives/Button'
import { SkeletonRows } from '../../design/states/States'
import { AUDIT_GROUPS, describeAudit, type AuditGroup } from './describe'
import { downloadText, selectCls, timeAgo, toCsv, useNow } from './lib'
import { AdminHeader, Card, Pill, SearchBox, TableWrap, Td, Th } from './ui'

const stamp = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

function Detail({ e, onClose }: { e: AuditEvent; onClose: () => void }) {
  const d = describeAudit(e)
  return (
    <aside aria-label="Event detail" className="eb-enter rounded-panel border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted">{e.id}</p>
          <h2 className="mt-1 text-base font-semibold">
            {e.actor} {d.text}
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close detail"
          onClick={onClose}
          className="rounded-control p-1 text-muted hover:text-ink"
        >
          <X aria-hidden size={16} />
        </button>
      </div>
      <dl className="mt-4 grid grid-cols-[7rem_1fr] gap-y-2 text-sm">
        <dt className="text-muted">When</dt>
        <dd>{stamp(e.at)}</dd>
        <dt className="text-muted">Actor</dt>
        <dd>
          {e.actor} <span className="text-muted">({e.actorRole})</span>
        </dd>
        <dt className="text-muted">Action</dt>
        <dd className="font-mono text-xs">{e.action}</dd>
        <dt className="text-muted">Target</dt>
        <dd className="font-mono text-xs break-all">{e.target}</dd>
        <dt className="text-muted">Region</dt>
        <dd>{e.region}</dd>
      </dl>
      <p className="mt-4 mb-1.5 text-sm font-medium">Metadata</p>
      <pre className="overflow-x-auto rounded-control bg-surface-sunken p-3 text-xs">
        {JSON.stringify(e.meta, null, 2)}
      </pre>
      <p className="mt-3 text-xs text-muted">
        Audit entries hold IDs and counts only, never answer text or secrets. They can’t be edited or deleted.
      </p>
    </aside>
  )
}

export function AuditPage() {
  const now = useNow(15_000)
  const { data: audit } = useAudit()
  const [q, setQ] = useState('')
  const [group, setGroup] = useState<AuditGroup | 'All'>('All')
  const [actor, setActor] = useState('all')
  const [open, setOpen] = useState<string | null>(null)
  const [openedAt] = useState(() => Date.now())

  const rows = useMemo(
    () =>
      (audit ?? []).filter((e) => {
        const d = describeAudit(e)
        return (
          (group === 'All' || d.group === group) &&
          (actor === 'all' || e.actor === actor) &&
          `${e.actor} ${e.action} ${e.target} ${d.text} ${e.id}`.toLowerCase().includes(q.toLowerCase())
        )
      }),
    [audit, group, actor, q],
  )
  const actors = [...new Set((audit ?? []).map((e) => e.actor))].sort()
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const e of audit ?? []) c[describeAudit(e).group] = (c[describeAudit(e).group] ?? 0) + 1
    return c
  }, [audit])
  const selected = audit?.find((e) => e.id === open)

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        live
        title="Audit log"
        description="Every sign-in, role change, approval, export and deletion, as it happens. Append-only."
        actions={
          <Button
            icon={<Download aria-hidden size={15} />}
            disabled={!rows.length}
            onClick={() =>
              downloadText(
                `exit-brain-audit-${new Date().toISOString().slice(0, 10)}.csv`,
                toCsv(
                  rows.map((e) => ({
                    id: e.id,
                    at: e.at,
                    actor: e.actor,
                    role: e.actorRole,
                    action: e.action,
                    target: e.target,
                    region: e.region,
                    meta: e.meta,
                  })),
                ),
              )
            }
          >
            Export CSV
          </Button>
        }
      />

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
        {(['All', ...AUDIT_GROUPS] as const).map((g) => (
          <button
            key={g}
            type="button"
            aria-pressed={group === g}
            onClick={() => setGroup(g)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              group === g
                ? 'border-ink bg-ink text-surface'
                : 'border-line text-muted hover:border-line-strong'
            }`}
          >
            {g}
            <span className="ml-1.5 tabular-nums opacity-70">
              {g === 'All' ? (audit?.length ?? 0) : (counts[g] ?? 0)}
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SearchBox
          value={q}
          onChange={setQ}
          label="Search the audit log"
          placeholder="Search action, target, ID"
        />
        <label className="flex items-center gap-2 text-sm text-muted">
          Actor
          <select className={selectCls} value={actor} onChange={(e) => setActor(e.target.value)}>
            <option value="all">Everyone</option>
            {actors.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
        <span className="text-sm text-muted" aria-live="polite">
          {rows.length} events
        </span>
      </div>

      {!audit ? (
        <SkeletonRows rows={6} label="Loading audit log" />
      ) : (
        <div className={`grid gap-4 ${selected ? 'xl:grid-cols-[1fr_22rem]' : ''}`}>
          <Card>
            <TableWrap caption="Audit events">
              <thead className="border-b border-line">
                <tr>
                  <Th>When</Th>
                  <Th>Event</Th>
                  <Th className="hidden md:table-cell">Category</Th>
                  <Th className="hidden lg:table-cell">Region</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((e) => {
                  const d = describeAudit(e)
                  return (
                    <tr
                      key={e.id}
                      tabIndex={0}
                      onClick={() => setOpen(open === e.id ? null : e.id)}
                      onKeyDown={(k) => k.key === 'Enter' && setOpen(open === e.id ? null : e.id)}
                      className={`cursor-pointer transition-colors hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-brand ${
                        open === e.id ? 'bg-brand-soft' : ''
                      } ${new Date(e.at).getTime() > openedAt ? 'eb-row-new' : ''}`}
                    >
                      <Td className="whitespace-nowrap text-muted">
                        <span title={stamp(e.at)}>{timeAgo(e.at, now)}</span>
                      </Td>
                      <Td>
                        <span className="flex items-start gap-2.5">
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                            style={{ background: d.color }}
                          />
                          <span>
                            <span className="font-medium">{e.actor}</span> {d.text}
                            <span className="block font-mono text-[11px] text-muted">{e.action}</span>
                          </span>
                        </span>
                      </Td>
                      <Td className="hidden md:table-cell">
                        <Pill>{d.group}</Pill>
                      </Td>
                      <Td className="hidden text-muted lg:table-cell">{e.region}</Td>
                    </tr>
                  )
                })}
                {!rows.length && (
                  <tr>
                    <Td className="py-8 text-center text-muted">No events match these filters.</Td>
                  </tr>
                )}
              </tbody>
            </TableWrap>
          </Card>
          {selected && <Detail e={selected} onClose={() => setOpen(null)} />}
        </div>
      )}
    </div>
  )
}
