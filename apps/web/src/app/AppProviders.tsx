import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { ExitBrainApi } from '../data/api'
import { ApiProvider } from '../data/ApiProvider'
import type { AuthGateway } from '../data/auth'
import { ToastProvider } from '../design/primitives/Toast'
import { AuthProvider } from './auth'

export function AppProviders({
  api,
  auth,
  queryClient,
  children,
}: {
  api: ExitBrainApi
  auth: AuthGateway
  queryClient: QueryClient
  children: ReactNode
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider api={api}>
        <AuthProvider gateway={auth}>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </ApiProvider>
    </QueryClientProvider>
  )
}
