import { describe, expect, it } from 'vitest'
import { hasThreeLetters } from './responseValidation.js'

describe('minimum text response', () => {
  it('requires three letters while allowing punctuation and spaces around them', () => {
    expect(hasThreeLetters('I ❤️ you')).toBe(true)
    expect(hasThreeLetters('ok!')).toBe(false)
    expect(hasThreeLetters('123 abc')).toBe(true)
    expect(hasThreeLetters('')).toBe(false)
  })
})
