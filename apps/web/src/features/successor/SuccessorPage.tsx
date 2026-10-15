import { useState } from 'react'
import { useParams } from 'react-router'
import { Citations } from '../../components/evidence/Citations'
import { EvidenceProvider } from '../../components/evidence/EvidenceContext'
import { EvidencePanel } from '../../components/evidence/EvidencePanel'
import { Button } from '../../components/ui/Button'
import { ProgressBar, RiskBars, VerificationBadge } from '../../components/ui/status'
import {
  useAskAssistant,
  useChecklist,
  useEscalate,
  useEvidence,
  useHandover,
  useProgress,
  useSetChecklistDone,
} from '../../data/hooks'
import type { AssistantReply } from '../../data/types'

const SUGGESTED = [
  'What happens if the nightly sync fails?',
  'Customers say they were charged twice. What do I check?',
  'How do I renew the SSL certificate?',
]

function Assistant({ transitionId }: { transitionId: string }) {
  const ask = useAskAssistant(transitionId)
  const escalate = useEscalate(transitionId)
  const [q, setQ] = useState('')
  const [thread, setThread] = useState<{ q: string; reply: AssistantReply; escalated?: boolean }[]>([])

  const send = (question: string) => {
    if (!question.trim()) return
    ask.mutate(question, { onSuccess: (reply) => setThread((t) => [...t, { q: question, reply }]) })
    setQ('')
  }

  return (
    <section aria-labelledby="assistant-title" className="rounded-lg border border-line bg-surface p-5">
      <h2 id="assistant-title" className="text-lg font-semibold">
        Ask how Ravi handled something
      </h2>
      <p className="mt-1 text-sm text-muted">
        Answers come only from approved knowledge and show their sources. If it isn’t there, you can send the
        question to Ravi or Priya.
      </p>

      <ol className="mt-4 space-y-4">
        {thread.map((m, i) => (
          <li key={i} className="space-y-2">
            <p className="ml-auto w-fit max-w-[85%] rounded-lg bg-brand-soft px-3 py-2 text-sm">{m.q}</p>
            {m.reply.found ? (
              <div className="max-w-[95%] rounded-lg border border-line px-3 py-2 text-sm leading-6">
                {m.reply.answer}
                {m.reply.citations.map((c, j) => (
                  <span key={j}>
                    <Citations ids={c.evidenceIds} />
                    <span className="ml-1 text-xs text-muted">{c.source}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="max-w-[95%] rounded-lg border border-dashed border-line px-3 py-2 text-sm">
                <p>{m.reply.answer}</p>
                {m.escalated ? (
                  <p className="mt-1 text-xs text-supported">
                    Sent to Ravi’s interview. You’ll see the answer here once he approves it.
                  </p>
                ) : (
                  <Button
                    variant="ghost"
                    className="mt-1 -ml-2"
                    disabled={escalate.isPending}
                    onClick={() =>
                      escalate.mutate(m.q, {
                        onSuccess: () =>
                          setThread((t) => t.map((x, k) => (k === i ? { ...x, escalated: true } : x))),
                      })
                    }
                  >
                    Ask Ravi
                  </Button>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          send(q)
        }}
      >
        <label htmlFor="ask" className="sr-only">
          Your question
        </label>
        <input
          id="ask"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-line px-3 py-1.5 text-sm"
          placeholder="e.g. When does the nightly sync run?"
        />
        <Button type="submit" variant="primary" disabled={!q.trim() || ask.isPending}>
          Ask
        </Button>
      </form>
      {thread.length === 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:border-brand hover:text-brand"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export function SuccessorPage() {
  const { id = '' } = useParams()
  const { data: handover } = useHandover(id)
  const { data: checklist = [] } = useChecklist(id)
  const { data: progress } = useProgress(id)
  const { data: evidence = [] } = useEvidence(id)
  const setDone = useSetChecklistDone(id)
  const approved = handover?.status === 'approved'
  const order = { high: 0, medium: 1, low: 2 }

  return (
    <EvidenceProvider evidence={evidence}>
      <header className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Taking over billing from Ravi</h1>
        <p className="mt-2 text-muted">
          Start with the high-risk items: they are the ones only Ravi has touched recently.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          {!approved ? (
            <section className="rounded-lg border border-dashed border-line bg-surface p-5">
              <h2 className="text-lg font-semibold">
                Your checklist appears when Priya approves the handover
              </h2>
              <p className="mt-1 text-sm text-muted">
                You only see knowledge that Ravi and Priya have reviewed. In this prototype, switch to Priya,
                open Ravi’s handover document and approve it.
              </p>
            </section>
          ) : (
            <section
              aria-labelledby="checklist-title"
              className="rounded-lg border border-line bg-surface p-5"
            >
              <h2 id="checklist-title" className="text-lg font-semibold">
                Learning checklist
              </h2>
              {progress && (
                <div className="mt-3 max-w-sm">
                  <ProgressBar value={progress.readinessPct} label="Readiness, weighted by risk" />
                </div>
              )}
              <ul className="mt-4 divide-y divide-line">
                {[...checklist]
                  .sort((a, b) => order[a.risk] - order[b.risk])
                  .map((c) => (
                    <li key={c.id} className="flex items-center gap-3 py-3">
                      <input
                        id={c.id}
                        type="checkbox"
                        checked={c.done}
                        onChange={(e) => setDone.mutate({ itemId: c.id, done: e.target.checked })}
                        className="h-4 w-4 accent-brand"
                      />
                      <label
                        htmlFor={c.id}
                        className={`flex-1 text-sm ${c.done ? 'text-muted line-through' : ''}`}
                      >
                        {c.title}
                      </label>
                      <RiskBars level={c.risk} showLabel={false} />
                    </li>
                  ))}
              </ul>
            </section>
          )}

          <Assistant transitionId={id} />

          {approved && handover && (
            <section
              aria-labelledby="handover-title"
              className="rounded-lg border border-line bg-surface p-5"
            >
              <h2 id="handover-title" className="text-lg font-semibold">
                Approved handover
              </h2>
              {handover.sections.map((s) => (
                <div key={s.id} className="mt-4">
                  <h3 className="text-sm font-semibold">{s.title}</h3>
                  <ul className="mt-1 space-y-2">
                    {s.statements.map((st) => (
                      <li key={st.id} className="text-sm leading-6">
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
                </div>
              ))}
            </section>
          )}
        </div>
        <div className="lg:sticky lg:top-6 lg:self-start">
          <EvidencePanel title="Sources" />
        </div>
      </div>
    </EvidenceProvider>
  )
}
