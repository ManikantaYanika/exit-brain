import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Modal dialog on the native <dialog> element: focus trap, Escape to close and inert
 * background come from the browser. Used for approval gates and destructive confirms.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) {
      // jsdom lacks showModal; fall back to the open attribute so tests and old browsers work.
      if (typeof el.showModal === 'function') el.showModal()
      else el.setAttribute('open', '')
    } else if (!open && el.open) {
      if (typeof el.close === 'function') el.close()
      else el.removeAttribute('open')
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="eb-dialog-title"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      className="eb-enter m-auto w-[min(92vw,520px)] rounded-panel border border-line bg-surface p-0 text-ink shadow-float backdrop:bg-[var(--eb-overlay)]"
    >
      {open && (
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="eb-dialog-title" className="text-lg font-semibold">
                {title}
              </h2>
              {description && <div className="mt-1 text-sm text-muted">{description}</div>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-control p-1 text-muted hover:text-ink"
            >
              <X aria-hidden size={18} />
            </button>
          </div>
          {children}
          {footer && (
            <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">{footer}</div>
          )}
        </div>
      )}
    </dialog>
  )
}
