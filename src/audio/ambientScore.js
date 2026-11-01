import { MUSIC_PATTERNS } from './musicPatterns.js'

export const SCORE_TICK_SECONDS = 2.4
export const SCORE_LOOP_STEPS = 128
export const SCORE_CHORDS = [
  [174.61, 220, 261.63, 329.63],
  [130.81, 196, 246.94, 293.66],
  [146.83, 174.61, 220, 261.63],
  [116.54, 174.61, 220, 261.63],
  [174.61, 220, 293.66, 349.23],
  [130.81, 164.81, 246.94, 329.63],
  [146.83, 220, 261.63, 349.23],
  [130.81, 196, 261.63, 293.66],
]

// Four related phrases: a theme, an answer, a small climb, and a soft return.
// Fixed score data avoids random note clashes and survives stage transitions.
export const MELODY_PHRASES = [
  [2, -1, 1, -1, 3, -1, -1, -1, 0, -1, 1, -1, 2, -1, -1, -1],
  [2, 3, -1, 1, 2, -1, -1, -1, 1, -1, 0, 2, 3, -1, -1, -1],
  [1, -1, 2, 3, -1, 2, -1, -1, 3, 2, -1, 1, 0, -1, -1, -1],
  [0, -1, 2, -1, 1, 3, -1, -1, 2, -1, 1, 0, 2, -1, -1, -1],
]

export function scoreFrame(tick, stage = 'menu') {
  const clock = ((tick % SCORE_LOOP_STEPS) + SCORE_LOOP_STEPS) % SCORE_LOOP_STEPS
  const step = clock % 16
  const rest = step % 8 >= 6
  const phrase = MELODY_PHRASES[Math.floor(clock / 16) % MELODY_PHRASES.length]
  const voice = MUSIC_PATTERNS[stage] || MUSIC_PATTERNS.menu
  const reflective = ['reflective', 'reveal', 'finale'].includes(stage)
  const timpani = stage === 'menu' ? clock % 16 === 0 : stage === 'board' && clock % 64 === 16
  return {
    chord: SCORE_CHORDS[Math.floor(clock / 16)],
    piano: rest ? -1 : phrase[step],
    bell: rest ? -1 : step % 8 === 5 ? 0 : MUSIC_PATTERNS.menu.bell[step % 8],
    bend: step % 8 === 5 || phrase[(step + 1) % 16] < 0,
    accompaniment: stage === 'menu' || rest ? -1 : voice.piano[step],
    pulse: stage !== 'menu' && voice.pulse > 0 && clock % 32 === 0,
    pulseCount: stage !== 'menu' && voice.pulse > 0 && clock % 32 === 0 ? (clock % 64 === 0 ? 1 : 2) : 0,
    barStart: clock % 8 === 0,
    padLevel: reflective ? stage === 'finale' ? 1.3 : 1.15 : stage === 'menu' ? .8 : .5,
    pizzicato: rest ? -1 : reflective ? step === 5 ? 2 : -1 : step % 8 === 3 ? (Math.floor(clock / 16) % 3) : -1,
    musicBox: reflective || stage === 'menu' ? step === 9 ? (Math.floor(clock / 16) + 2) % 4 : -1 : -1,
    timpani,
    timpaniCount: timpani ? (clock % 64 === 48 ? 2 : 1) : 0,
  }
}
