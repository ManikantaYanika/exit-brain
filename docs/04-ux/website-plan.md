# Exit Brain — Marketing Website Plan (Website track)

> Status: **W0 — plan for review. No website code exists yet.**
> Owner decisions recorded 15 Oct 2026 (D1–D8 below). This document is the source of truth for the public website; `ux-plan.md` stays the source of truth for the product app.
> Labels: **[FACT]** verified (source or codebase), **[ASSUMPTION]** believed but unverified, **[PROPOSED]** a design choice awaiting review, **[RESEARCH NEEDED]** must be checked before it ships.
> Research behind this plan: "Exit Brain website research" report (15 Oct 2026) — competitor pages, enterprise site patterns, animation performance, SEO/chatbot architecture. Key sources are cited inline.

---

## 1. Scope and boundaries

**In scope:** a multi-page public website for global engineering and enterprise buyers, a no-LLM site guide (v1), a contact form (UI first; backend after approval), legal pages needed for the form.

**Out of scope (needs separate approval):** LLM chatbot (v2), analytics vendor, email provider configuration, blog/changelog/careers/customers pages, pricing page, any change to the product app's UI, tokens, auth, RLS or API contracts.

**Rules carried from the project (non-negotiable):**
- No fake trust badges, customer logos, testimonials, certifications, security guarantees or unverified statistics.
- "No person scoring, no employment decisions" appears in website copy and stays true in the product.
- Product screenshots on the website use demo data and are labelled **MOCK DATA**.
- Website work must not block or regress the 7-day MVP (Day 1–7 DoD).
- WCAG 2.2 AA target; continuous decorative motion has a visible pause control.

## 2. Decisions (15 Oct 2026)

| ID | Topic | Decision | Consequence |
|---|---|---|---|
| D1 | Roadmap | Website is a **separate track** with its own tasks and DoD. Core MVP work is not blocked. | Roadmap gets a "Website track" section. Day 1 DoD still open. |
| D2 | Colours | Peach / terracotta / warm cream, **light only**, for the website. The product app keeps its tokens, dark mode and workflows. | Separate token file scoped to the website layout, with its own contrast test. |
| D3 | SEO architecture | **W1 spike first:** React Router framework mode + prerender in isolation. If risky, compare with a separate Astro site **with evidence**, then owner approval. No migration on assumptions. | W1 produces a spike report; nothing merges to `main` from the spike without approval. |
| D4 | Chatbot | **v1 = no LLM**: answers only from website content, with page links and suggested questions. No external AI API, no extra backend. LLM is a future phase with separate approval. | v1 runs fully in the browser on a build-time index. |
| D5 | Services | Three **founder-led, proposed** services: pilot onboarding and setup; employee knowledge-handover facilitation; knowledge concentration review based on authorised source evidence. No customers, case studies, outcomes or guaranteed deliverables implied. Product and services kept clearly separate. | Services page labels each as "Proposed, founder-led, by arrangement". |
| D6 | Founder | Name: **Manikanta Yanika**. Only owner-verified details. No invented experience, credentials, history, achievements, testimonials or social links. Photo later; until then a photo-less layout. | Unconfirmed fields stay as visible placeholders and the page is excluded from navigation and sitemap until approved. |
| D7 | Contact | Public email is a **placeholder** until confirmed; personal email never published without permission. Resend may be evaluated, but no "form works" claim before configuration, domain verification and delivery testing. Form must have server-side validation, abuse protection, secure DB permissions and a consent/privacy notice. No secrets in the frontend. External services need owner confirmation. | Contact page ships with the form in a clearly labelled "not yet active" state until W10 is approved and tested. |
| D8 | Fonts | Keep **IBM Plex Sans / Mono** (already in use). Self-host only if verified better; document licence, size, fallbacks, privacy. No unnecessary font packages. | See §8.2 — recommendation: vendor the font files, no npm package. |

## 3. What exists today [FACT — codebase, `main` @ 51ea3f9]

