import { z } from 'zod'

/**
 * Browser-visible configuration. Only public values belong here.
 * Fails fast at startup instead of producing confusing runtime errors later.
 */
const envSchema = z.object({
  VITE_SUPABASE_URL: z.url({ message: 'VITE_SUPABASE_URL must be a valid URL' }),
  VITE_SUPABASE_ANON_KEY: z
    .string({ message: 'VITE_SUPABASE_ANON_KEY is required' })
    .min(20, 'VITE_SUPABASE_ANON_KEY looks too short'),
})

export type AppEnv = z.infer<typeof envSchema>

/** True if the key is a Supabase secret / service-role key (must never reach the browser). */
export function isPrivilegedKey(key: string): boolean {
  if (key.startsWith('sb_secret_')) return true
  const parts = key.split('.')
  if (parts.length !== 3 || !parts[1]) return false
  try {
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    const payload: unknown = JSON.parse(json)
    return (
      typeof payload === 'object' &&
      payload !== null &&
      (payload as { role?: unknown }).role === 'service_role'
    )
  } catch {
    return false
  }
}

export function parseEnv(raw: Record<string, unknown>): AppEnv {
  const result = envSchema.safeParse(raw)
  if (!result.success) {
    const issues = result.error.issues.map((i) => `- ${i.message}`).join('\n')
    throw new Error(`Invalid frontend environment:\n${issues}\nSee .env.example.`)
  }
  if (isPrivilegedKey(result.data.VITE_SUPABASE_ANON_KEY)) {
    // Security rule: service-role / secret keys bypass RLS and must stay server-side.
    throw new Error(
      'Refusing to start: VITE_SUPABASE_ANON_KEY is a secret/service-role key. Use the anon or publishable key.',
    )
  }
  return result.data
}
