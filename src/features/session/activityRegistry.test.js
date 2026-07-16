import { describe, expect, it } from 'vitest'
import { activityRegistry, activityIds } from './activityRegistry.jsx'

const players = [
  { displayName: 'Kyle' },
  { displayName: 'Elaine' },
]

describe('activityRegistry', () => {
  it('contains the full 45-item activity pack with unique ids', () => {
    expect(activityIds).toHaveLength(45)
    expect(new Set(activityIds).size).toBe(45)
  })

  it('completes a normal two-turn activity and produces journal-ready text', () => {
    const entry = activityRegistry['comfort-menu']
    let state = entry.createInitialState()

    let step = entry.advance(state, {
      input: { text: 'Tea and quiet.' },
      playerIndex: 0,
    })
    expect(step.completed).toBe(false)

    step = entry.advance(step.state, {
      input: { text: 'Blanket and forehead rubs.' },
      playerIndex: 1,
    })
    expect(step.completed).toBe(true)

    const result = entry.resolve(step.state, players)
    expect(result.heartBonus).toBe(3)
    expect(result.payload.entries).toHaveLength(2)
    expect(result.text).toContain('Kyle:')
    expect(result.vibe).toBe('tender')
  })

  it('adds an openAt timestamp for postcard-next-year', () => {
    const entry = activityRegistry['postcard-next-year']
    let state = entry.createInitialState()

    state = entry.advance(state, {
      input: { text: 'Remember when we finally slowed down?' },
      playerIndex: 0,
    }).state

    const step = entry.advance(state, {
      input: { text: 'And started laughing again on purpose.' },
      playerIndex: 1,
    })

    const result = entry.resolve(step.state, players)
    expect(result.openAt).toBeTypeOf('string')
    expect(result.payload.openAt).toBe(result.openAt)
  })

  it('keeps all spicy activities skippable', () => {
    const spicyEntries = Object.values(activityRegistry).filter((entry) => entry.vibe === 'spicy')
    expect(spicyEntries).toHaveLength(15)
    expect(spicyEntries.every((entry) => entry.skippable)).toBe(true)
  })
})
