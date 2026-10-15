# W2 report — website foundations, hero visual, auth scoped to the product

> Date: 15 Oct 2026 · Branch `feat/w2-site-foundations` · ⛔ Owner review gate (website-plan.md §10).
> Everything below was run. Numbers are measured.

## 1. Scope delivered

| Item | Where |
|---|---|
| Website tokens (light only, peach), scoped to `.eb-site`; product tokens untouched | `src/design/site-tokens.css`, `index.css` mappings |
| Token contrast test (text 4.5:1, control borders 3:1, scope, light-only) | `src/design/site-tokens.test.ts` — caught 2 failing values (accent-ink on soft 4.497, line-strong on canvas 2.998); both darkened, plan updated |
| Site layout: sticky header, mobile menu (focus trap, Escape), footer with honest status line, skip link | `src/features/site/SiteLayout.tsx`, `nav.ts`, `SiteLink.tsx` |
| Page transitions (View Transitions, 200 ms cross-fade, off under reduced motion) | `SiteLink` (`viewTransition`), `index.css` |
| Hero visual from the logo: lobed brain with 45° circuit traces, signals into a door, speed lines, "Approved handover"; evidence chips with real artefact names | `src/features/site/motion/` |
| Motion control: visible Pause/Play (remembered), pauses off-screen and in hidden tabs, static frame under reduced motion | `useAmbientMotion.ts`, `index.css` |
| Home rebuilt in the new system (existing approved copy; 2 honesty fixes: retention "by design", trust intro no longer claims full enforcement) | `src/features/site/home/` |
| `robots.txt` prerendered (disallows `/app`, points to sitemap) | `src/routes/robots.ts` |
| **Supabase client no longer loads on website pages** (auth wraps only sign-in + app routes) | `src/routes/auth-scope.tsx`, `src/app/runtime.ts`, `useOptionalAuth` |

Navigation links only to things that exist: header items are Home sections until W4–W7 add their pages.

## 2. Tests and checks

| Check | Result |
|---|---|
| `npm run lint` / `format:check` / `typecheck` | pass |
| `npx vitest run` | **170/170** (was 135; +site tokens, layout, motion tests) |
| `npm run build` + `verify:prerender` | pass; `/`, `/sitemap.xml`, `/robots.txt`, `/404` prerendered |
| `scripts/ci/test-nginx.sh` (real nginx) | 10/10 |
| `npm run build:prototype` | pass (764 KB) |
| Live-mode build: Supabase chunks requested | **home 0** (before: 2) · `/signin` 2 — check added to CI `live-auth` job |
| Horizontal overflow at 1280 / 768 / 375 px | none |
| Dark-mode OS | website stays light; product keeps dark theme |
| Product pages unchanged (W1b vs W2, 7 app pages × light/dark × 1280/390) | 27/28 pixel-identical; 1 = the known 6-pixel rendering-noise spot from W1b |

## 3. Performance (Lighthouse 12.8.2, mobile, simulated throttling, nginx HTTPS + HTTP/2, 3 runs)

| Page | Perf | LCP (ms) | FCP (ms) | TBT (ms) | CLS | A11y | BP | SEO |
|---|---|---|---|---|---|---|---|---|
| W2 home | 95 / 96 / 97 | 2258 / 2269 / 2116 | 1958 / 2119 / 1966 | 2 / 0 / 0 | 0 | 100 | 100 | 100 |
| W1b home (before) | 99 / 97 / 97 | 1768 / 2119 / 2115 | 1468 / 1969 / 1965 | 0 / 0 / 0 | 0 | 100 | 100 | 100 |
| W2 `/signin` | 97 / 97 / 97 | 2253 / 2430 / 2130 | 1803 / 1830 / 1905 | 10 / 6 / 10 | 0 | 100 | 100 | 58 (noindex, intended) |

The new home is ~0–150 ms slower to LCP than W1b in this lab setup (more content above the fold, inline SVG). LCP element is the hero paragraph (text), so the visual doesn't delay it. Lab numbers on loopback only; field data needs a deployment.

## 4. Known limitations

- Pages other than Home are not built (W4–W7); nav uses Home sections until then.
- One-time motion preference uses `localStorage`; if storage is blocked, Pause still works for the visit.
- Roles list has five items, so the last sits alone in a two-column layout.
- Evidence chips and labels in the hero are small at 375 px (decorative; the SVG has a text alternative).
