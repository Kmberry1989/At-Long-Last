import { describe, expect, it } from 'vitest'
import { activityDefinitions, duelDefinitions } from './contentPackData.js'
import {
  averageVibeVotes,
  buildBoardRewardPatch,
  createDefaultBoardState,
  getAllowedIntensities,
  pickWeightedActivityId,
  pickWeightedActivityOptions,
  pickWeightedDuelId,
} from './sessionWiring.js'

describe('sessionWiring', () => {
  it('averages vibe votes and normalizes the result', () => {
    const result = averageVibeVotes({
      u1: { tender: 0.6, playful: 0.3, spicy: 0.1 },
      u2: { tender: 0.4, playful: 0.2, spicy: 0.4 },
    })

    expect(result.tender).toBeCloseTo(0.5, 5)
    expect(result.playful).toBeCloseTo(0.25, 5)
    expect(result.spicy).toBeCloseTo(0.25, 5)
  })

  it('only allows intensity 3 when spicy is unlocked', () => {
    expect(getAllowedIntensities({ tender: 0.5, playful: 0.3, spicy: 0.2 })).toEqual([1, 2])
    expect(getAllowedIntensities({ tender: 0.2, playful: 0.2, spicy: 0.6 })).toEqual([1, 2, 3])
  })

  it('avoids duplicate activities until the pool is exhausted', () => {
    const first = pickWeightedActivityId({ tender: 1, playful: 0, spicy: 0 }, [], () => 0)
    const second = pickWeightedActivityId({ tender: 1, playful: 0, spicy: 0 }, [first], () => 0)

    expect(second).not.toBe(first)
  })

  it('avoids duplicate duels until the pool is exhausted', () => {
    const first = pickWeightedDuelId({ tender: 0, playful: 1, spicy: 0 }, [], () => 0)
    const second = pickWeightedDuelId({ tender: 0, playful: 1, spicy: 0 }, [first], () => 0)

    expect(second).not.toBe(first)
  })

  it('builds unique activity options for a double-pick choice', () => {
    const picks = pickWeightedActivityOptions(
      { tender: 1, playful: 0, spicy: 0 },
      [],
      2,
      () => 0,
    )

    expect(picks).toHaveLength(2)
    expect(new Set(picks).size).toBe(2)
  })

  it.each(['tender', 'playful', 'spicy'])(
    'uses a dominant %s vote to favor matching activities and duels',
    (vibe) => {
      const weights = {
        playful: vibe === 'playful' ? 1 : 0,
        spicy: vibe === 'spicy' ? 1 : 0,
        tender: vibe === 'tender' ? 1 : 0,
      }
      const activityId = pickWeightedActivityId(weights, [], () => 0)
      const duelId = pickWeightedDuelId(weights, [], () => 0)

      expect(
        activityDefinitions.find((entry) => entry.id === activityId)?.vibe,
      ).toBe(vibe)
      expect(
        duelDefinitions.find((entry) => entry.id === duelId)?.vibe,
      ).toBe(vibe)
    },
  )

  it('updates board rewards by vibe', () => {
    const initial = createDefaultBoardState()
    const tender = buildBoardRewardPatch(initial, 'tender', 'comfort-menu')
    const playful = buildBoardRewardPatch(tender, 'playful', 'doodle-duel-memory')
    const spicy = buildBoardRewardPatch(playful, 'spicy', 'kiss-courier')

    expect(tender.tenderStars).toBe(1)
    expect(playful.playfulStickerIds).toContain('doodle-duel-memory')
    expect(spicy.spicyGlowLevel).toBe(1)
  })
})
