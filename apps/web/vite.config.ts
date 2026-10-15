import tailwindcss from '@tailwindcss/vite'
import { reactRouter } from '@react-router/dev/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // The React Router plugin builds the site + app (framework mode); Vitest keeps the plain React plugin.
  // The single-file prototype has its own config: vite.prototype.config.ts.
  plugins: [process.env.VITEST ? react() : reactRouter(), tailwindcss()],
  // Only VITE_* vars reach the browser bundle. Secrets must never use this prefix.
  envPrefix: 'VITE_',
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
})
