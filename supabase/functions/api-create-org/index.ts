import { appOrigin, corsHeaders } from '../_shared/config.ts'
import { withSupabase } from '../_shared/deps.ts'
import { handle } from '../_shared/http.ts'
import { createOrg } from './handler.ts'

export default {
  fetch: withSupabase(
    { auth: 'user', cors: { headers: corsHeaders(appOrigin()) } },
    handle('api-create-org', 'POST', createOrg),
  ),
}
