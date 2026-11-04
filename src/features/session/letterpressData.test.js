import { describe, expect, it } from 'vitest'
import { getLetterpressPrompt, getLetterpressWords, LETTERPRESS_PROMPTS, weaveLetterpressWords } from './letterpressData.js'

describe('Letterpress prompts and reveal', () => {
  it('provides a varied prompt library and a shared deterministic prompt per night and round', () => {
    expect(LETTERPRESS_PROMPTS.length).toBeGreaterThanOrEqual(20)
    expect(getLetterpressPrompt('night-a', 1)).toBe(getLetterpressPrompt('night-a', 1))
    expect(getLetterpressPrompt('night-a', 1)).not.toBe(getLetterpressPrompt('night-a', 2))
  })

  it('keeps four submitted words and alternates both players in the reveal sentence', () => {
    expect(getLetterpressWords('  we make tiny magic tonight  ')).toEqual(['we', 'make', 'tiny', 'magic'])
    expect(weaveLetterpressWords(['we', 'make', 'tiny'], ['laugh', 'often', 'together']))
      .toBe('we laugh make often tiny together')
  })
})
