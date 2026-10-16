/* Why Exit Brain copy (website-copy.md §5). Categories only, no named competitors, no statistics of our own. */
export const PROTECTS = [
  {
    title: 'Delivery',
    body: 'Work keeps moving when the engineer who knew the billing job, the release script or the client workaround moves on.',
  },
  {
    title: 'The successor’s first months',
    body: 'They start from an approved handover and a checklist ordered by risk, not from a folder of old documents.',
  },
  {
    title: 'The manager’s time',
    body: 'The questions come from the records, so the manager reviews and approves instead of writing the handover themselves.',
  },
  {
    title: 'A record the team trusts',
    body: 'Every statement points to its source and was approved by a person, so it stays useful after the engineer has gone.',
  },
]

export const COMPARE_COLUMNS = ['Exit interview', 'Wiki or docs', 'Enterprise search', 'Exit Brain'] as const

export const COMPARE_ROWS: { row: string; values: [string, string, string, string] }[] = [
  { row: 'Starts from evidence in your code history', values: ['No', 'No', 'Partly', 'Yes'] },
  { row: 'Finds what only one person knows', values: ['No', 'No', 'No', 'Yes'] },
  { row: 'Checks answers against the records', values: ['No', 'No', 'No', 'Yes'] },
  { row: 'Handover approved by a person', values: ['Sometimes', 'Sometimes', 'No', 'Yes'] },
  { row: 'Built for a departure', values: ['Yes', 'No', 'No', 'Yes'] },
]

export interface WorksheetInput {
  salary: number
  rampMonths: number
  rampShare: number
  managerHours: number
  hourlyCost: number
}

/**
 * The visitor's own arithmetic, nothing pre-filled as fact:
 * ramp-up cost = monthly salary × months to ramp up × share of time lost while ramping;
 * manager cost = handover hours × hourly cost.
 */
export function worksheetCost(i: WorksheetInput) {
  const ramp = (i.salary / 12) * i.rampMonths * (i.rampShare / 100)
  const manager = i.managerHours * i.hourlyCost
  return { ramp, manager, total: ramp + manager }
}
