import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react'

const KEY = 'eb-motion'

const EVENT = 'eb-motion-change'

function readPaused(): boolean {
  try {
    return localStorage.getItem(KEY) === 'paused'
  } catch {
    return false
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

function writePaused(paused: boolean) {
  try {
    if (paused) localStorage.setItem(KEY, 'paused')
    else localStorage.removeItem(KEY)
  } catch {
    // Storage unavailable: the choice can't be remembered, so motion keeps its default.
  }
  window.dispatchEvent(new Event(EVENT))
}

/**
 * Ambient motion control (WCAG 2.2 SC 2.2.2): the visitor can pause it and the choice is remembered.
 * Motion also stops while the element is off-screen or the tab is hidden, to save CPU and battery.
 * Reduced-motion users get a static frame from CSS; this hook doesn't need to know about it.
 */
export function useAmbientMotion(ref: RefObject<Element | null>) {
  // Server snapshot (prerender + hydration) is "not paused"; the stored choice applies right after.
  const storedPaused = useSyncExternalStore(subscribe, readPaused, () => false)
  const [sessionPaused, setSessionPaused] = useState<boolean | null>(null)
  const userPaused = sessionPaused ?? storedPaused
  const [visible, setVisible] = useState(true)
  const [tabHidden, setTabHidden] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? true))
    io.observe(el)
    return () => io.disconnect()
  }, [ref])

  useEffect(() => {
    const onChange = () => setTabHidden(document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  const toggle = () => {
    const next = !userPaused
    setSessionPaused(next) // works even when storage is blocked
    writePaused(next)
  }

  return { userPaused, running: !userPaused && visible && !tabHidden, toggle }
}
