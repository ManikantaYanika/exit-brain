import { Ban, Check, Mail, UserRound } from 'lucide-react'
import { ClosingCta, DraftNotice, Pill, Section } from '../blocks'
import { FOUNDER, MISSION, PRINCIPLES, SERVICE_LABEL, SERVICES, WONT_BUILD } from '../content/company'
import { PageHeader } from '../PageHeader'
import { SiteLink } from '../SiteLink'
import { container, primaryButton, secondaryButton } from '../styles'

export function AboutPage() {
  return (
    <>
      <PageHeader kicker="About" title="About Exit Brain" lead={MISSION}>
        <SiteLink href="/contact" className={primaryButton}>
          Contact us
        </SiteLink>
        <SiteLink href="/security" className={secondaryButton}>
          How we handle data
        </SiteLink>
      </PageHeader>

      <Section id="principles" title="What we hold to">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <li key={p.title} className="rounded-[12px] border border-line bg-surface p-6">
              <h3 className="flex items-center gap-2 text-[1.0625rem] font-semibold">
                <Check aria-hidden size={18} className="text-supported" /> {p.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="wont-build" band title="What we won’t build">
        <ul className="flex max-w-2xl flex-col gap-3">
          {WONT_BUILD.map((w) => (
            <li key={w} className="flex items-start gap-3 text-[1.0625rem]">
              <Ban aria-hidden size={20} className="mt-0.5 shrink-0 text-accent-ink" /> {w}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="status" title="Where we are">
        <p className="max-w-[42rem] text-[1.0625rem] leading-[1.7] text-muted">
          Exit Brain is in early development and founder-led. Pilots are by invitation. We don’t have customer
          case studies yet, so this site doesn’t show any.
        </p>
        {FOUNDER.published && (
          <SiteLink href="/about/founder" className="mt-6 inline-flex font-medium text-link underline">
            Meet the founder
          </SiteLink>
        )}
      </Section>

      <ClosingCta
        title="Want to run a pilot with us?"
        primary={{ label: 'Contact us', href: '/contact' }}
        secondary={{ label: 'See the services', href: '/services' }}
      />
    </>
  )
}

function Placeholder({ what }: { what: string }) {
  return (
    <span className="inline-block rounded-[8px] border border-dashed border-line-strong bg-band px-3 py-2 text-[0.97rem] text-muted">
      Placeholder: {what}, to be provided by Manikanta.
    </span>
  )
}

/** Hidden page: reachable by URL for owner preview, noindex, and kept out of nav and sitemap until FOUNDER.published. */
export function FounderPage() {
  const f = FOUNDER
  return (
    <>
      {!f.published && (
        <DraftNotice>
          Preview, not published. Text and photo are waiting for the founder’s approval.
        </DraftNotice>
      )}
      <section className={`${container} grid gap-10 py-16 md:grid-cols-[18rem_1fr] md:gap-16 md:py-24`}>
        <figure className="m-0">
          {f.photo ? (
            <img
              src={f.photo}
              alt={`Photo of ${f.name}`}
              width={576}
              height={720}
              className="aspect-[4/5] w-full rounded-[20px] border border-line object-cover"
            />
          ) : (
            <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-line-strong bg-band text-muted">
              <UserRound aria-hidden size={48} strokeWidth={1.25} />
              <span className="text-sm">Photo to come</span>
            </div>
          )}
        </figure>
        <div className="max-w-[42rem]">
          <p className="text-[0.94rem] font-medium text-accent-ink">Founder</p>
          <h1 className="mt-3 text-[2.4rem] leading-[1.06] font-semibold tracking-[-0.03em] sm:text-[3rem]">
            {f.name}
          </h1>
          <div className="mt-3">
            {f.title ? <p className="text-lg text-muted">{f.title}</p> : <Placeholder what="title" />}
          </div>

          <h2 className="mt-10 text-[1.4rem] font-semibold tracking-[-0.015em]">About</h2>
          <div className="mt-3 text-[1.0625rem] leading-[1.7] text-muted">
            {f.bio ? <p>{f.bio}</p> : <Placeholder what="a short bio" />}
          </div>

          <h2 className="mt-10 text-[1.4rem] font-semibold tracking-[-0.015em]">
            Why I’m building Exit Brain
          </h2>
          <div className="mt-3 text-[1.0625rem] leading-[1.7] text-muted">
            {f.why ? <p>{f.why}</p> : <Placeholder what="this section, in the founder’s own words" />}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={`mailto:${f.email}`}
              className="inline-flex items-center gap-2 font-medium text-link underline"
            >
              <Mail aria-hidden size={18} /> {f.email}
            </a>
            {f.links.map((l) => (
              <a key={l.href} href={l.href} rel="noopener me" className="font-medium text-link underline">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export function ServicesPage() {
  return (
    <>
      <PageHeader
        kicker="Services"
        title="Services"
        lead="Founder-led services that sit alongside the product. They are proposed and arranged case by case. The software is separate and doesn’t require them."
      >
        <SiteLink href="/contact" className={primaryButton}>
          Talk to us
        </SiteLink>
      </PageHeader>

      <div className={`${container} py-16 md:py-20`}>
        <ol className="grid gap-6 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <li
              key={s.id}
              id={s.id}
              className="flex scroll-mt-24 flex-col rounded-[16px] border border-line bg-surface p-7"
            >
              <span className="text-sm font-medium text-muted tabular-nums">0{i + 1}</span>
              <h2 className="mt-2 text-[1.3rem] leading-snug font-semibold tracking-[-0.015em]">{s.title}</h2>
              <p className="mt-3 flex-1 leading-relaxed text-muted">{s.body}</p>
              <div className="mt-6">
                <Pill>{SERVICE_LABEL}</Pill>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-[42rem] text-sm leading-relaxed text-muted">
          No customers, case studies or outcomes are implied. Scope, timing and price are agreed in writing
          before any work starts.
        </p>
      </div>

      <ClosingCta
        title="Planning a handover, or a pilot?"
        primary={{ label: 'Talk to us', href: '/contact' }}
        secondary={{ label: 'How it works', href: '/how-it-works' }}
      />
    </>
  )
}
