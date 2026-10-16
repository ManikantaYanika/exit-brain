import type { Config } from '@react-router/dev/config'

/**
 * Framework mode with build-time prerender for public pages only.
 * Everything else (/signin, /demo, /app/*) is served by the SPA fallback (__spa-fallback.html).
 */
export default {
  appDirectory: 'src',
  ssr: false,
  prerender: ['/', '/how-it-works', '/features', '/sitemap.xml', '/robots.txt', '/404'],
} satisfies Config
