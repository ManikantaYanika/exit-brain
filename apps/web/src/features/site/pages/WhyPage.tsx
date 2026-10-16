import { useId, useState } from 'react'
import { ClosingCta, Section } from '../blocks'
import { COMPARE_COLUMNS, COMPARE_ROWS, PROTECTS, worksheetCost, type WorksheetInput } from '../content/why'
import { PageHeader } from '../PageHeader'
import { SiteLink } from '../SiteLink'
import { primaryButton, secondaryButton } from '../styles'

const FIELDS: { key: keyof WorksheetInput; label: string; hint: string; max: number }[] = [
  { key: 'salary', label: 'Yearly salary for the role', hint: 'In your currency', max: 1e9 },
  { key: 'rampMonths', label: 'Months for a successor to ramp up', hint: 'Your estimate', max: 36 },
  {
    key: 'rampShare',
    label: 'Share of their time lost while ramping up (%)',
    hint: '0 to 100',
    max: 100,
  },
  {
    key: 'managerHours',
    label: 'Hours the manager spends on the handover',
    hint: 'Your estimate',
    max: 2000,
  },
  { key: 'hourlyCost', label: 'Manager’s hourly cost', hint: 'In your currency', max: 1e6 },
]

const fmt = new Intl.NumberFormat('en', { maximumFractionDigits: 0 })

/** The visitor's own numbers. Nothing is pre-filled, stored or sent anywhere. */
export function Worksheet() {
  const base = useId()
  const [values, setValues] = useState<Record<keyof WorksheetInput, string>>({
    salary: '',
    rampMonths: '',
    rampShare: '',
    managerHours: '',
    hourlyCost: '',
  })
  const parsed = Object.fromEntries(
    FIELDS.map((f) => {
      const n = Number(values[f.key])
      return [f.key, values[f.key] !== '' && Number.isFinite(n) && n >= 0 && n <= f.max ? n : null]
    }),
  ) as Record<keyof WorksheetInput, number | null>
  const complete = FIELDS.every((f) => parsed[f.key] !== null)
  const result = complete ? worksheetCost(parsed as WorksheetInput) : null

  return (
    <div className="grid gap-8 rounded-[20px] border border-line bg-surface p-6 shadow-float sm:p-8 lg:grid-cols-[1.3fr_1fr]">
      <form
        className="grid gap-5 sm:grid-cols-2"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Cost worksheet"
      >
        {FIELDS.map((f) => {
          const id = `${base}-${f.key}`
          const invalid = values[f.key] !== '' && parsed[f.key] === null
          return (
            <div key={f.key} className="flex flex-col gap-1.5">
              <label htmlFor={id} className="text-sm font-medium">
                {f.label}
              </label>
              <input
                id={id}
                type="number"
                inputMode="decimal"
                min={0}
                max={f.max}
                value={values[f.key]}
                aria-invalid={invalid || undefined}
                aria-describedby={`${id}-hint`}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                className="h-11 rounded-control border border-line-strong bg-surface px-3 tabular-nums focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand aria-invalid:border-conflicting"
              />
              <span id={`${id}-hint`} className="text-xs text-muted">
                {invalid ? `Enter a number from 0 to ${fmt.format(f.max)}.` : f.hint}
              </span>
            </div>
          )
        })}
      </form>
      <div className="flex flex-col justify-between gap-6 rounded-[12px] bg-band p-6">
        <div aria-live="polite">
          <p className="text-sm font-medium text-muted">Your estimate</p>
          {result ? (
            <>
              <p className="mt-2 text-[2.5rem] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                {fmt.format(result.total)}
              </p>
              <dl className="mt-4 flex flex-col gap-1 text-sm text-muted">
                <div className="flex justify-between gap-4">
                  <dt>Successor ramp-up</dt>
                  <dd className="tabular-nums">{fmt.format(result.ramp)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Manager time</dt>
                  <dd className="tabular-nums">{fmt.format(result.manager)}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="mt-2 text-[1.0625rem] text-muted">Fill in all five fields to see your number.</p>
          )}
        </div>
        <p className="text-xs leading-relaxed text-muted">
          Monthly salary × months to ramp up × share of time lost, plus manager hours × hourly cost. This is
          your arithmetic, not a claim by Exit Brain. Your inputs stay in your browser and aren’t saved.
        </p>
      </div>
    </div>
  )
}

export function WhyPage() {
  return (
    <>
      <PageHeader
        kicker="Why Exit Brain"
        title="A departure is a predictable risk"
        lead="Most teams handle it with a meeting and a document written in the last week. Exit Brain starts earlier, from the work itself."
      >
        <SiteLink href="/signup" className={primaryButton}>
          Start a pilot
        </SiteLink>
        <SiteLink href="/how-it-works" className={secondaryButton}>
          How it works
        </SiteLink>
      </PageHeader>

      <Section id="protects" title="What it protects">
        <ul className="grid gap-5 sm:grid-cols-2">
          {PROTECTS.map((p) => (
            <li key={p.title} className="rounded-[12px] border border-line bg-surface p-6">
              <h3 className="text-[1.125rem] font-semibold">{p.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="compare"
        band
        title="How it compares"
        lead="Types of tools teams already use when someone leaves. This compares approaches, not named products."
      >
        <div
          role="region"
          aria-label="Comparison table"
          tabIndex={0}
          className="overflow-x-auto rounded-[12px] border border-line bg-surface focus-visible:outline-2 focus-visible:outline-brand"
        >
          <table className="w-full min-w-[40rem] text-left text-[0.97rem]">
            <caption className="sr-only">Exit Brain compared with other approaches to a handover</caption>
            <thead className="border-b border-line text-sm">
              <tr>
                <td className="px-5 py-3" />
                {COMPARE_COLUMNS.map((c) => (
                  <th
                    key={c}
                    scope="col"
                    className={`px-4 py-3 font-medium ${c === 'Exit Brain' ? 'bg-brand-soft text-brand' : 'text-muted'}`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {COMPARE_ROWS.map((r) => (
                <tr key={r.row}>
                  <th scope="row" className="px-5 py-3.5 font-normal">
                    {r.row}
                  </th>
                  {r.values.map((v, i) => (
                    <td
                      key={i}
                      className={`px-4 py-3.5 ${i === 3 ? 'bg-brand-soft/60 font-medium text-ink' : 'text-muted'}`}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        id="worksheet"
        title="Work out your own numbers"
        lead="What does one departure cost your team? Use your own figures; we don’t supply any."
      >
        <Worksheet />
      </Section>

      <ClosingCta
        title="Someone critical is leaving? Start while they’re still here."
        primary={{ label: 'Start a pilot', href: '/signup' }}
        secondary={{ label: 'Explore the demo', href: '/demo' }}
      />
    </>
  )
}
