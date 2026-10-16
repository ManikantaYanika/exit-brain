import { DraftNotice, Prose } from '../blocks'
import { CONTACT_EMAIL } from '../content/security'
import { PageHeader } from '../PageHeader'
import { SiteLink } from '../SiteLink'
import { container } from '../styles'

/*
 * Legal drafts (website-plan.md §8.5, security §5.10). Plain statements of how the site and product work
 * today; they are not reviewed legal text and say so. Legal entity, address and hosting are not decided
 * yet and are named as open, not invented. [RESEARCH NEEDED] DPDP Rules / GDPR basis before the form goes live.
 */
export const LEGAL_DRAFT_NOTICE = 'Draft, pending legal review. Not yet the final terms.'
const UPDATED = '16 October 2026'

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>

export function PrivacyPage() {
  return (
    <>
      <DraftNotice>{LEGAL_DRAFT_NOTICE}</DraftNotice>
      <PageHeader kicker="Legal" title="Privacy notice" lead={`Draft · last updated ${UPDATED}`} />
      <div className={`${container} py-14 md:py-16`}>
        <Prose>
          <p>
            This notice explains what the Exit Brain website and product collect, why, and what you can ask us
            to do. Exit Brain is in early development and founder-led. The legal entity responsible for your
            data and its address will be named here before this notice is final.
          </p>

          <h2>This website</h2>
          <ul>
            <li>
              <strong>No analytics, no advertising.</strong> The website uses no analytics, tracking pixels or
              advertising cookies. Fonts are served from our own site, not from a font provider.
            </li>
            <li>
              <strong>Stored in your browser only.</strong> If you pause the animation, or pick a light or
              dark theme in the product, that choice is saved in your browser’s local storage. The demo keeps
              the fictional person you picked in session storage until you close the tab. Neither is sent to
              us.
            </li>
            <li>
              <strong>Site guide and help search</strong> run in your browser. Your questions aren’t sent to
              us or stored.
            </li>
            <li>
              <strong>Server logs.</strong> Like any website, the server that delivers these pages may record
              standard request data, such as IP address, browser and time. The hosting provider and how long
              it keeps these logs will be stated here once hosting is chosen.
            </li>
          </ul>

          <h2>When you contact us</h2>
          <p>
            If you email us, we use your name, email address and message only to reply to you. The contact
            form on this site is not active yet and sends nothing. Before it is switched on, this notice will
            say where submissions are stored and for how long.
          </p>

          <h2>The product, for pilot workspaces</h2>
          <ul>
            <li>
              <strong>Account data:</strong> name, email address and role, used to sign you in and show you
              what your role allows.
            </li>
            <li>
              <strong>Work records:</strong> from repositories your organisation selects, excerpts only:
              commit messages, pull request and issue titles, shortened descriptions, file paths, timestamps
              and links. Not file contents.
            </li>
            <li>
              <strong>Interview answers and the handover</strong>, shared only after the leaving engineer
              approves their answers and the manager approves the handover.
            </li>
            <li>
              <strong>Purpose:</strong> knowledge transfer only. Not for performance evaluation or employment
              decisions.
            </li>
            <li>
              <strong>Retention:</strong> by design, evidence, answers and AI records are deleted 90 days
              after a handover is completed, or after the period your workspace chooses (30 to 365 days).
            </li>
          </ul>
          <p>
            More detail on access, isolation and AI use is on the{' '}
            <SiteLink href="/security">Security</SiteLink> page. The AI provider will be named there once it
            is chosen.
          </p>

          <h2>Your choices</h2>
          <p>
            You can ask what we hold about you, ask us to correct it, or ask us to delete it, by emailing{' '}
            {mail}. Workspace owners can also disconnect GitHub and request deletion of everything ingested
            from it.
          </p>

          <h2>Changes</h2>
          <p>
            We will update this notice as the product changes, and change the date at the top. Questions:{' '}
            {mail}.
          </p>
        </Prose>
      </div>
    </>
  )
}

export function TermsPage() {
  return (
    <>
      <DraftNotice>{LEGAL_DRAFT_NOTICE}</DraftNotice>
      <PageHeader kicker="Legal" title="Terms of use" lead={`Draft · last updated ${UPDATED}`} />
      <div className={`${container} py-14 md:py-16`}>
        <Prose>
          <p>
            These draft terms describe how the Exit Brain website, demo and pilots are meant to work. They
            will be replaced by reviewed terms, and pilots are covered by a separate written agreement.
          </p>

          <h2>Early development</h2>
          <p>
            Exit Brain is in early development. Features are labelled “MVP scope” or “Later”, and the{' '}
            <SiteLink href="/security#status">security status</SiteLink> lists what isn’t done yet. Don’t rely
            on the product for anything it doesn’t yet do.
          </p>

          <h2>The demo</h2>
          <p>
            The demo uses a fictional company. Everything in it is MOCK DATA. Please don’t enter real personal
            or company information into it.
          </p>

          <h2>Pilots and pricing</h2>
          <p>
            Pilots are by invitation. Billing isn’t live, and nothing is charged without a signed agreement
            that sets out scope, price and data handling.
          </p>

          <h2>Acceptable use</h2>
          <ul>
            <li>Connect only repositories your organisation is allowed to share with Exit Brain.</li>
            <li>
              Don’t use Exit Brain to evaluate, rank or monitor people, or to make employment decisions.
            </li>
            <li>Don’t try to access another organisation’s data, or disrupt the service.</li>
          </ul>

          <h2>Your content</h2>
          <p>
            Your organisation keeps its rights in its records, answers and handovers. Exit Brain uses them
            only to provide the service to that organisation.
          </p>

          <h2>Contact</h2>
          <p>Questions about these terms: {mail}.</p>
        </Prose>
      </div>
    </>
  )
}
