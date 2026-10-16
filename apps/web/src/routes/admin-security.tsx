import { SecurityPage } from '../features/admin/SecurityPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Security')

export default function Route() {
  return <SecurityPage />
}
