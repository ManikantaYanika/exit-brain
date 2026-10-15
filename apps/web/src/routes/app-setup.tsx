import { RoleGate } from '../app/RoleGate'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Workspace setup')

export default function Route() {
  return (
    <RoleGate allow={['owner', 'admin']}>
      <OnboardingPage />
    </RoleGate>
  )
}
