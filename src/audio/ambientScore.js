import { MUSIC_PATTERNS } from './musicPatterns.js'

export const SCORE_TICK_SECONDS = 2.4
export const SCORE_LOOP_STEPS = 64
export const SCORE_CHORDS = [
  [174.61, 220, 261.63, 329.63],
  [130.81, 196, 246.94, 293.66],
  [146.83, 174.61, 220, 261.63],
  [116.54, 174.61, 220, 261.63],
]

export function scoreFrame(tick, stage = 'menu') {
  const step = tick % 16
  const rest = step % 8 >= 6
  const base = MUSIC_PATTERNS.menu
  const voice = MUSIC_PATTERNS[stage] || base
  return {
    chord: SCORE_CHORDS[Math.floor(tick / 8) % SCORE_CHORDS.length],
    piano: rest ? -1 : base.piano[step],
    bell: rest ? -1 : step % 8 === 5 ? 0 : base.bell[step % base.bell.length],
    bend: step % 8 === 5 || base.piano[(step + 1) % 16] < 0,
    accompaniment: stage === 'menu' || rest ? -1 : voice.piano[step],
    // Alternate a single thump and a double heartbeat every fourth measure.
    pulse: stage !== 'menu' && voice.pulse > 0 && tick % 32 === 0,
    pulseCount: stage !== 'menu' && voice.pulse > 0 && tick % 32 === 0 ? (tick % 64 === 0 ? 1 : 2) : 0,
    barStart: tick % 8 === 0,
  }
}
