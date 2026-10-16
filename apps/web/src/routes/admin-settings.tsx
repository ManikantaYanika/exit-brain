import { SettingsPage } from '../features/admin/SettingsPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Settings')

export default function Route() {
  return <SettingsPage />
}
