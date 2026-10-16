import { z } from 'zod'

/**
 * Contact form schema. Used by the page now; meant to be mirrored server-side in W10
 * (Edge Function `contact-submit`), which is the real boundary. Browser validation is only for the visitor.
 */
export const CONTACT_TOPICS = ['Pilot', 'Security question', 'Partnership', 'Other'] as const

export const contactSchema = z.object({
  topic: z.enum(CONTACT_TOPICS, { error: 'Choose a topic.' }),
  name: z.string().trim().min(1, 'Enter your name.').max(120, 'Use 120 characters or fewer.'),
  email: z.email({ error: 'Enter a valid email address.' }).max(254, 'Use 254 characters or fewer.'),
  company: z.string().trim().max(160, 'Use 160 characters or fewer.').optional().or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(10, 'Tell us a little more (at least 10 characters).')
    .max(4000, 'Use 4,000 characters or fewer.'),
  /** Honeypot: hidden from people; bots that fill it are rejected. */
  website: z.string().max(0).optional().or(z.literal('')),
})

export type ContactInput = z.input<typeof contactSchema>

export function validateContact(input: ContactInput) {
  const r = contactSchema.safeParse(input)
  if (r.success) return { ok: true as const, data: r.data, errors: {} as Record<string, string> }
  const errors: Record<string, string> = {}
  for (const issue of r.error.issues) {
    const k = String(issue.path[0] ?? 'form')
    errors[k] ??= issue.message
  }
  return { ok: false as const, errors }
}
