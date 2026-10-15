import { SignInPage } from '../features/auth/SignInPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Sign in')

export default function Route() {
  return <SignInPage />
}
