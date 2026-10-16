import { PeoplePage } from '../features/admin/PeoplePage'
import { appMeta } from './meta'

export const meta = () => appMeta('People & roles')

export default function Route() {
  return <PeoplePage />
}
