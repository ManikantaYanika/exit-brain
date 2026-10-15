import { z } from '../_shared/deps.ts'
import { HttpError, json, mapDbError } from '../_shared/http.ts'
import type { UserScopedContext } from '../_shared/types.ts'
import { readJson } from '../_shared/validate.ts'

export const acceptSchema = z.object({
  token: z.string().min(32, 'Invalid invitation').max(128, 'Invalid invitation'),
})

/**
 * POST /api-accept-invite  { token } -> 200 { org_id }
 * accept_invitation() hashes the token and checks: unused, unrevoked, unexpired,
 * and invited email == caller's email. All failures return the same message (T11).
 */
export async function acceptInvite(req: Request, ctx: UserScopedContext): Promise<Response> {
  if (!ctx.userClaims) throw new HttpError(401, 'unauthenticated', 'Sign in required')
  const body = await readJson(req, acceptSchema)

  const { data, error } = await ctx.supabase.rpc('accept_invitation', { p_token: body.token })
  if (error) {
    if (error.code === '22023') {
      throw new HttpError(400, 'bad_request', 'This invitation is invalid, expired or for a different email')
    }
    throw mapDbError(error, 'Could not accept invitation')
  }
  if (typeof data !== 'string') throw new HttpError(500, 'internal', 'Unexpected response')

  return json({ org_id: data }, 200)
}
