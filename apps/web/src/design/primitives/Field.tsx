import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'

const control =
  'w-full rounded-control border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-muted transition-colors duration-150 hover:border-ink focus:border-brand focus:outline-none focus-visible:outline-2 focus-visible:outline-brand aria-[invalid=true]:border-conflicting disabled:cursor-not-allowed disabled:opacity-60'

interface FieldProps {
  label: string
  hint?: ReactNode
  error?: string
  /** Renders the label visually hidden (still read by screen readers). */
  hideLabel?: boolean
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode
}

/** Label + control + hint + error, wired with ids so assistive tech reads them together. */
export function Field({ label, hint, error, hideLabel, children }: FieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'text-sm font-medium text-ink'}>
        {label}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-conflicting">
          {error}
        </p>
      )}
    </div>
  )
}

type WithField = { label: string; hint?: ReactNode; error?: string; hideLabel?: boolean }

export function TextInput({
  label,
  hint,
  error,
  hideLabel,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & WithField) {
  return (
    <Field label={label} hint={hint} error={error} hideLabel={hideLabel}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={`h-9 ${control} ${className}`}
          {...props}
        />
      )}
    </Field>
  )
}

export function TextArea({
  label,
  hint,
  error,
  hideLabel,
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & WithField) {
  return (
    <Field label={label} hint={hint} error={error} hideLabel={hideLabel}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={`py-2 leading-6 ${control} ${className}`}
          {...props}
        />
      )}
    </Field>
  )
}

export function SelectInput({
  label,
  hint,
  error,
  hideLabel,
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & WithField) {
  return (
    <Field label={label} hint={hint} error={error} hideLabel={hideLabel}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={`h-9 ${control} ${className}`}
          {...props}
        >
          {children}
        </select>
      )}
    </Field>
  )
}
