import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Evidence } from '../../data/types'

interface EvidenceState {
  all: Evidence[]
  byId: Map<string, Evidence>
  /** Global citation number for an evidence id (stable order of first appearance in `all`). */
  numberOf: (id: string) => number
  focused: string[]
  focus: (ids: string[]) => void
  focusKey: number
}

const Ctx = createContext<EvidenceState | null>(null)

export function EvidenceProvider({ evidence, children }: { evidence: Evidence[]; children: ReactNode }) {
  const [focused, setFocused] = useState<string[]>([])
  const [focusKey, setFocusKey] = useState(0)
  const byId = useMemo(() => new Map(evidence.map((e) => [e.id, e])), [evidence])
  const order = useMemo(() => new Map(evidence.map((e, i) => [e.id, i + 1])), [evidence])
  const focus = useCallback((ids: string[]) => {
    setFocused(ids)
    setFocusKey((k) => k + 1)
  }, [])
  const value = useMemo(
    () => ({ all: evidence, byId, numberOf: (id: string) => order.get(id) ?? 0, focused, focus, focusKey }),
    [evidence, byId, order, focused, focus, focusKey],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useEvidenceContext(): EvidenceState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useEvidenceContext must be used inside <EvidenceProvider>')
  return ctx
}
