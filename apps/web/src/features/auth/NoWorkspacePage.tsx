import { useState, type FormEvent } from 'react'
import { useAuth } from '../../app/auth'
import { AuthError, type SizeBand } from '../../data/auth'
import { Button } from '../../design/primitives/Button'
import { SelectInput, TextInput } from '../../design/primitives/Field'
import { AuthCard, AuthLayout } from './AuthLayout'

const SIZES: SizeBand[] = ['1-20', '21-50', '51-150', '151+']

/** Signed in, but not a member of any workspace yet: create one, or wait for an invite. */
export function NoWorkspacePage() {
  const { gateway, session, refresh } = useAuth()
  const [name, setName] = useState('')
  const [size, setSize] = useState<SizeBand>('21-50')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2) return setError('Enter your company name (at least 2 characters).')
    if (!gateway.createWorkspace) return
    setError(undefined)
    setBusy(true)
    try {
      await gateway.createWorkspace({ name, sizeBand: size })
      await refresh()
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title={`Welcome${session?.name ? `, ${session.name.split(' ')[0]}` : ''}`}
      subtitle="Create a workspace for your company. If a colleague already did, open the invite link they sent you instead."
      footer={
        <button
          type="button"
          onClick={() => void gateway.signOut()}
          className="font-medium text-brand hover:underline"
        >
          Sign out
        </button>
      }
    >
      <AuthCard>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <TextInput
            label="Company name"
            autoComplete="organization"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
          />
          <SelectInput
            label="Company size"
            value={size}
            onChange={(e) => setSize(e.target.value as SizeBand)}
          >
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s} people
              </option>
            ))}
          </SelectInput>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={busy}
            disabled={!gateway.createWorkspace}
          >
            Create workspace
          </Button>
          <p className="text-xs text-muted">You become the workspace owner. You can invite your team next.</p>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
