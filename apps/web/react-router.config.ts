import type { Config } from '@react-router/dev/config'

/**
 * SPIKE (W1): framework mode with build-time prerender for public pages only.
 * Everything else (/signin, /demo, /app/*) is served by the SPA fallback (__spa-fallback.html).
 */
export default {
  appDirectory: 'src',
  ssr: false,
  prerender: ['/', '/spike-about', '/sitemap.xml', '/404'],
} satisfies Config
