import { Info, Mail } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { CONTACT_EMAIL } from '../content/security'
import { PageHeader } from '../PageHeader'
import { SiteLink } from '../SiteLink'
import { container } from '../styles'
import { CONTACT_TOPICS, validateContact, type ContactInput } from './schema'

/** Until W10 is approved and delivery is tested, the form validates but cannot be sent (D7). */
export const FORM_ACTIVE = false

const field =
  'w-full rounded-control border border-line-strong bg-surface px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand aria-invalid:border-conflicting'

function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string
  label: string
  optional?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-conflicting">
          {error}
        </p>
      )}
    </div>
  )
}

export function ContactPage() {
  const base = useId()
  const [form, setForm] = useState<ContactInput>({
    topic: 'Pilot',
    name: '',
    email: '',
    company: '',
    message: '',
    website: '',
  })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const { errors } = validateContact(form)
  const shown = (k: keyof ContactInput) => (touched[k] ? errors[k] : undefined)
  const id = (k: string) => `${base}-${k}`
  const describe = (k: keyof ContactInput) => (shown(k) ? `${id(k)}-error` : undefined)
  const bind = (k: keyof ContactInput) => ({
    id: id(k),
    name: k,
    value: form[k] ?? '',
    'aria-invalid': shown(k) ? true : undefined,
    'aria-describedby': describe(k),
    onChange: (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [k]: true })),
  })

  return (
    <>
      <PageHeader
        kicker="Contact"
        title="Contact"
        lead="Ask about a pilot, a security question or anything else."
      />
      <div className={`${container} grid gap-12 py-16 md:py-20 lg:grid-cols-[1.4fr_1fr]`}>
        <form
          noValidate
          aria-label="Contact form"
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            setTouched({ topic: true, name: true, email: true, company: true, message: true })
          }}
        >
          <Field id={id('topic')} label="Topic" error={shown('topic')}>
            <select {...bind('topic')} className={`${field} h-11`}>
              {CONTACT_TOPICS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id={id('name')} label="Name" error={shown('name')}>
              <input {...bind('name')} autoComplete="name" className={`${field} h-11`} />
            </Field>
            <Field id={id('email')} label="Work email" error={shown('email')}>
              <input {...bind('email')} type="email" autoComplete="email" className={`${field} h-11`} />
            </Field>
          </div>
          <Field id={id('company')} label="Company" optional error={shown('company')}>
            <input {...bind('company')} autoComplete="organization" className={`${field} h-11`} />
          </Field>
          <Field id={id('message')} label="Message" error={shown('message')}>
            <textarea {...bind('message')} rows={6} className={`${field} py-2.5`} />
          </Field>
          {/* Honeypot: off-screen and skipped by keyboard and screen readers. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor={id('website')}>Leave this empty</label>
            <input {...bind('website')} tabIndex={-1} autoComplete="off" />
          </div>

          <p className="text-sm text-muted">
            We use these details only to reply to you. See our{' '}
            <SiteLink href="/privacy" className="font-medium text-link underline">
              privacy notice (draft)
            </SiteLink>
            .
          </p>

          <div
            id={id('inactive')}
            role="note"
            className="flex items-start gap-3 rounded-[12px] border border-line bg-soft p-4 text-[0.97rem]"
          >
            <Info aria-hidden size={18} className="mt-0.5 shrink-0 text-accent-ink" />
            <p>
              This form isn’t active yet, so nothing you type is sent. Please email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-link underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
          <div>
            <button
              type="submit"
              disabled={!FORM_ACTIVE}
              aria-describedby={id('inactive')}
              className="inline-flex h-12 items-center rounded-control bg-brand px-6 font-medium text-on-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send message
            </button>
          </div>
        </form>

        <aside className="flex flex-col gap-6">
          <div className="rounded-[16px] border border-line bg-surface p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <Mail aria-hidden size={18} className="text-brand" /> Email us
            </h2>
            <p className="mt-2 text-muted">
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-link underline">
                {CONTACT_EMAIL}
              </a>
            </p>
            <p className="mt-3 text-sm text-muted">
              For pilots, security questions and partnerships. Exit Brain is founder-led, so you’ll hear back
              from the founder.
            </p>
          </div>
          <div className="rounded-[16px] border border-line bg-band p-6">
            <h2 className="font-semibold">Reporting a vulnerability?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Email the same address with the details. See{' '}
              <SiteLink href="/security" className="font-medium text-link underline">
                Security
              </SiteLink>{' '}
              for how we handle reports.
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
