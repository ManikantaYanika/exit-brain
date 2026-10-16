import { ArrowRight, ChevronDown, LogIn, PlayCircle, Rocket, type LucideIcon } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { SiteLink } from './SiteLink'

const ITEMS: { label: string; hint: string; href: string; Icon: LucideIcon; primary?: boolean }[] = [
  {
    label: 'Start a pilot',
    hint: 'Create a workspace for your team',
    href: '/signup',
    Icon: Rocket,
    primary: true,
  },
  { label: 'Sign in', hint: 'Already have a workspace', href: '/signin', Icon: LogIn },
  { label: 'Explore the demo', hint: 'Fictional company, no account', href: '/demo', Icon: PlayCircle },
]

/**
 * Header "Get started" disclosure: one button that reveals sign-in, pilot and demo links.
 * Disclosure (not an ARIA menu): plain links, Tab moves through them, Escape or an outside click closes,
 * focus returns to the button on Escape. Closes on navigation.
 */
export function GetStartedMenu() {
  const id = useId()
  const { pathname } = useLocation()
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpenOn(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenOn(null)
        button.current?.focus()
      }
    }
    const onFocus = (e: FocusEvent) => {
      if (e.target instanceof Node && !root.current?.contains(e.target)) setOpenOn(null)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    document.addEventListener('focusin', onFocus)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('focusin', onFocus)
    }
  }, [open])

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpenOn(open ? null : pathname)}
        className="inline-flex h-10 items-center gap-1.5 rounded-control bg-brand px-4 text-[0.94rem] font-medium text-on-brand transition-colors duration-150 hover:bg-brand-hover"
      >
        Get started
        <ChevronDown
          aria-hidden
          size={16}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          id={`${id}-panel`}
          className="eb-pop absolute top-[calc(100%+0.5rem)] right-0 z-50 w-72 rounded-[14px] border border-line bg-surface p-2 shadow-float"
        >
          <ul className="flex flex-col">
            {ITEMS.map(({ label, hint, href, Icon, primary }) => (
              <li key={href}>
                <SiteLink
                  href={href}
                  onClick={() => setOpenOn(null)}
                  className="group flex items-center gap-3 rounded-[10px] px-3 py-2.5 hover:bg-band focus-visible:bg-band"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${
                      primary ? 'bg-brand text-on-brand' : 'bg-brand-soft text-brand'
                    }`}
                  >
                    <Icon aria-hidden size={18} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[0.94rem] font-medium text-ink">{label}</span>
                    <span className="block text-xs text-muted">{hint}</span>
                  </span>
                  <ArrowRight
                    aria-hidden
                    size={16}
                    className="text-muted opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </SiteLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
