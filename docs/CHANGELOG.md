# Changelog

Only verified work is recorded here. Numbers are measured, never estimated.

## 2026-10-15 — Day 1 (in progress)

- Repo skeleton, `.gitignore`, `.env.example`, docs (PRD, roadmap, database schema, security & privacy).
- Migrations `20261015000001_core.sql` (7 tenant tables, enums, `private` RLS helpers, policies, column-level grants, `create_organization` + `accept_invitation` RPCs, last-owner + same-org triggers) and `20261015000002_profile_trigger.sql`.
- pgTAP `supabase/tests/rls_core.test.sql`: **44/44 passing** on local Postgres 16 + Supabase auth shim (`scripts/local-db/test-db.sh`). Not yet run under `supabase test db`.
- Security fixes found by tests/review: cross-org probe via transition trigger (refuse non-writers first); removed client-callable `log_audit()` (audit forgery).
- Pending: Vite app, `supabase init`/`start`, Edge Functions, UI, CI.
- Frontend `apps/web`: Vite 8 + React 19 + TS 6 (strict, `noUncheckedIndexedAccess`), Tailwind 4, React Router 8, TanStack Query 5, Zod 4, supabase-js 2, Vitest 5 + Testing Library, Prettier, oxlint.
- `src/lib/env.ts` validates frontend env and **refuses to start with a service-role / `sb_secret_` key** (T3). Verified: lint, typecheck, format:check, `vitest run` **9/9**, `vite build` all exit 0; build output scanned clean of secret material.
- Decision: template ships **oxlint instead of ESLint** — kept (roadmap Day 1 task 2 said ESLint; update `05-plan/7-day-roadmap.md`).
- **[FACT] Supabase breaking change (changelog 2026-04-28):** new `public` tables are no longer auto-exposed to the Data API (all projects from 2026-10-30). Core migration now grants explicitly; local shim mirrors the new behaviour. Verified: removing the grants drops the suite to 4/44.
- Edge Functions on `npm:@supabase/server@1.9.2` (`withSupabase`, `auth: 'user'`, CORS = `APP_ORIGIN` only): `api-create-org`, `api-invite`, `api-accept-invite` + `_shared` (error envelope, SQLSTATE→HTTP map, zod body validation with size limits, tokens, audit helper). **No Day-1 function uses the service role.**
- Migrations `…03_invite_rpc.sql` (`create_invitation`: role check + sha256 token hash + `member.invited` audit, atomic) and `…04_audit_triggers.sql` (role change, removal, invite revoke, transition created).
- Security review fixes: role changes / removals / transition creation were unaudited (FR-25) → triggers; invite acceptance now requires a **confirmed** email (T11); body size checked before buffering; unexpected-error logs truncated.
- Tests: pgTAP **62/62** (3 files), Deno **20/20**, `deno check` + `deno lint` clean. Not yet run against a live Supabase stack (`supabase test db` / `functions serve`).
- CI (`.github/workflows/ci.yml`, all actions pinned): **web** (oxlint, prettier, typecheck, vitest, build, bundle secret scan), **functions** (deno fmt/lint/check/test), **database** (`supabase db start` + `supabase test db` on CLI 2.121.0, plus a gate failing if any `public` table lacks RLS), **secrets** (gitleaks 8.30.1, full history). Verified locally: bundle scanner flags a planted service_role JWT; RLS gate fails on a table without RLS; gitleaks clean (2 fake test keys allow-listed).
- `supabase init` (CLI 2.121.0, Postgres 17): local auth hardened — Vite site URL, min password 8 + letters/digits, **email confirmations on**, secure password change.

## 2026-10-15 — Day 1.5: clickable prototype

- Decision: in-app prototype before real data wiring (roadmap updated). Screens use the `ExitBrainApi` interface; prototype runs on `createMockApi()` with **MOCK DATA** fixtures (fictional Acme SaaS, Ravi/Priya/Kiran/Anita).
- Screens: transitions dashboard, knowledge review (confirm / edit / reject, risk factors), answers + verification, handover document (approve, copy as Markdown), employee interview (evidence-based questions, follow-ups, skip with reason, approve), successor checklist + cited assistant with refusal and "Ask Ravi" escalation, workspace setup.
- Design: evidence-first — inline citation pills coloured by verification status open a git-log style evidence panel; risk shown as bars, not colour. IBM Plex Sans + Plex Mono (code evidence only).
- Tests: vitest **26/26** (mock adapter rules 12, UI flows 7, env 7). lint, typecheck, format, build exit 0.
- Shareable single-file build (`npm run build:prototype`, memory router) published as a private claude.ai Artifact. Visual review in a browser not done in the build environment.

## 2026-10-15 — P0: design system (UX plan phase 0)

