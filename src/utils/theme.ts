// Theme ids: the saved value, the ?theme= value and the class on <html>
export const THEMES = {
    light: 'light',
    dark: 'dark',
    earlyWeb: 'early-web',
} as const

export type Theme = (typeof THEMES)[keyof typeof THEMES]

export const THEME_STORAGE_KEY = 'theme-preference'

// Shareable links: ?theme=early-web (or light/dark) picks the theme on arrival
export const THEME_QUERY_PARAM = 'theme'

const THEME_ORDER: readonly Theme[] = [
    THEMES.light,
    THEMES.dark,
    THEMES.earlyWeb,
]

const THEME_LABELS: Readonly<Record<Theme, string>> = {
    [THEMES.light]: 'light',
    [THEMES.dark]: 'dark',
    [THEMES.earlyWeb]: 'early web',
}

// Light is the default look, so it has no class on <html>
const THEME_CLASSES = THEME_ORDER.filter((t) => t !== THEMES.light)

// Every accepted value, including 'retro' saved before the early-web rename.
// A Map so prototype keys like 'toString' never match.
const THEME_BY_VALUE: ReadonlyMap<string, Theme> = new Map<string, Theme>([
    ...THEME_ORDER.map((t): [string, Theme] => [t, t]),
    ['retro', THEMES.earlyWeb],
])

export const parseStoredTheme = (value: string | null): Theme | null =>
    (value !== null && THEME_BY_VALUE.get(value)) || null

export const resolveTheme = (
    stored: string | null,
    systemPrefersDark: boolean,
    requested: string | null = null
): Theme =>
    parseStoredTheme(requested) ??
    parseStoredTheme(stored) ??
    (systemPrefersDark ? THEMES.dark : THEMES.light)

export const nextTheme = (theme: Theme): Theme =>
    THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length] ??
    THEMES.light

export const themeToggleLabel = (current: Theme): string =>
    `Switch to ${THEME_LABELS[nextTheme(current)]} theme`

// Inline script string for FOUC prevention
// MUST be used with is:inline in <head>
// Mirrors resolveTheme + applyThemeClass (parity is covered by tests).
// A valid ?theme= is saved like a toggle click, then removed from the address
// bar so a later toggle isn't undone by a reload.
export const THEME_INIT_SCRIPT = `
const themeByValue = new Map(${JSON.stringify([...THEME_BY_VALUE])})
const toTheme = (value) => (value === null ? null : themeByValue.get(value) ?? null)
const params = new URLSearchParams(location.search)
const requestedTheme = toTheme(params.get(${JSON.stringify(THEME_QUERY_PARAM)}))
if (requestedTheme) {
    localStorage.setItem(${JSON.stringify(THEME_STORAGE_KEY)}, requestedTheme)
    params.delete(${JSON.stringify(THEME_QUERY_PARAM)})
    const query = params.toString()
    history.replaceState(history.state, '', location.pathname + (query ? '?' + query : '') + location.hash)
}
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const theme = toTheme(localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}))
    ?? (systemPrefersDark ? ${JSON.stringify(THEMES.dark)} : ${JSON.stringify(THEMES.light)})
document.documentElement.classList.remove(...${JSON.stringify(THEME_CLASSES)})
if (theme !== ${JSON.stringify(THEMES.light)}) {
    document.documentElement.classList.add(theme)
}
`

// Applies theme class to DOM without saving to localStorage
export const applyThemeClass = (theme: Theme): void => {
    document.documentElement.classList.remove(...THEME_CLASSES)
    if (theme !== THEMES.light) {
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
    return THEME_CLASSES.find((t) => classList.contains(t)) ?? THEMES.light
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
                applyThemeClass(e.matches ? THEMES.dark : THEMES.light)
            }
        })
}
