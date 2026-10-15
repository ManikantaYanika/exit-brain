# Exit Brain — Website Copy Draft (v0.1, for review)

> Status: **draft for owner review (W0).** Plain, professional English. Goes into `features/site/content/*.ts` after approval.
> Every claim is traceable: ‹src: …› marks where a statement comes from. Remove the markers when the copy is implemented; keep them in this file.
> Product status, stated honestly on the site: **Exit Brain is in early development. Pilots are by invitation.** No feature is described as live unless it is built and tested. Feature status uses two labels only: **"MVP scope"** (being built for the pilot) and **"Later"**.
> Words we don't use: revolutionary, world's first, guaranteed, 100%, monitor, track (people), productivity score, effortless, magic.

---

## Global

- **Header:** How it works · Features · Security · Why Exit Brain · Services · Company · Sign in · **Book a pilot**
- **Footer tagline:** Knowledge transfer for engineering teams, built on evidence and human approval.
- **Footer status line:** Exit Brain is in early development. Pilots are by invitation.
- **Footer links:** Product (How it works, Features, Security, Explore the demo) · Company (About, Services, Contact) · Help (Help centre, Site guide) · Legal (Privacy — draft, Terms — draft)
- **Demo labels:** every product image carries "MOCK DATA — fictional company".

---

## 1. Home `/`

**Hero**
- Eyebrow: Knowledge transfer for engineering teams
- H1: **When a senior engineer leaves, their knowledge doesn't have to.**
- Sub: Exit Brain reads the work they did on GitHub, asks the questions only they can answer, and gives their successor a handover where every statement points to its source and was approved by a person. ‹src: PRD §1›
- CTAs: **Book a pilot** · Explore the demo
- Under CTAs: Read-only GitHub access · People approve every step · No scoring of people ‹src: PRD NFR-02, NFR-05, NFR-06›

**The problem**
- H2: The knowledge that matters most is the knowledge nobody wrote down.
- Body: Exit interviews and handover documents depend on the leaving person listing what they know. But people can't list what they don't realise only they know: the job that has to run before month-end, the retry someone added during an incident, the client whose invoices are handled by hand. ‹src: PRD §1›
- Evidence line: In a peer-reviewed study of 133 popular open-source projects on GitHub, about two-thirds could be put at serious risk if just one or two developers left (a "truck factor" of 2 or less). ‹src: Avelino et al., ICPC 2016 — open-source only; cite in a footnote with link›

**How it works (summary)**
- H2: Evidence first, then ask.
- 1 Connect GitHub, read-only — Choose the repositories Exit Brain may read.
- 2 Find what only one person knows — Areas where one engineer made most of the changes, recurring jobs and workarounds, each with the records behind it.
- 3 Interview with evidence — Short, specific questions tied to their own commits and pull requests.
- 4 Verify — Each answer is checked against the records and marked supported, partly supported, conflicting or unverified.
- 5 Approve and hand over — The manager approves a handover where every statement cites its source. The successor gets a checklist and an assistant that answers only from it.
- Link: See the full workflow →

**A portal for each person**
- H2: Everyone sees what their role needs, and nothing more.
- Engineering manager — Reviews what would leave with the person, follows the interview, approves the handover.
- Leaving engineer — Answers short questions about their own work. Nothing is shared until they approve it.
- Successor — A checklist ordered by risk, and answers with sources.
- HR — Status and progress, without code, answers or handover text.
- Workspace owner — Team, GitHub access, data retention and an audit log.
‹src: security-and-privacy §4 role matrix›

**Evidence you can check** (evidence-trace artefact, MOCK DATA)
- H2: Every line points to where it came from.
- Body: Statements in a handover link to the commits, pull requests and issues behind them, with a verification status. If the records don't support an answer, Exit Brain says so.

**Trust strip** → link to Security
- Read-only GitHub App · Each customer's data isolated in the database · People approve every step · Not used to evaluate people

**Pricing**
- H2: One price per handover.
- **$149 per departure** — pilot pricing.
- You pay when someone leaves, not for seats. Managers, successors and HR are included.
- Small print: Billing isn't live yet. Nothing is charged without a signed agreement. ‹src: ux-plan §11›

**Closing CTA**
- H2: Someone resigned this week? Start the handover while they're still here.
- **Book a pilot** · Explore the demo

---

## 2. How it works `/how-it-works`

- H1: How a handover works
- Sub: Exit Brain starts from the work itself, so the questions are about the parts only the leaving engineer has touched.

