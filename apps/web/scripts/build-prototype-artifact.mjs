// Bundle the memory-routed prototype into ONE self-contained HTML file (CSS + JS inlined)
// for sharing as a claude.ai Artifact. Usage: npm run build:prototype
import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const out = 'dist-prototype'
execSync(`npx vite build --base ./ --outDir ${out}/build --emptyOutDir`, {
  stdio: 'inherit',
  env: { ...process.env, VITE_ROUTER: 'memory' },
})
const assets = join(out, 'build', 'assets')
const files = readdirSync(assets)
const css = files
  .filter((f) => f.endsWith('.css'))
  .map((f) => readFileSync(join(assets, f), 'utf8'))
  .join('\n')
const js = files
  .filter((f) => f.endsWith('.js'))
  .map((f) => readFileSync(join(assets, f), 'utf8'))
  .join('\n')
if (js.includes('</script')) throw new Error('bundle contains </script; cannot inline safely')

const html = `<title>Exit Brain Prototype</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`
mkdirSync(out, { recursive: true })
writeFileSync(join(out, 'exit-brain-prototype.html'), html)
console.log(`wrote ${out}/exit-brain-prototype.html (${(html.length / 1024).toFixed(0)} KB)`)
