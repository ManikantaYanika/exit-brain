/** How it works: step text (shared by the page and the site guide index). */
export const HOW_STEPS = [
  {
    title: 'Connect GitHub, read-only',
    who: 'Workspace admin',
    body: 'An admin installs the Exit Brain GitHub App and selects the repositories it may read. It asks for metadata, contents, pull requests and issues, all read-only.',
    never: 'Exit Brain never writes to your repositories.',
  },
  {
    title: 'Find what only one person knows',
    who: 'Exit Brain suggests, the manager decides',
    body: 'Exit Brain reads commit messages, pull request and issue titles and descriptions, and file paths. It suggests knowledge areas with the records behind each one. The manager confirms, edits or rejects them.',
    never: 'A suggestion is never treated as fact before a person reviews it.',
  },
  {
    title: 'Interview with evidence',
    who: 'Leaving engineer',
    body: 'The leaving engineer gets short questions tied to specific records, with “Why are we asking?” next to each one. When an answer is too general to hand over, a follow-up asks for the missing detail.',
    never: 'An answer is never shared before the engineer approves it.',
  },
  {
    title: 'Verify against the records',
    who: 'Exit Brain checks, the manager resolves',
    body: 'Each answer is compared with the records and given one of four statuses. Conflicts become open questions for the manager instead of disappearing into the document.',
    never: 'A conflict is never hidden.',
  },
  {
    title: 'Approve and hand over',
    who: 'Manager, then the successor',
    body: 'The manager edits and approves the handover. The successor gets a checklist ordered by risk and an assistant that answers only from approved content, with sources. When the answer isn’t there, it says so and offers to ask the leaving engineer.',
    never: 'The assistant never invents an answer.',
  },
]
