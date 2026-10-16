import { Info, Receipt } from 'lucide-react'
import { useBilling } from '../../data/admin/hooks'
import { SkeletonRows } from '../../design/states/States'
import { BarChart, LineChart, Meter } from './charts'
import { fmt, usd } from './lib'
import { AdminHeader, Card, Pill, Stat, TableWrap, Td, Th } from './ui'

const month = (m: string) => new Date(`${m}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'short' })
const monthLong = (m: string) =>
  new Date(`${m}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

export function BillingPage() {
  const { data: b } = useBilling()
  if (!b) return <SkeletonRows rows={4} label="Loading billing" />
  const amount = b.departuresThisPeriod * b.pricePerDepartureUsd
  const thisMonth = b.monthly.at(-1)!
  const perDeparture = thisMonth.departures ? thisMonth.aiCostUsd / thisMonth.departures : 0
  const chart = b.monthly.map((m) => ({ ...m, amountUsd: m.departures * b.pricePerDepartureUsd }))

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Usage & billing"
        description="One price per departure, not per seat. Managers, successors and HR are included."
      />

      <div
        role="note"
        className="flex items-start gap-3 rounded-panel border border-partial/40 bg-partial-soft p-4 text-sm"
      >
        <Info aria-hidden size={18} className="mt-0.5 shrink-0 text-partial" />
        <p>
          <strong className="font-semibold">Billing isn’t live.</strong> Exit Brain is in pilot. Amounts below
          show what pilot pricing would come to; nothing is charged without a signed agreement.
        </p>
      </div>

      <div className="eb-stagger grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          label="Plan"
          value={b.pricePerDepartureUsd}
          format={(v) => `${usd(Math.round(v))} / departure`}
          hint="Pilot pricing"
        />
        <Stat
          label={`Departures, ${b.periodLabel}`}
          value={b.departuresThisPeriod}
          hint="Each is one handover"
        />
        <Stat label="Would come to" value={amount} format={(v) => usd(Math.round(v))} hint="Not billed" />
        <Stat
          label="AI cost per departure"
          value={perDeparture}
          format={(v) => `$${v.toFixed(2)}`}
          tone="good"
          hint="Our cost, this month"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Departures per month" note="Pilot amount per month at $149 each">
          <BarChart
            data={chart}
            x="month"
            series={[{ key: 'amountUsd', label: 'Pilot amount', color: 'var(--eb-brand)' }]}
            format={(v) => usd(Math.round(v))}
            xLabel={month}
            label="Pilot amount per month"
          />
        </Card>
        <Card title="AI runs" note="Analysis, question generation and verification per month">
          <LineChart
            data={b.monthly}
            x="month"
            series={[{ key: 'aiRuns', label: 'AI runs', color: 'var(--eb-brand-2)' }]}
            format={(v) => fmt.format(Math.round(v))}
            xLabel={month}
            label="AI runs per month"
          />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card
          title="This month’s usage"
          note="Soft limits for the pilot; nothing stops at the limit, we get in touch"
        >
          <div className="flex flex-col gap-5">
            <Meter label="AI runs" value={b.aiRuns} max={b.aiRunsSoftLimit} format={(v) => fmt.format(v)} />
            <Meter
              label="Storage (excerpts only)"
              value={b.storageMb}
              max={b.storageLimitMb}
              format={(v) => `${Math.round(v)} MB`}
            />
          </div>
        </Card>
        <Card title="Pilot statements" note="What each month would have cost">
          <TableWrap caption="Pilot statements">
            <thead className="border-b border-line">
              <tr>
                <Th>Statement</Th>
                <Th>Period</Th>
                <Th className="text-right">Departures</Th>
                <Th className="text-right">Amount</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {b.invoices.map((i) => (
                <tr key={i.id} className="hover:bg-surface-sunken">
                  <Td>
                    <span className="flex items-center gap-2 font-mono text-xs">
                      <Receipt aria-hidden size={14} className="text-muted" />
                      {i.id}
                    </span>
                  </Td>
                  <Td>{monthLong(i.period)}</Td>
                  <Td className="text-right tabular-nums">{i.departures}</Td>
                  <Td className="text-right tabular-nums">{usd(i.amountUsd)}</Td>
                  <Td>
                    <Pill>Not billed</Pill>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Card>
      </div>
    </div>
  )
}
