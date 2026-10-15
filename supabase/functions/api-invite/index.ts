import { appOrigin, corsHeaders } from '../_shared/config.ts'
import { withSupabase } from '../_shared/deps.ts'
import { handle } from '../_shared/http.ts'
import { invite } from './handler.ts'
import type { UserScopedContext } from '../_shared/types.ts'

const origin = appOrigin()

export default {
  fetch: withSupabase(
    { auth: 'user', cors: { headers: corsHeaders(origin) } },
    handle('api-invite', 'POST', (req, ctx: UserScopedContext) => invite(req, ctx, origin)),
  ),
}
