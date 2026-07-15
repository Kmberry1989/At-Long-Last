import { describe, expect, it } from 'vitest'
import { resolveTieByTime } from './duelRegistry.jsx'

describe('duelRegistry', () => {
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
