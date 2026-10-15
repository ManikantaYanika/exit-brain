import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { ExitBrainApi } from '../data/api'
import { ApiProvider } from '../data/ApiProvider'
import { ToastProvider } from '../design/primitives/Toast'
import { PersonaProvider } from './persona'
import type { PersonaId } from './personas'

export function AppProviders({
  api,
  queryClient,
  persona,
  children,
}: {
  api: ExitBrainApi
  queryClient: QueryClient
  persona?: PersonaId
  children: ReactNode
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider api={api}>
        <PersonaProvider initial={persona}>
          <ToastProvider>{children}</ToastProvider>
        </PersonaProvider>
      </ApiProvider>
    </QueryClientProvider>
  )
}
