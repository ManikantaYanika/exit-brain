import { Monitor, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { applyThemeChoice, readThemeChoice, type ThemeChoice } from '../theme'

const options: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light theme', Icon: Sun },
  { value: 'system', label: 'Match system theme', Icon: Monitor },
  { value: 'dark', label: 'Dark theme', Icon: Moon },
]

export function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>(readThemeChoice)
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex rounded-control border border-line p-0.5"
    >
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={choice === value}
          aria-label={label}
          title={label}
          onClick={() => {
            setChoice(value)
            applyThemeChoice(value)
          }}
          className={`rounded-[4px] p-1.5 transition-colors duration-150 ${
            choice === value ? 'bg-brand-soft text-brand' : 'text-muted hover:text-ink'
          }`}
        >
          <Icon aria-hidden size={14} strokeWidth={1.75} />
        </button>
      ))}
    </div>
  )
}
