export const CONNECT_FOUR_COLUMNS = 7
export const CONNECT_FOUR_ROWS = 6
export const CONNECT_FOUR_CELLS = CONNECT_FOUR_COLUMNS * CONNECT_FOUR_ROWS

export function createConnectFourState(playerUids = []) {
  return {
    board: Array(CONNECT_FOUR_CELLS).fill(-1),
    lastMove: null,
    moveCount: 0,
    playerUids: [...playerUids],
    winnerUid: null,
  }
}

export function getConnectFourMovePlayer(progress, playerUids) {
  if (!playerUids?.length) return null
  return playerUids[Math.max(0, Number(progress?.lifetimeNights) || 0) % playerUids.length]
}

export function findConnectFourLandingRow(board, column) {
  if (!Array.isArray(board) || board.length !== CONNECT_FOUR_CELLS || !Number.isInteger(column) || column < 0 || column >= CONNECT_FOUR_COLUMNS) return -1
  for (let row = 0; row < CONNECT_FOUR_ROWS; row += 1) {
    if (board[row * CONNECT_FOUR_COLUMNS + column] === -1) return row
  }
  return -1
}

export function getConnectFourWinner(board, column, row) {
  if (!Array.isArray(board) || board.length !== CONNECT_FOUR_CELLS) return -1
  const player = board[row * CONNECT_FOUR_COLUMNS + column]
  if (player !== 0 && player !== 1) return -1
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]]
  for (const [dx, dy] of directions) {
    let count = 1
    for (const sign of [-1, 1]) {
      let x = column + dx * sign
      let y = row + dy * sign
      while (x >= 0 && x < CONNECT_FOUR_COLUMNS && y >= 0 && y < CONNECT_FOUR_ROWS && board[y * CONNECT_FOUR_COLUMNS + x] === player) {
        count += 1
        x += dx * sign
        y += dy * sign
      }
    }
    if (count >= 4) return player
  }
  return -1
}

export function placeConnectFourPiece(state, { column, playerUid, sessionId }) {
  if (!state?.playerUids?.includes(playerUid)) throw new Error('You are not a player in this game.')
  if (state.lastMove?.sessionId === sessionId) throw new Error('Tonight’s move has already been played.')
  const previousGameComplete = Boolean(state.winnerUid) || state.moveCount >= CONNECT_FOUR_CELLS
  const boardBeforeMove = previousGameComplete ? Array(CONNECT_FOUR_CELLS).fill(-1) : state.board
  const moveCountBeforeMove = previousGameComplete ? 0 : state.moveCount
  const row = findConnectFourLandingRow(boardBeforeMove, column)
  if (row < 0) throw new Error('That column is full. Choose another one.')
  const playerIndex = state.playerUids.indexOf(playerUid)
  const board = [...boardBeforeMove]
  board[row * CONNECT_FOUR_COLUMNS + column] = playerIndex
  const winnerIndex = getConnectFourWinner(board, column, row)
  const winnerUid = winnerIndex >= 0 ? state.playerUids[winnerIndex] : null
  const moveCount = moveCountBeforeMove + 1
  const tied = !winnerUid && moveCount === CONNECT_FOUR_CELLS
  return {
    state: {
      ...state,
      board,
      lastMove: { column, playerUid, row, sessionId },
      moveCount,
      winnerUid: winnerUid || null,
    },
    result: winnerUid ? { type: 'win', winnerUid } : tied ? { type: 'tie' } : null,
  }
}
