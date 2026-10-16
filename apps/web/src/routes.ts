import { index, layout, prefix, route, type RouteConfig } from '@react-router/dev/routes'

/**
 * Build-time route config (framework mode). Public pages listed in react-router.config.ts are
 * prerendered; everything else is served by the SPA fallback.
 * Auth (and, in live mode, the Supabase client) is only mounted for the routes inside auth-scope.
 * Keep in sync with src/app/routes.tsx (used by tests and the prototype) — routes.parity.test.ts checks this.
 */
export default [
  layout('routes/site-layout.tsx', [
    index('routes/home.tsx'),
    route('how-it-works', 'routes/how-it-works.tsx'),
    route('features', 'routes/features.tsx'),
    route('security', 'routes/security.tsx'),
    route('why-exit-brain', 'routes/why-exit-brain.tsx'),
    route('services', 'routes/services.tsx'),
    route('about', 'routes/about.tsx'),
    route('about/founder', 'routes/founder.tsx'),
    route('contact', 'routes/contact.tsx'),
    route('help', 'routes/help.tsx'),
    route('privacy', 'routes/privacy.tsx'),
    route('terms', 'routes/terms.tsx'),
    // '/404' is prerendered through this splat route, so the 404 file hydrates as the same route
    // that any unknown URL matches on the client (no hydration mismatch).
    route('*', 'routes/site-not-found.tsx'),
  ]),
  route('sitemap.xml', 'routes/sitemap.ts'),
  route('robots.txt', 'routes/robots.ts'),
  layout('routes/auth-scope.tsx', [
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
        route('*', 'routes/not-found.tsx', { id: 'app-not-found' }),
      ]),
    ]),
  ]),
] satisfies RouteConfig
