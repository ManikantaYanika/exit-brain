import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { Role } from '../data/types'
import { EmptyState } from '../design/states/States'
import { usePersona } from './persona'

/**
 * UI-level gate. Usability only — Postgres RLS is the security boundary
 * (security-and-privacy.md §4) and this component never replaces it.
 */
export function RoleGate({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const { persona } = usePersona()
  if (allow.includes(persona.role)) return <>{children}</>
  return (
    <EmptyState
      title="This page isn’t part of your portal"
      body={`As ${persona.label.toLowerCase()}, you don’t have access to this page. Your own work is one click away.`}
      action={
        <Link to={persona.home} className="text-sm font-medium text-brand hover:underline">
          Go to my portal
        </Link>
      }
    />
  )
}
