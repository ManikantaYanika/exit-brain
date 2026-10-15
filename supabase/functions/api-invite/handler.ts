import { z } from '../_shared/deps.ts'
import { HttpError, json, mapDbError } from '../_shared/http.ts'
import { generateToken, sha256Hex } from '../_shared/tokens.ts'
import type { UserScopedContext } from '../_shared/types.ts'
import { readJson } from '../_shared/validate.ts'

export const inviteSchema = z.object({
  org_id: z.uuid(),
  // trim + lowercase BEFORE validating: pasted emails often carry spaces/caps.
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  // 'owner' can never be granted by invitation (T2).
  role: z.enum(['admin', 'manager', 'employee', 'successor', 'viewer']),
})

/**
 * POST /api-invite  { org_id, email, role } -> 201 { invitation_id, expires_at, invite_url }
 * create_invitation() checks owner/admin, stores only sha256(token) and audits member.invited.
 * The raw token is returned once so the inviter can share the link (email delivery is
 * deferred — roadmap Day 1 fallback). It travels in the URL fragment, which browsers do not
 * send to servers, so it doesn't land in access logs.
 */
export async function invite(req: Request, ctx: UserScopedContext, origin: string): Promise<Response> {
  if (!ctx.userClaims) throw new HttpError(401, 'unauthenticated', 'Sign in required')
  const body = await readJson(req, inviteSchema)

  const token = generateToken()
  const { data, error } = await ctx.supabase.rpc('create_invitation', {
    p_org: body.org_id,
    p_email: body.email,
    p_role: body.role,
    p_token_hash: await sha256Hex(token),
  })
  if (error) {
    if (error.code === '23505') {
      throw new HttpError(409, 'conflict', 'This person is already a member or has an open invitation')
    }
    throw mapDbError(error, 'Could not create invitation')
  }
  const row = data as { id?: string; expires_at?: string } | null
  if (!row?.id) throw new HttpError(500, 'internal', 'Unexpected response')

  return json(
    {
      invitation_id: row.id,
      expires_at: row.expires_at,
      invite_url: `${origin}/invite/accept#token=${token}`,
    },
    201,
  )
}
