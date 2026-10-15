# W1 spike report — React Router framework mode + prerender

> Date: 15 Oct 2026 · Branch `spike/rr-framework-prerender` (PR #10, **do not merge**) · Decision it informs: `website-plan.md` D3
> Everything below was run, not assumed. Where something was not tested, it says so.

## 1. Question

Can the website get real static HTML (content, metadata, sitemap, 404) by moving `apps/web` from React Router **data mode** to **framework mode with `prerender` and `ssr: false`**, without breaking the product app, auth, tests or CI?

## 2. What the spike changed

| File | Change |
|---|---|
| `react-router.config.ts` (new) | `appDirectory: 'src'`, `ssr: false`, `prerender: ['/', '/spike-about', '/sitemap.xml', '/404']` |
| `src/routes.ts` (new) | Same URL tree as `src/app/routes.tsx`, as route modules |
| `src/routes/*.tsx` (19 new) | Thin modules wrapping the **existing** page components; `meta` exports on public pages |
| `src/routes/meta.ts`, `sitemap.ts` (new) | Per-page title/description/canonical/OG/Twitter; prerendered `sitemap.xml` resource route |
| `src/root.tsx` (new) | Replaces `index.html` + `main.tsx`: head, theme-before-paint script, providers |
| `vite.config.ts` | `reactRouter()` plugin for builds; Vitest keeps `@vitejs/plugin-react` |
| `package.json` | `build`: `tsc -b && react-router build`; + `@react-router/dev@8.4.0` (dev), `isbot@^5` |
| `.oxlintrc.json`, `.prettierignore`, `.gitignore` | Allow route-module exports (`meta`, `loader`, …); ignore `build/`, `.react-router/` |
| `.github/workflows/ci.yml` | Bundle secret scan path `apps/web/dist` → `apps/web/build/client` |

No page component, API contract, auth adapter, permission rule, migration or Edge Function was changed.

## 3. Results

| Check | Result | Evidence |
|---|---|---|
| Built HTML contains real page content | ✅ | `index.html` 38 KB with hero H1 and ~6.7k chars of visible text; `spike-about/index.html` H1 present |
| Title, description, canonical, OG, Twitter tags in static HTML | ✅ | Present on both prerendered pages |
| `sitemap.xml` generated at build time | ✅ | Valid XML with both URLs |
| Unknown path → 404 page **with HTTP 404** | ✅ with host rule | Static server emulating the planned host rules returned 404 for `/does-not-exist`, `/about` |
| `/signin`, `/demo`, `/app/*` work on direct load and reload | ✅ | Served by `__spa-fallback.html` (200); deep reload of `/app/transitions/t-ravi/answers` kept the demo session |
| Signed-out deep link → `/signin` | ✅ | `/app/team` redirected |
| Hydration / runtime errors | ✅ none | Playwright console + pageerror listeners (font CDN blocked in sandbox, filtered) |
| Existing tests | ✅ 125/125 | `vitest run` |
| Lint / typecheck / format | ✅ | after the two config additions above |
| Bundle secret scan | ✅ clean | 66 files |
| CI (all 4 jobs) on the spike branch | ✅ green | PR #10 run 38747104926 |
| First-load JS (gzip) | Home 139 KB · second page 131 KB · app fallback 128 KB | vs 159 KB single bundle on `main` today; route-level code splitting comes free |
| Lighthouse / Core Web Vitals | ⏳ not measured | Planned in W3/W9 |

Browser checks: Playwright against `build/client` served by a small Node server that applies the same rules as the proposed Nginx config (file → 200; SPA paths → fallback 200; else → `404/index.html` with status 404).

## 4. Findings and known limitations

1. **Live Supabase auth not ported.** The spike's `root.tsx` uses demo auth only. The real migration must create the Supabase gateway client-side only (it reads browser env and storage), e.g. lazily on first client render. Needs its own tests.
2. **Single-file prototype build not ported.** `npm run build:prototype` relies on `index.html` + memory router. Fix: keep a dedicated `vite.prototype.config.ts` with `index.prototype.html` + `main.tsx` (data mode) for the artifact only.
3. **Two route definitions.** Tests render `src/app/routes.tsx` (RouteObject tree); the build uses `src/routes.ts`. Mitigation in the real PR: one test that asserts both define the same paths, or move tests to `createRoutesStub`.
4. **`isbot` must be declared explicitly.** The CLI tried to auto-add it during the first build and the install left `node_modules` incomplete; a clean `npm install` fixed it. Pin it in `package.json` (licence: Unlicense).
5. **Real 404 status depends on the host.** Shown with the emulator. Nginx: explicit `try_files` for SPA prefixes + `error_page 404 /404/index.html`. Vercel/Netlify rewrites to be verified at deploy time.
6. **SPA-fallback pages have no default `<title>`.** Add a root-level default meta.
7. **Node ≥ 22.22 required** by the React Router Vite plugin (CI uses Node 22 → OK; local was 22.22.0).
8. Extra `.data` files are emitted for prerendered routes (e.g. `sitemap.xml.data`); harmless.

## 5. Astro comparison (brief, because no blocker was found)

| | Framework mode (spike) | Separate Astro site |
|---|---|---|
| Static HTML + meta | ✅ proven | ✅ (Astro default) |
| Shared components/tokens with app | Same codebase | Copy or extract a shared package |
| Deploys | One | Two (site + app subdomain) |
| New framework to learn | No | Yes |
| JS on marketing pages | ~131–139 KB gzip (React hydrates) | Near 0 by default (islands) |
| Risk to app | Route config migration (proven here) | None |

Astro would ship less JavaScript on marketing pages; content and metadata are already static in both, so search/AI crawlers and link previews are served either way.

## 6. Recommendation

**GO with framework mode + prerender (option A)**, as a clean PR (not this spike) that also resolves limitations 1–6, with its own tests, before any website page is built. If marketing-page JS weight later blocks the Lighthouse ≥ 90 target, revisit splitting site and app providers before considering Astro.

⛔ Owner approval required before the migration PR.
