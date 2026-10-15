import { appOrigin, corsHeaders } from '../_shared/config.ts'
import { withSupabase } from '../_shared/deps.ts'
import { handle } from '../_shared/http.ts'
import { acceptInvite } from './handler.ts'

export default {
  fetch: withSupabase(
    { auth: 'user', cors: { headers: corsHeaders(appOrigin()) } },
    handle('api-accept-invite', 'POST', acceptInvite),
  ),
}
