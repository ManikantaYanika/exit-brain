import type { Session } from '../../data/auth'
import { homePathFor } from '../../domain/permissions'

/** Where to go after sign-in: the page they were sent away from, if it's inside the app. */
export function destinationFor(session: Session, from: unknown): string {
  if (!session.role) return '/app'
  if (typeof from === 'string' && from.startsWith('/app/') && !from.startsWith('//')) return from
  return homePathFor(session.role, session.homeTransitionId ?? undefined)
}
