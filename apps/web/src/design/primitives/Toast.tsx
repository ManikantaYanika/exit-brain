import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

type Tone = 'success' | 'error'
interface ToastItem {
  id: number
  tone: Tone
  message: string
}

const ToastContext = createContext<((message: string, tone?: Tone) => void) | null>(null)

/** Announces results politely to screen readers; auto-dismisses after 5s. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const next = useRef(1)
  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), [])
  const show = useCallback(
    (message: string, tone: Tone = 'success') => {
      const id = next.current++
      setItems((xs) => [...xs.slice(-2), { id, tone, message }])
      setTimeout(() => dismiss(id), 5000)
    },
    [dismiss],
  )
  const value = useMemo(() => show, [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-0 bottom-0 z-50 flex w-full max-w-sm flex-col gap-2 p-4"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))' }}
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className="eb-enter pointer-events-auto flex items-start gap-3 rounded-panel border border-line bg-surface p-3 text-sm shadow-float"
          >
            {t.tone === 'success' ? (
              <CheckCircle2 aria-hidden size={18} className="mt-0.5 shrink-0 text-supported" />
            ) : (
              <AlertTriangle aria-hidden size={18} className="mt-0.5 shrink-0 text-conflicting" />
            )}
            <p className="flex-1">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="text-muted hover:text-ink"
            >
              <X aria-hidden size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
