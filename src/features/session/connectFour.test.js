import { describe, expect, it } from 'vitest'
import {
  CONNECT_FOUR_COLUMNS,
  CONNECT_FOUR_ROWS,
  createConnectFourState,
  findConnectFourLandingRow,
  getConnectFourMovePlayer,
  getUnlockedConnectFourTokens,
  placeConnectFourPiece,
} from './connectFour.js'

function play(state, column, playerUid, sessionId, tokenId = playerUid === 'one' ? 'garnet' : 'moon') {
  return placeConnectFourPiece(state, { column, playerUid, sessionId, tokenId }).state
}

describe('Connect Four anytime match', () => {
  it('alternates each move in the same match and keeps pieces in the lowest open space', () => {
    const players = ['one', 'two']
    let state = createConnectFourState(players, 'one')
    expect(getConnectFourMovePlayer({ lifetimeNights: 0 }, players, state)).toBe('one')
    state = play(state, 3, 'one', 'move-1')
    expect(state.board[3]).toBe(0)
    expect(state.tokenIds[3]).toBe('garnet')
    expect(findConnectFourLandingRow(state.board, 3)).toBe(1)
    expect(getConnectFourMovePlayer({ lifetimeNights: 0 }, players, state)).toBe('two')
    state = play(state, 3, 'two', 'move-2')
    expect(state.board[10]).toBe(1)
    expect(state.tokenIds[10]).toBe('moon')
    expect(getConnectFourMovePlayer({ lifetimeNights: 0 }, players, state)).toBe('one')
  })

  it('rejects duplicate moves, out-of-turn moves, and full columns', () => {
    let state = createConnectFourState(['one', 'two'])
    state = play(state, 0, 'one', 'move-1')
    expect(() => placeConnectFourPiece(state, { column: 0, playerUid: 'one', sessionId: 'move-2', tokenId: 'garnet' })).toThrow(/partner’s turn/i)
    for (let index = 1; index < CONNECT_FOUR_ROWS; index += 1) {
      state = play(state, 0, index % 2 ? 'two' : 'one', `move-${index + 1}`)
    }
    expect(findConnectFourLandingRow(state.board, 0)).toBe(-1)
    expect(() => placeConnectFourPiece(state, { column: 0, playerUid: 'two', sessionId: 'move-6', tokenId: 'moon' })).toThrow(/already been played/i)
    expect(() => placeConnectFourPiece(state, { column: 0, playerUid: 'one', sessionId: 'move-7', tokenId: 'garnet' })).toThrow(/column is full/i)
  })

  it('detects the winner without resetting the board and exposes night-based cosmetic unlocks', () => {
    let state = createConnectFourState(['one', 'two'], 'one')
    const turns = [
      [0, 'one'], [1, 'two'], [1, 'one'], [2, 'two'], [2, 'one'],
      [3, 'two'], [2, 'one'], [3, 'two'], [3, 'one'], [5, 'two'], [3, 'one'],
    ]
    turns.forEach(([column, playerUid], index) => { state = play(state, column, playerUid, `move-${index + 1}`) })
    expect(state.winnerUid).toBe('one')
    expect(state.moveCount).toBe(11)
    expect(state.board.filter(cell => cell >= 0)).toHaveLength(11)
    expect(() => play(state, 6, 'two', 'move-12')).toThrow(/match is complete/i)
    expect(getUnlockedConnectFourTokens(2).map(token => token.id)).toEqual(['garnet', 'moon'])
    expect(getUnlockedConnectFourTokens(3).map(token => token.id)).toContain('leaf')
    expect(CONNECT_FOUR_COLUMNS * CONNECT_FOUR_ROWS).toBe(42)
  })
})
