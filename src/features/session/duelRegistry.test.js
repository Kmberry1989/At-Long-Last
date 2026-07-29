import { describe, expect, it } from 'vitest'
import { duelIds, duelRegistry, resolveTieByTime } from './duelRegistry.jsx'

describe('duelRegistry', () => {
  it('contains the full 15-item duel pack with unique ids', () => {
    expect(duelIds).toHaveLength(15)
    expect(new Set(duelIds).size).toBe(15)
  })

  it('keeps all spicy duels skippable', () => {
    const spicyDuels = Object.values(duelRegistry).filter((entry) => entry.vibe === 'spicy')
    expect(spicyDuels).toHaveLength(5)
    expect(spicyDuels.every((entry) => entry.skippable)).toBe(true)
  })

  it('retries when both players are too close', () => {
    const outcome = resolveTieByTime(
      { won: true, time: 1 },
      { won: true, time: 1.05 },
    )

    expect(outcome).toEqual({ retry: true })
  })

  it('picks the faster winner when both clear the duel', () => {
    const outcome = resolveTieByTime(
      { won: true, time: 0.92 },
      { won: true, time: 1.14 },
    )

    expect(outcome.winnerIndex).toBe(0)
  })

  it('retries when both players miss', () => {
    const outcome = resolveTieByTime(
      { won: false, time: 99 },
      { won: false, time: 99 },
    )

    expect(outcome).toEqual({ retry: true })
  })

  it('treats creative and closeness challenges as shared completions', () => {
    const sharedIds = [
      'constellation-home',
      'doodle-duel-memory',
      'emoji-court',
      'fever-dream-date',
      'gratitude-duel',
      'letterpress-one-word',
      'portrait-panic-directed',
      'slow-draw-portrait-romantic',
      'temperature-check',
      'voice-note-trailer',
      'wavelength-slider',
    ]

    sharedIds.forEach((id) => {
      expect(duelRegistry[id].resolveTie(
        { score: 1, time: 9, value: 2, won: true },
        { score: 99, time: 1, value: 10, won: true },
      )).toEqual({ shared: true })
    })
  })
})
