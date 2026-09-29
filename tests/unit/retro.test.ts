import {
    createKonamiMatcher,
    fallbackVisitorCount,
    parseGoatCounterCount,
    toCounterDigits,
} from '@/utils/retro'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

const SEQUENCE = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
]

const feed = (keys: string[]): boolean[] => {
    const match = createKonamiMatcher()
    return keys.map((k) => match(k))
}

const anyKey = fc.constantFrom(
    ...SEQUENCE,
    'B',
    'A',
    'x',
    'Enter',
    ' ',
    'Escape'
)

describe('createKonamiMatcher', () => {
    it('is true on the final key of the sequence', () => {
        const results = feed(SEQUENCE)
        expect(results[results.length - 1]).toBe(true)
        expect(results.slice(0, -1).every((r) => r === false)).toBe(true)
    })

    it('accepts uppercase B and A', () => {
        const keys = [...SEQUENCE.slice(0, 8), 'B', 'A']
        expect(feed(keys).at(-1)).toBe(true)
    })

    it('is true on the final key after any random prefix', () => {
        fc.assert(
            fc.property(fc.array(anyKey, { maxLength: 30 }), (prefix) => {
                const results = feed([...prefix, ...SEQUENCE])
                expect(results.at(-1)).toBe(true)
            })
        )
    })

    it('never matches when any one key is missing', () => {
        fc.assert(
            fc.property(fc.integer({ min: 0, max: 9 }), (i) => {
                const keys = SEQUENCE.filter((_, idx) => idx !== i)
                expect(feed(keys).some(Boolean)).toBe(false)
            })
        )
    })

    it('never matches when two different adjacent keys are swapped', () => {
        fc.assert(
            fc.property(fc.integer({ min: 0, max: 8 }), (i) => {
                fc.pre(SEQUENCE[i] !== SEQUENCE[i + 1])
                const keys = [...SEQUENCE]
                ;[keys[i], keys[i + 1]] = [keys[i + 1], keys[i]]
                expect(feed(keys).some(Boolean)).toBe(false)
            })
        )
    })

    it('recovers after a mistake (ArrowUp x3 then the rest)', () => {
        const keys = ['ArrowUp', ...SEQUENCE]
        expect(feed(keys).at(-1)).toBe(true)
    })
})

describe('toCounterDigits', () => {
    it('joined digits equal n, padded to at least minDigits', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 10_000_000 }),
                fc.integer({ min: 1, max: 12 }),
                (n, min) => {
                    const digits = toCounterDigits(n, min)
                    expect(Number(digits.join(''))).toBe(n)
                    expect(digits.length).toBeGreaterThanOrEqual(min)
                    expect(digits.length).toBe(Math.max(min, String(n).length))
                }
            )
        )
    })

    it('defaults to 6 digits', () => {
        expect(toCounterDigits(42)).toEqual([0, 0, 0, 0, 4, 2])
    })

    it('does not truncate numbers longer than minDigits', () => {
        expect(toCounterDigits(1234567)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('clamps negative and non-finite input to 0', () => {
        for (const bad of [-5, -1e9, NaN, Infinity, -Infinity]) {
            expect(toCounterDigits(bad)).toEqual([0, 0, 0, 0, 0, 0])
        }
    })
})

describe('parseGoatCounterCount', () => {
    it('parses a comma-formatted count string', () => {
        expect(parseGoatCounterCount({ count: '12,345' })).toBe(12345)
    })

    it('parses a plain count string', () => {
        expect(parseGoatCounterCount({ count: '7' })).toBe(7)
    })

    it('round-trips any formatted non-negative integer', () => {
        fc.assert(
            fc.property(fc.nat(1_000_000_000), (n) => {
                const count = n.toLocaleString('en-US')
                expect(parseGoatCounterCount({ count })).toBe(n)
            })
        )
    })

    it('returns null for malformed input', () => {
        const bad: unknown[] = [
            null,
            undefined,
            42,
            'text',
            [],
            {},
            { count: 12 },
            { count: 'abc' },
            { count: '' },
            { count: null },
            { total: '5' },
        ]
        for (const b of bad) {
            expect(parseGoatCounterCount(b)).toBeNull()
        }
    })
})

describe('fallbackVisitorCount', () => {
    it('returns an integer within [13370, 99999] for any random in [0,1)', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0, max: 1, noNaN: true, maxExcluded: true }),
                (r) => {
                    const v = fallbackVisitorCount(r)
                    expect(Number.isInteger(v)).toBe(true)
                    expect(v).toBeGreaterThanOrEqual(13370)
                    expect(v).toBeLessThanOrEqual(99999)
                }
            )
        )
    })

    it('covers the range endpoints', () => {
        expect(fallbackVisitorCount(0)).toBe(13370)
        expect(fallbackVisitorCount(0.9999999999)).toBeLessThanOrEqual(99999)
    })
})
