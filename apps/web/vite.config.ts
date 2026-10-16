import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { reactRouter } from '@react-router/dev/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * `vite preview` only: serve the build the way deploy/nginx/exit-brain.conf does.
 * /privacy → privacy/index.html (prerendered); app routes → __spa-fallback.html; anything else →
 * the branded 404 page.
 * Without this, preview answers every path with the home page HTML, React hydrates the wrong
 * markup and the page renders twice. Production (nginx) is unaffected.
 */
const SPA_ROUTE = /^\/(?:(?:signin|signup|check-email|demo)\/?$|app(?:\/|$))/

function previewLikeNginx(): Plugin {
  return {
    name: 'exit-brain:preview-like-nginx',
    configurePreviewServer(server) {
      const dir = resolve(server.config.root, 'build/client')
      server.middlewares.use((req, res, next) => {
        // React Router's prerender step also runs a preview server during `build`; leave it alone.
        if (process.env.IS_RR_BUILD_REQUEST === 'yes') return next()
        const [path = '/', query = ''] = (req.url ?? '/').split('?')
        const isPage = req.method === 'GET' && !/\.[a-z0-9]+$/i.test(path) && path !== '/'
        if (isPage) {
          const page = join(path, 'index.html')
          if (!existsSync(join(dir, page)) && !SPA_ROUTE.test(path)) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(readFileSync(join(dir, '404/index.html')))
            return
          }
          const target = existsSync(join(dir, page)) ? page : '/__spa-fallback.html'
          req.url = target + (query ? `?${query}` : '')
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // The React Router plugin builds the site + app (framework mode); Vitest keeps the plain React plugin.
  // The single-file prototype has its own config: vite.prototype.config.ts.
  plugins: [process.env.VITEST ? react() : reactRouter(), tailwindcss(), previewLikeNginx()],
  // Only VITE_* vars reach the browser bundle. Secrets must never use this prefix.
  envPrefix: 'VITE_',
  // Dev only: pre-bundle these up front. Otherwise Vite finds them on the first page load, re-optimizes
  // and reloads mid-hydration ("504 Outdated Optimize Dep"), and the prerendered page stays
  // non-interactive (cards, Get started menu) until a manual refresh.
  optimizeDeps: { include: ['lucide-react', '@tanstack/react-query', 'zod'] },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
})
