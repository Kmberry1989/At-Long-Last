import { cleanup, render } from '@testing-library/react'
import { createElement } from 'react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { activityIds, activityRegistry } from './activityRegistry.jsx'
import { duelIds, duelRegistry } from './duelRegistry.jsx'

const players = [
  { uid: 'avery', displayName: 'Avery' },
  { uid: 'rowan', displayName: 'Rowan' },
]
const twoAnswerActivityIds = activityIds.filter(id => {
  const state = activityRegistry[id].createInitialState(players, { activePlayerIndex: 0, random: () => 0, history: [] })
  return Object.keys(state).sort().join(',') === 'activityId,entries,prompt,turnIndex'
})

describe('activity catalog opening playtest', () => {
  beforeAll(() => vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ({ fillRect() {} })))
  afterAll(() => vi.restoreAllMocks())

  it.each(activityIds)('%s opens for both players', (id) => {
    const entry = activityRegistry[id]
    for (const activePlayerIndex of [0, 1]) {
      const state = entry.createInitialState(players, { activePlayerIndex, random: () => 0, history: [] })
      for (const playerIndex of [0, 1]) {
        const { container } = render(entry.render({
          activity: { id, type: id, state },
          disabled: false,
          onClose: vi.fn(),
          onSubmit: vi.fn(),
          playerIndex,
          players,
        }))
        expect(container.textContent?.trim().length, `${id} should render content for player ${playerIndex} when ${activePlayerIndex} leads`).toBeGreaterThan(0)
        cleanup()
      }
    }
  })
})

describe('two-answer activity playtest', () => {
  it.each(twoAnswerActivityIds)('%s completes in either player order', id => {
    const entry = activityRegistry[id]
    for (const order of [[0, 1], [1, 0]]) {
      let state = entry.createInitialState(players, { activePlayerIndex: order[0], random: () => 0, history: [] })
      const first = entry.advance(state, { input: { text: 'Avery shared a thoughtful answer.' }, playerIndex: order[0] })
      expect(first.completed).toBe(false)
      state = first.state
      const second = entry.advance(state, { input: { text: 'Rowan shared a thoughtful answer.' }, playerIndex: order[1] })
      expect(second.completed).toBe(true)
      const journal = entry.resolve(second.state, players)
      expect(journal.text).toContain('Avery:')
      expect(journal.text).toContain('Rowan:')
    }
  })
})

describe('duel catalog opening playtest', () => {
  it.each(duelIds)('%s opens for both players', id => {
    const Start = duelRegistry[id].start
    for (const playerIndex of [0, 1]) {
      const { container } = render(createElement(Start, {
        disabled: false,
        onComplete: vi.fn(),
        playerIndex,
        players,
      }))
      expect(container.textContent?.trim().length, `${id} should render content for player ${playerIndex}`).toBeGreaterThan(0)
      cleanup()
    }
  })
})
