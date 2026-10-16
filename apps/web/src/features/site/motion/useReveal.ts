import { useEffect } from 'react'

/**
 * Scroll reveal for website cards (`[data-reveal]` inside <main>).
 * - Only elements that start below the viewport are hidden, and only after hydration, so prerendered
 *   content and anything above the fold are never invisible (no CLS, no blank first paint).
 * - Siblings get a small stagger. Reduced motion or no IntersectionObserver: nothing is hidden.
 */
export function useReveal(key: string) {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const items = [...document.querySelectorAll<HTMLElement>('main [data-reveal]')]
    const below = items.filter((el) => el.getBoundingClientRect().top > window.innerHeight)
    if (!below.length) return

    const show = (el: HTMLElement) => {
      if (!el.classList.contains('eb-reveal-pending')) return
      const siblings = el.parentElement ? [...el.parentElement.children] : []
      const index = Math.max(0, siblings.indexOf(el))
      el.style.setProperty('--eb-reveal-delay', `${Math.min(index, 5) * 70}ms`)
      el.classList.remove('eb-reveal-pending')
      el.classList.add('eb-reveal-in')
      io.unobserve(el)
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) show(e.target as HTMLElement)
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    for (const el of below) {
      el.classList.add('eb-reveal-pending')
      io.observe(el)
    }
    // A jump (anchor link, End key) can skip past cards without them ever intersecting:
    // anything already above the bottom of the viewport is shown.
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        for (const el of below) if (el.getBoundingClientRect().top < window.innerHeight) show(el)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
      // Never leave content hidden if the page changes mid-animation.
      for (const el of below) el.classList.remove('eb-reveal-pending')
    }
  }, [key])
}
