/**
 * Domain types shared by the UI. They mirror docs/02-architecture/database-schema.md
 * so the mock adapter can later be replaced by a Supabase adapter without UI changes.
 */

export type Role = 'owner' | 'admin' | 'manager' | 'employee' | 'successor' | 'viewer'
export type TransitionStatus =
  | 'draft'
  | 'ingesting'
  | 'analysing'
  | 'interviewing'
  | 'verifying'
  | 'handover_review'
  | 'completed'
  | 'cancelled'
export type Level = 'high' | 'medium' | 'low'
export type ItemStatus = 'suggested' | 'confirmed' | 'edited' | 'rejected'
export type ItemCategory =
  'system' | 'recurring_task' | 'deployment' | 'troubleshooting' | 'dependency' | 'client' | 'other'
export type AnswerClass = 'complete' | 'vague' | 'incomplete' | 'off_topic'
export type AnswerStatus = 'draft' | 'approved' | 'skipped'
export type VerificationStatus = 'supported' | 'partially_supported' | 'conflicting' | 'unverified'
export type EvidenceSource = 'github_commit' | 'github_pr' | 'github_issue'

export interface Person {
  id: string
  name: string
  email: string
  role: Role
  title: string
}

export interface Organization {
  id: string
  name: string
  sizeBand: string
}

export interface Transition {
  id: string
  employee: { id: string; name: string; githubLogin: string; title: string }
  successor: { id: string; name: string } | null
  lastWorkingDay: string // ISO date
  status: TransitionStatus
  repos: string[]
  evidenceCount: number
}

export interface Evidence {
  id: string
  source: EvidenceSource
  ref: string // short sha or #number
  repo: string
  title: string
  excerpt: string
  paths: string[]
  occurredAt: string // ISO
  url: string
}

export interface RiskFactor {
  label: string
  value: string
}

export interface KnowledgeItem {
  id: string
  transitionId: string
  title: string
  summary: string
  category: ItemCategory
  area: string
  risk: Level
  confidence: Level
  status: ItemStatus
  evidenceIds: string[]
  riskFactors: RiskFactor[]
}

export interface Question {
  id: string
  itemId: string
  text: string
  evidenceIds: string[]
  parentId: string | null
  depth: number
}

export interface Answer {
  id: string
  questionId: string
  body: string
  classification: AnswerClass
  status: AnswerStatus
}

export interface Verification {
  answerId: string
  status: VerificationStatus
  explanation: string
  evidenceIds: string[]
}

export interface HandoverStatement {
  id: string
  text: string
  evidenceIds: string[]
  confidence: Level
  verification: VerificationStatus
}

export interface HandoverSection {
  id: string
  title: string
  statements: HandoverStatement[]
}

export interface Handover {
  transitionId: string
  version: number
  status: 'draft' | 'approved'
  approvedAt: string | null
  sections: HandoverSection[]
}

export interface ChecklistItem {
  id: string
  itemId: string
  title: string
  risk: Level
  done: boolean
  sectionId: string
}

export interface AssistantReply {
  found: boolean
  answer: string
  citations: { evidenceIds: string[]; source: string }[]
}

export interface InterviewState {
  questions: Question[]
  answers: Answer[]
}

export interface TransitionProgress {
  itemsReviewedPct: number
  questionsAnsweredPct: number
  answersApprovedPct: number
  unverified: number
  conflicting: number
  handoverStatus: 'not_started' | 'draft' | 'approved'
  readinessPct: number
}
