import { RoleGate } from '../app/RoleGate'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Transitions')

export default function Route() {
  return (
    <RoleGate allow={['owner', 'admin', 'manager', 'viewer']}>
      <DashboardPage />
    </RoleGate>
  )
}
