# W1b report — framework mode + prerender, hardened

> Date: 15 Oct 2026 · Branch `feat/w1b-framework-mode` · Gate ⛔ owner review before merge and before W2.
> Context: the W1 spike (PR #10) was merged into `main` (14:02 UTC) before the owner's "do not merge" decision arrived. W1b therefore starts from that `main` and fixes it, instead of re-doing the migration. No revert was done.
> Everything below was run. Numbers are measured. Things not verified are listed as such.

## 1. Spike limitations → status

| # | Limitation (W1 report) | Fix | Verified by |
|---|---|---|---|
| 1 | Live Supabase auth not wired | `createAuth()` + `createLazyGateway()`: Supabase loads lazily, browser-only; prerender never touches it | 5 unit tests; live-mode build loads with no page errors and no demo panel (local); **real sign-up → email → sign-in: CI job `live-auth`** (see §3) |
| 2 | `build:prototype` broken | `vite.prototype.config.ts` + `index.prototype.html` + data-mode `src/main.tsx`, fonts inlined | `npm run build:prototype` → 748 KB single file, 5 inlined fonts, no Google Fonts; CI step added |
| 3 | Two route definitions | `src/app/routes.parity.test.ts` compares URL trees and checks every route file exists | Passes; **fails when a route is removed** (mutation check) |
| 4 | `isbot` auto-install broke `node_modules` | `isbot` declared (`^5.2.2`, Unlicense) | `rm -rf node_modules && npm ci && npm run build`: no auto-install, `package.json` unchanged by the build |
| 5 | 404 status depends on host | `deploy/nginx/exit-brain.conf` + `scripts/ci/test-nginx.sh` (real nginx 1.24) | 10/10 checks: `/`, sitemap, `/signin`, `/demo`, `/app`, deep app route → 200; `/does-not-exist`, `/spike-about` → **404**; `/fonts/OFL.txt` → 200; JS served gzip. CI step added |
| 6 | No default title on SPA pages | Root `meta` (`Exit Brain`) + `appMeta()` on every app/auth route (title + `noindex`) | `src/routes/meta.test.ts` (every route module exports meta); prerender guard checks fallback title |

Also: `/spike-about` removed; `scripts/verify-prerender.mjs` (CI) fails the build if prerendered pages lose H1, title, description, canonical, OG, 404 page, sitemap, fallback title — confirmed it fails (13 errors) on the old SPA build.

## 2. D8 — fonts self-hosted

- Files: `src/design/fonts/` (Sans 400/500/600, Mono 400/500 latin WOFF2 from `@fontsource/*@5.3.0`), `fonts.css`, `OFL.txt` (also served at `/fonts/OFL.txt`). No npm font package.
- Google Fonts links removed from `root.tsx`, `index.prototype.html` and the prototype script.
- Preloaded: Sans 400 and 600.
- **No visual change — measured:** 32 screens (8 pages × light/dark × 1280/390 px; landing, sign-in, demo, manager transitions + review, employee interview, successor, owner team), old build (pre-spike `51ea3f9`, Google Fonts emulated with the same IBM Plex files because the CDN is blocked in this sandbox) vs new build: **31 identical, 1 with 6 differing pixels**. Re-rendering the *new* build twice reproduces the same 6-pixel difference against itself, and a re-run matched the old build exactly → rendering noise, not a font or layout change. Loaded font faces identical on every screen.
- Caveat: Google's own font binaries can differ slightly from Fontsource's; the comparison proves our CSS, weights, ranges and layout are unchanged.

## 3. Live Supabase auth

- Local stack can't run in this sandbox (Docker registries return 403), so verification runs in a **new CI job `live-auth`**: `supabase start` (Postgres, GoTrue, PostgREST, Kong, Mailpit) → build with `VITE_AUTH_MODE=live` → Playwright: live sign-in page has no demo panel → sign-up → confirmation email read from Mailpit → link signs in → "Welcome / Create workspace" (no membership) → reload keeps session → sign-out protects `/app` → wrong password rejected → sign-in again → unconfirmed account blocked. **Result: passed on PR #11, run 38752619332** (step "Run sign-up, confirmation and sign-in in a real browser" succeeded; the script exits non-zero if any of its 9 checks fails). Log text could not be downloaded from the build sandbox; it is visible in the GitHub job log.
- Not covered: workspace creation through the `api-create-org` Edge Function (edge runtime not started in this job), magic link.
- Known cost: in live mode the Supabase client chunk (**~55 KB gzip**) also loads on marketing pages, because the auth provider checks the session on mount. Proposed fix in W2: check the session only on auth/app routes. Demo mode is unaffected.

## 4. Performance (measured separately; not a pass/fail claim)

Lighthouse 12.8.2, mobile, simulated throttling, 3 runs each, local nginx with gzip. Old = pre-spike SPA (`51ea3f9`). Its Google Fonts request fails in this sandbox, so the old build downloads **no fonts** (an advantage for it).

| Setup | Page | Perf | LCP (ms) | FCP (ms) | TBT (ms) | CLS |
|---|---|---|---|---|---|---|
| HTTPS + HTTP/2 | new home | 99 / 97 / 97 | 1899 / 2123 / 2113 | 1749 / 1973 / 1963 | 0 / 0 / 0 | 0 |
| HTTPS + HTTP/2 | old home | 94 / 94 / 94 | 2173 / 2184 / 2179 | 2173 / 2184 / 2179 | 123 / 28 / 57 | 0 |
| HTTPS + HTTP/2 | new `/signin` | 97 / 98 / 97 | 2130 / 2107 / 2130 | 1905 / 1882 / 1905 | 10 / 0 / 0 | 0 |
| HTTPS + HTTP/2 | old `/signin` | 96 / 96 / 96 | 2213 / 2185 / 2177 | 2213 / 2185 / 2177 | 47 / 16 / 21 | 0 |
| HTTP/1.1 | new home | 90 / 91 / 90 | ~2980 | ~2680 | 0–2 | 0 |
| HTTP/1.1 | old home | 97 / 95 / 95 | ~2050 | ~2050 | 36–109 | 0 |

Other categories (HTTP/1.1 runs): new home accessibility 100, best practices 100, SEO 100. `/signin` SEO 54 because it is intentionally `noindex`.

What this shows: over HTTP/1.1 (6 connections per host) the new build's ~25 small preloaded chunks compete with the stylesheet and first paint is ~0.6 s later; over HTTP/2, as real hosts serve it, the new build is faster than the old one. **Production must serve over HTTPS with HTTP/2** (noted in the nginx file). These are lab numbers on loopback with a self-signed certificate — field Core Web Vitals must be measured after deployment.

Changes made because of measurement: gzip in the nginx config (it was missing, JS went uncompressed); stylesheet declared with React `precedence` so it is emitted ahead of the hoisted module preloads.

## 5. Not done / open

- Vercel/Netlify 404 rules not verified (hosting not chosen); nginx verified.
- Field performance after deploy.
- Logo `<img>` uses the 39 KB 512-px PNG at 28 px and React preloads it; a smaller asset would help, but it is a visual asset change → out of W1b scope.
