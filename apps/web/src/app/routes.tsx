import type { RouteObject } from 'react-router'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { InterviewPage } from '../features/interview/InterviewPage'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { SuccessorPage } from '../features/successor/SuccessorPage'
import { AnswersTab } from '../features/transition/AnswersTab'
import { HandoverTab } from '../features/transition/HandoverTab'
import { KnowledgeReview } from '../features/transition/KnowledgeReview'
import { TransitionPage } from '../features/transition/TransitionPage'
import { NotFound } from './pages'
import { RoleGate } from './RoleGate'
import { Shell } from './Shell'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Shell />,
    children: [
      {
        index: true,
        element: (
          <RoleGate allow={['manager', 'viewer']}>
            <DashboardPage />
          </RoleGate>
        ),
      },
      {
        path: 'onboarding',
        element: (
          <RoleGate allow={['manager']}>
            <OnboardingPage />
          </RoleGate>
        ),
      },
      {
        path: 'transitions/:id',
        element: (
          <RoleGate allow={['manager']}>
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
        path: 'successor/:id',
        element: (
          <RoleGate allow={['successor']}>
            <SuccessorPage />
          </RoleGate>
        ),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]
