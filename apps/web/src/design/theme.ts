export type ThemeChoice = 'system' | 'light' | 'dark'

const KEY = 'eb-theme'

/** Read the saved choice. Storage can throw or be empty (private mode, sandboxed frames). */
export function readThemeChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

/** Apply a choice: 'system' removes data-theme so prefers-color-scheme decides (tokens.css). */
export function applyThemeChoice(choice: ThemeChoice, root: HTMLElement = document.documentElement): void {
  if (choice === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', choice)
  try {
    if (choice === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, choice)
  } catch {
    // Choice still applies for this page view.
  }
}
