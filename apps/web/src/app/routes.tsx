import type { RouteObject } from 'react-router'
import { CheckEmailPage } from '../features/auth/CheckEmailPage'
import { DemoPickerPage } from '../features/auth/DemoPickerPage'
import { SignInPage } from '../features/auth/SignInPage'
import { SignUpPage } from '../features/auth/SignUpPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { InterviewPage } from '../features/interview/InterviewPage'
import { LandingPage } from '../features/marketing/LandingPage'
import { MarketingLayout } from '../features/marketing/MarketingLayout'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { SuccessorPage } from '../features/successor/SuccessorPage'
import { TeamPage } from '../features/team/TeamPage'
import { AnswersTab } from '../features/transition/AnswersTab'
import { HandoverTab } from '../features/transition/HandoverTab'
import { KnowledgeReview } from '../features/transition/KnowledgeReview'
import { TransitionPage } from '../features/transition/TransitionPage'
import { AppLayout } from './AppLayout'
import { NotFound, RoleHome } from './pages'
import { RequireAuth } from './RequireAuth'
import { RoleGate } from './RoleGate'

const ADMINS = ['owner', 'admin'] as const
const STAFF = ['owner', 'admin', 'manager'] as const

/**
 * Public site → auth portal → one portal per role under /app.
 * RoleGate only shapes the UI; RLS is the security boundary.
 */
export const routes: RouteObject[] = [
  { path: '/', element: <MarketingLayout />, children: [{ index: true, element: <LandingPage /> }] },
  { path: '/signin', element: <SignInPage /> },
  { path: '/signup', element: <SignUpPage /> },
  { path: '/check-email', element: <CheckEmailPage /> },
  { path: '/demo', element: <DemoPickerPage /> },
  {
    path: '/app',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <RoleHome /> },
      {
        path: 'transitions',
        element: (
          <RoleGate allow={[...STAFF, 'viewer']}>
            <DashboardPage />
          </RoleGate>
        ),
      },
      {
        path: 'transitions/:id',
        element: (
          <RoleGate allow={[...STAFF]}>
            <TransitionPage />
          </RoleGate>
        ),
        children: [
          { index: true, element: <KnowledgeReview /> },
          { path: 'answers', element: <AnswersTab /> },
          { path: 'handover', element: <HandoverTab /> },
        ],
      },
      {
        path: 'interview/:id',
        element: (
          <RoleGate allow={['employee']}>
            <InterviewPage />
          </RoleGate>
        ),
      },
      {
        path: 'onboarding/:id',
        element: (
          <RoleGate allow={['successor']}>
            <SuccessorPage />
          </RoleGate>
        ),
      },
      {
        path: 'setup',
        element: (
          <RoleGate allow={[...ADMINS]}>
            <OnboardingPage />
          </RoleGate>
        ),
      },
      {
        path: 'team',
        element: (
          <RoleGate allow={[...STAFF]}>
            <TeamPage />
          </RoleGate>
        ),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]
