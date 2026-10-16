import { OverviewPage } from '../features/admin/OverviewPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Admin overview')

export default function Route() {
  return <OverviewPage />
}
