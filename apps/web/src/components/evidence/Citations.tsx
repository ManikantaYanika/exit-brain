import type { VerificationStatus } from '../../data/types'
import { useEvidenceContext } from './EvidenceContext'

const ring: Record<VerificationStatus, string> = {
  supported: 'border-supported text-supported',
  partially_supported: 'border-partial text-partial',
  conflicting: 'border-conflicting text-conflicting',
  unverified: 'border-unverified text-unverified',
}

/**
 * Inline citation pills — the signature element. Each claim carries its sources;
 * clicking opens them in the evidence panel. A claim with no evidence says so plainly.
 */
export function Citations({ ids, status = 'supported' }: { ids: string[]; status?: VerificationStatus }) {
  const { numberOf, focus, byId } = useEvidenceContext()
  if (ids.length === 0) {
    return <span className="ml-1 align-middle text-xs text-muted italic">no record</span>
  }
  return (
    <span className="ml-1 inline-flex gap-0.5 align-middle">
      {ids.map((id) => {
        const e = byId.get(id)
        return (
          <button
            key={id}
            type="button"
            onClick={() => focus(ids)}
            className={`min-w-5 rounded-full border px-1 text-[11px] leading-4 font-semibold tabular-nums hover:bg-surface ${ring[status]}`}
            aria-label={`Evidence ${numberOf(id)}${e ? `: ${e.title}` : ''}`}
            title={e?.title}
          >
            {numberOf(id)}
          </button>
        )
      })}
    </span>
  )
}
