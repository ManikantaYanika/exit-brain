import { useState } from 'react'
import { useParams } from 'react-router'
import { Citations } from '../../components/evidence/Citations'
import { useEvidenceContext } from '../../components/evidence/EvidenceContext'
import { Button } from '../../components/ui/Button'
import { VerificationBadge } from '../../components/ui/status'
import { useApproveHandover, useHandover } from '../../data/hooks'
import { handoverToMarkdown } from './handoverMarkdown'

export function HandoverTab() {
  const { id = '' } = useParams()
  const { data: h } = useHandover(id)
  const approve = useApproveHandover(id)
  const { byId, numberOf } = useEvidenceContext()
  const [copied, setCopied] = useState<'idle' | 'copied' | 'failed'>('idle')

  if (!h) return <p className="text-muted">Loading…</p>
  const statements = h.sections.flatMap((s) => s.statements)
  const open = statements.filter((s) => s.verification !== 'supported').length
  const approved = h.status === 'approved'

  const markdown = handoverToMarkdown(h, 'Ravi Kumar', byId, numberOf)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied('copied')
    } catch {
      setCopied('failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface px-5 py-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {approved ? 'Approved and shared with Kiran' : `Draft version ${h.version}`}
          </p>
          <p className="text-sm text-muted">
            {approved
              ? 'This version is locked. Changes create a new version.'
              : `${statements.length} statements, ${open} not fully supported by records. Kiran sees nothing until you approve.`}
          </p>
        </div>
        <Button onClick={copy}>{copied === 'copied' ? 'Markdown copied' : 'Copy as Markdown'}</Button>
        {!approved && (
          <Button variant="primary" disabled={approve.isPending} onClick={() => approve.mutate()}>
            Approve handover
          </Button>
        )}
      </div>

      {copied === 'failed' && (
        <div className="rounded-lg border border-line bg-surface p-4">
          <label htmlFor="md-export" className="text-sm text-muted">
            Copying is blocked here. Select the text below and copy it.
          </label>
          <textarea
            id="md-export"
            readOnly
            value={markdown}
            rows={8}
            className="mt-2 w-full rounded-md border border-line p-2 font-mono text-xs"
            onFocus={(e) => e.currentTarget.select()}
          />
        </div>
      )}

      <article className="rounded-lg border border-line bg-surface px-6 py-5">
        {h.sections.map((s) => (
          <section key={s.id} className="border-b border-line py-4 first:pt-0 last:border-b-0 last:pb-0">
            <h3 className="text-base font-semibold">{s.title}</h3>
            <ul className="mt-2 space-y-3">
              {s.statements.map((st) => (
                <li key={st.id} className="max-w-prose text-sm leading-6">
                  {st.text}
                  <Citations ids={st.evidenceIds} status={st.verification} />
                  {st.verification !== 'supported' && (
                    <span className="ml-2 align-middle">
                      <VerificationBadge status={st.verification} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </article>
    </div>
  )
}
