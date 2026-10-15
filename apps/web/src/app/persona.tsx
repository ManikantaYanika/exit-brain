import type { Role } from '../data/types'
import { homePathFor } from '../domain/permissions'
import { useAuth } from './auth'

/** The signed-in person, as the portal screens need them. Derived from the auth session. */
export interface Persona {
  name: string
  firstName: string
  role: Role
  label: string
  home: string
}

/** Only used inside <RequireAuth>, which guarantees a session with a role. */
export function usePersona(): { persona: Persona } {
  const { session } = useAuth()
  if (!session?.role) throw new Error('usePersona needs a signed-in member (wrap the route in <RequireAuth>)')
  return {
    persona: {
      name: session.name,
      firstName: session.name.split(' ')[0] ?? session.name,
      role: session.role,
      label: session.roleLabel,
      home: homePathFor(session.role, session.homeTransitionId ?? undefined),
    },
  }
}
