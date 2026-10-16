/**
 * In-memory implementation of ExitBrainApi for the clickable prototype. MOCK DATA ONLY.
 * The "AI" here is a few transparent heuristics so the flows can be clicked through;
 * it is not the real assessor, verifier or assistant.
 */
import type { ExitBrainApi, ReviewDecision, SubmitAnswerResult } from './api'
import * as fx from './fixtures'
import type {
  Answer,
  AnswerClass,
  AssistantReply,
  ChecklistItem,
  Handover,
  KnowledgeItem,
  Question,
  Transition,
} from './types'

const clone = <T>(v: T): T => structuredClone(v)

interface State {
  org: typeof fx.org
  people: typeof fx.people
  transitions: Transition[]
  items: KnowledgeItem[]
  questions: Question[]
  answers: Answer[]
  checklist: ChecklistItem[]
  handover: Handover
  escalations: string[]
}

function freshState(): State {
  return {
    org: clone(fx.org),
    people: clone(fx.people),
    transitions: clone(fx.transitions),
    items: clone(fx.knowledgeItems),
    questions: clone(fx.questions),
    answers: clone(fx.answers),
    checklist: clone(fx.checklist),
    handover: clone(fx.handover),
    escalations: [],
  }
}

const HEDGES = /\b(it depends|usually|not sure|somehow|stuff|things|probably|i think|kind of|etc)\b/i
const SPECIFICS = /(`|\d|#|\/|npm |run |cron|slack|alert|log|table|script|channel|ticket)/i

/** Transparent stand-in for the answer assessor (assess_answer@v1 in the real build). */
export function classifyAnswer(body: string): AnswerClass {
  const words = body.trim().split(/\s+/).filter(Boolean)
  if (words.length < 4) return 'off_topic'
  if (words.length < 15 || HEDGES.test(body)) return 'vague'
  if (!SPECIFICS.test(body)) return 'incomplete'
  return 'complete'
}

const FOLLOW_UPS: Record<Exclude<AnswerClass, 'complete'>, string> = {
  vague:
    'Could you make that concrete for Kiran: the exact command, schedule or channel, and what “done” looks like?',
  incomplete: 'What would someone need to check or run, and where (file, dashboard, channel)?',
  off_topic:
    'That seems to answer a different question. In one or two sentences, what should a successor do here?',
}

const STOP = new Set([
  'the',
  'a',
  'an',
  'is',
  'to',
  'of',
  'and',
  'or',
  'how',
  'what',
  'did',
  'do',
  'does',
  'if',
  'in',
  'on',
  'for',
  'ravi',
  'handle',
  'we',
  'i',
  'it',
])
const tokens = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t))

export function createMockApi(latencyMs = 250): ExitBrainApi & { reset(): void } {
  let s = freshState()
  const wait = <T>(v: T): Promise<T> => new Promise((r) => setTimeout(() => r(clone(v)), latencyMs))
  const fail = (msg: string) => Promise.reject(new Error(msg))

  const findTransition = (id: string) => s.transitions.find((t) => t.id === id)

  return {
    mode: 'mock',
    reset() {
      s = freshState()
    },

    getOrganization: () => wait(s.org),
    listPeople: () => wait(s.people),
    createOrganization: ({ name, sizeBand }) => {
      s.org = { ...s.org, name, sizeBand }
      return wait(s.org)
    },
    invite: ({ email }) =>
      wait({ inviteUrl: `https://app.exitbrain.dev/invite/accept#token=mock-${btoa(email).slice(0, 12)}` }),

    listTransitions: () => wait(s.transitions),
    createTransition: (input) => {
      const name = input.employeeName.trim()
      if (!name) return fail('Enter the name of the person leaving.')
      if (!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(input.githubLogin.trim()))
        return fail('Enter their GitHub username, for example ravi-k.')
      if (!/^\d{4}-\d{2}-\d{2}$/.test(input.lastWorkingDay)) return fail('Choose their last working day.')
      if (input.lastWorkingDay < new Date().toISOString().slice(0, 10))
        return fail('The last working day can’t be in the past.')
      if (!input.repos.length) return fail('Choose at least one repository to read.')
      if (
        s.transitions.some(
          (t) => t.employee.name.toLowerCase() === name.toLowerCase() && t.status !== 'completed',
        )
      )
        return fail(`${name} already has an open transition.`)
      const successor = input.successorId ? s.people.find((p) => p.id === input.successorId) : null
      const slug = name
        .toLowerCase()
        .replace(/[^a-z]+/g, '-')
        .replace(/^-|-$/g, '')
      const t: Transition = {
        id: `t-${slug}-${s.transitions.length + 1}`,
        employee: {
          id: `e-${slug}`,
          name,
          githubLogin: input.githubLogin.trim(),
          title: input.title.trim() || 'Engineer',
        },
        successor: successor ? { id: successor.id, name: successor.name } : null,
        lastWorkingDay: input.lastWorkingDay,
        status: 'ingesting',
        repos: [...input.repos],
        evidenceCount: 0,
      }
      s.transitions.push(t)
      return wait(t)
    },
    getTransition: (id) => {
      const t = findTransition(id)
      return t ? wait(t) : fail('Transition not found')
    },
    getProgress: (id) => {
      const items = s.items.filter((i) => i.transitionId === id)
      if (items.length === 0) {
        return wait({
          itemsReviewedPct: 0,
          questionsAnsweredPct: 0,
          answersApprovedPct: 0,
          unverified: 0,
          conflicting: 0,
          handoverStatus: 'not_started' as const,
          readinessPct: 0,
        })
      }
      const reviewed = items.filter((i) => i.status !== 'suggested').length
      const qs = s.questions.filter((q) => items.some((i) => i.id === q.itemId))
      const answered = qs.filter((q) => s.answers.some((a) => a.questionId === q.id)).length
      const approved = s.answers.filter(
        (a) => a.status === 'approved' && qs.some((q) => q.id === a.questionId),
      ).length
      const statements = s.handover.sections.flatMap((x) => x.statements)
      const weights = { high: 3, medium: 2, low: 1 }
      const total = s.checklist.reduce((n, c) => n + weights[c.risk], 0)
      const done = s.checklist.filter((c) => c.done).reduce((n, c) => n + weights[c.risk], 0)
      return wait({
        itemsReviewedPct: Math.round((reviewed / items.length) * 100),
        questionsAnsweredPct: qs.length ? Math.round((answered / qs.length) * 100) : 0,
        answersApprovedPct: answered ? Math.round((approved / answered) * 100) : 0,
        unverified: statements.filter((x) => x.verification === 'unverified').length,
        conflicting: statements.filter((x) => x.verification === 'conflicting').length,
        handoverStatus: s.handover.status,
        readinessPct: total ? Math.round((done / total) * 100) : 0,
      })
    },

    listEvidence: () => wait(fx.evidence),
    listKnowledgeItems: (tid) => wait(s.items.filter((i) => i.transitionId === tid)),
    reviewItem: (itemId, decision: ReviewDecision) => {
      const item = s.items.find((i) => i.id === itemId)
      if (!item) return fail('Knowledge area not found')
      if (decision === 'confirm') item.status = 'confirmed'
      else if (decision === 'reject') item.status = 'rejected'
      else {
        item.title = decision.edit.title.trim() || item.title
        item.summary = decision.edit.summary.trim() || item.summary
        item.status = 'edited'
      }
      return wait(item)
    },

    getInterview: (tid) => {
      const itemIds = new Set(s.items.filter((i) => i.transitionId === tid).map((i) => i.id))
      const qs = s.questions.filter((q) => itemIds.has(q.itemId))
      return wait({ questions: qs, answers: s.answers.filter((a) => qs.some((q) => q.id === a.questionId)) })
    },
    submitAnswer: (questionId, body) => {
      const q = s.questions.find((x) => x.id === questionId)
      if (!q) return fail('Question not found')
      const existing = s.answers.find((a) => a.questionId === questionId)
      if (existing?.status === 'approved') return fail('Approved answers cannot be edited')
      const classification = classifyAnswer(body)
      const answer: Answer = existing
        ? Object.assign(existing, { body, classification })
        : { id: `a-${crypto.randomUUID().slice(0, 8)}`, questionId, body, classification, status: 'draft' }
      if (!existing) s.answers.push(answer)

      let followUpQuestionId: string | null = null
      const alreadyHasFollowUp = s.questions.some((x) => x.parentId === q.id)
      if (classification !== 'complete' && q.depth < 2 && !alreadyHasFollowUp) {
        const fu: Question = {
          id: `q-${crypto.randomUUID().slice(0, 8)}`,
          itemId: q.itemId,
          text: FOLLOW_UPS[classification],
          evidenceIds: q.evidenceIds,
          parentId: q.id,
          depth: q.depth + 1,
        }
        s.questions.splice(s.questions.indexOf(q) + 1, 0, fu)
        followUpQuestionId = fu.id
      }
      const result: SubmitAnswerResult = { answer, followUpQuestionId }
      return wait(result)
    },
    skipQuestion: (questionId, reason) => {
      const existing = s.answers.find((a) => a.questionId === questionId)
      const body = `Skipped: ${reason}`
      if (existing) Object.assign(existing, { body, status: 'skipped' })
      else
        s.answers.push({
          id: `a-${crypto.randomUUID().slice(0, 8)}`,
          questionId,
          body,
          classification: 'off_topic',
          status: 'skipped',
        })
      return wait(undefined)
    },
    approveAnswers: (tid) => {
      const itemIds = new Set(s.items.filter((i) => i.transitionId === tid).map((i) => i.id))
      let n = 0
      for (const a of s.answers) {
        const q = s.questions.find((x) => x.id === a.questionId)
        if (q && itemIds.has(q.itemId) && a.status === 'draft') {
          a.status = 'approved'
          n++
        }
      }
      return wait(n)
    },

    listVerifications: () => wait(fx.verifications),

    getHandover: () => wait(s.handover),
    approveHandover: (tid) => {
      if (tid !== s.handover.transitionId) return fail('Handover not found')
      s.handover.status = 'approved'
      s.handover.approvedAt = new Date().toISOString()
      const t = findTransition(tid)
      if (t) t.status = 'completed'
      return wait(s.handover)
    },

    getChecklist: () => wait(s.checklist),
    setChecklistDone: (itemId, done) => {
      const c = s.checklist.find((x) => x.id === itemId)
      if (!c) return fail('Checklist item not found')
      c.done = done
      return wait(c)
    },
    askAssistant: (_tid, question): Promise<AssistantReply> => {
      // Retrieval over APPROVED answers only (FR-21). Weak match => "not found".
      const qt = new Set(tokens(question))
      let best: { score: number; answer: Answer } | null = null
      for (const a of s.answers.filter((x) => x.status === 'approved')) {
        const q = s.questions.find((x) => x.id === a.questionId)
        const hay = new Set(tokens(`${a.body} ${q?.text ?? ''}`))
        const score = [...qt].filter((t) => hay.has(t)).length
        if (!best || score > best.score) best = { score, answer: a }
      }
      if (!best || best.score < 2) {
        return wait({ found: false, answer: 'I can’t find this in approved knowledge.', citations: [] })
      }
      const v = fx.verifications.find((x) => x.answerId === best.answer.id)
      const q = s.questions.find((x) => x.id === best.answer.questionId)
      return wait({
        found: true,
        answer: best.answer.body,
        citations: [
          { evidenceIds: v?.evidenceIds ?? q?.evidenceIds ?? [], source: 'Approved interview answer' },
        ],
      })
    },
    escalate: (tid, question) => {
      const item = s.items.find((i) => i.transitionId === tid && i.status !== 'rejected')
      if (!item) return fail('No knowledge area to attach this question to')
      s.escalations.push(question)
      s.questions.push({
        id: `q-${crypto.randomUUID().slice(0, 8)}`,
        itemId: item.id,
        text: `Kiran asked: “${question.trim()}”`,
        evidenceIds: [],
        parentId: null,
        depth: 0,
      })
      return wait(undefined)
    },
  }
}
