import { RoleGate } from '../app/RoleGate'
import { TeamPage } from '../features/team/TeamPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Team')

export default function Route() {
  return (
    <RoleGate allow={['owner', 'admin', 'manager']}>
      <TeamPage />
    </RoleGate>
  )
}
