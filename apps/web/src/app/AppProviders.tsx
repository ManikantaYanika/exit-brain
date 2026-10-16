import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { AdminApiProvider } from '../data/admin/AdminApiProvider'
import type { AdminApi } from '../data/admin/types'
import type { ExitBrainApi } from '../data/api'
import { ApiProvider } from '../data/ApiProvider'
import type { AuthGateway } from '../data/auth'
import { ToastProvider } from '../design/primitives/Toast'
import { AuthProvider } from './auth'

export function AppProviders({
  api,
  auth,
  queryClient,
  adminApi,
  children,
}: {
  api: ExitBrainApi
  auth: AuthGateway
  queryClient: QueryClient
  /** Admin portal adapter; the demo falls back to one in-memory instance per page load. */
  adminApi?: AdminApi
  children: ReactNode
}) {
  const inner = (
    <ApiProvider api={api}>
      <AuthProvider gateway={auth}>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </ApiProvider>
  )
  return (
    <QueryClientProvider client={queryClient}>
      {adminApi ? <AdminApiProvider api={adminApi}>{inner}</AdminApiProvider> : inner}
    </QueryClientProvider>
  )
}
