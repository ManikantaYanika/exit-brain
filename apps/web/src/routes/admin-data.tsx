import { DataPage } from '../features/admin/DataPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Data & privacy')

export default function Route() {
  return <DataPage />
}
