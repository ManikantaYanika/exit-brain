import { FlaskConical } from 'lucide-react'
import type { ReactNode } from 'react'

/** Inline marker for records that look real but are demo data (ux-plan §6). */
export function DemoLabel({ children = 'Demo data' }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-demo-soft px-2 py-0.5 text-xs font-medium text-demo">
      <FlaskConical aria-hidden size={12} />
      {children}
    </span>
  )
}

/** Shown on any step that is simulated in demo mode (GitHub, ingestion, AI). */
export function SimulatedStepNotice({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-control border border-demo/30 bg-demo-soft px-3 py-2 text-sm text-demo">
      <FlaskConical aria-hidden size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  )
}
