// Type definitions
export type Theme = 'dark' | 'light' | 'retro'

export const THEME_STORAGE_KEY = 'theme-preference'

// Shareable links: ?theme=retro (or light/dark) picks the theme on arrival
export const THEME_QUERY_PARAM = 'theme'

const THEME_ORDER: readonly Theme[] = ['light', 'dark', 'retro']

export const parseStoredTheme = (value: string | null): Theme | null =>
    THEME_ORDER.find((t) => t === value) ?? null

export const resolveTheme = (
    stored: string | null,
    systemPrefersDark: boolean,
    requested: string | null = null
): Theme =>
    parseStoredTheme(requested) ??
    parseStoredTheme(stored) ??
    (systemPrefersDark ? 'dark' : 'light')

export const nextTheme = (theme: Theme): Theme =>
    THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length] ??
    'light'

// Inline script string for FOUC prevention
// MUST be used with is:inline in <head>
// Mirrors resolveTheme + applyThemeClass (parity is covered by tests).
// A valid ?theme= is saved like a toggle click, then removed from the address
// bar so a later toggle isn't undone by a reload.
export const THEME_INIT_SCRIPT = `
const isTheme = (t) => t === 'light' || t === 'dark' || t === 'retro'
const params = new URLSearchParams(location.search)
const requestedTheme = params.get('theme')
if (isTheme(requestedTheme)) {
    localStorage.setItem('theme-preference', requestedTheme)
    params.delete('theme')
    const query = params.toString()
    history.replaceState(history.state, '', location.pathname + (query ? '?' + query : '') + location.hash)
}
const storedTheme = localStorage.getItem('theme-preference')
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const theme = isTheme(storedTheme)
    ? storedTheme
    : (systemPrefersDark ? 'dark' : 'light')
document.documentElement.classList.remove('dark', 'retro')
if (theme !== 'light') {
    document.documentElement.classList.add(theme)
}
`

// Applies theme class to DOM without saving to localStorage
export const applyThemeClass = (theme: Theme): void => {
    document.documentElement.classList.remove('dark', 'retro')
    if (theme !== 'light') {
        document.documentElement.classList.add(theme)
    }
}

// Runtime utility functions
export const initTheme = (): Theme => {
    const theme = resolveTheme(
        localStorage.getItem(THEME_STORAGE_KEY),
        window.matchMedia('(prefers-color-scheme: dark)').matches
    )

    applyThemeClass(theme)

    return theme
}

export const setTheme = (theme: Theme): void => {
    applyThemeClass(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export const getTheme = (): Theme => {
    const { classList } = document.documentElement
    if (classList.contains('retro')) return 'retro'
    return classList.contains('dark') ? 'dark' : 'light'
}

export const toggleTheme = (): Theme => {
    const newTheme = nextTheme(getTheme())
    setTheme(newTheme)
    return newTheme
}

export const observeSystemThemeChanges = (): void => {
    window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
            // Only auto-switch if user hasn't explicitly set a preference
            if (!localStorage.getItem(THEME_STORAGE_KEY)) {
                // Apply theme WITHOUT saving to localStorage
                // This allows continued system preference tracking
                applyThemeClass(e.matches ? 'dark' : 'light')
            }
        })
}
