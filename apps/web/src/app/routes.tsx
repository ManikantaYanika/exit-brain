import type { RouteObject } from 'react-router'
import { CheckEmailPage } from '../features/auth/CheckEmailPage'
import { DemoPickerPage } from '../features/auth/DemoPickerPage'
import { SignInPage } from '../features/auth/SignInPage'
import { SignUpPage } from '../features/auth/SignUpPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { InterviewPage } from '../features/interview/InterviewPage'
import { HomePage } from '../features/site/home/HomePage'
import { FeaturesPage } from '../features/site/pages/FeaturesPage'
import { HowItWorksPage } from '../features/site/pages/HowItWorksPage'
import { ContactPage } from '../features/site/contact/ContactPage'
import { AboutPage, FounderPage, ServicesPage } from '../features/site/pages/CompanyPages'
import { HelpPage } from '../features/site/pages/HelpPage'
import { PrivacyPage, TermsPage } from '../features/site/pages/LegalPages'
import { SecurityPage } from '../features/site/pages/SecurityPage'
import { SiteNotFoundPage } from '../features/site/pages/SiteNotFoundPage'
import { WhyPage } from '../features/site/pages/WhyPage'
import { SiteLayout } from '../features/site/SiteLayout'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { SuccessorPage } from '../features/successor/SuccessorPage'
import { TeamPage } from '../features/team/TeamPage'
import { AdminShell } from '../features/admin/AdminShell'
import { AuditPage } from '../features/admin/AuditPage'
import { BillingPage } from '../features/admin/BillingPage'
import { DataPage } from '../features/admin/DataPage'
import { IntegrationsPage } from '../features/admin/IntegrationsPage'
import { KnowledgePage } from '../features/admin/KnowledgePage'
import { OverviewPage } from '../features/admin/OverviewPage'
import { PeoplePage } from '../features/admin/PeoplePage'
import { SecurityPage as AdminSecurityPage } from '../features/admin/SecurityPage'
import { SettingsPage } from '../features/admin/SettingsPage'
import { SystemPage } from '../features/admin/SystemPage'
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
  {
    path: '/',
    element: <SiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'how-it-works', element: <HowItWorksPage /> },
      { path: 'features', element: <FeaturesPage /> },
      { path: 'security', element: <SecurityPage /> },
      { path: 'why-exit-brain', element: <WhyPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'about/founder', element: <FounderPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'help', element: <HelpPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: '*', element: <SiteNotFoundPage /> },
    ],
  },
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
      {
        path: 'admin',
        element: (
          <RoleGate allow={[...ADMINS]}>
            <AdminShell />
          </RoleGate>
        ),
        children: [
          { index: true, element: <OverviewPage /> },
          { path: 'people', element: <PeoplePage /> },
          { path: 'knowledge', element: <KnowledgePage /> },
          { path: 'system', element: <SystemPage /> },
          { path: 'integrations', element: <IntegrationsPage /> },
          { path: 'audit', element: <AuditPage /> },
          { path: 'data', element: <DataPage /> },
          { path: 'security', element: <AdminSecurityPage /> },
          { path: 'billing', element: <BillingPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]