- `apps/web`: React 19, TypeScript 6, Vite 8, Tailwind 4, React Router 8.4 in **data mode** (`createBrowserRouter`), TanStack Query 5, Zod 4, lucide-react. CI: web, functions, database, secrets — 4/4 green.
- Public routes: `/` (one-page landing, `features/marketing`), `/signin`, `/signup`, `/check-email`, `/demo`. App routes: `/app/*` with role portals behind `RequireAuth`.
- Contracts to preserve: `ExitBrainApi`, `AuthGateway` (demo + Supabase adapters), `permissions.ts`, product tokens (`design/tokens.css`) + contrast test.
- Fonts: IBM Plex Sans + Mono from Google Fonts CDN (`index.html`).
- Tests: 125 web (Vitest), 62 pgTAP, 20 Deno.
- Rendering: client-only SPA; the HTML shipped for every route is an empty `#root`.

## 4. Sitemap [PROPOSED]

| Route | Purpose | Primary CTA | In nav | Rendering |
|---|---|---|---|---|
| `/` | Problem, promise, route visitors onward | Book a pilot · Explore the demo | Logo | Static HTML |
| `/how-it-works` | Five-step workflow with real UI on MOCK DATA | Explore the demo | Header | Static HTML |
| `/features` | Capabilities by role; Available in pilot vs Planned | Book a pilot | Header | Static HTML |
| `/security` | Access, data, isolation, AI use, retention, responsible use, status table | Ask a security question | Header | Static HTML |
| `/why-exit-brain` | Business case; category comparison; own-numbers worksheet | Book a pilot | Header | Static HTML |
| `/services` | Three proposed founder-led services (D5) | Talk to us | Header | Static HTML |
| `/about` | Mission, principles, what we won't build | Meet the founder | Header (Company) | Static HTML |
| `/about/founder` | Manikanta Yanika (D6) | Contact | Hidden until approved | Static HTML |
| `/contact` | Pilot, security, partnership, other | Send (inactive until W10) | Header button + footer | Static HTML + form |
| `/help` | Searchable FAQ, getting started, support routes | Ask the site guide | Footer | Static HTML |
| `/privacy`, `/terms` | Required before collecting personal data | — | Footer | Static HTML, marked draft |
| `/signin`, `/signup`, `/check-email`, `/demo`, `/app/*` | Existing product — unchanged | — | "Sign in" | SPA |
| any unknown path | Branded 404 with links | Home | — | Real **404 status** where the host supports it |

Header: How it works · Features · Security · Why Exit Brain · Services · Company (About) · **Sign in** · **Book a pilot**. Pattern: short nav for a one-product company (Linear) rather than a mega menu (Stripe, Vercel) — research report §"A seven-item nav".
Pricing stays a section on Home: "$149 per departure — pilot pricing. Billing isn't live yet." (ux-plan §11).

## 5. Visitor journeys [PROPOSED]

| Visitor | Path | Leaves with |
|---|---|---|
| CTO / VP Eng (buyer) | Home → How it works → Security → Contact (pilot) | A pilot request, or a security question |
| Engineering manager (champion) | Home → Features → `/demo` → Contact | Hands-on view of the manager portal |
| Security reviewer | Security (shared link) → Help (data FAQ) → Contact (security) | Written answers to a security questionnaire |
| HR / People Ops | Why Exit Brain → Security §Responsible use → Contact | Confidence it isn't surveillance |
| Any visitor | Site guide → answer card → linked page | The right page in one or two clicks |
| Existing customer | Header "Sign in" → `/app` | Their role portal |

Every page ends with a next step that fits its visitor; no dead ends.

## 6. Design system — website tokens [PROPOSED; contrast FACT, computed with WCAG 2.x formula]

Concept: **peach paper, logo ink, logo blue.** Peach and terracotta carry warmth; actions stay in the logo blue; the blue→violet gradient appears only in the wordmark, hero highlight and motion.

