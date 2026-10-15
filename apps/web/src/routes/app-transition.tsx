import { RoleGate } from '../app/RoleGate'
import { TransitionPage } from '../features/transition/TransitionPage'

export default function Route() {
  return (
    <RoleGate allow={['owner', 'admin', 'manager']}>
      <TransitionPage />
    </RoleGate>
  )
}
