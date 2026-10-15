import { RoleGate } from '../app/RoleGate'
import { SuccessorPage } from '../features/successor/SuccessorPage'

export default function Route() {
  return (
    <RoleGate allow={['successor']}>
      <SuccessorPage />
    </RoleGate>
  )
}