For each step: **What happens · Who acts · What they see (MOCK DATA image) · What Exit Brain never does**

1. **Connect GitHub, read-only** — An admin installs the Exit Brain GitHub App and selects repositories. Permissions requested: metadata, contents, pull requests and issues, all read-only. *Never:* writes to your repositories. ‹src: PRD NFR-02›
2. **Find what only one person knows** — Exit Brain reads commit messages, pull request and issue titles and descriptions, and file paths. It suggests knowledge areas with the evidence behind each. The manager confirms, edits or rejects them. *Never:* treats a suggestion as fact before a person reviews it. ‹src: PRD FR, security §5.8›
3. **Interview with evidence** — The leaving engineer gets questions tied to specific records, with "Why are we asking?" next to each. Vague answers get a follow-up. *Never:* shares an answer before the engineer approves it.
4. **Verify against the records** — Each answer is compared with the records and marked: **Supported**, **Partly supported**, **Conflicting** or **Unverified**. Conflicts appear as open questions for the manager. *Never:* hides a conflict.
5. **Approve and hand over** — The manager reviews the generated handover, edits it and approves it. The successor gets a checklist ordered by risk and an assistant that answers only from approved content, with sources. If the answer isn't there, it says so and offers to ask the leaving engineer. *Never:* invents an answer.

- Note: Example timeline for a 30-day notice period (illustration, not a promise).
- CTA: Explore the demo (fictional company, no account needed)

---

## 3. Features `/features`

- H1: Features
- Sub: Built for the people who carry a handover. Status shows what is in the pilot (MVP scope) and what comes later.

| Group | Feature | Status |
|---|---|---|
| Managers | Knowledge areas with evidence and risk factors; confirm, edit, reject | MVP scope |
| Managers | Interview progress and open questions | MVP scope |
| Managers | Handover editing, versioning and approval; Markdown export | MVP scope |
| Leaving engineer | Evidence-based questions with follow-ups; approve before sharing | MVP scope |
| Successor | Checklist ordered by risk; cited assistant; ask the leaving engineer | MVP scope |
| HR | Status and progress without knowledge content | MVP scope |
| Admins | Members and roles, GitHub access, audit log | MVP scope |
| Admins | Data retention settings and deletion | MVP scope (may move later) |
| Integrations | GitHub | MVP scope |
| Integrations | Slack, Jira, Google Drive | Later |
| Enterprise | SSO/SAML, SCIM | Later |
‹src: PRD §2 goals/non-goals, roadmap Days 1–7, security §9›

---

## 4. Security `/security`

- H1: Security and responsible use
- Sub: How Exit Brain handles your code history and your people. This page describes the design of the MVP; where something isn't done yet, the table at the end says so.

**Access** — Exit Brain connects through a GitHub App with read-only permissions to the repositories you select: metadata, contents, pull requests and issues. GitHub issues it short-lived installation tokens that expire after one hour. Exit Brain can't push code, comment or change settings. ‹src: PRD NFR-02; GitHub Docs (installation tokens)›

**What we store** — Excerpts only: commit messages, pull request and issue titles, shortened descriptions, file paths, timestamps and links. We don't store the contents of your files. ‹src: NFR-04, security §5.8›

**Isolation** — Every customer table is protected by row-level security in Postgres. Automated tests check that one organisation can't read another's data, and they run on every change. ‹src: NFR-01, CI database job›

**AI use** — AI suggests; people approve. Knowledge areas, answers and the handover each need a person's approval. Every AI statement shows its source and a verification status. Only excerpts and answers are sent to the AI provider. *[Provider name and its data-use terms — to be added when chosen; until then no "not used for training" claim.]* ‹src: NFR-05, security §5.6›

**Retention** — By design, evidence, answers and AI records are deleted 90 days after a handover is completed. Workspaces can set 30 to 365 days and request deletion at any time. *(Retention job is MVP scope; status in table.)* ‹src: security §5.8›

**Responsible use** —
- Exit Brain looks at knowledge concentrated in systems, not at how well people work.
- It does not score, rank or compare people, and produces no productivity metrics.
- It must not be used for performance reviews or employment decisions.
- The leaving engineer sees why each question is asked and approves what is shared.
‹src: NFR-06, security §5.8 Purpose; EU draft guidance on workplace AI (Faegre Drinker, June 2026)›

**Status table** (honest)

