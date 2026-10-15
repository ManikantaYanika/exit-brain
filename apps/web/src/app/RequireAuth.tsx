import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { SkeletonRows } from '../design/states/States'
import { NoWorkspacePage } from '../features/auth/NoWorkspacePage'
import { useAuth } from './auth'

/** Signed-out visitors go to sign-in; members without a workspace create one first. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, session } = useAuth()
  const location = useLocation()
  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <SkeletonRows rows={2} label="Loading your workspace" />
      </div>
    )
  }
  if (status === 'signedOut' || !session) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  }
  if (!session.role) return <NoWorkspacePage />
  return <>{children}</>
}