- Palette sampled from the Exit Brain logo (ink `#0D1939`, blue `#1F5DF0`, violet `#733AEA`, cyan `#46C2FE`); tokens in `src/design/tokens.css`, light + dark (system setting and in-app toggle).
- `tokens.test.ts` parses the token file and enforces WCAG AA for 17 text/background pairs per theme and 3:1 for control borders — **37 tests**; verified it fails on a bad token (light blue brand → 4 failures).
- Logo assets: transparent full logo, mark, 32/192/512 px icons (`public/brand/`); live wordmark so "Exit" stays legible on dark.
- Primitives: Button (variants, sizes, loading), Field/TextInput/TextArea/SelectInput (label/hint/error wired with ARIA), Dialog (native `<dialog>`), Toast (polite live region), ThemeToggle, Logo, DemoLabel, SimulatedStepNotice; states: Skeleton, EmptyState, ErrorState. Icons: lucide-react 1.49.0 (pinned).
- `domain/permissions.ts` mirrors the security role matrix; 19 tests pin it.
- Prototype migrated to tokens (no literal colours left in components); MOCK DATA bar uses the `demo` token.
- Tests: vitest **90/90**; lint, typecheck, format, build, bundle scan exit 0. Visual review in a real browser still not done in the build environment.

## 2026-10-15 — P1: landing page, auth portal, one portal per role

- Public landing page (`/`): evidence-trace hero, how it works, per-role portals, security, **$149 per departure** pilot pricing (labelled "billing isn’t live yet"), FAQ.
- Auth portal: `/signin` (password + magic link), `/signup` (Zod policy = Supabase config: 8+ chars, letters + digits), `/check-email`, `/demo` portal picker. Redirect-after-login only to `/app/…` paths (no open redirect).
- `AuthGateway` contract with two adapters: **demo** (fixed fictional accounts, labelled MOCK DATA everywhere) and **live** Supabase Auth (`VITE_AUTH_MODE=live`; email confirmation required, magic links never create users, workspace creation via `api-create-org`). Supabase client is only loaded in live mode.
- Role portals under `/app` with `RequireAuth` + per-role sidebar: owner/admin (transitions, team, setup), manager (transitions, team), leaving engineer (own interview), successor (own onboarding), HR viewer (status only). UI gates only; RLS stays the boundary.
- Fixes found by screenshot review: missing charset in single-file build (mojibake), sidebar footer clipped under the demo bar.
- Verified: oxlint, prettier, typecheck, **vitest 125/125**, `vite build`, bundle secret scan clean; Playwright screenshots of landing (light/dark/mobile), sign-in, demo picker and all 5 portals.
- Known: main JS chunk 543 kB (165 kB gzip) — route-level code splitting is a follow-up.

## 2026-10-15 — Website track W0: plan and copy (docs only)

