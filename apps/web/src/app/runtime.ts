import { createMockApi } from '../data/mockApi'
import { createQueryClient } from '../lib/queryClient'
import { createAuth } from './createAuth'

/**
 * Per-page-load singletons for the framework-mode build (src/root.tsx, routes/auth-scope.tsx).
 * Product data stays MOCK DATA until the live data adapter lands (roadmap Days 2–6).
 * Creating `auth` loads nothing: in live mode Supabase is fetched on the first auth call.
 */
export const api = createMockApi()
export const auth = createAuth()
export const queryClient = createQueryClient()
