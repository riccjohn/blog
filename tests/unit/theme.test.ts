import {
    THEME_INIT_SCRIPT,
    THEME_STORAGE_KEY,
    applyThemeClass,
    nextTheme,
    observeSystemThemeChanges,
    parseStoredTheme,
    resolveTheme,
    type Theme,
} from '@/utils/theme'
import fc from 'fast-check'
import { afterEach, describe, expect, it, vi } from 'vitest'

const THEMES: Theme[] = ['light', 'dark', 'retro']

const expectedClasses = (theme: Theme): string[] =>
    theme === 'light' ? [] : [theme]

const makeClassList = (initial: string[]) => {
    const set = new Set(initial)
    return {
        add: (...c: string[]) => c.forEach((x) => set.add(x)),
        remove: (...c: string[]) => c.forEach((x) => set.delete(x)),
        contains: (c: string) => set.has(c),
        toggle: (c: string, force?: boolean) => {
            const on = force ?? !set.has(c)
            if (on) set.add(c)
            else set.delete(c)
            return on
        },
        snapshot: () => [...set].sort(),
    }
}

const makeStorage = (initial: string | null) => {
    const map = new Map<string, string>()
    if (initial !== null) map.set(THEME_STORAGE_KEY, initial)
    return {
        getItem: (k: string) => map.get(k) ?? null,
        setItem: (k: string, v: string) => void map.set(k, v),
    }
}

type Listener = (e: { matches: boolean }) => void

const stubBrowser = (opts: {
    classes: string[]
    stored: string | null
    prefersDark: boolean
}) => {
    const classList = makeClassList(opts.classes)
    const storage = makeStorage(opts.stored)
    const listeners: Listener[] = []
    const matchMedia = () => ({
        matches: opts.prefersDark,
        addEventListener: (_: string, l: Listener) => void listeners.push(l),
    })
    const document = { documentElement: { classList } }
    const window = { matchMedia, localStorage: storage, document }
    vi.stubGlobal('document', document)
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('window', window)
    return { classList, storage, matchMedia, document, listeners }
}

afterEach(() => {
    vi.unstubAllGlobals()
})

const classArb = fc.array(
    fc.constantFrom('dark', 'retro', 'foo', 'bar', 'light', 'x-y')
)
const themeArb = fc.constantFrom(...THEMES)
const storedArb = fc.oneof(
    fc.constant<string | null>(null),
    fc.constantFrom<string | null>(...THEMES),
    fc.string()
)

describe('parseStoredTheme', () => {
    it('accepts the three exact theme strings', () => {
        expect(THEMES.map((t) => parseStoredTheme(t))).toEqual(THEMES)
    })

    it('returns null for any other string or null', () => {
        fc.assert(
            fc.property(
                fc.string().filter((s) => !THEMES.some((t) => t === s)),
                (s) => parseStoredTheme(s) === null
            )
        )
        expect(parseStoredTheme(null)).toBeNull()
        expect(parseStoredTheme('Retro')).toBeNull()
        expect(parseStoredTheme(' dark')).toBeNull()
    })
})

describe('resolveTheme', () => {
    it('always returns one of the three themes', () => {
        fc.assert(
            fc.property(storedArb, fc.boolean(), (stored, dark) =>
                THEMES.includes(resolveTheme(stored, dark))
            )
        )
    })

    it('returns retro iff stored is retro', () => {
        fc.assert(
            fc.property(storedArb, fc.boolean(), (stored, dark) => {
                expect(resolveTheme(stored, dark) === 'retro').toBe(
                    stored === 'retro'
                )
            })
        )
    })

    it('honors stored light/dark regardless of system preference', () => {
        fc.assert(
            fc.property(
                fc.constantFrom('light', 'dark'),
                fc.boolean(),
                (stored, dark) => resolveTheme(stored, dark) === stored
            )
        )
    })

    it('falls back to system preference when stored is invalid or null', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    fc.constant<string | null>(null),
                    fc.string().filter((s) => !THEMES.some((t) => t === s))
                ),
                fc.boolean(),
                (stored, dark) =>
                    resolveTheme(stored, dark) === (dark ? 'dark' : 'light')
            )
        )
    })
})

describe('nextTheme', () => {
    it('cycles light -> dark -> retro -> light', () => {
        expect(nextTheme('light')).toBe('dark')
        expect(nextTheme('dark')).toBe('retro')
        expect(nextTheme('retro')).toBe('light')
    })

    it('returns the input after three applications', () => {
        fc.assert(
            fc.property(
                themeArb,
                (t) => nextTheme(nextTheme(nextTheme(t))) === t
            )
        )
    })
})

describe('applyThemeClass', () => {
    it('leaves exactly the class for the theme, whatever was there before', () => {
        fc.assert(
            fc.property(classArb, themeArb, (classes, theme) => {
                const { classList } = stubBrowser({
                    classes,
                    stored: null,
                    prefersDark: false,
                })
                applyThemeClass(theme)
                const result = classList
                    .snapshot()
                    .filter((c) => c === 'dark' || c === 'retro')
                expect(result).toEqual(expectedClasses(theme))
                // unrelated classes are preserved
                for (const c of classes.filter(
                    (c) => c !== 'dark' && c !== 'retro'
                )) {
                    expect(classList.contains(c)).toBe(true)
                }
            })
        )
    })
})

describe('THEME_INIT_SCRIPT parity with resolveTheme + applyThemeClass', () => {
    it('leaves the same classes for arbitrary stored value and system preference', () => {
        fc.assert(
            fc.property(
                storedArb,
                fc.boolean(),
                classArb,
                (stored, prefersDark, classes) => {
                    const a = stubBrowser({ classes, stored, prefersDark })
                    new Function(THEME_INIT_SCRIPT)()
                    const fromScript = a.classList.snapshot()

                    const b = stubBrowser({ classes, stored, prefersDark })
                    applyThemeClass(resolveTheme(stored, prefersDark))
                    expect(fromScript).toEqual(b.classList.snapshot())
                }
            )
        )
    })

    it('adds retro for stored retro', () => {
        const a = stubBrowser({
            classes: ['dark'],
            stored: 'retro',
            prefersDark: true,
        })
        new Function(THEME_INIT_SCRIPT)()
        expect(a.classList.snapshot()).toEqual(['retro'])
    })
})

describe('observeSystemThemeChanges', () => {
    it('never switches away from a stored theme', () => {
        fc.assert(
            fc.property(themeArb, fc.boolean(), (stored, matches) => {
                const env = stubBrowser({
                    classes: expectedClasses(stored),
                    stored,
                    prefersDark: false,
                })
                observeSystemThemeChanges()
                expect(env.listeners.length).toBeGreaterThan(0)
                env.listeners.forEach((l) => l({ matches }))
                expect(env.classList.snapshot()).toEqual(
                    expectedClasses(stored)
                )
            })
        )
    })

    it('follows the system when nothing is stored', () => {
        const env = stubBrowser({
            classes: [],
            stored: null,
            prefersDark: false,
        })
        observeSystemThemeChanges()
        env.listeners.forEach((l) => l({ matches: true }))
        expect(env.classList.snapshot()).toEqual(['dark'])
    })
})
