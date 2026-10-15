import { verificationLabel } from '../../components/ui/statusLabels'
import type { Evidence, Handover } from '../../data/types'

/** Plain Markdown export (FR-19). Every statement keeps its citations and status. */
export function handoverToMarkdown(
  h: Handover,
  employee: string,
  evidenceById: Map<string, Evidence>,
  numberOf: (id: string) => number,
): string {
  const lines = [
    `# Handover: ${employee}`,
    '',
    `Version ${h.version}, ${h.status === 'approved' ? 'approved' : 'draft'}.`,
    '',
  ]
  const cited = new Set<string>()
  for (const s of h.sections) {
    lines.push(`## ${s.title}`, '')
    for (const st of s.statements) {
      st.evidenceIds.forEach((id) => cited.add(id))
      const refs = st.evidenceIds.length ? ` [${st.evidenceIds.map(numberOf).join(', ')}]` : ' [no record]'
      lines.push(`- ${st.text}${refs} — ${verificationLabel(st.verification)}, ${st.confidence} confidence`)
    }
    lines.push('')
  }
  lines.push('## Evidence', '')
  for (const id of [...cited].sort((a, b) => numberOf(a) - numberOf(b))) {
    const e = evidenceById.get(id)
    if (e) lines.push(`${numberOf(id)}. ${e.repo} ${e.ref}: ${e.title}`)
  }
  return lines.join('\n')
}
