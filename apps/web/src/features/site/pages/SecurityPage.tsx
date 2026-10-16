import { ShieldCheck } from 'lucide-react'
import { ClosingCta, Pill, Section } from '../blocks'
import {
  CONTACT_EMAIL,
  GITHUB_TOKEN_DOC,
  RESPONSIBLE_USE,
  SECURITY_TOPICS,
  STATUS,
} from '../content/security'
import { PageHeader } from '../PageHeader'
import { container, secondaryButton } from '../styles'

export function SecurityPage() {
  return (
    <>
      <PageHeader
        kicker="Security"
        title="Security and responsible use"
        lead="How Exit Brain handles your code history and your people. This page describes the design of the MVP. Where something isn’t built yet, the status table says so."
      >
        <a href="#status" className={secondaryButton}>
          See what’s done and what isn’t
        </a>
      </PageHeader>

      <div className={`${container} grid gap-x-16 gap-y-12 py-16 md:grid-cols-2 md:py-20`}>
        {SECURITY_TOPICS.map((t) => (
          <section key={t.id} id={t.id} data-reveal className="scroll-mt-24">
            <h2 className="text-[1.4rem] leading-snug font-semibold tracking-[-0.015em]">{t.title}</h2>
            <div className="mt-3 flex flex-col gap-3 text-[1.0625rem] leading-[1.7] text-muted">
              {t.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {t.id === 'access' && (
              <p className="mt-3 text-sm text-muted">
                Source:{' '}
                <a href={GITHUB_TOKEN_DOC} className="font-medium text-link underline" rel="noopener">
                  GitHub Docs, installation access tokens
                </a>
              </p>
            )}
          </section>
        ))}
      </div>

      <Section
        id="responsible-use"
        band
        title="Responsible use"
        lead="Exit Brain exists to move knowledge to the next person. It is not a way to watch or judge the person leaving."
      >
        <ul className="grid gap-4 md:grid-cols-2">
          {RESPONSIBLE_USE.map((r) => (
            <li
              key={r}
              data-reveal
              className="eb-card flex items-start gap-3 rounded-[12px] border border-line bg-surface p-5"
            >
              <ShieldCheck aria-hidden size={20} className="mt-0.5 shrink-0 text-brand" />
              <span className="text-[1.0625rem] leading-relaxed">{r}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="status"
        title="Status, honestly"
        lead="Exit Brain is in early development. This is what exists today and what doesn’t."
      >
        <div
          role="region"
          aria-label="Security status table"
          tabIndex={0}
          className="overflow-x-auto rounded-[12px] border border-line bg-surface focus-visible:outline-2 focus-visible:outline-brand"
        >
          <table className="w-full min-w-[28rem] text-left text-[0.97rem]">
            <caption className="sr-only">Security controls and their current status</caption>
            <thead className="border-b border-line bg-band text-sm text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">
                  Control
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {STATUS.map((s) => (
                <tr key={s.item}>
                  <th scope="row" className="px-5 py-3.5 font-normal">
                    {s.item}
                  </th>
                  <td className="px-5 py-3.5">
                    <Pill tone={s.tone}>{s.status}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="report" band title="Report a vulnerability">
        <p className="max-w-[42rem] text-[1.0625rem] leading-[1.7] text-muted">
          Email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-link underline">
            {CONTACT_EMAIL}
          </a>{' '}
          with the details and how to reproduce the issue. Please give us time to fix it before you disclose
          it. Don’t access other people’s data while testing.
        </p>
      </Section>

      <ClosingCta
        title="Have a security questionnaire or a question we haven’t answered?"
        primary={{ label: 'Ask a security question', href: '/contact' }}
        secondary={{ label: 'Read the help centre', href: '/help' }}
      />
    </>
  )
}
