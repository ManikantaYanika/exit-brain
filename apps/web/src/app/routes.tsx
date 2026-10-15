import type { RouteObject } from 'react-router'
import { Home, NotFound } from './pages'
import { Shell } from './Shell'

/**
 * Route tree. Screens (S1 auth, S2 onboarding, S4 dashboard, S11 team) are
 * added later today; these placeholders keep the shell routable and testable.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <Home /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]
