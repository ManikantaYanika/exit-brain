import type { ReactNode } from 'react'
import { usePersona } from './persona'
import type { Persona } from './personas'

/**
 * UI-level gate for the prototype. Usability only — in the real app Postgres RLS is the
 * security boundary (security-and-privacy.md §4) and this component never replaces it.
 */
export function RoleGate({ allow, children }: { allow: Persona['role'][]; children: ReactNode }) {
  const { persona } = usePersona()
  if (allow.includes(persona.role)) return <>{children}</>
  return (
    <div className="max-w-xl rounded-lg border border-line bg-surface p-5">
      <h1 className="text-lg font-semibold">This page isn’t part of {persona.name.split(' ')[0]}’s view</h1>
      <p className="mt-1 text-sm text-muted">
        As {persona.label.toLowerCase()}, {persona.name.split(' ')[0]} wouldn’t see it. Use the “Viewing as”
        menu to switch person.
      </p>
    </div>
  )
}