| Item | Status |
|---|---|
| Read-only GitHub App | MVP scope |
| Row-level security + cross-tenant tests | Done (tested in CI) |
| Audit log of approvals and role changes | Done for membership and roles; more in MVP scope |
| Retention job | MVP scope |
| SSO/SAML, SCIM | Not started |
| SOC 2, ISO 27001 | Not started |
| External penetration test | Not started |
| Data Processing Agreement | Not started |
| Data residency choice | Not started |
‹src: CHANGELOG Day 1, security §9›

**Report a vulnerability** — Email [security contact — placeholder]. Please give us time to fix an issue before disclosing it.

---

## 5. Why Exit Brain `/why-exit-brain`

- H1: Why Exit Brain
- Sub: A departure is a predictable risk. Most teams handle it with a meeting and a document.

**What it protects** — Delivery when a key engineer leaves; the successor's first months; the manager's time; a record the team has approved.

**How it compares** (categories, no named competitors)

| | Exit interview | Wiki / docs | Enterprise search | Exit Brain |
|---|---|---|---|---|
| Starts from evidence in your code history | No | No | Partly | Yes |
| Finds what only one person knows | No | No | No | Yes |
| Checks answers against records | No | No | No | Yes |
| Handover approved by a person | Sometimes | Sometimes | No | Yes |
| Built for a departure | Yes | No | No | Yes |

**Work out your own numbers** — worksheet: salary of the leaving engineer, months for a successor to ramp up, hours the manager spends on handover → a simple cost line. Nothing pre-filled as fact. Footnote: "Your inputs stay in your browser."

CTA: Book a pilot

---

## 6. About `/about`

- H1: About Exit Brain
- Mission: No team should lose what it has learned when someone moves on.
- Principles: Evidence before questions · Consent before sharing · People approve, AI suggests · Read-only by default · Honest about what's not built yet
- What we won't build: employee surveillance, performance scoring, tools that make employment decisions.
- Company status: Exit Brain is in early development. *[Legal entity, location — placeholder until owner confirms]*
- Link: Meet the founder (shown only after approval)

## 7. Founder `/about/founder` (hidden until approved)

- H1: Manikanta Yanika
- Role: Founder, Exit Brain *[confirm title]*
- Bio: *[placeholder — owner to provide verified text]*
- Why Exit Brain: *[placeholder — in the founder's words]*
- Links: *[placeholder — only links the owner provides]*
- Photo: none until provided; layout works without one.

## 8. Services `/services`

- H1: Services
- Sub: Founder-led services that sit alongside the product. They are proposed and arranged case by case. The software is separate and doesn't require them.
- Label on each: **Proposed · founder-led · by arrangement**
1. **Pilot onboarding and setup** — Help installing the GitHub App, choosing repositories and running the first transition together.
2. **Employee knowledge-handover facilitation** — Support for a manager running a critical handover: planning the interview, reviewing the handover draft.
3. **Knowledge concentration review** — A review of selected repositories, based on authorised source evidence, showing where knowledge sits with one person. Not an assessment of individuals.
- Small print: No outcomes are guaranteed. Scope, timing and price are agreed in writing first.
- CTA: Talk to us

## 9. Contact `/contact`

- H1: Contact
- Sub: Ask about a pilot, a security question or anything else.
- Fields: Topic (Pilot · Security question · Partnership · Other), Name, Work email, Company, Message.
- Consent: "We use these details only to reply to you. See our Privacy notice (draft)."
- Until W10: notice "This form isn't active yet. Please email [contact email — placeholder]." Submit disabled.
- No response-time promise.

## 10. Help `/help`

- H1: Help centre
- Search box + "Ask the site guide".
- Sections: Getting started · Sign-in and accounts · GitHub access · Data and privacy · For managers · For leaving engineers · For successors · For HR
- FAQ (answers drawn from this document only): Do you read our source code? · Does the AI decide anything? · What does the leaving engineer see? · Which tools are supported? · Can we delete our data? · How much does it cost? · Is there a demo?

## 11. 404

- H1: Page not found
- Body: The link may be out of date. Try one of these: Home · How it works · Help · Contact.

## 12. Site guide (v1) strings

- Launcher: Ask about Exit Brain
- Panel title: Site guide
- Disclosure: Answers come from pages on this website. It doesn't use AI and doesn't store your questions.
- Suggested: How does verification work? · What data do you read? · How much does it cost? · Is it used to evaluate employees?
- No match: I couldn't find that on our site. You can ask us directly on the Contact page.
