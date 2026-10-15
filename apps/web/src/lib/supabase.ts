import { createClient } from '@supabase/supabase-js'
import { parseEnv } from './env'

const env = parseEnv(import.meta.env)

/**
 * Browser client: anon/publishable key + the signed-in user's JWT.
 * Every query is filtered by Postgres RLS — never trust the UI for authorization.
 */
export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
