import { AppLayout } from '../app/AppLayout'
import { RequireAuth } from '../app/RequireAuth'
import { appMeta } from './meta'

export const meta = () => appMeta('Your workspace')

export default function Route() {
  return (
    <RequireAuth>
      <AppLayout />
    </RequireAuth>
  )
}
