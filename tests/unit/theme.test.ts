import {
    THEME_INIT_SCRIPT,
    THEME_QUERY_PARAM,
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
    search?: string
    hash?: string
}) => {
    const classList = makeClassList(opts.classes)
    const storage = makeStorage(opts.stored)
    const location = {
        pathname: '/blog/post/',
        search: opts.search ?? '',
        hash: opts.hash ?? '',
    }
    const replaced: string[] = []
    const history = {
        replaceState: (_: unknown, __: string, url: string) =>
            void replaced.push(url),
    }
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
    vi.stubGlobal('location', location)
    vi.stubGlobal('history', history)
    return { classList, storage, matchMedia, document, listeners, replaced }
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

describe('resolveTheme with a requested theme', () => {
    it('a valid requested theme wins over stored value and system preference', () => {
        fc.assert(
            fc.property(
                themeArb,
                storedArb,
                fc.boolean(),
                (requested, stored, dark) =>
                    resolveTheme(stored, dark, requested) === requested
            )
        )
    })

    it('an invalid or missing requested theme changes nothing', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    fc.constant<string | null>(null),
                    fc.string().filter((s) => !THEMES.some((t) => t === s))
                ),
                storedArb,
                fc.boolean(),
                (requested, stored, dark) =>
                    resolveTheme(stored, dark, requested) ===
                    resolveTheme(stored, dark)
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

const requestedArb = fc.oneof(
    fc.constant<string | null>(null),
    fc.constantFrom<string | null>(...THEMES),
    fc.string()
)

const searchFor = (requested: string | null): string =>
    requested === null
        ? ''
        : `?${new URLSearchParams({ [THEME_QUERY_PARAM]: requested })}`

describe('THEME_INIT_SCRIPT parity with resolveTheme + applyThemeClass', () => {
    it('leaves the same classes for arbitrary stored value, system preference and ?theme=', () => {
        fc.assert(
            fc.property(
                storedArb,
                fc.boolean(),
                classArb,
                requestedArb,
                (stored, prefersDark, classes, requested) => {
                    const search = searchFor(requested)
                    const a = stubBrowser({
                        classes,
                        stored,
                        prefersDark,
                        search,
                    })
                    new Function(THEME_INIT_SCRIPT)()
                    const fromScript = a.classList.snapshot()

                    const b = stubBrowser({
                        classes,
                        stored,
                        prefersDark,
                        search,
                    })
                    applyThemeClass(
                        resolveTheme(stored, prefersDark, requested)
                    )
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

describe('THEME_INIT_SCRIPT with ?theme=', () => {
    it('saves a valid requested theme like a toggle click would', () => {
        fc.assert(
            fc.property(themeArb, storedArb, (requested, stored) => {
                const env = stubBrowser({
                    classes: [],
                    stored,
                    prefersDark: false,
                    search: searchFor(requested),
                })
                new Function(THEME_INIT_SCRIPT)()
                expect(env.storage.getItem(THEME_STORAGE_KEY)).toBe(requested)
            })
        )
    })

    it('removes only the theme param from the address bar, keeping other params and the hash', () => {
        const env = stubBrowser({
            classes: [],
            stored: null,
            prefersDark: false,
            search: '?utm_source=bsky&theme=retro&page=2',
            hash: '#comments',
        })
        new Function(THEME_INIT_SCRIPT)()
        expect(env.replaced).toEqual([
            '/blog/post/?utm_source=bsky&page=2#comments',
        ])
    })

    it('leaves a bare path when theme was the only param', () => {
        const env = stubBrowser({
            classes: [],
            stored: null,
            prefersDark: false,
            search: '?theme=retro',
        })
        new Function(THEME_INIT_SCRIPT)()
        expect(env.replaced).toEqual(['/blog/post/'])
    })

    it('ignores an invalid value: nothing saved, URL untouched', () => {
        fc.assert(
            fc.property(
                fc.string().filter((s) => !THEMES.some((t) => t === s)),
                storedArb,
                (requested, stored) => {
                    const env = stubBrowser({
                        classes: [],
                        stored,
                        prefersDark: false,
                        search: searchFor(requested),
                    })
                    new Function(THEME_INIT_SCRIPT)()
                    expect(env.storage.getItem(THEME_STORAGE_KEY)).toBe(stored)
                    expect(env.replaced).toEqual([])
                }
            )
        )
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
