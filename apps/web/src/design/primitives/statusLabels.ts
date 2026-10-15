import type { VerificationStatus } from '../../data/types'

const labels: Record<VerificationStatus, string> = {
  supported: 'Supported',
  partially_supported: 'Partly supported',
  conflicting: 'Conflicting',
  unverified: 'Unverified',
}

export function verificationLabel(s: VerificationStatus): string {
  return labels[s]
}
