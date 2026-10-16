import { beforeEach, describe, expect, it } from 'vitest'
import { classifyAnswer, createMockApi } from './mockApi'

describe('classifyAnswer (stand-in for the answer assessor)', () => {
  it('flags very short answers as off topic', () => {
    expect(classifyAnswer('no idea')).toBe('off_topic')
  })
  it('flags hedging as vague', () => {
    expect(
      classifyAnswer('It depends, usually it is fine and nothing much happens there honestly at all.'),
    ).toBe('vague')
  })
  it('accepts specific answers as complete', () => {
    expect(
      classifyAnswer(
        'If it fails the portal shows stale balances; it posts to #billing-alerts and you rerun npm run sync:nightly the next morning.',
      ),
    ).toBe('complete')
  })
})

describe('mock ExitBrainApi', () => {
  const api = createMockApi(0)
  beforeEach(() => api.reset())

  it('a vague answer creates exactly one follow-up, depth-limited', async () => {
    const r1 = await api.submitAnswer('q-2', 'It depends, usually fine.')
    expect(r1.followUpQuestionId).not.toBeNull()
    const r2 = await api.submitAnswer('q-2', 'Still not sure honestly.')
    expect(r2.followUpQuestionId).toBeNull() // no duplicate follow-up for the same question
    const { questions } = await api.getInterview('t-ravi')
    const fu = questions.find((q) => q.id === r1.followUpQuestionId)
    expect(fu?.depth).toBe(1)
    expect(fu?.evidenceIds).toEqual(['ev-1'])
  })

  it('approved answers cannot be edited', async () => {
    await expect(api.submitAnswer('q-1', 'changed')).rejects.toThrow(/cannot be edited/)
  })

  it('approving answers only affects drafts', async () => {
    await api.submitAnswer(
      'q-4',
      'Only billing uses /webhooks/stripe; the 30s timeout is set in api-gateway/routes/webhooks.yaml.',
    )
    expect(await api.approveAnswers('t-ravi')).toBe(1)
    expect(await api.approveAnswers('t-ravi')).toBe(0)
  })

  it('assistant answers from approved knowledge with citations', async () => {
    const r = await api.askAssistant('t-ravi', 'What happens if the nightly sync fails?')
    expect(r.found).toBe(true)
    expect(r.citations[0]?.evidenceIds.length).toBeGreaterThan(0)
  })

  it('assistant refuses when nothing approved matches', async () => {
    const r = await api.askAssistant('t-ravi', 'How do I renew the SSL certificate?')
    expect(r).toEqual({ found: false, answer: 'I can’t find this in approved knowledge.', citations: [] })
  })

  it('assistant ignores draft answers', async () => {
    await api.submitAnswer(
      'q-4',
      'The kafka replay consumer reads billing topics from the analytics cluster daily.',
    )
    const r = await api.askAssistant('t-ravi', 'kafka replay consumer analytics cluster')
    expect(r.found).toBe(false)
  })

  it('escalation adds a question to the interview', async () => {
    await api.escalate('t-ravi', 'How do I renew the SSL certificate?')
    const { questions } = await api.getInterview('t-ravi')
    expect(questions.some((q) => q.text.includes('SSL certificate'))).toBe(true)
  })

  it('reviewing an item updates progress', async () => {
    const before = await api.getProgress('t-ravi')
    await api.reviewItem('k-gst', 'confirm')
    const after = await api.getProgress('t-ravi')
    expect(after.itemsReviewedPct).toBeGreaterThan(before.itemsReviewedPct)
  })

  it('approving the handover completes the transition', async () => {
    const h = await api.approveHandover('t-ravi')
    expect(h.status).toBe('approved')
    expect((await api.getTransition('t-ravi')).status).toBe('completed')
  })
})

describe('createTransition', () => {
  const later = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10)
  const base = {
    employeeName: 'Lena Fischer',
    title: '',
    githubLogin: 'lena-f',
    successorId: null,
    lastWorkingDay: later,
    repos: ['acme/infra'],
  }

  it('validates the input before starting', async () => {
    const api = createMockApi(0)
    await expect(api.createTransition({ ...base, employeeName: ' ' })).rejects.toThrow('name')
    await expect(api.createTransition({ ...base, githubLogin: 'bad login!' })).rejects.toThrow(
      'GitHub username',
    )
    await expect(api.createTransition({ ...base, lastWorkingDay: '2020-01-01' })).rejects.toThrow('past')
    await expect(api.createTransition({ ...base, repos: [] })).rejects.toThrow('repository')
    await expect(api.createTransition({ ...base, employeeName: 'Ravi Kumar' })).rejects.toThrow(
      'already has an open transition',
    )
  })

  it('starts a read-only ingestion transition', async () => {
    const api = createMockApi(0)
    const t = await api.createTransition({ ...base, successorId: 'u-kiran' })
    expect(t).toMatchObject({
      status: 'ingesting',
      evidenceCount: 0,
      successor: { name: 'Kiran Rao' },
      repos: ['acme/infra'],
    })
    expect((await api.listTransitions()).map((x) => x.id)).toContain(t.id)
  })
})
