import { describe, expect, it } from 'vitest'
import { activityRegistry } from './activityRegistry.jsx'

const players = [
  { displayName: 'Kyle' },
  { displayName: 'Elaine' },
]

describe('activityRegistry', () => {
  it('completes spark check-in after two turns', () => {
    const entry = activityRegistry['spark-checkin']
    let state = entry.createInitialState()

    let step = entry.advance(state, {
      input: { mood: 4, note: 'Ready for this.' },
      playerIndex: 0,
    })
    expect(step.completed).toBe(false)

    step = entry.advance(step.state, {
      input: { mood: 5, note: 'Very in.' },
      playerIndex: 1,
    })
    expect(step.completed).toBe(true)

    const result = entry.resolve(step.state, players)
    expect(result.heartBonus).toBe(3)
    expect(result.payload.entries).toHaveLength(2)
  })

  it('completes story chain after four turns', () => {
    const entry = activityRegistry['story-chain']
    let state = entry.createInitialState()

    for (let index = 0; index < 4; index += 1) {
      const step = entry.advance(state, {
        input: { text: `Line ${index + 1}` },
        playerIndex: index % 2,
      })
      state = step.state
      if (index < 3) {
        expect(step.completed).toBe(false)
      } else {
        expect(step.completed).toBe(true)
      }
    }
  })
})
