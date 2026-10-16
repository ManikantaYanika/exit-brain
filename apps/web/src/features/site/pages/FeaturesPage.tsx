import { FEATURE_GROUPS, STATUS } from '../content/features'
import { PageHeader } from '../PageHeader'
import { SiteLink } from '../SiteLink'
import { container, primaryButton, secondaryButton } from '../styles'

export function FeaturesPage() {
  return (
    <>
      <PageHeader
        kicker="Features"
        title="Built for the people who carry a handover"
        lead="Each role gets the part of the handover it needs. Exit Brain is in early development: “MVP scope” means it is being built for the pilot; “Later” means it is planned but not part of the MVP."
      >
        <SiteLink href="/how-it-works" className={secondaryButton}>
          How it works
        </SiteLink>
      </PageHeader>

      <div className={`${container} py-16 md:py-24`}>
        <div className="flex flex-col">
          {FEATURE_GROUPS.map(({ who, Icon, intro, features }) => (
            <section
              key={who}
              data-reveal
              aria-labelledby={`f-${who}`}
              className="grid gap-6 border-b border-line py-10 first:pt-0 last:border-b-0 lg:grid-cols-[1fr_2fr] lg:gap-16"
            >
              <div className="flex gap-3">
                <Icon aria-hidden size={22} strokeWidth={1.75} className="mt-1 shrink-0 text-brand" />
                <div>
                  <h2
                    id={`f-${who}`}
                    className="text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]"
                  >
                    {who}
                  </h2>
                  <p className="mt-2 text-muted">{intro}</p>
                </div>
              </div>
              <ul className="flex flex-col divide-y divide-line">
                {features.map((f) => (
                  <li
                    key={f.name}
                    className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                  >
                    <div className="max-w-[36rem]">
                      <h3 className="font-semibold">{f.name}</h3>
                      <p className="mt-1 text-[0.94rem] leading-relaxed text-muted">{f.detail}</p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 self-start rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS[f.status].cls}`}
                    >
                      {STATUS[f.status].label}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <section className="border-t border-line bg-band">
        <div
          className={`${container} flex flex-col items-start gap-8 py-16 md:flex-row md:items-center md:justify-between`}
        >
          <h2 className="max-w-xl text-[1.75rem] leading-tight font-semibold tracking-[-0.02em] text-balance">
            Want to shape what comes after the MVP? Join the pilot.
          </h2>
          <div className="flex flex-wrap gap-3">
            <SiteLink href="/signup" className={primaryButton}>
              Start a pilot
            </SiteLink>
            <SiteLink href="/demo" className={secondaryButton}>
              Explore the demo
            </SiteLink>
          </div>
        </div>
      </section>
    </>
  )
}
