import { useParams } from 'react-router'
import { Citations } from '../../components/evidence/Citations'
import { VerificationBadge } from '../../design/primitives/status'
import { useInterview, useVerifications } from '../../data/hooks'

export function AnswersTab() {
  const { id = '' } = useParams()
  const { data: interview } = useInterview(id)
  const { data: verifications = [] } = useVerifications(id)
  const questions = interview?.questions ?? []
  const answers = interview?.answers ?? []
  const approved = answers.filter((a) => a.status === 'approved')
  const waiting = questions.filter((q) => !answers.some((a) => a.questionId === q.id && a.status !== 'draft'))

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold">{approved.length} approved answers</h2>
        <p className="mt-1 max-w-prose text-sm text-muted">
          You only see answers Ravi has reviewed and approved. Each one is checked against the work records:
          “unverified” means no record covers it, not that it is wrong.
        </p>
        <ul className="mt-4 space-y-4">
          {approved.map((a) => {
            const q = questions.find((x) => x.id === a.questionId)
            const v = verifications.find((x) => x.answerId === a.id)
            return (
              <li key={a.id} className="rounded-lg border border-line bg-surface p-5">
                <p className="text-sm text-muted">{q?.text}</p>
                <blockquote className="mt-2 border-l-2 border-line pl-3 text-sm leading-6 whitespace-pre-wrap">
                  {a.body}
                </blockquote>
                <div className="mt-3 flex flex-wrap items-start gap-3">
                  <VerificationBadge status={v?.status ?? 'unverified'} />
                  <p className="min-w-0 flex-1 text-sm text-muted">
                    {v?.explanation ?? 'Not checked yet.'}
                    {v && <Citations ids={v.evidenceIds} status={v.status} />}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
      <section>
        <h2 className="text-base font-semibold text-muted">Waiting for Ravi ({waiting.length})</h2>
        <ul className="mt-3 space-y-2">
          {waiting.map((q) => (
            <li key={q.id} className="text-sm">
              {q.text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