| Token | Hex | Role | Contrast (measured) |
|---|---|---|---|
| `site-canvas` | `#FFF8F2` | Page background | ink 16.43 · muted 6.01 · brand 5.14 |
| `site-band` | `#FDF0E7` | Alternate section bands | ink 15.47 · brand 4.84 |
| `site-soft` | `#FBE3D3` | Highlight wells (no brand-coloured body text) | ink 14.01 · brand 4.39 ✗ text |
| `site-glow` | `#E8875A` | Decorative only (glows, rings) | 2.48 on canvas ✗ text |
| `site-accent-ink` | `#B4441F` | Terracotta: eyebrows, accent text | 5.27 canvas · 4.50 soft |
| `site-surface` | `#FFFFFF` | Cards, forms, guide panel | ink 17.28 |
| `site-ink` | `#0D1939` | Text (logo navy) | — |
| `site-muted` | `#5A5F73` | Secondary text | 6.01 canvas · 5.13 soft |
| `site-brand` | `#1F5DF0` | Primary buttons (white text 5.41) | 5.14 canvas |
| `site-brand-deep` | `#1A4FD0` | Links on bands and soft wells | 5.54–6.50 |
| `site-violet` | `#733AEA` | Gradient end, motion | 5.67 canvas |
| `site-spark` | `#46C2FE` | Motion only | never text |
| `site-line` | `#EEDFD3` | Decorative dividers | — |
| `site-line-strong` | `#9A8F88` | Input/control borders (≥ 3:1, WCAG 1.4.11) | 3.00 canvas · 3.15 surface |

Rules: tokens live in `src/design/site-tokens.css`, scoped under `.eb-site` so they cannot leak into `/app`. A unit test enforces AA for every text pair and 3:1 for control borders. Product `tokens.css` is untouched.
Type: IBM Plex Sans 400/500/600; display 600 at −0.02em; scale 0.875 · 1 · 1.125 · 1.375 · 1.75 · 2.25 · 3.25 rem (hero to 4 rem); body 17 px, max 68ch. IBM Plex Mono only for real artefacts (SHAs, paths).
Layout: 1200 px content, 12 columns, 96–128 px section rhythm on desktop; radius 6 controls / 12 cards / 20 hero panels / 999 pills; borders first, soft navy-tinted shadow only for floating layers.

## 7. Motion [PROPOSED; rules FACT where cited]

Concept from the logo: circuit traces with nodes (brain) → a door (exit) → speed lines (knowledge moving on). Signals travel along traces into the door and out to the successor.

| Where | What | Technique |
|---|---|---|
| Home hero | Knowledge-circuit: 30–60 nodes, signal pulses, slow peach/blue gradient drift | Inline SVG + CSS (`stroke-dashoffset`, `transform`, `opacity`) — 0 KB JS |
| Page heroes | Lighter circuit variant per page | Same component, fewer nodes |
| How it works | Existing "evidence trace" replays when in view | CSS, IntersectionObserver |
| Page changes | ~200 ms cross-fade | React Router `viewTransition` + CSS |
| Sections | 12 px rise + fade, from a visible resting state | CSS |

Rules:
- Animate only `transform` / `opacity` / `stroke-dashoffset`; no layout properties (CLS stays 0). [FACT] web.dev: composited animations don't count toward CLS.
- [FACT] WCAG 2.2 SC 2.2.2 (Level A): moving content that starts automatically and lasts > 5 s needs a mechanism to pause it → visible **Pause motion** control, preference remembered per browser.
- `prefers-reduced-motion: reduce` → static frame, fades ≤ 80 ms (SC 2.3.3, AAA, adopted anyway).
- Pause when off-screen (IntersectionObserver) or tab hidden (`visibilitychange`). Background starts after the headline paints.
- [FACT] View Transitions (same-document): Chrome/Edge 111+, Firefox 144+, Safari 18+. Unsupported browsers navigate without animation.
- Not used: three.js (~417 KB gzip measured), Lottie, GSAP, Lenis smooth-scroll hijacking.
- Budgets (measured in W3/W9, not assumed): LCP < 2.5 s, CLS < 0.05, INP < 200 ms, Lighthouse ≥ 90 performance and accessibility on every page.

## 8. Architecture

### 8.1 Rendering (decision pending W1)

[FACT] Vercel's crawler study: GPTBot, ClaudeBot, PerplexityBot don't execute JavaScript. [FACT] Google renders JS but recommends server-side or pre-rendering. [FACT] React Router 8 documents `prerender` with `ssr: false` in **framework mode**: listed paths become static HTML; other paths fall back to an SPA shell. Today we use data mode.

W1 spike compares:
- **A — React Router framework mode + prerender** (one codebase, one component library, migration of route config).
- **B — Separate Astro site** for marketing, app unchanged (two builds/deploys, two frameworks), only if A is risky.

**W1 result (15 Oct 2026):** spike passed every check (static content + meta + sitemap + 404, app routes on reload, 125/125 tests, CI 4/4). Recommendation: **GO with A** via a clean migration PR (W1b) that also fixes the spike's known limitations. Full report: `website-w1-spike.md`. ⛔ Awaiting owner approval.

