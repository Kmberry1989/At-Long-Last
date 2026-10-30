import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { activityRegistry } from './activityRegistry.jsx'
import { commitChoice, verifyChoice } from './choiceCommitment.js'

const players = [{ uid: 'one', displayName: 'One' }, { uid: 'two', displayName: 'Two' }]
afterEach(cleanup)

describe('committed partner choices', () => {
  it('hides choices until both commitments and rejects a different answer or nonce', async () => {
    const record = await commitChoice('a')
    expect(await verifyChoice(record, record.commitment)).toBe(true)
    expect(await verifyChoice({ ...record, answerId: 'b' }, record.commitment)).toBe(false)
    expect(await verifyChoice({ ...record, nonce: '0'.repeat(48) }, record.commitment)).toBe(false)
    expect((await commitChoice('a')).commitment).not.toBe(record.commitment)
  })
  for (const id of ['mind-meld', 'prediction-box']) {
    it(`${id} locks twice, opens twice, and waits for both acknowledgments`, async () => {
      const entry = activityRegistry[id]
      let state = entry.createInitialState(players, { activePlayerIndex: 0, random: () => 0 })
      const answerId = state.options[0].id
      const records = [await commitChoice(answerId), await commitChoice(answerId)]
      for (const playerIndex of [0, 1]) {
        state = entry.advance(state, { input: { commitment: records[playerIndex].commitment }, playerIndex }).state
        expect(state.answers).toEqual({})
        expect(state.predictionId ?? null).toBeNull()
      }
      expect(state.phase).toBe('opening')
      // A duplicate commitment cannot change the locked answer.
      expect(entry.advance(state, { input: { commitment: 'f'.repeat(64) }, playerIndex: 0 }).state).toBe(state)
      for (const playerIndex of [0, 1]) {
        expect(await verifyChoice(records[playerIndex], state.commitments[String(playerIndex)])).toBe(true)
        state = entry.advance(state, { input: records[playerIndex], playerIndex }).state
      }
      expect(state.phase).toBe('reveal')
      expect(entry.advance(state, { input: { action: 'continue' }, playerIndex: 1 }).state).toBe(state)
      let step = entry.advance(state, { input: { action: 'continue' }, playerIndex: 0 })
      expect(step.completed).toBe(false)
      step = entry.advance(step.state, { input: { action: 'continue' }, playerIndex: 1 })
      expect(step.completed).toBe(true)
      expect(entry.resolve(step.state, players).payload.matched).toBe(true)
    })
  }
  it('renders the reveal after a choice without changing hook order', () => {
    const entry = activityRegistry['prediction-box']
    const state = entry.createInitialState(players, { random: () => 0 })
    const props = { activity: { id: 'a', type: entry.id, state }, players, playerIndex: 0, onSubmit() {}, onSkip() {} }
    const view = render(entry.render(props))
    view.rerender(entry.render({ ...props, activity: { ...props.activity, state: { ...state, phase: 'reveal', predictionId: state.options[0].id, actualId: state.options[0].id } } }))
    expect(screen.getByRole('heading', { name: 'You called it.' })).toBeInTheDocument()
  })
})
