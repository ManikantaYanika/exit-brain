import { BillingPage } from '../features/admin/BillingPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Usage & billing')

export default function Route() {
  return <BillingPage />
}