### 8.2 Fonts (D8) [FACT unless marked]

- Licence: IBM Plex is SIL Open Font License 1.1 (`@fontsource/ibm-plex-sans@5.3.0`, `@fontsource/ibm-plex-mono@5.3.0`: `OFL-1.1`) — self-hosting and redistribution allowed with the licence file.
- Size (latin subset, woff2, measured from the npm tarballs): Sans 400 22.6 KB, 500 24.2 KB, 600 24.3 KB; Mono 400 14.7 KB, 500 14.9 KB → ~101 KB for the five faces we use. Google Fonts serves comparable subset files, so **bytes don't change materially**.
- What self-hosting changes: no connections to `fonts.googleapis.com` / `fonts.gstatic.com` (one fewer origin, two fewer CSP entries, no third-party DNS/TLS on first visit); visitor IP addresses aren't sent to Google (a Munich court, LG München I, 20 Jan 2022, held embedding Google Fonts without consent breached GDPR). Browsers partition HTTP cache per site, so the shared-CDN cache benefit no longer exists. [ASSUMPTION] the latency gain is small but positive; to be measured in W2.
- **Recommendation:** vendor the five woff2 files + `OFL.txt` into `apps/web/public/fonts/` with `@font-face` + `font-display: swap` and preload of Sans 400/600. **No npm package.** Fallback stack unchanged (`ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`).
- Note: `index.html` is shared with the product app. Switching the font source changes **where** fonts load from, not how the app looks. Needs owner OK because it touches the app shell.

### 8.3 Code layout [PROPOSED]

```
apps/web/src/
  design/site-tokens.css          website tokens (scoped .eb-site) + test
  features/site/
    SiteLayout.tsx, SiteHeader.tsx, SiteFooter.tsx, PageMeta.tsx
    pages/                        one file per route
    content/*.ts                  page copy as typed data (single source for pages + guide index)
    motion/                       KnowledgeCircuit, useInView, MotionPreference
    guide/                        index search (BM25), panel UI
scripts/build-site-index.mjs      content → site-index.json at build time
```
`features/marketing` (current one-page landing) is retired once `/` moves to the new Home.

### 8.4 Site guide v1 (D4)

- Build step turns every page section in `content/*.ts` into `site-index.json` (title, text, URL, section anchor).
- Browser ranks sections with a small BM25 implementation (~60 lines, no dependency) and shows the best 2–3 as answer cards with "Open page".
- Suggested questions; no match → "I couldn't find that on our site" + Contact link.
- Copy can only come from the index, so the guide can't state anything the pages don't. Labelled "Site guide — answers from Exit Brain pages". Nothing is sent to a server or stored.
- Accessibility: dialog with focus trap, `role="log"` + `aria-live="polite"`, Escape closes, focus returns to the launcher.

### 8.5 Contact form (D7) — phased

- W7: UI with Zod validation, consent line linking `/privacy`, honeypot field; **submit disabled**, notice "This form isn't active yet. Email: [placeholder]".
- W10 (separate approval): Edge Function `contact-submit` (Zod server-side, honeypot, Cloudflare Turnstile verified server-side, per-IP rate limit) → table `contact_submissions` (RLS enabled, **no policies**, no client grants; written only by the function). This table holds **no tenant data and has no `org_id`** — a documented exception to the org_id rule, to be added to `database-schema.md` with the migration and covered by pgTAP (anon/authenticated cannot read or write). Email notice via Resend only after domain verification and a delivery test. `/exit-brain-security-review` before merge.
- [RESEARCH NEEDED] India DPDP Rules: notice/consent obligation dates (reported 13 Nov 2026) — verify against the official Gazette before W10. Privacy and Terms pages ship marked "Draft — pending legal review".

### 8.6 SEO and headers [PROPOSED]

Per page: unique `<title>`, description, canonical URL, Open Graph + Twitter tags, OG image; `sitemap.xml` (approved pages only), `robots.txt`; JSON-LD `Organization` and `FAQPage` (Help). Security headers per `security-and-privacy.md` §5.9 at the host.
Canonical base URL: **[ASSUMPTION] placeholder until the domain is bought** (ux-plan §11).

## 9. Dependencies

