import { RoleGate } from '../app/RoleGate'
import { TeamPage } from '../features/team/TeamPage'

export default function Route() {
  return (
    <RoleGate allow={['owner', 'admin', 'manager']}>
      <TeamPage />
    </RoleGate>
  )
}
