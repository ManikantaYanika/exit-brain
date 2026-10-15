import { FlaskConical } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../../app/auth'
import { AuthError, type Session } from '../../data/auth'
import { destinationFor } from './redirect'
import { DEMO_PASSWORD } from '../../data/demo/demoAuth'
import { Button } from '../../design/primitives/Button'
import { TextInput } from '../../design/primitives/Field'
import { AuthCard, AuthLayout } from './AuthLayout'
import { emailSchema, fieldErrors, signInSchema } from './schemas'

export function SignInPage() {
  const { gateway, refresh, session, status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const from = (location.state as { from?: unknown } | null)?.from

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<'password' | 'magic' | null>(null)
  const [magicSent, setMagicSent] = useState(false)
  const isDemo = gateway.mode === 'demo'

  if (status === 'signedIn' && session && busy === null)
    return <Navigate to={destinationFor(session, from)} replace />

  async function finish(session: Session) {
    await refresh()
    navigate(destinationFor(session, from), { replace: true })
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = signInSchema.safeParse({ email, password })
    if (!parsed.success) return setErrors(fieldErrors(parsed.error))
    setErrors({})
    setBusy('password')
    try {
      await finish(await gateway.signIn(parsed.data.email, parsed.data.password))
    } catch (err) {
      setErrors({ form: err instanceof AuthError ? err.message : 'Something went wrong. Try again.' })
    } finally {
      setBusy(null)
    }
  }

  async function onMagicLink() {
    const parsed = emailSchema.safeParse(email)
    if (!parsed.success)
      return setErrors({ email: parsed.error.issues[0]?.message ?? 'Enter a valid email.' })
    setErrors({})
    setBusy('magic')
    try {
      await gateway.sendMagicLink(parsed.data)
      setMagicSent(true)
    } catch (err) {
      setErrors({ form: err instanceof AuthError ? err.message : 'Something went wrong. Try again.' })
    } finally {
      setBusy(null)
    }
  }

  return (
    <AuthLayout
      title="Sign in to Exit Brain"
      subtitle="Use the email your workspace invited."
      footer={
        <>
          New to Exit Brain?{' '}
          <Link to="/signup" className="font-medium text-brand hover:underline">
            Start a pilot
          </Link>
        </>
      }
    >
      {params.get('confirmed') === '1' && (
        <p
          role="status"
          className="mb-4 rounded-control border border-supported/40 bg-supported-soft px-3 py-2 text-sm"
        >
          Email confirmed. Sign in to continue.
        </p>
      )}
      <AuthCard>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <TextInput
            label="Work email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <TextInput
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          {errors.form && (
            <p role="alert" className="text-sm font-medium text-conflicting">
              {errors.form}
            </p>
          )}
          {magicSent && (
            <p role="status" className="text-sm text-supported">
              {isDemo
                ? 'Demo mode: no email is sent. Use a demo account below.'
                : 'Check your inbox for a sign-in link. It expires in one hour.'}
            </p>
          )}
          <Button type="submit" variant="primary" size="lg" loading={busy === 'password'}>
            Sign in
          </Button>
          <Button variant="ghost" onClick={onMagicLink} loading={busy === 'magic'}>
            Email me a sign-in link instead
          </Button>
        </form>
      </AuthCard>

      {isDemo && gateway.demoAccounts && (
        <section
          aria-labelledby="demo-heading"
          className="mt-6 rounded-panel border border-demo/30 bg-demo-soft p-5"
        >
          <h2 id="demo-heading" className="flex items-center gap-2 text-sm font-semibold text-demo">
            <FlaskConical aria-hidden size={15} /> MOCK DATA: demo workspace
          </h2>
          <p className="mt-1 text-sm text-ink">
            Explore as a fictional person at Acme SaaS. Nothing you do here is saved or sent.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {gateway.demoAccounts.map((a) => (
              <Button
                key={a.id}
                size="sm"
                onClick={async () => finish(await gateway.signInAsDemo!(a.id))}
                aria-label={`Continue as ${a.name}, ${a.roleLabel}`}
              >
                {a.name.split(' ')[0]} · {a.roleLabel}
              </Button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">
            Or type a demo email (for example priya@acme.dev) with the password{' '}
            <code className="font-mono text-ink">{DEMO_PASSWORD}</code>.{' '}
            <Link to="/demo" className="font-medium text-brand hover:underline">
              Compare the portals
            </Link>
          </p>
        </section>
      )}
    </AuthLayout>
  )
}
