import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Only VITE_* vars reach the browser bundle. Secrets must never use this prefix.
  envPrefix: 'VITE_',
  build: {
    // The single-file prototype (VITE_ROUTER=memory) has no sibling files, so inline every asset.
    assetsInlineLimit: process.env.VITE_ROUTER === 'memory' ? Number.MAX_SAFE_INTEGER : 4096,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
})
