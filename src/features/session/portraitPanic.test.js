import { describe, expect, it } from 'vitest'
import { getPortraitPanicStage, isValidPortraitGuide } from './portraitPanic.js'

describe('Portrait Panic guidance', () => {
  it('requires three distinct supported cues', () => {
    expect(isValidPortraitGuide(['left', 'larger', 'smile'])).toBe(true)
    expect(isValidPortraitGuide(['left', 'left', 'smile'])).toBe(false)
    expect(isValidPortraitGuide(['left', 'larger'])).toBe(false)
    expect(isValidPortraitGuide(['left', 'larger', 'secret'])).toBe(false)
  })

  it('allows each player to send cues independently, then draw from the cues received', () => {
    expect(getPortraitPanicStage({}, 0)).toBe('guide')
    expect(getPortraitPanicStage({ guides: { 0: ['left', 'larger', 'smile'] } }, 0)).toBe('waiting')
    expect(getPortraitPanicStage({ guides: { 0: ['left', 'larger', 'smile'], 1: ['right', 'simple', 'closer'] } }, 0)).toBe('draw')
    expect(getPortraitPanicStage({ results: { 1: { highlight: 'drawn' } } }, 1)).toBe('complete')
  })
})
