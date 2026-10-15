import { RoleGate } from '../app/RoleGate'
import { SuccessorPage } from '../features/successor/SuccessorPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Onboarding')

export default function Route() {
  return (
    <RoleGate allow={['successor']}>
      <SuccessorPage />
    </RoleGate>
  )
}
