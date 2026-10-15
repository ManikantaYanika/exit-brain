import { Link, Navigate } from 'react-router'
import { EmptyState } from '../design/states/States'
import { useOptionalAuth } from './auth'
import { usePersona } from './persona'

/** /app sends each person to their own portal. */
export function RoleHome() {
  const { persona } = usePersona()
  return <Navigate to={persona.home} replace />
}

export function NotFound() {
  const status = useOptionalAuth()?.status ?? 'signedOut'
  const home = status === 'signedIn' ? '/app' : '/'
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <EmptyState
        title="Page not found"
        body="The link may be old, or the page may have moved."
        action={
          <Link to={home} className="text-sm font-medium text-brand hover:underline">
            {status === 'signedIn' ? 'Go to my portal' : 'Go to the home page'}
          </Link>
        }
      />
    </div>
  )
}
