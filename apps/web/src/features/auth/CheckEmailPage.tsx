import { MailCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { useAuth } from '../../app/auth'
import { SimulatedStepNotice } from '../../design/primitives/Demo'
import { AuthCard, AuthLayout } from './AuthLayout'

export function CheckEmailPage() {
  const { gateway } = useAuth()
  const email = (useLocation().state as { email?: string } | null)?.email

  return (
    <AuthLayout title="Check your email">
      <AuthCard>
        <div className="flex flex-col items-start gap-4">
          <span className="rounded-full bg-brand-soft p-3 text-brand">
            <MailCheck aria-hidden size={22} />
          </span>
          <p>
            We sent a confirmation link to <strong>{email ?? 'your inbox'}</strong>. Open it on this device to
            finish creating your account. The link expires in 24 hours.
          </p>
          <p className="text-sm text-muted">
            Nothing arrived? Check spam, or wait a minute and sign up again.
          </p>
          {gateway.mode === 'demo' && (
            <SimulatedStepNotice>
              Demo mode: no account was created and no email was sent. Try the product with a demo account
              instead.
            </SimulatedStepNotice>
          )}
          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <Link to="/signin" className="text-brand hover:underline">
              Back to sign in
            </Link>
            {gateway.mode === 'demo' && (
              <Link to="/demo" className="text-brand hover:underline">
                Open the demo
              </Link>
            )}
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
