import { describe, expect, it } from 'vitest'
import { MUSIC_PATTERNS, musicStageFor } from './musicPatterns.js'

describe('contextual music', () => {
  it('gives menus, guessing, timed play, reflection, reveals, and finales distinct voices', () => {
    expect(musicStageFor(null)).toBe('menu')
    expect(musicStageFor({ phase: 'turn' })).toBe('board')
    expect(musicStageFor({ phase: 'activity' }, { type: 'prediction-box' })).toBe('prediction')
    expect(musicStageFor({ phase: 'activity' }, { type: 'tempo-tap' })).toBe('timed')
    expect(musicStageFor({ phase: 'activity' }, { type: 'the-vault' })).toBe('reflective')
    expect(musicStageFor({ phase: 'activity' }, { state: { phase: 'reveal' } })).toBe('reveal')
    expect(musicStageFor({ phase: 'duel', currentDuel: { id: 'wavelength-duel' } })).toBe('prediction')
    expect(musicStageFor({ phase: 'finale' })).toBe('finale')
  })
  it('keeps every voice in the same four-note harmonic palette', () => {
    for (const voice of Object.values(MUSIC_PATTERNS)) {
      expect(voice.piano).toHaveLength(16)
      expect([...voice.piano, ...voice.bell].every(note => note >= -1 && note <= 3)).toBe(true)
    }
    expect(MUSIC_PATTERNS.reflective.pulse).toBe(0)
    expect(MUSIC_PATTERNS.prediction.bell).not.toEqual(MUSIC_PATTERNS.timed.bell)
  })
})
