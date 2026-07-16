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
})
