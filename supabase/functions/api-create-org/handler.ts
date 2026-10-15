import { z } from '../_shared/deps.ts'
import { HttpError, json, mapDbError } from '../_shared/http.ts'
import type { UserScopedContext } from '../_shared/types.ts'
import { isValidTimeZone, readJson } from '../_shared/validate.ts'

export const createOrgSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  size_band: z.enum(['1-20', '21-50', '51-150', '151+']).optional(),
  timezone: z
    .string()
    .refine(isValidTimeZone, 'Unknown time zone')
    .default('Asia/Kolkata'),
})

/**
 * POST /api-create-org  { name, size_band?, timezone? } -> 201 { org_id }
 * Runs as the caller: create_organization() makes them owner and writes org.created (FR-02).
 */
export async function createOrg(req: Request, ctx: UserScopedContext): Promise<Response> {
  if (!ctx.userClaims) throw new HttpError(401, 'unauthenticated', 'Sign in required')
  const body = await readJson(req, createOrgSchema)

  const { data, error } = await ctx.supabase.rpc('create_organization', {
    p_name: body.name,
    p_size_band: body.size_band ?? null,
    p_timezone: body.timezone,
  })
  if (error) throw mapDbError(error, 'Could not create organization')
  if (typeof data !== 'string') throw new HttpError(500, 'internal', 'Unexpected response')

  return json({ org_id: data }, 201)
}
