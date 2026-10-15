import type { DbError } from './http.ts'

/**
 * The slice of the request context our Day-1 handlers use. Handlers depend on this
 * narrow interface (not the full SupabaseContext) so they can be unit-tested with fakes,
 * and so it is obvious they never touch the service-role client.
 */
export interface UserScopedContext {
  supabase: {
    rpc(fn: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: DbError | null }>
  }
  userClaims: { id: string; email?: string } | null
}
