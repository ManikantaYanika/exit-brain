// Static server for E2E runs, with the same routing rules as deploy/nginx/exit-brain.conf:
// file or <path>/index.html -> 200; product routes -> __spa-fallback.html (200); else 404 page (404).
// Usage: node scripts/ci/serve-web.mjs <build/client> <port>
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const root = process.argv[2]
const port = Number(process.argv[3] ?? 5173)
const SPA = /^\/(signin|signup|check-email|demo)\/?$|^\/app(\/.*)?$/
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json',
}
const isFile = async (p) => { try { return (await stat(p)).isFile() } catch { return false } }

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
  let file = join(root, path)
  let status = 200
  if (!file.startsWith(root) || !(await isFile(file))) {
    if (await isFile(join(file, 'index.html'))) file = join(file, 'index.html')
    else if (SPA.test(path)) file = join(root, '__spa-fallback.html')
    else { file = join(root, '404/index.html'); status = 404 }
  }
  res.writeHead(status, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' })
  res.end(await readFile(file))
}).listen(port, '127.0.0.1', () => console.log(`serving ${root} on http://localhost:${port}`))