| Need | Package | Status | Reason / licence / impact |
|---|---|---|---|
| UI, routing, styles, validation, icons, tests | existing | Installed | — |
| Framework-mode build + prerender | `@react-router/dev` (dev only) | Missing | Only if W1 chooses A. MIT. Build-time only, 0 KB in browser. Version pinned ≥ 2 weeks old, matched to react-router 8.4. |
| Fonts | none (vendored woff2 + OFL) | — | ~101 KB fonts, same as today's CDN bytes |
| Animation | none | — | CSS/SVG/View Transitions. `motion` (MIT, ~4.6 KB LazyMotion) only if a later case proves CSS insufficient — separate approval |
| Site guide search | none | — | Own BM25 |
| E2E + a11y | `@playwright/test`, `@axe-core/playwright` (dev) | Missing | W9; Apache-2.0 / MPL-2.0; CI-only |
| Anti-spam | Cloudflare Turnstile (script, no npm) | Account needed | W10 only, after approval |

Every install records version, licence and bundle impact in the PR description.

## 10. Tasks, acceptance criteria and gates

Each task = branch → PR to `main` → CI green → owner merges. "Done" means implemented **and** its tests pass, with results reported (files changed, tests run, actual numbers, known limitations). ⛔ = stop for owner approval.

| ID | Task | Acceptance criteria |
|---|---|---|
| W0 ⛔ | Docs: this plan, copy draft, PRD/roadmap/UX/security updates | Docs merged; labels on every claim; no code |
| W1 ⛔ | Rendering spike (isolated branch, not merged) | Report shows for `/` and one more page: real text in built HTML, title/description/canonical/OG present, sitemap generated, unknown path → 404 page (and status where host allows), `/signin` `/demo` `/app/*` work on reload, **all existing tests pass**, CI unchanged. Go/no-go with evidence; Astro comparison if no-go |
| W1b ⛔ | Migration PR (after W1 approval): framework mode + prerender, live auth wired client-side, prototype build kept, route-parity test, host config docs | Same checks as W1 plus: live auth adapter tests pass, `build:prototype` still produces the artifact, route-parity test, CI 4/4 green |
| W2 ⛔ | Site foundations: tokens + contrast test, fonts (if approved), SiteLayout/header/mobile menu/footer, PageMeta, transitions, sitemap/robots | Tokens AA by test; keyboard-only navigation works with visible focus; no horizontal scroll at 375 px; screenshots 375/768/1280 |
| W3 | Knowledge-circuit motion | Pause control works and is remembered; reduced-motion shows static frame (tested); pauses off-screen/hidden; measured LCP/CLS/INP on Home recorded; Lighthouse perf ≥ 90 |
| W4 | Home, How it works, Features | Copy = approved draft; MOCK DATA labels on artefacts; heading order and link tests |
| W5 ⛔ | Security, Why Exit Brain | Every security statement traced to a line in `security-and-privacy.md` or a cited source; status table honest |
| W6 | About, Founder (hidden), Services | Founder placeholders visible; Founder excluded from nav/sitemap until approved; services labelled proposed |
| W7 | Contact (inactive), Help, Privacy, Terms (draft) | Zod validation tests; submit disabled with clear notice; legal pages marked draft |
| W8 ⛔ | Site guide v1 | Top-3 contains the right page for ≥ 13 of 15 sample questions (test); "not found" path; focus and aria tests |
| W9 | Quality pass | Playwright smoke per page + axe (0 serious/critical); Lighthouse per page recorded; responsive pass; shareable preview |
| W10 ⛔ | Contact backend (needs Supabase project, email decision) | Security review passes; pgTAP + Deno tests green; delivery tested end-to-end before any "form works" claim |

## 11. Risks

| Risk | Mitigation |
|---|---|
| Framework-mode migration breaks app, auth or tests | Isolated W1 spike, go/no-go on evidence, Astro fallback |
| Copy over-promises | Claims traced to docs (W5 gate); status table; owner approves Security, Services, Founder |
| Seen as employee surveillance | Responsible-use section; "systems, not people"; employee approves what is shared |
| Motion hurts performance/a11y | CSS/SVG only; pause; reduced motion; measured budgets |
| Peach tokens drift below contrast | Token contrast test in CI |
| Scope creep | Only the pages in §4; anything else needs approval |
