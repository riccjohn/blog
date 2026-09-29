const KONAMI_SEQUENCE = [
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

export const createKonamiMatcher = (): ((key: string) => boolean) => {
    let recent: string[] = []
    return (key) => {
        recent = [...recent, key.length === 1 ? key.toLowerCase() : key].slice(
            -KONAMI_SEQUENCE.length
        )
        return (
            recent.length === KONAMI_SEQUENCE.length &&
            recent.every((k, i) => k === KONAMI_SEQUENCE[i])
        )
    }
}

export const toCounterDigits = (n: number, minDigits = 6): number[] => {
    const safe = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
    return String(safe).padStart(minDigits, '0').split('').map(Number)
}

export const parseGoatCounterCount = (json: unknown): number | null => {
    if (typeof json !== 'object' || json === null || !('count' in json)) {
        return null
    }
    const { count } = json
    if (typeof count !== 'string') return null
    const digits = count.replace(/,/g, '')
    return /^\d+$/.test(digits) ? Number(digits) : null
}

const FALLBACK_MIN = 13370
const FALLBACK_MAX = 99999

export const fallbackVisitorCount = (random: number): number =>
    FALLBACK_MIN + Math.floor(random * (FALLBACK_MAX - FALLBACK_MIN + 1))
