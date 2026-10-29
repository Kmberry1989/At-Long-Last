import { describe, expect, it } from 'vitest'
import { SCORE_CHORDS, SCORE_LOOP_STEPS, SCORE_TICK_SECONDS, scoreFrame } from './ambientScore.js'

describe('continuous ambient score', () => {
  it('alternates single and double heartbeats every fourth measure in rhythmic game scenes', () => {
    for (const stage of ['board', 'prediction', 'timed', 'finale']) {
      const pulses = Array.from({ length: 96 }, (_, tick) => tick).filter(tick => scoreFrame(tick, stage).pulse)
      expect(pulses).toEqual([0, 32, 64])
      expect(pulses.map(tick => scoreFrame(tick, stage).pulseCount)).toEqual([1, 2, 1])
    }
    for (const stage of ['menu', 'reflective', 'reveal']) {
      expect(Array.from({ length: 96 }, (_, tick) => scoreFrame(tick, stage).pulse).some(Boolean)).toBe(false)
    }
  })
  it('keeps the same foundation through menu, play, reveal, and finale', () => {
    for (let tick = 0; tick < SCORE_LOOP_STEPS; tick += 1) {
      const menu = scoreFrame(tick, 'menu')
      for (const stage of ['board', 'prediction', 'reflective', 'timed', 'finale']) {
        const game = scoreFrame(tick, stage)
        for (const field of ['chord', 'piano', 'bell', 'barStart']) expect(game[field]).toEqual(menu[field])
      }
      expect(menu.accompaniment).toBe(-1)
      expect(menu.pulse).toBe(false)
    }
    expect(scoreFrame(0, 'board').accompaniment).toBeGreaterThanOrEqual(0)
  })
  it('wraps the score without resetting the clock or duplicating a final note', () => {
    expect(SCORE_TICK_SECONDS).toBeGreaterThan(1.5)
    expect(SCORE_LOOP_STEPS).toBe(SCORE_CHORDS.length * 16)
    for (let tick = 0; tick < SCORE_LOOP_STEPS; tick += 1) {
      expect(scoreFrame(tick + SCORE_LOOP_STEPS)).toEqual(scoreFrame(tick))
    }
    expect(scoreFrame(SCORE_LOOP_STEPS - 1).piano).toBe(-1)
    expect(scoreFrame(SCORE_LOOP_STEPS - 1).bell).toBe(-1)
    expect(scoreFrame(SCORE_LOOP_STEPS).barStart).toBe(true)
  })
  it('leaves wide phrase gaps and gives isolated notes a bending tail', () => {
    expect(scoreFrame(0).bend).toBe(true)
    expect(scoreFrame(5).bend).toBe(true)
    for (const tick of [6, 7, 14, 15]) {
      expect(scoreFrame(tick).piano).toBe(-1)
      expect(scoreFrame(tick).bell).toBe(-1)
    }
  })
})
