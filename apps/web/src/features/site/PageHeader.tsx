import type { ReactNode } from 'react'

/** Top of a website page: page name, one-line purpose, optional actions. Calm by design; the home hero is the only animated one. */
export function PageHeader({
  kicker,
  title,
  lead,
  children,
}: {
  kicker: string
  title: string
  lead: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_22rem_at_92%_0%,var(--eb-soft),transparent_70%),radial-gradient(30rem_18rem_at_0%_0%,var(--eb-brand-soft),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-[1200px] px-4 pt-14 pb-14 sm:px-6 md:pt-20 md:pb-16">
        <p className="text-[0.94rem] font-medium text-accent-ink">{kicker}</p>
        <h1 className="mt-3 max-w-3xl text-[2.4rem] leading-[1.06] font-semibold tracking-[-0.03em] text-balance sm:text-[3.2rem]">
          {title}
        </h1>
        <p className="mt-5 max-w-[40rem] text-[1.125rem] leading-[1.65] text-muted">{lead}</p>
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  )
}
