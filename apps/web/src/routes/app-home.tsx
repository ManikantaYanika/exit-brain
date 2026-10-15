import { RoleHome } from '../app/pages'
import { appMeta } from './meta'

export const meta = () => appMeta('Your workspace')

export default function Route() {
  return <RoleHome />
}
