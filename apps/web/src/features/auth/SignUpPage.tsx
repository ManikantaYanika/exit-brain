import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../app/auth'
import { AuthError } from '../../data/auth'
import { Button } from '../../design/primitives/Button'
import { TextInput } from '../../design/primitives/Field'
import { AuthCard, AuthLayout } from './AuthLayout'
import { fieldErrors, signUpSchema } from './schemas'

export function SignUpPage() {
  const { gateway } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = signUpSchema.safeParse(form)
    if (!parsed.success) return setErrors(fieldErrors(parsed.error))
    setErrors({})
    setBusy(true)
    try {
      await gateway.signUp(parsed.data)
      navigate('/check-email', { state: { email: parsed.data.email } })
    } catch (err) {
      setErrors({ form: err instanceof AuthError ? err.message : 'Something went wrong. Try again.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Start a pilot"
      subtitle="Create your account, then set up your workspace and invite your team."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <AuthCard>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <TextInput
            label="Full name"
            autoComplete="name"
            value={form.name}
            onChange={set('name')}
            error={errors.name}
          />
          <TextInput
            label="Work email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
          />
          <TextInput
            label="Password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            hint="At least 8 characters, with letters and numbers."
          />
          {errors.form && (
            <p role="alert" className="text-sm font-medium text-conflicting">
              {errors.form}
            </p>
          )}
          <Button type="submit" variant="primary" size="lg" loading={busy}>
            Create account
          </Button>
          <p className="text-xs text-muted">
            We’ll email you a confirmation link. Exit Brain only reads the GitHub repositories you choose, and
            never evaluates people.
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
