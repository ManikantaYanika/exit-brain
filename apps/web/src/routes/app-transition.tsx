import { RoleGate } from '../app/RoleGate'
import { TransitionPage } from '../features/transition/TransitionPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Transition')

export default function Route() {
  return (
    <RoleGate allow={['owner', 'admin', 'manager']}>
      <TransitionPage />
    </RoleGate>
  )
}
