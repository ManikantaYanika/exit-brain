import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { ExitBrainApi } from '../data/api'
import { ApiProvider } from '../data/ApiProvider'
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
        <PersonaProvider initial={persona}>{children}</PersonaProvider>
      </ApiProvider>
    </QueryClientProvider>
  )
}
