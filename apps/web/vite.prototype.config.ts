import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Single-file prototype artifact only (`npm run build:prototype`): data-mode entry (src/main.tsx)
 * with a memory router, every asset (including fonts) inlined. The real app builds with
 * `react-router build` (vite.config.ts).
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: 'VITE_',
  build: {
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    rollupOptions: { input: 'index.prototype.html' },
  },
})
