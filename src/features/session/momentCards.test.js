import { describe, expect, it } from 'vitest'
import { drawMomentCard, flipMomentCoin, MOMENT_DECKS } from './momentCards.js'

describe('Trash and Treasure moments', () => {
  it('uses a fair half-and-half threshold for the coin sides', () => {
    expect(flipMomentCoin(() => 0)).toBe('trash')
    expect(flipMomentCoin(() => 0.499999)).toBe('trash')
    expect(flipMomentCoin(() => 0.5)).toBe('treasure')
    expect(flipMomentCoin(() => 0.999999)).toBe('treasure')
  })
  it('offers a varied library of named everyday and milestone moments', () => {
    expect(MOMENT_DECKS.trash.length).toBeGreaterThanOrEqual(10)
    expect(MOMENT_DECKS.treasure.length).toBeGreaterThanOrEqual(10)
    for (const [category, cards] of Object.entries(MOMENT_DECKS)) {
      expect(new Set(cards.map(card => card.title)).size).toBe(cards.length)
      for (const card of cards) {
        expect(card.title.length).toBeGreaterThan(4)
        expect(card.scene.length).toBeGreaterThan(15)
        expect(card.effect.length).toBeGreaterThan(3)
      }
      expect(category).toMatch(/^(trash|treasure)$/)
    }
    expect(MOMENT_DECKS.trash.find(card => card.id === 'late-dinner')?.title).not.toMatch(/\d|\d:\d/)
  })

  it('uses the lower d6 face as the exact number of spaces in the card direction', () => {
    const treasure = drawMomentCard(() => 0.99, [5, 2])
    expect(treasure.category).toBe('treasure')
    expect(treasure.lowerDie).toBe(2)
    expect(treasure.spaces).toBe(2)
    expect(treasure.movement).toBe(2)
    const trash = drawMomentCard(() => 0, [5, 6])
    expect(trash.category).toBe('trash')
    expect(trash.movement).toBe(-5)
    expect(MOMENT_DECKS.trash.some(source => source.id === trash.id)).toBe(true)
  })

  it('maps each lower-die face directly to the same space count', () => {
    for (let face = 1; face <= 6; face += 1) {
      const card = drawMomentCard(() => 0.99, [6, face])
      expect(card.lowerDie).toBe(face)
      expect(card.spaces).toBe(face)
      expect(card.movement).toBe(face)
    }
  })
})
