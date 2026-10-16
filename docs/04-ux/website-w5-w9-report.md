# W3, W5–W9 report — remaining website pages, site guide, quality pass

> Date: 16 Oct 2026 · Branch `feat/w5-w9-site-pages` · One PR for owner review (the owner asked for the remaining website end to end, so the W5 and W8 review gates are taken together at this PR).
> Everything below was run. Numbers are measured. What isn't done is listed in §6.

## 1. Pages

| Route | What it contains | In nav / sitemap | Source of copy |
|---|---|---|---|
| `/security` | Access, data, isolation, AI use, secrets, retention; responsible use; status table; vulnerability contact | Header + footer / yes | `website-copy.md` §4; every statement traced in `content/security.ts` (`src`) to `security-and-privacy.md` §5.1–5.8 or GitHub Docs |
| `/why-exit-brain` | What it protects; category comparison (no named competitors); own-numbers worksheet (nothing pre-filled, nothing stored) | Header + footer / yes | §5 |
| `/services` | The three owner-approved services, each labelled "Proposed · founder-led · by arrangement" | Header + footer / yes | §8 |
| `/about` | Mission, principles, what we won't build, honest company status | Header + footer / yes | §6 |
| `/about/founder` | Name, placeholders for title/bio/"why", public email, photo placeholder; no links | **No / no**, `noindex`, preview banner | §7 |
| `/contact` | Form with Zod validation + honeypot + consent line; **Send disabled**; notice with the public email | Footer / yes | §9, plan §8.5 |
| `/help` | Searchable FAQ in 8 sections, "Ask the site guide", FAQPage JSON-LD | Footer / yes | §10 (answers restate other pages) |
| `/privacy`, `/terms` | Plain drafts, banner "Draft, pending legal review" | Footer / yes | §5.8, §5.10 |
| any unknown URL | Website 404 with links (Home, How it works, Help, Contact), HTTP 404 | — | §11 |

Header is now: How it works · Features · Security · Why Exit Brain · Services · About · Sign in · Start a pilot. The desktop nav appears from 1024 px (six items); below that the existing mobile menu is used.

## 2. Site guide v1 (D4)

- `guide/search.ts`: BM25 (~100 lines, no dependency) with light stemming and a small synonym list. `guide/siteIndex.ts` builds the index from the same typed content the pages render, so the guide can only repeat the site. Hidden founder page is not indexed.
- Loaded only when the guide is opened (separate chunk). No AI, no network, nothing stored.
- Dialog with focus trap, Escape closes, focus returns to the launcher; answers in `role="log"` + `aria-live="polite"`; no match → "I couldn't find that on our site" + Contact link.
- **Sample questions: 15/15** have a page that answers them in the top 3 (test requires ≥ 13). Each sample lists the pages that genuinely answer it.
- Deviation from plan §8.4: the index is built in the browser from typed content instead of a `site-index.json` build step. Same guarantee (only site text), one less build script.

## 3. Fixes found on the way

- **Unknown URLs rendered the 404 page twice** (two `.eb-site` trees). Also present on `main` (checked: `main` shows "Page not found" twice at `/no-such-page`). Cause: the prerendered `/404` file was a different route than the splat route unknown URLs match, so hydration failed and React rendered a second tree. Fix: `/404` is prerendered through the splat route itself. Verified: one tree, one H1 at `/no-such-page`, `/about/nope`, `/404`.
- axe `scrollable-region-focusable` (serious) on the two tables at 375 px → scroll containers are now focusable named regions.
- Header `aria-current` link had no visible style; now medium weight + ink.

## 4. Checks run

| Check | Result |
|---|---|
| `format:check`, `lint`, `typecheck` | ✅ |
| `vitest run` | ✅ **213/213** (178 → 213; 35 new) |
| `build` + `verify:prerender` (extended: 10 pages' H1/description/canonical/OG/not-noindex/in sitemap; drafts marked; FAQPage JSON-LD; inactive notice; founder noindex + not in sitemap) | ✅ |
| Real nginx (`scripts/ci/test-nginx.sh`) | ✅ 23/23 (new pages 200; `/about/founder` 200 preview; `/about/nope` 404) |
| `build:prototype` | ✅ 840 KB |
| Bundle grep for server keys | ✅ clean |
| **Browser smoke + axe** (`npm run test:site`, Playwright + axe-core 4.13.0, 13 URLs × 375/1280 px, reduced motion) | ✅ every page: HTTP status right, 1 H1, no horizontal scroll, no page errors, **0 serious/critical axe violations**; guide and contact flows pass |

New dev dependency: `axe-core` **4.13.0** (exact; MPL-2.0; 0 dependencies; published 5 Aug 2026; `npm audit` 0 vulnerabilities). Dev-only, not in the browser bundle. 4.14.0 was skipped (11 days old).

## 5. Lighthouse (lab: mobile, simulated throttling, HTTPS + HTTP/2 nginx, 3 runs)

| Page | Performance | LCP (ms) | A11y / BP / SEO | CLS | TBT |
|---|---|---|---|---|---|
| Home | 96 / 96 / 96 | 2280–2435 | 100 / 100 / 100 | ≤ 0.0004 | 0 |
| How it works | 96 / 97 / 98 | 2143–2459 | 100 | 0.0006 | 0 |
| Features | 98 / 97 / 99 | 1953–2206 | 100 | ≤ 0.0004 | 0 |
| Security | 98 / 98 / 97 | 1980–2272 | 100 / 100 / 100 | 0.0004 | 0 |
| Why Exit Brain | 98 / 97 / 97 | 2121–2290 | 100 / 100 / 100 | 0.0004 | 0 |
| Services | 98 / 98 / 98 | 1978–2129 | 100 / 100 / 100 | 0.0004 | 0 |
| About | 97 / 97 / 98 | 1983–2261 | 100 / 100 / 100 | 0.0006 | 0 |
| Contact | 96 / 97 / 96 | 2281–2444 | 100 / 100 / 100 | 0.0005 | 0 |
| Help | 98 / 97 / 97 | 1999–2133 | 100 / 100 / 100 | ≤ 0.0004 | 0 |
| Privacy | 98 / 98 / 98 | 2106–2126 | 100 / 100 / 100 | 0.0004 | 0 |

The tiny CLS comes from the guide launcher widening when the 500-weight font loads (well under the 0.05 budget). Lab numbers on loopback; field Core Web Vitals need a real deployment.

## 6. Not done / open

- **Founder photo:** not in the workspace (the image in chat wasn't saved as a file). Page shows a placeholder; set `FOUNDER.photo` when the file arrives. Title, bio and "why" stay placeholders until the owner writes them. Publishing = set `FOUNDER.published = true` (adds nav link on About, sitemap, indexing).
- **Contact form stays inactive** (W10: Edge Function, Turnstile, rate limit, `contact_submissions`, delivery test, security review).
- **Privacy/Terms are drafts:** legal entity, address and hosting provider are named as open. [RESEARCH NEEDED] DPDP Rules dates and GDPR basis before the form goes live.
- `test:site` runs locally; it is **not added to CI** (CI configuration unchanged on purpose). Proposed as a follow-up.
- W3 "page hero circuit variants" not built; W3's acceptance criteria (pause remembered, reduced motion, off-screen/hidden pause, measured Home) were met in W2 and re-measured here.
- `SITE_URL` is still the placeholder `https://exitbrain.example` until the domain is bought.
