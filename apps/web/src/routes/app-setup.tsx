import { RoleGate } from '../app/RoleGate'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'

export default function Route() {
  return (
    <RoleGate allow={['owner', 'admin']}>
      <OnboardingPage />
    </RoleGate>
  )
}
