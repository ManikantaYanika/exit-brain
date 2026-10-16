import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { NewTransitionInput, ReviewDecision } from './api'
import { useApi } from './ApiProvider'

export const keys = {
  org: ['org'] as const,
  people: ['people'] as const,
  transitions: ['transitions'] as const,
  transition: (id: string) => ['transition', id] as const,
  progress: (id: string) => ['progress', id] as const,
  evidence: (id: string) => ['evidence', id] as const,
  items: (id: string) => ['items', id] as const,
  interview: (id: string) => ['interview', id] as const,
  verifications: (id: string) => ['verifications', id] as const,
  handover: (id: string) => ['handover', id] as const,
  checklist: (id: string) => ['checklist', id] as const,
}

export function useOrganization() {
  const api = useApi()
  return useQuery({ queryKey: keys.org, queryFn: () => api.getOrganization() })
}
export function usePeople() {
  const api = useApi()
  return useQuery({ queryKey: keys.people, queryFn: () => api.listPeople() })
}
export function useTransitions() {
  const api = useApi()
  return useQuery({ queryKey: keys.transitions, queryFn: () => api.listTransitions() })
}
export function useTransition(id: string) {
  const api = useApi()
  return useQuery({ queryKey: keys.transition(id), queryFn: () => api.getTransition(id) })
}
export function useProgress(id: string) {
  const api = useApi()
  return useQuery({ queryKey: keys.progress(id), queryFn: () => api.getProgress(id) })
}
export function useEvidence(id: string) {
  const api = useApi()
  return useQuery({ queryKey: keys.evidence(id), queryFn: () => api.listEvidence(id) })
}
export function useKnowledgeItems(id: string) {
  const api = useApi()
  return useQuery({ queryKey: keys.items(id), queryFn: () => api.listKnowledgeItems(id) })
}
export function useInterview(id: string) {
  const api = useApi()
  return useQuery({ queryKey: keys.interview(id), queryFn: () => api.getInterview(id) })
}
export function useVerifications(id: string) {
  const api = useApi()
  return useQuery({ queryKey: keys.verifications(id), queryFn: () => api.listVerifications(id) })
}
export function useHandover(id: string) {
  const api = useApi()
  return useQuery({ queryKey: keys.handover(id), queryFn: () => api.getHandover(id) })
}
export function useChecklist(id: string) {
  const api = useApi()
  return useQuery({ queryKey: keys.checklist(id), queryFn: () => api.getChecklist(id) })
}

/** Invalidate everything derived from one transition after a write. */
function useInvalidateTransition() {
  const qc = useQueryClient()
  return (id: string) =>
    Promise.all([
      qc.invalidateQueries({ queryKey: keys.items(id) }),
      qc.invalidateQueries({ queryKey: keys.interview(id) }),
      qc.invalidateQueries({ queryKey: keys.progress(id) }),
      qc.invalidateQueries({ queryKey: keys.handover(id) }),
      qc.invalidateQueries({ queryKey: keys.checklist(id) }),
      qc.invalidateQueries({ queryKey: keys.transition(id) }),
      qc.invalidateQueries({ queryKey: keys.transitions }),
    ])
}

export function useReviewItem(transitionId: string) {
  const api = useApi()
  const invalidate = useInvalidateTransition()
  return useMutation({
    mutationFn: (v: { itemId: string; decision: ReviewDecision }) => api.reviewItem(v.itemId, v.decision),
    onSuccess: () => invalidate(transitionId),
  })
}
export function useSubmitAnswer(transitionId: string) {
  const api = useApi()
  const invalidate = useInvalidateTransition()
  return useMutation({
    mutationFn: (v: { questionId: string; body: string }) => api.submitAnswer(v.questionId, v.body),
    onSuccess: () => invalidate(transitionId),
  })
}
export function useSkipQuestion(transitionId: string) {
  const api = useApi()
  const invalidate = useInvalidateTransition()
  return useMutation({
    mutationFn: (v: { questionId: string; reason: string }) => api.skipQuestion(v.questionId, v.reason),
    onSuccess: () => invalidate(transitionId),
  })
}
export function useApproveAnswers(transitionId: string) {
  const api = useApi()
  const invalidate = useInvalidateTransition()
  return useMutation({
    mutationFn: () => api.approveAnswers(transitionId),
    onSuccess: () => invalidate(transitionId),
  })
}
export function useApproveHandover(transitionId: string) {
  const api = useApi()
  const invalidate = useInvalidateTransition()
  return useMutation({
    mutationFn: () => api.approveHandover(transitionId),
    onSuccess: () => invalidate(transitionId),
  })
}
export function useSetChecklistDone(transitionId: string) {
  const api = useApi()
  const invalidate = useInvalidateTransition()
  return useMutation({
    mutationFn: (v: { itemId: string; done: boolean }) => api.setChecklistDone(v.itemId, v.done),
    onSuccess: () => invalidate(transitionId),
  })
}
export function useAskAssistant(transitionId: string) {
  const api = useApi()
  return useMutation({ mutationFn: (question: string) => api.askAssistant(transitionId, question) })
}
export function useEscalate(transitionId: string) {
  const api = useApi()
  const invalidate = useInvalidateTransition()
  return useMutation({
    mutationFn: (question: string) => api.escalate(transitionId, question),
    onSuccess: () => invalidate(transitionId),
  })
}

export function useCreateTransition() {
  const api = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NewTransitionInput) => api.createTransition(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.transitions }),
  })
}
