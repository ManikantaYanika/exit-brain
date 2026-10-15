import { index, layout, prefix, route, type RouteConfig } from '@react-router/dev/routes'

// SPIKE (W1): same URL structure as src/app/routes.tsx, expressed as route modules.
export default [
  layout('routes/site-layout.tsx', [
    index('routes/home.tsx'),
    route('spike-about', 'routes/spike-about.tsx'),
  ]),
  route('sitemap.xml', 'routes/sitemap.ts'),
  route('signin', 'routes/signin.tsx'),
  route('signup', 'routes/signup.tsx'),
  route('check-email', 'routes/check-email.tsx'),
  route('demo', 'routes/demo.tsx'),
  ...prefix('app', [
    layout('routes/app-layout.tsx', [
      index('routes/app-home.tsx'),
      route('transitions', 'routes/app-transitions.tsx'),
      route('transitions/:id', 'routes/app-transition.tsx', [
        index('routes/app-transition-review.tsx'),
        route('answers', 'routes/app-transition-answers.tsx'),
        route('handover', 'routes/app-transition-handover.tsx'),
      ]),
      route('interview/:id', 'routes/app-interview.tsx'),
      route('onboarding/:id', 'routes/app-onboarding.tsx'),
      route('setup', 'routes/app-setup.tsx'),
      route('team', 'routes/app-team.tsx'),
    ]),
  ]),
  route('404', 'routes/not-found.tsx', { id: 'not-found-page' }),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