- New `docs/04-ux/website-plan.md`: decisions D1–D8, sitemap, journeys, website tokens (contrast measured), motion rules, rendering/fonts/guide/contact architecture, dependencies, tasks W0–W10 with acceptance criteria and review gates.
- New `docs/04-ux/website-copy.md`: page-wise copy draft v0.1 with source markers; product status stated as "early development, pilots by invitation".
- Updated PRD (§2.1 website scope), roadmap (Website track), ux-plan §11 (website tokens and motion are website-only), security §5.10 (claims policy, site guide, contact form, third parties), README docs table.
- Verified: IBM Plex `@fontsource` 5.3.0 is OFL-1.1; latin woff2 for the five faces used ≈ 101 KB (measured from npm tarballs).
- No code changed. Pending: W1 rendering spike.
- W1 spike (branch `spike/rr-framework-prerender`, PR #10, not for merge): framework mode + prerender verified — static HTML with content and meta, sitemap, 404 via host rule, app routes on reload, 125/125 tests, CI 4/4 green; first-load JS 139 KB gzip on Home vs 159 KB today. Report: `docs/04-ux/website-w1-spike.md`. Recommendation GO, pending approval.

## 2026-10-15 — W1b: framework mode hardened + self-hosted fonts (PR pending review)

- Note: the W1 spike (PR #10) was merged to `main` before the "do not merge" decision; W1b fixes `main` forward.
- Live auth: `createAuth()` + `createLazyGateway()` (Supabase loads lazily in the browser only); new CI job `live-auth` runs real sign-up → email confirmation → sign-in against a local Supabase stack.
- Prototype build restored (`vite.prototype.config.ts`, `index.prototype.html`); route-parity test; `isbot` declared; root + per-route metadata (`appMeta` noindex); `/spike-about` removed.
- Hosting: `deploy/nginx/exit-brain.conf` (SPA fallback, real 404, gzip) tested with real nginx (`scripts/ci/test-nginx.sh`); `scripts/verify-prerender.mjs` guard in CI.
- D8: IBM Plex self-hosted (WOFF2 + OFL); 32-screen pixel comparison vs pre-spike build: no font or layout change (one 6-px rendering-noise diff).
- CI (PR #11): all 5 jobs green incl. `live-auth`. Verified locally: clean `npm ci`, lint, format, typecheck, **135/135 tests**, build, prerender guard, secret scan, nginx 10/10, prototype build. Lighthouse (lab, HTTP/2): home 97–99, LCP 1.9–2.1 s. Report: `docs/04-ux/website-w1b-report.md`.

## 2026-10-15 — W2: website foundations + logo-inspired hero (PR pending review)

- Website tokens (peach, light only) scoped to `.eb-site`; contrast test caught and fixed two values. Site layout, mobile menu, footer status line, skip link, view transitions, robots.txt.
- Hero "knowledge circuit" from the logo with pause control, off-screen/hidden-tab pause and reduced-motion frame (CSS/SVG, no animation library).
- Auth scoped to sign-in and app routes: live mode no longer downloads the Supabase client on website pages (0 vs 2 chunks, measured; CI check added).
- Verified: 170/170 tests, lint/format/typecheck, build + prerender guard, nginx 10/10, prototype build, no overflow at 375/768/1280, product pages unchanged (27/28 identical, 1 known noise spot). Lighthouse (HTTP/2, lab) home 95–97. Report: `docs/04-ux/website-w2-report.md`.

## 2026-10-16 — Website: card and nav motion, expandable cards, Get started menu (PR pending review)

- Owner request after review. Cards rise in as they scroll into view and lift on hover. Only cards that start off-screen are hidden, and only after hydration; nothing is hidden under reduced motion.
- Home step, role and trust cards open on click to show more. The extra text comes only from approved copy on How it works, Features and Security. Cards follow the accordion pattern (`h3 > button[aria-expanded]`); the closed panel is `inert`.
- Header: animated underline on hover and on the current page, and a shadow once the page scrolls. Sign in, Start a pilot and Explore the demo now sit in one "Get started" menu that opens on tap; Escape or an outside click closes it. The mobile menu is unchanged.
- Feature data moved to `content/features.ts` (shared by Features, Home and the site guide).
- Verified: lint, format, typecheck, **219/219 tests**, build + prerender guard, nginx 24/24, browser smoke + axe (0 serious/critical), prototype build. Lighthouse lab (HTTP/2): Home 95–97, Security 97–98, accessibility 100, CLS ≤ 0.0004.

## 2026-10-16 — Founder page published (PR pending review)

- `/about/founder` uses the owner's approved title, bio, "why", tagline, LinkedIn link and photo. The photo was cropped to 4:5 and compressed to WebP (576×720, 85 KB, no metadata), with no retouching.
- Page is linked from About and the footer, listed in the sitemap, indexed, and answered by the site guide.
- Verified: lint, format, typecheck, **214/214 tests**, build + prerender guard, nginx 24/24, browser smoke + axe (0 serious/critical), prototype build, bundle key grep.

## 2026-10-16 — W3, W5–W9: remaining website pages, site guide, quality pass (PR pending review)

- New pages: `/security` (traced claims, honest status table), `/why-exit-brain` (category comparison, own-numbers worksheet), `/services` (3 owner-approved services, labelled proposed), `/about`, `/contact` (Zod validation, honeypot, consent line, **Send disabled** until W10), `/help` (searchable FAQ + FAQPage JSON-LD), `/privacy` and `/terms` (marked "Draft, pending legal review"), website 404.
- `/about/founder`: preview only (noindex, not in nav or sitemap), placeholders for title/bio/"why", public email, photo placeholder, no invented links.
- Site guide v1: BM25 over the site's own content, no AI, no network, nothing stored; loaded on open; 15/15 sample questions answered in the top 3.
- Fixed: unknown URLs rendered the 404 page twice (also on `main`); axe scrollable-region issue on tables; visible style for the current header link.
- Verified: lint, format, typecheck, **213/213 tests**, build + extended prerender guard, nginx 23/23, prototype build, bundle key grep, browser smoke + axe on 13 URLs × 2 widths (0 serious/critical). Lighthouse lab (HTTP/2): 96–99 performance, 100 accessibility on every page. Report: `docs/04-ux/website-w5-w9-report.md`.
- Dev dependency: `axe-core` 4.13.0 (MPL-2.0, exact).

## 2026-10-16 — W4: How it works and Features pages (PR pending review)

- `/how-it-works`: five steps (who acts, what happens, what Exit Brain never does) with real product UI on MOCK DATA (5 labelled examples), the four verification statuses, and a 30-day timeline marked "an illustration, not a promise".
- `/features`: capabilities by role with only two labels, "MVP scope" and "Later" (Slack/Jira/Drive and SSO/SCIM shown as Later).
- Header/footer link to the new pages; home-section links work from any page (`/#trust`); current page marked with `aria-current`. Both pages prerendered, in the sitemap, checked by the prerender guard and the nginx test.
- Owner inputs recorded in `website-copy.md` for W6/W7: public contact email, founder page placeholders (photo, title, bio, "why"; optional links, none invented; hidden until approved), and the three services.
- Verified: lint, format, typecheck, **178/178 tests**, build + prerender guard, secret scan, nginx 13/13, prototype build, no overflow at 375/1280. Lighthouse lab (HTTP/2): How it works 97–98, Features 97–99, Home 97; a11y 100; CLS 0.
