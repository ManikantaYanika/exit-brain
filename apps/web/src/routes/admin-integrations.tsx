import { IntegrationsPage } from '../features/admin/IntegrationsPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Integrations')

export default function Route() {
  return <IntegrationsPage />
}
