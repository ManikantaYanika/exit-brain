import { createContext, useContext, type ReactNode } from 'react'
import { createMockAdminApi, type MockAdminApi } from './mockAdminApi'
import type { AdminApi } from './types'

const Ctx = createContext<AdminApi | null>(null)
let fallback: MockAdminApi | null = null

/** Tests and the live adapter pass their own; the demo uses one in-memory instance per page load. */
export function AdminApiProvider({ api, children }: { api: AdminApi; children: ReactNode }) {
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAdminApi(): AdminApi {
  const api = useContext(Ctx)
  if (api) return api
  fallback ??= createMockAdminApi()
  return fallback
}
