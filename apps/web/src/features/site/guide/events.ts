export const OPEN_GUIDE_EVENT = 'eb:open-guide'
/** Open the guide from anywhere on the site (e.g. the help centre). */
export const openSiteGuide = () => window.dispatchEvent(new Event(OPEN_GUIDE_EVENT))

export const SUGGESTED = [
  'How does verification work?',
  'What data do you read?',
  'How much does it cost?',
  'Is it used to evaluate employees?',
]
