// Type definitions
export type Theme = 'dark' | 'light'

export const THEME_STORAGE_KEY = 'theme-preference'

// Inline script string for FOUC prevention
// MUST be used with is:inline in <head>
export const THEME_INIT_SCRIPT = `
const storedTheme = localStorage.getItem('theme-preference')
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const theme = storedTheme || (systemPrefersDark ? 'dark' : 'light')
if (theme === 'dark') {
    document.documentElement.classList.add('dark')
} else {
    document.documentElement.classList.remove('dark')
}
`

// Internal helper - applies theme class to DOM without saving to localStorage
const applyThemeClass = (theme: Theme): void => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}

// Runtime utility functions
export const initTheme = (): Theme => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
    ).matches
    const theme = storedTheme || (systemPrefersDark ? 'dark' : 'light')

    applyThemeClass(theme)

    return theme
}

export const setTheme = (theme: Theme): void => {
    applyThemeClass(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export const getTheme = (): Theme => {
    return document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light'
}

export const toggleTheme = (): Theme => {
    const currentTheme = getTheme()
    const newTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    return newTheme
}

export const observeSystemThemeChanges = (): void => {
    window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
            // Only auto-switch if user hasn't explicitly set a preference
            if (!localStorage.getItem(THEME_STORAGE_KEY)) {
                const newTheme: Theme = e.matches ? 'dark' : 'light'
                // Apply theme WITHOUT saving to localStorage
                // This allows continued system preference tracking
                applyThemeClass(newTheme)
            }
        })
}
