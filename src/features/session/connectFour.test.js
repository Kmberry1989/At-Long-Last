import { describe, expect, it } from 'vitest'
import {
  CONNECT_FOUR_COLUMNS,
  CONNECT_FOUR_ROWS,
  createConnectFourState,
  findConnectFourLandingRow,
  getConnectFourMovePlayer,
  placeConnectFourPiece,
} from './connectFour.js'

function play(state, column, playerUid, sessionId) {
  return placeConnectFourPiece(state, { column, playerUid, sessionId }).state
}

describe('Connect Four night finale', () => {
  it('alternates the nightly mover and keeps pieces in the lowest open space', () => {
    const players = ['one', 'two']
    let state = createConnectFourState(players)
    expect(getConnectFourMovePlayer({ lifetimeNights: 0 }, players)).toBe('one')
    state = play(state, 3, 'one', 'night-1')
    expect(state.board[3]).toBe(0)
    expect(findConnectFourLandingRow(state.board, 3)).toBe(1)
    expect(getConnectFourMovePlayer({ lifetimeNights: 1 }, players)).toBe('two')
  })

  it('rejects a second piece in the same night and a full column', () => {
    let state = createConnectFourState(['one', 'two'])
    for (let index = 0; index < CONNECT_FOUR_ROWS; index += 1) {
      state = play(state, 0, index % 2 ? 'two' : 'one', `night-${index}`)
    }
    expect(findConnectFourLandingRow(state.board, 0)).toBe(-1)
    expect(() => placeConnectFourPiece(state, { column: 0, playerUid: 'one', sessionId: 'night-5' })).toThrow(/already been played/i)
    expect(() => placeConnectFourPiece(state, { column: 0, playerUid: 'one', sessionId: 'night-6' })).toThrow(/column is full/i)
  })

  it('keeps the completed board visible, then starts a fresh board with the next night move', () => {
    let state = createConnectFourState(['one', 'two'])
    const turns = [
      [0, 'one'], [1, 'two'], [1, 'one'], [2, 'two'], [2, 'one'],
      [3, 'two'], [2, 'one'], [3, 'two'], [3, 'one'], [5, 'two'], [3, 'one'],
    ]
    turns.forEach(([column, playerUid], index) => { state = play(state, column, playerUid, `night-${index}`) })
    expect(state.winnerUid).toBe('one')
    expect(state.moveCount).toBe(11)
    const next = play(state, 6, 'two', 'night-next')
    expect(next.winnerUid).toBeNull()
    expect(next.moveCount).toBe(1)
    expect(next.board.filter(cell => cell >= 0)).toHaveLength(1)
    expect(next.board[(CONNECT_FOUR_ROWS - 1) * CONNECT_FOUR_COLUMNS + 6]).toBe(-1)
    expect(next.board[6]).toBe(1)
  })
})
