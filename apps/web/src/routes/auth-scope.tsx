import { Outlet } from 'react-router'
import { AuthProvider } from '../app/auth'
import { auth } from '../app/runtime'

/**
 * Wraps only the sign-in pages and the product (/signin … /app/*). Website pages render outside it,
 * so they never ask for a session and, in live mode, never download the Supabase client.
 */
export default function Route() {
  return (
    <AuthProvider gateway={auth}>
      <Outlet />
    </AuthProvider>
  )
}
