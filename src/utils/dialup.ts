// [frequency Hz, start s, duration s]: a short modem-style handshake, under 3s total
const TONES: ReadonlyArray<readonly [number, number, number]> = [
    [350, 0, 0.5],
    [440, 0, 0.5],
    [2100, 0.6, 0.4],
    [1200, 1.1, 0.3],
    [2400, 1.5, 0.3],
    [980, 1.9, 0.2],
    [1800, 2.1, 0.4],
]

export const playDialup = (): void => {
    if (typeof AudioContext === 'undefined') return
    try {
        const ctx = new AudioContext()
        const gain = ctx.createGain()
        gain.gain.value = 0.05
        gain.connect(ctx.destination)
        const now = ctx.currentTime
        TONES.forEach(([freq, start, duration]) => {
            const osc = ctx.createOscillator()
            osc.type = 'square'
            osc.frequency.value = freq
            osc.connect(gain)
            osc.start(now + start)
            osc.stop(now + start + duration)
        })
    } catch {
        // sound is decorative; ignore failures
    }
}
