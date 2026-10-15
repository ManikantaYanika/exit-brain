import { AppLayout } from '../app/AppLayout'
import { RequireAuth } from '../app/RequireAuth'

export default function Route() {
  return (
    <RequireAuth>
      <AppLayout />
    </RequireAuth>
  )
}
