# Exit Brain — Product UX Plan & Design System

> Version 0.2 · 15 Oct 2026 · Status: **Approved by Mani (15 Oct)** — palette tuned to the logo · Owner: Mani
> Replaces the missing `04-ux/screens.md`. Builds on `01-product/PRD.md`, `05-plan/7-day-roadmap.md`,
> `02-architecture/database-schema.md`, `07-security/security-and-privacy.md` and the Day 1.5 prototype (PR #3).
> Labels: **[FACT] [ASSUMPTION] [RECOMMENDATION] [DECISION NEEDED]**

---

## 1. What this plan is for

Exit Brain must work as three things at once, without rework between them:

1. **A product customers can use** — landing → sign-up → organisation → GitHub → transition → interview → handover → successor.
2. **A demo Mani can present** — realistic data, every role, a five-minute story.
3. **The real platform later** — the same screens, wired to Supabase, with RLS as the boundary.

The rule that ties them together: **screens never know where data comes from.** They talk to one interface (`ExitBrainApi` + `AuthGateway`). Demo mode and live mode are two implementations of it.

---

## 2. Review of what exists

### 2.1 Requirements coverage (PRD §4) — prototype vs. this plan

| Story | Prototype (PR #3) | This plan adds |
|---|---|---|
| US-01 sign up, create org | Not built (persona switcher only) | Landing, sign-up, sign-in, magic link, create-org flow |
| US-02 invite + roles | Invite-link form only | Team page, role changes, pending invites, revoke, role explainer |
| US-03 connect GitHub, choose repos | Static permission list | Full connect flow (simulated in demo, labelled), repo picker |
| US-04 disconnect + delete data | — | Integrations page: disconnect, deletion request, confirmation |
| US-05 audit log | — | Audit log (owner/admin), filters |
| US-10/11 start transition, map login | — | "Start a transition" wizard: person, GitHub login, last day, successor |
| US-12 ingestion progress | — | Live progress screen: repos, records read, rate-limit pauses, retry |
| US-13/14 knowledge areas + review | ✅ | Bulk actions, filters, empty/error states |
| US-20–23 interview | ✅ | Per-topic progress, autosave, "15 min today" pacing |
| US-30 verification | ✅ (read-only) | Manager override with comment (logged) |
| US-31/32 handover + export | ✅ approve, copy Markdown | Version history, edit statement, print view |
| US-40–42 successor | ✅ | Checklist links to handover sections, escalation status |
| US-50/51 dashboard + risk score | Partial | HR view, filters, risk score popover |

### 2.2 Prototype issues to fix (found in review)

- No marketing site, no authentication, no onboarding sequence: the journey starts mid-product.
- "Viewing as" switcher is fine for a demo but is not how users arrive; it moves into a **Demo bar** (see §6).
- Loading states are plain text ("Loading…"); there are no skeletons, error states or retry.
- No toasts or confirmation for irreversible actions (approve handover, approve answers).
- Light theme only; no dark mode.
- Visual review in a real browser has not been done yet.

### 2.3 What we keep

Evidence-first UI (citation pills → evidence panel), risk as bars not colour, status colours reserved for verification, the `ExitBrainApi` adapter, query hooks, persona gating as UX (RLS as security), MOCK DATA labelling.

---

## 3. Experience principles

1. **Evidence before opinion.** Every AI claim shows its source records, confidence and verification status in the same line of sight. No claim without a citation pill or an explicit "no record".
2. **Humans approve, visibly.** Every gate (review areas, approve answers, approve handover) is a named, deliberate action with a summary of what will be shared and with whom.
3. **Each role sees its own job.** A leaving engineer never lands on a dashboard; a successor never sees drafts; HR never sees evidence.
4. **Calm, quick, trustworthy.** Motion explains change and never delays work. Nothing blinks for attention unless it needs a decision.
5. **Honest demo.** Demo data and simulated steps are labelled where they appear, not only in a banner.

---

## 4. Design system

### 4.1 Brand inputs (from the logo)

Logo: `exit_brain_logo.png` (project files). Colours sampled from the file, not guessed:

| Logo element | Hex | Role in the UI |
|---|---|---|
| "Exit" wordmark navy | `#0D1939` | `ink` (light theme text) |
| "Brain" / mark blue | `#1F5DF0` | `brand` (primary actions, links, focus) |
| Mark / "Brain" violet | `#733AEA` | `brand-2` — gradient end only (wordmark, hero highlight, readiness meter) |
| Speed lines cyan | `#46C2FE` | `spark` — decorative only (hero motion, illustrations); never text |
| Mark deep core | `#081D71` | Dark-theme hero depth |

Usage rules: the brand gradient (`#1F5DF0 → #733AEA`) appears in the wordmark, the landing hero and progress/readiness fills — nowhere else. The wordmark is rendered as live text ("Exit" in `ink`, "Brain" in the gradient) beside the mark image, because the navy "Exit" in the PNG disappears on dark backgrounds. Assets: `apps/web/public/brand/` (transparent full logo, transparent mark, 32/192/512 px icons).

### 4.2 Colour tokens — light (default) and dark

Concept: *the logo's ink and blue on cool paper.* One brand hue for actions; violet only inside the gradient; status colours carry meaning only.

| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | `#F5F7FB` | `#0A1022` | App background |
| `surface` | `#FFFFFF` | `#121A30` | Panels, tables, forms, inputs |
| `surface-sunken` | `#EEF1F7` | `#0B1124` | Code blocks, evidence wells |
| `ink` | `#0D1939` | `#E8ECF5` | Primary text |
| `ink-muted` | `#55617A` | `#9BA6BD` | Secondary text |
| `line` | `#DCE2EC` | `#24304D` | Dividers, panel borders (decorative) |
| `line-strong` | `#8792A8` | `#5C6884` | Input, checkbox and focusable control borders (≥ 3:1, WCAG 1.4.11) |
| `brand` | `#1F5DF0` | `#7FA6FF` | Primary actions, links, focus |
| `brand-hover` | `#1A4FD0` | `#9BB9FF` | Hover/pressed primary |
| `brand-soft` | `#EAF0FE` | `#1A2A55` | Selected rows, hover wells |
| `brand-2` | `#733AEA` | `#B49BFF` | Gradient end only |
| `spark` | `#46C2FE` | `#46C2FE` | Decorative motion only |
| `supported` / soft | `#1E7B4F` / `#E6F4EC` | `#4CC38A` / `#12291E` | Verified |
| `partial` / soft | `#9A5D00` / `#FDF2DF` | `#E7A94A` / `#2E2210` | Partly supported |
| `conflicting` / soft | `#B42318` / `#FDE8E6` | `#F0756A` / `#33150F` | Conflicting, destructive |
| `unverified` / soft | `#55617A` / `#EEF1F7` | `#9BA6BD` / `#1D2540` | No record |
| `demo` / soft | `#7A5A00` / `#FFF4CC` | `#E8C35A` / `#2B2410` | Demo data labels only |

Rules: risk is never coloured (bars); `demo` yellow is used for nothing else; all text pairs meet **WCAG 2.1 AA**. Verified for this palette: every text/background pair is ≥ 4.7:1 in both themes (white on brand 5.41, brand on surface 5.41, dark brand on surface 7.24); `line-strong` is 3.13 / 3.10 against surface. A unit test over the token table keeps it that way.

### 4.3 Typography

- **IBM Plex Sans** — all UI and marketing. Chosen because Exit Brain lives in engineering teams; Plex reads as tooling, not lifestyle.
- **IBM Plex Mono** — only for real code artefacts: commit SHAs, file paths, commands. Never for labels.
- Scale (rem, 1.200 minor third): 0.75 · 0.875 · 1 · 1.2 · 1.44 · 1.728 · 2.074 · 2.488 · 3.583 (landing display only).
- Weights 400 / 500 / 600. Headings `text-wrap: balance`, tracking −0.01em above 1.44rem. Running text max 68ch, line-height 1.6. Sentence case everywhere; no all-caps labels.

### 4.4 Space, shape, depth

- 4px base; spacing steps 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Radius by role: 6px controls, 10px panels, 999px pills. No single radius on everything.
- Elevation: borders by default; shadow only for floating layers (menus, dialogs, toasts): `0 8px 24px rgb(15 19 26 / 0.12)`.
- Layout: 12-column grid, 1200px content max, 16px minimum gutter, sidebar 248px collapsing to a top bar under 1024px.

### 4.5 Motion

| Token | Duration | Easing | Used for |
|---|---|---|---|
| `instant` | 80ms | linear | Hover, press |
| `quick` | 160ms | `cubic-bezier(.2,0,0,1)` | Menus, toasts, tabs |
| `panel` | 240ms | `cubic-bezier(.2,0,0,1)` | Drawers, evidence panel, step transitions |
| `story` | 900ms total | staggered | Landing hero only |

- One orchestrated moment: the **landing hero "evidence trace"** — three commit lines resolve into one handover sentence whose citation pills light up. Plays once, ≤ 1s, never blocks scrolling.
- In-product motion only answers user actions (approve → row settles into "Reviewed"; citation click → evidence row flashes once).
- `prefers-reduced-motion`: all motion reduced to opacity fades ≤ 80ms.
- Library: CSS transitions + View Transitions API where supported. No animation framework unless a phase proves it necessary.

### 4.6 Components (built once, used everywhere)

Primitives: Button (primary / secondary / ghost / danger, sizes, loading), IconButton, Input, Textarea, Select, Checkbox, Radio, Switch, Field (label, hint, error), Tooltip, Popover, Menu, Dialog, Drawer, Tabs, Toast, Skeleton, EmptyState, ErrorState, Banner, Badge, Avatar, Stepper, ProgressBar, Table (sortable, sticky header), Pagination, Kbd.

Domain: CitationPills, EvidencePanel, EvidenceRow, VerificationBadge, RiskBars, ConfidenceText, RiskScorePopover, ApprovalGate (summary + confirm), DemoLabel, SimulatedStepNotice, RoleBadge, TransitionStatus, ReadinessMeter, AuditEntry.

Icons: `lucide-react` (pinned), 16/20px, stroke 1.75.

### 4.7 Standard states (every data view)

| State | Pattern |
|---|---|
| Loading | Skeleton matching final layout; no spinners for page loads > 300ms |
| Empty | One sentence on what will appear + the action that creates it |
| Error | What failed, what to do, Retry button; no stack traces; request id in small text |
| Partial | Inline banner ("2 repositories couldn't be read — retry") |
| Success | Toast naming the result ("Handover approved. Kiran can see it now.") |
| Permission | Plain explanation of who can do this; never a blank page |

---

## 5. Information architecture

### 5.1 Routes

```
/                         Landing (public)
/pricing, /security       Public pages (security page explains read-only, RLS, retention)
/signin  /signup  /auth/callback  /invite/accept
/demo                     Choose a demo role (no account needed)

/app                      Redirects by role
/app/setup/*              Onboarding: organisation → team → GitHub → repositories → done
/app/transitions          Dashboard (manager, admin, owner, HR)
/app/transitions/new      Start a transition (wizard)
/app/transitions/:id      Overview · Knowledge areas · Answers · Handover · Activity
/app/interview/:id        Leaving employee
/app/onboarding/:id       Successor (checklist, handover, assistant)
/app/settings/team        Members, invites, roles
/app/settings/integrations GitHub connection, repositories, disconnect
/app/settings/data        Retention, deletion requests
/app/settings/audit       Audit log
```

### 5.2 Navigation by role

| Role | Lands on | Sidebar |
|---|---|---|
| Owner / Admin | `/app/transitions` (or setup if incomplete) | Transitions · Team · Integrations · Data & retention · Audit log |
| Manager | `/app/transitions` | Transitions · Team (view) |
| Leaving employee | `/app/interview/:id` | My interview · What will be shared |
| Successor | `/app/onboarding/:id` | My checklist · Handover · Ask |
| HR (viewer) | `/app/transitions` (status columns only) | Transitions |

Navigation reflects RLS; it never replaces it.

---

## 6. Demo mode — honest by design

- **Entry:** landing "Try the demo" → `/demo` → pick a role card (Priya, Ravi, Kiran, Anita, Arjun as admin). No account; nothing stored server-side.
- **Demo bar** (persistent, top, `demo` colour): "Demo workspace — fictional company and data. Switch role ▾ · Reset demo". Replaces the prototype's "Viewing as".
- **In-place labels:** `DemoLabel` on any record that looks real (repository names, people). `SimulatedStepNotice` on steps that are not real in demo: GitHub connection ("Simulated — no GitHub account is connected"), ingestion ("Simulated progress over demo records"), AI detection/assessment/verification/assistant ("Simulated AI — fixed demo logic, not a language model").
- **Never:** a green "Connected to GitHub", real logos implying partnership, invented customer names on the landing page, invented metrics or testimonials. Landing proof points are product behaviours, not claims.
- Live mode removes the bar and the notices automatically (`dataMode === 'live'`).

---

## 7. End-to-end journeys

### J1 — Visitor → customer (Arjun, owner/CTO)
1. **Landing** (`/`): hero states the problem in one line; the evidence-trace animation shows the product idea; primary CTA "Start free pilot", secondary "Try the demo"; sections: how it works (connect → detect → interview → verify → hand over), trust (read-only GitHub, tenant isolation, human approval, retention), roles, pricing note ("Per departure — pilot pricing on request"), FAQ, footer.
2. **Sign up** (`/signup`): work email + password or magic link; password rules shown inline; email confirmation screen ("Check your inbox") — required because invites rely on confirmed emails (T11).
3. **Create organisation** (`/app/setup/organisation`): name, size band, time zone, retention (default 90 days, explained).
4. **Invite team** (`/app/setup/team`): email + role rows; role explainer; invite links (copy) until email delivery exists; skip allowed.
5. **Connect GitHub** (`/app/setup/github`): what we read (4 read permissions) and never do (write, read secrets, store full files); "Install GitHub App" → returns → **Choose repositories** with search and select; only selected repos are read.
6. **Ready** (`/app/setup/done`): checklist of what's set up; CTA "Start your first transition".

### J2 — Manager runs a transition (Priya)
1. Dashboard: table of transitions (status, days left, progress, needs attention); filters; "Start a transition".
2. **Start wizard**: person (existing member or name/email) → GitHub login (autocomplete from repo contributors) → last working day + successor → repositories (default all selected) → review → Start.
3. **Reading GitHub** (overview tab): per-repo progress, records read, rate-limit pause shown as "Paused until 14:32 — GitHub limit", retry on error. Live in real mode via polling `jobs`.
4. **Knowledge areas**: AI-suggested areas sorted by risk; evidence panel; confirm / edit / reject; bulk confirm; risk-score popover with factors. Gate: "Generate interview questions" enabled when ≥ 1 area confirmed.
5. **Answers**: approved answers with verification; override status with required comment; conflicts create a task.
6. **Handover**: generated document with citations per statement; edit statement; version history; **ApprovalGate** dialog summarising open items and who gets access → Approve.
7. **Activity**: timeline of decisions (from audit log, scoped to this transition).

### J3 — Leaving employee (Ravi)
1. Invite email → accept → lands on **My interview**: why this exists, what is shared and when, time estimate.
2. Topics list with progress; questions with "Why are we asking?" evidence; autosaved drafts; follow-ups; skip with reason / suggest another person.
3. **What will be shared**: preview exactly what Priya and Kiran will see.
4. Approve (ApprovalGate) → locked, confirmation.

### J4 — Successor (Kiran)
1. Before approval: waiting state explaining what will arrive.
2. After approval: risk-ordered checklist linked to handover sections; readiness meter.
3. Handover reader with citations.
4. **Ask**: answers only from approved knowledge, with sources; "Not in approved knowledge" → Ask Ravi / Ask Priya; escalation status shown.

### J5 — HR (Anita)
Transitions table with status, days left, completion %, open risks count. No evidence, answers or handover text. Export CSV of status (P2).

### J6 — Admin
Team (roles, pending invites, revoke), Integrations (connection status, repos, disconnect + delete data with typed confirmation), Data & retention, Audit log.

---

### J7 — Exit Brain platform admin (new, not in PRD yet)
Internal console, separate from customer workspaces: staff sign-in (SSO + MFA, allowlist) → organisations list (metadata) → organisation detail (plan, usage, integration health) → platform health (jobs, AI errors, token spend) → plans/flags → deletion-request confirmation → staff audit log. **No access to evidence, answers or handovers** except through customer-granted, time-boxed, read-only **support access** that appears in the customer's audit log. Flowcharts: `04-ux/user-journeys.html`. Needs: PRD stories, security plan section (staff roles, support-access table + RLS), and a later phase after P6.

## 8. Screen inventory

| ID | Screen | Roles | Key states |
|---|---|---|---|
| S0 | Landing | public | — |
| S0a | Security page | public | — |
| S1 | Sign in / sign up / confirm email / magic link | public | invalid credentials, unconfirmed email, rate limited |
| S1a | Accept invitation | invited | invalid/expired link, wrong email |
| S1b | Demo role picker | public | — |
| S2 | Setup: organisation → team → GitHub → repositories → done | owner | GitHub install cancelled, zero repos |
| S3 | Settings · Integrations | owner, admin | revoked, suspended, disconnect confirm |
| S4 | Transitions dashboard | owner, admin, manager, HR | empty (first run), filtered empty |
| S5 | Start a transition (wizard) | owner, admin, manager | login not found in repos, duplicate active transition |
| S6 | Transition · Overview (ingestion) | manager+ | running, paused (rate limit), failed + retry, done |
| S7 | Transition · Knowledge areas | manager+ | none detected, all reviewed |
| S8 | Interview | employee | no questions yet, all approved |
| S8a | What will be shared | employee | — |
| S9 | Transition · Answers & verification | manager+ | none approved yet |
| S9a | Transition · Handover | manager+ | generating, draft, approved, new version |
| S10 | Successor workspace | successor | waiting for approval, ready |
| S11 | Settings · Team | owner, admin (manager read) | pending invites, last owner protection |
| S12 | Settings · Audit log | owner, admin | empty, filtered |
| S13 | Settings · Data & retention | owner, admin | deletion requested |
| S14 | Not found / no access | all | — |

---

## 9. Architecture so the UI survives the real backend

```
apps/web/src/
  app/            router, layouts (Marketing, Auth, App), role redirects, providers
  design/         tokens.css, primitives (Button, Dialog, …), states (Skeleton, EmptyState, ErrorState)
  domain/         types.ts (mirror DB schema), permissions.ts (role → capability, mirrors security doc §4)
  data/
    api.ts        ExitBrainApi (data) — unchanged contract, extended per phase
    auth.ts       AuthGateway: signUp, signIn, magicLink, signOut, session$, acceptInvite
    demo/         demoApi + demoAuth + fixtures (MOCK DATA)
    live/         supabaseApi + supabaseAuth (Days 2–6)
    hooks/        TanStack Query hooks (screens only use these)
  features/       marketing, auth, setup, transitions, interview, successor, settings
```

- `VITE_DATA_MODE=demo|live` picks the implementation at start-up; screens are identical.
- **Errors** cross the boundary as `{ code, message }` (same envelope as Edge Functions), so error states work for both.
- **Permissions** in UI come from `permissions.ts` (capability checks like `can('handover.approve')`), derived from the same matrix as RLS; tests assert the matrix matches `security-and-privacy.md §4`.
- **Realtime readiness:** ingestion and job progress go through `useJobProgress(transitionId)`, which polls in live mode (pg `jobs` table) and simulates ticks in demo mode.
- **No secrets in the browser** (existing env guard stays); demo mode needs no env.

---

## 10. Implementation phases

Each phase is its own branch and PR, CI must stay green (web, functions, database, secrets). No phase changes migrations or RLS unless stated; any that does runs `/exit-brain-security-review`.

| Phase | Scope | Acceptance criteria | Tests |
|---|---|---|---|
| **P0 Design system** | Tokens (light/dark), primitives, states, layouts, `permissions.ts`, restructure folders per §9 | All tokens AA; every primitive keyboard-operable with visible focus; dark mode via `prefers-color-scheme` and toggle; prototype screens migrated with no behaviour change | Contrast unit test over tokens; component tests (Dialog focus trap, Toast, Field errors); existing 26 tests still pass |
| **P1 Landing + auth + demo entry** | S0, S0a, S1, S1a, S1b, Demo bar, `AuthGateway` (demo impl) | Landing loads with no layout shift; hero animation ≤ 1s and disabled by reduced motion; forms validate inline with Zod; demo role picker routes to role home; no fake logos/metrics | Form validation tests; route-by-role tests; reduced-motion test; Lighthouse ≥ 90 perf/a11y on landing (manual, recorded) |
| **P2 Onboarding** | S2 setup flow, S11 team, S3 integrations (simulated GitHub) | Setup resumable at any step; invites show role explainer; GitHub step clearly labelled simulated in demo; repo picker selects subset; disconnect needs typed confirmation | Stepper resume test; invite role restrictions (no owner invite); disconnect confirm test |
| **P3 Manager workflow** | S4, S5 wizard, S6 ingestion progress, S7 review (bulk, filters, risk popover) | Wizard blocks duplicate active transition; progress shows paused/failed/retry; areas reviewable by keyboard; question generation gated on ≥ 1 confirmed area | Wizard validation; job-progress state machine tests; review bulk-action tests |
| **P4 Employee interview** | S8, S8a, autosave, follow-ups, approval gate | Drafts autosave and survive reload (demo: in memory per session); approval dialog lists exactly what is shared; approved answers locked | Autosave, follow-up depth, approval-lock tests |
| **P5 Verification + handover + successor** | S9 override, S9a edit/versions/approve, S10 checklist + assistant + escalation | Override requires comment and appears in activity; approval creates locked version; successor sees nothing before approval; assistant refuses on weak retrieval | Override, versioning, gating, assistant refusal tests |
| **P6 Admin, HR, polish** | S12 audit, S13 retention, HR view, empty/error states everywhere, responsive pass, a11y pass, Playwright E2E of J1–J5 in demo mode | No horizontal scroll at 375px; every view has loading/empty/error; axe: 0 serious issues; E2E green in CI | Playwright E2E per journey (added to CI web job), axe checks |

After P6, Days 2–6 of the roadmap implement `data/live/*` against Supabase without changing screens.

---

## 11. Decisions (15 Oct 2026)

| Topic | Decision | Follow-up |
|---|---|---|
| Logo | Use `exit_brain_logo.png`; palette above derived from it | — |
| Name | "Exit Brain", two words | — |
| Domain | Buy later | Until then links use the deploy URL; set `APP_ORIGIN` when bought |
| Pricing on landing | **$149 per departure** (pilot) | Supersedes the $299 assumption in PRD §3.4 → **update PRD §3.4 and `09-business/go-to-market.md`**; still an assumption to validate |
| Sign-in | **Real Supabase Auth** (sign-up, email confirmation, sign-in, magic link) with real organisations, members and invitations (Day 1 RPCs). Transition content (evidence, areas, answers, handover) stays **demo data**, labelled, until Days 2–6 wire it | Needs a Supabase dev project; `AuthGateway` has a demo implementation so the UI and tests run without one |
| Public demo | Also keep `/demo` (no account) for quick customer walkthroughs | — |
