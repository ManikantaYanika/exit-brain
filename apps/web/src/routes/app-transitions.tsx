import { RoleGate } from '../app/RoleGate'
import { DashboardPage } from '../features/dashboard/DashboardPage'

export default function Route() {
  return (
    <RoleGate allow={['owner', 'admin', 'manager', 'viewer']}>
      <DashboardPage />
    </RoleGate>
  )
}
