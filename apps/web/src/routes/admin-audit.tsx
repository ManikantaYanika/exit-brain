import { AuditPage } from '../features/admin/AuditPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Audit log')

export default function Route() {
  return <AuditPage />
}
