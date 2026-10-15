import type {
  Answer,
  AssistantReply,
  ChecklistItem,
  Evidence,
  Handover,
  InterviewState,
  KnowledgeItem,
  Organization,
  Person,
  Transition,
  TransitionProgress,
  Verification,
} from './types'

export type ReviewDecision = 'confirm' | 'reject' | { edit: { title: string; summary: string } }

export interface SubmitAnswerResult {
  answer: Answer
  /** Present when the answer was vague or incomplete and depth allows another follow-up. */
  followUpQuestionId: string | null
}

/**
 * The single contract between the UI and the backend.
 * mockApi implements it for the prototype; a Supabase adapter (RLS-scoped client +
 * Edge Functions) implements it for real. Screens never import either directly.
 */
export interface ExitBrainApi {
  readonly mode: 'mock' | 'live'
  getOrganization(): Promise<Organization>
  listPeople(): Promise<Person[]>
  createOrganization(input: { name: string; sizeBand: string }): Promise<Organization>
  invite(input: { email: string; role: Person['role'] }): Promise<{ inviteUrl: string }>

  listTransitions(): Promise<Transition[]>
  getTransition(id: string): Promise<Transition>
  getProgress(id: string): Promise<TransitionProgress>

  listEvidence(transitionId: string): Promise<Evidence[]>
  listKnowledgeItems(transitionId: string): Promise<KnowledgeItem[]>
  reviewItem(itemId: string, decision: ReviewDecision): Promise<KnowledgeItem>

  getInterview(transitionId: string): Promise<InterviewState>
  submitAnswer(questionId: string, body: string): Promise<SubmitAnswerResult>
  skipQuestion(questionId: string, reason: string): Promise<void>
  approveAnswers(transitionId: string): Promise<number>

  listVerifications(transitionId: string): Promise<Verification[]>

  getHandover(transitionId: string): Promise<Handover>
  approveHandover(transitionId: string): Promise<Handover>

  getChecklist(transitionId: string): Promise<ChecklistItem[]>
  setChecklistDone(itemId: string, done: boolean): Promise<ChecklistItem>
  askAssistant(transitionId: string, question: string): Promise<AssistantReply>
  escalate(transitionId: string, question: string): Promise<void>
}
