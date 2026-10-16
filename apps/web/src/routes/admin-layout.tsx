import { RoleGate } from '../app/RoleGate'
import { AdminShell } from '../features/admin/AdminShell'
import { appMeta } from './meta'

export const meta = () => appMeta('Admin portal')

/** Owner/admin only. RoleGate shapes the UI; RLS is the security boundary. */
export default function Route() {
  return (
    <RoleGate allow={['owner', 'admin']}>
      <AdminShell />
    </RoleGate>
  )
}
