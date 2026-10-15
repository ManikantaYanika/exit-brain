import { createContext, useContext, type ReactNode } from 'react'
import type { ExitBrainApi } from './api'

const ApiContext = createContext<ExitBrainApi | null>(null)

export function ApiProvider({ api, children }: { api: ExitBrainApi; children: ReactNode }) {
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useApi(): ExitBrainApi {
  const api = useContext(ApiContext)
  if (!api) throw new Error('useApi must be used inside <ApiProvider>')
  return api
}
