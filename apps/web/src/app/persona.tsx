import { createContext, useContext, useState, type ReactNode } from 'react'

import { personas, type Persona, type PersonaId } from './personas'

interface PersonaState {
  persona: Persona
  setPersona: (id: PersonaId) => void
}

const PersonaContext = createContext<PersonaState | null>(null)

export function PersonaProvider({
  children,
  initial = 'priya',
}: {
  children: ReactNode
  initial?: PersonaId
}) {
  const [id, setId] = useState<PersonaId>(initial)
  return (
    <PersonaContext.Provider value={{ persona: personas[id], setPersona: setId }}>
      {children}
    </PersonaContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function usePersona(): PersonaState {
  const ctx = useContext(PersonaContext)
  if (!ctx) throw new Error('usePersona must be used inside <PersonaProvider>')
  return ctx
}
