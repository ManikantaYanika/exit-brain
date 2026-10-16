import { SystemPage } from '../features/admin/SystemPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Jobs & health')

export default function Route() {
  return <SystemPage />
}
