import { CheckEmailPage } from '../features/auth/CheckEmailPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Check your email')

export default function Route() {
  return <CheckEmailPage />
}
