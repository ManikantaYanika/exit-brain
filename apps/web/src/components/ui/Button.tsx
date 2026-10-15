import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const styles: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-[#2f329a] disabled:bg-brand/50',
  secondary: 'border border-line bg-surface text-ink hover:border-muted disabled:text-muted',
  ghost: 'text-brand hover:bg-brand-soft disabled:text-muted',
  danger: 'border border-line bg-surface text-conflicting hover:border-conflicting',
}

export function Button({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    />
  )
}
