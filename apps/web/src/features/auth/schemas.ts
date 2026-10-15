import { z } from 'zod'

/** Mirrors supabase/config.toml: minimum 8 characters, letters and digits. */
export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .regex(/[A-Za-z]/, 'Include at least one letter.')
  .regex(/\d/, 'Include at least one number.')

export const emailSchema = z.string().trim().pipe(z.email('Enter a valid work email.'))

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.'),
})

export const signUpSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.').max(80, 'Keep your name under 80 characters.'),
  email: emailSchema,
  password: passwordSchema,
})

/** First message per field, for inline errors. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    if (!out[key]) out[key] = issue.message
  }
  return out
}
