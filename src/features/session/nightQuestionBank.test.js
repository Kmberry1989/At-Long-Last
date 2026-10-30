import { describe, expect, it } from 'vitest'
import { NIGHT_CHOICE_QUESTIONS } from './nightQuestionBank.js'
import { MIND_MELD_PROMPTS, PREDICTION_BOX_PROMPTS, VAULT_PROMPTS } from './connectionGameData.js'
import { BLIND_CANVAS_PROMPTS } from './waveThreeGameData.js'
import { BLUFF_BIDDING_TOPICS, PHOTO_FLASHBACK_PROMPTS } from './waveFourGameData.js'
import { WORD_WEAVER_PUZZLES } from './waveTwoGameData.js'

describe('night content library', () => {
  it('keeps every bank unique and offers at least twenty prompts per conversational family', () => {
    for (const bank of [MIND_MELD_PROMPTS, PREDICTION_BOX_PROMPTS, VAULT_PROMPTS, BLIND_CANVAS_PROMPTS, BLUFF_BIDDING_TOPICS, PHOTO_FLASHBACK_PROMPTS]) {
      expect(bank.length).toBeGreaterThanOrEqual(20)
      expect(new Set(bank.map(p => p.id)).size).toBe(bank.length)
      expect(new Set(bank.map(p => p.prompt)).size).toBe(bank.length)
    }
  })
  it('provides fifty distinct choice questions with four valid answers each', () => {
    expect(NIGHT_CHOICE_QUESTIONS.length).toBeGreaterThanOrEqual(50)
    for (const question of NIGHT_CHOICE_QUESTIONS) {
      expect(question.options.map(o => o.id)).toEqual(['a', 'b', 'c', 'd'])
      expect(new Set(question.options.map(o => o.label)).size).toBe(4)
      expect(question.text.length).toBeLessThan(500)
    }
  })
  it('only accepts words the shared letter tray can actually form', () => {
    for (const puzzle of WORD_WEAVER_PUZZLES) {
      expect(new Set(puzzle.allowedWords).size).toBe(puzzle.allowedWords.length)
      for (const word of puzzle.allowedWords) {
        const letters = puzzle.letters.map(letter => letter.toLowerCase())
        for (const letter of word) {
          const index = letters.indexOf(letter)
          expect(index, `${puzzle.id}: ${word}`).toBeGreaterThanOrEqual(0)
          letters.splice(index, 1)
        }
      }
    }
  })
})
