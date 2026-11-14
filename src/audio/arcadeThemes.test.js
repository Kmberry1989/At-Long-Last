import { describe, expect, it } from 'vitest'
import { ARCADE_SONGS } from './arcadeThemes.js'

describe('mini-game theme scores', () => {
  it('gives Radar Love a distinct 32-bar nautical pattern in the shared sound palette', () => {
    const radar = ARCADE_SONGS['radar-love']
    const other = ARCADE_SONGS['my-one-and-only']

    expect(radar.bars).toHaveLength(32)
    expect(radar.voice).toBe('radar')
    expect(radar.bpm).toBeGreaterThan(other.bpm - 10)
    expect(radar.bars.map(bar => bar.melody.map(note => note?.frequency ?? null))).not.toEqual(
      other.bars.map(bar => bar.melody.map(note => note?.frequency ?? null)),
    )
    expect(radar.bars.slice(0, 8).some(bar => bar.melody.filter(Boolean).length >= 5)).toBe(true)
    expect(radar.bars.at(-1).melody.some(Boolean)).toBe(true)
  })
})
