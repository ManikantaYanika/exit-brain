import { SignUpPage } from '../features/auth/SignUpPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Start a pilot')

export default function Route() {
  return <SignUpPage />
}
