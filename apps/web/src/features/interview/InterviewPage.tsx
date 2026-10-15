import { useState } from 'react'
import { useParams } from 'react-router'
import { Citations } from '../../components/evidence/Citations'
import { EvidenceProvider } from '../../components/evidence/EvidenceContext'
import { EvidencePanel } from '../../components/evidence/EvidencePanel'
import { Button } from '../../design/primitives/Button'
import { RiskBars } from '../../design/primitives/status'
import {
  useApproveAnswers,
  useEvidence,
  useInterview,
  useKnowledgeItems,
  useSkipQuestion,
  useSubmitAnswer,
} from '../../data/hooks'
import type { Answer, AnswerClass, Question } from '../../data/types'

const assessorNote: Record<AnswerClass, string> = {
  complete: 'Clear and specific. You can still edit it until you approve.',
  vague: 'This reads a little general, so there’s a follow-up below.',
  incomplete: 'Missing the “how” or “where”, so there’s a follow-up below.',
  off_topic: 'This doesn’t seem to answer the question, so there’s a follow-up below.',
}

function QuestionBlock({
  q,
  answer,
  transitionId,
}: {
  q: Question
  answer: Answer | undefined
  transitionId: string
}) {
  const submit = useSubmitAnswer(transitionId)
  const skip = useSkipQuestion(transitionId)
  const [text, setText] = useState(answer?.status === 'draft' ? answer.body : '')
  const [skipping, setSkipping] = useState(false)
  const [reason, setReason] = useState('')
  const locked = answer?.status === 'approved' || answer?.status === 'skipped'

  return (
    <li
      className={`rounded-lg border border-line bg-surface p-5 ${q.depth > 0 ? 'ml-6 border-l-2 border-l-brand' : ''}`}
    >
      <p className="font-medium leading-6">
        {q.depth > 0 && <span className="mr-1 text-sm font-normal text-brand">Follow-up:</span>}
        {q.text}
      </p>
      {q.evidenceIds.length > 0 && (
        <p className="mt-1 text-sm text-muted">
          Why are we asking? Based on these records
          <Citations ids={q.evidenceIds} />
        </p>
      )}

      {locked ? (
        <div className="mt-3 text-sm">
          <p className="whitespace-pre-wrap">{answer.body}</p>
          <p className="mt-2 text-xs text-muted">
            {answer.status === 'approved'
              ? 'Approved and shared. Approved answers can’t be edited.'
              : 'Skipped.'}
          </p>
        </div>
      ) : skipping ? (
        <form
          className="mt-3 space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (reason.trim()) skip.mutate({ questionId: q.id, reason: reason.trim() })
          }}
        >
          <label className="block text-sm">
            <span className="text-muted">Who should answer this, or why doesn’t it apply?</span>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-md border border-line px-2 py-1.5"
              placeholder="e.g. Ask Deepa in finance — she owns the export now"
            />
          </label>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={!reason.trim() || skip.isPending}>
              Skip with reason
            </Button>
            <Button onClick={() => setSkipping(false)}>Back</Button>
          </div>
        </form>
      ) : (
        <form
          className="mt-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (text.trim()) submit.mutate({ questionId: q.id, body: text.trim() })
          }}
        >
          <label className="sr-only" htmlFor={`a-${q.id}`}>
            Your answer
          </label>
          <textarea
            id={`a-${q.id}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-line px-3 py-2 text-sm leading-6"
            placeholder="Write it the way you’d explain it to Kiran on his first day."
          />
          {answer && <p className="mt-1 text-xs text-muted">{assessorNote[answer.classification]}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="submit" variant="primary" disabled={!text.trim() || submit.isPending}>
              {answer ? 'Update answer' : 'Save answer'}
            </Button>
            <Button variant="ghost" onClick={() => setSkipping(true)}>
              I don’t know, or someone else should answer
            </Button>
          </div>
        </form>
      )}
    </li>
  )
}

export function InterviewPage() {
  const { id = '' } = useParams()
  const { data: interview } = useInterview(id)
  const { data: items = [] } = useKnowledgeItems(id)
  const { data: evidence = [] } = useEvidence(id)
  const approve = useApproveAnswers(id)
  const [justApproved, setJustApproved] = useState<number | null>(null)

  const questions = interview?.questions ?? []
  const answers = interview?.answers ?? []
  const topics = items.filter((i) => i.status === 'confirmed' || i.status === 'edited')
  const drafts = answers.filter((a) => a.status === 'draft')
  const answeredCount = questions.filter((q) => answers.some((a) => a.questionId === q.id)).length

  return (
    <EvidenceProvider evidence={evidence}>
      <header className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Your handover interview</h1>
        <p className="mt-2 text-muted">
          These questions come from your own commits and pull requests, so Kiran isn’t left guessing. About 15
          minutes a day is enough. Nothing is shared until you approve it, and you can correct anything first.
        </p>
        <p className="mt-2 text-sm">
          <span className="tabular-nums">{answeredCount}</span> of{' '}
          <span className="tabular-nums">{questions.length}</span> questions answered
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-10">
          {topics.map((t) => {
            const qs = questions.filter((q) => q.itemId === t.id)
            if (qs.length === 0) return null
            return (
              <section key={t.id} aria-labelledby={`topic-${t.id}`}>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 id={`topic-${t.id}`} className="text-xl font-semibold">
                    {t.title}
                  </h2>
                  <RiskBars level={t.risk} />
                </div>
                <ol className="mt-3 space-y-3">
                  {qs.map((q) => (
                    <QuestionBlock
                      key={q.id}
                      q={q}
                      answer={answers.find((a) => a.questionId === q.id)}
                      transitionId={id}
                    />
                  ))}
                </ol>
              </section>
            )
          })}

          <section aria-labelledby="approve-title" className="rounded-lg border border-line bg-surface p-5">
            <h2 id="approve-title" className="text-lg font-semibold">
              Review and approve
            </h2>
            {drafts.length === 0 ? (
              <p className="mt-1 text-sm text-muted">
                {justApproved
                  ? `${justApproved} answers approved and shared with Priya and Kiran.`
                  : 'No draft answers waiting.'}
              </p>
            ) : (
              <>
                <p className="mt-1 text-sm text-muted">
                  {drafts.length} draft {drafts.length === 1 ? 'answer is' : 'answers are'} only visible to
                  you. Approving shares them with Priya and Kiran, and they can’t be edited afterwards.
                </p>
                <ul className="mt-3 space-y-2">
                  {drafts.map((a) => (
                    <li key={a.id} className="border-l-2 border-line pl-3 text-sm">
                      <span className="text-muted">{questions.find((q) => q.id === a.questionId)?.text}</span>
                      <p className="mt-0.5">{a.body}</p>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="primary"
                  className="mt-4"
                  disabled={approve.isPending}
                  onClick={() => approve.mutate(undefined, { onSuccess: (n) => setJustApproved(n) })}
                >
                  Approve {drafts.length} {drafts.length === 1 ? 'answer' : 'answers'}
                </Button>
              </>
            )}
          </section>
        </div>
        <div className="lg:sticky lg:top-6 lg:self-start">
          <EvidencePanel title="Your records" ids={[...new Set(questions.flatMap((q) => q.evidenceIds))]} />
        </div>
      </div>
    </EvidenceProvider>
  )
}
