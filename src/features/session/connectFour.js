export const CONNECT_FOUR_COLUMNS = 7
export const CONNECT_FOUR_ROWS = 6
export const CONNECT_FOUR_CELLS = CONNECT_FOUR_COLUMNS * CONNECT_FOUR_ROWS

export const CONNECT_FOUR_TOKENS = [
  { id: 'garnet', name: 'Garnet heart', unlockAt: 0, atlas: 0, sprite: [0, 0] },
  { id: 'moon', name: 'Crescent moon', unlockAt: 0, atlas: 0, sprite: [1, 0] },
  { id: 'leaf', name: 'Botanical leaf', unlockAt: 3, atlas: 0, sprite: [2, 0] },
  { id: 'key', name: 'Antique key', unlockAt: 7, atlas: 0, sprite: [0, 1] },
  { id: 'shell', name: 'Scallop shell', unlockAt: 14, atlas: 0, sprite: [1, 1] },
  { id: 'lantern', name: 'Little lantern', unlockAt: 25, atlas: 0, sprite: [2, 1] },
  { id: 'letter', name: 'Sealed letter', unlockAt: 40, atlas: 0, sprite: [0, 2] },
  { id: 'blossom', name: 'Five-petal bloom', unlockAt: 60, atlas: 0, sprite: [1, 2] },
  { id: 'compass', name: 'Compass rose', unlockAt: 100, atlas: 0, sprite: [2, 2] },
  { id: 'candle', name: 'Candlelight', unlockAt: 125, atlas: 1, sprite: [0, 0] },
  { id: 'teacup', name: 'Flowered teacup', unlockAt: 150, atlas: 1, sprite: [1, 0] },
  { id: 'cottage', name: 'Little cottage', unlockAt: 175, atlas: 1, sprite: [2, 0] },
  { id: 'paintbox', name: 'Paint and palette', unlockAt: 200, atlas: 1, sprite: [0, 1] },
  { id: 'hourglass', name: 'Hourglass', unlockAt: 225, atlas: 1, sprite: [1, 1] },
  { id: 'umbrella', name: 'Rainy day umbrella', unlockAt: 250, atlas: 1, sprite: [2, 1] },
  { id: 'picnic', name: 'Picnic basket', unlockAt: 275, atlas: 1, sprite: [0, 2] },
  { id: 'musicbox', name: 'Music box', unlockAt: 300, atlas: 1, sprite: [1, 2] },
  { id: 'sunrise', name: 'Sunrise hills', unlockAt: 365, atlas: 1, sprite: [2, 2] },
  { id: 'strawberry', name: 'Strawberry', unlockAt: 0, atlas: 2, sprite: [0, 0] },
  { id: 'chicken', name: 'Little chicken', unlockAt: 0, atlas: 2, sprite: [1, 0] },
  { id: 'beehive', name: 'Honey jar', unlockAt: 400, atlas: 2, sprite: [2, 0] },
  { id: 'cherries', name: 'Cherries', unlockAt: 425, atlas: 2, sprite: [0, 1] },
  { id: 'fern', name: 'Fern frond', unlockAt: 450, atlas: 2, sprite: [1, 1] },
  { id: 'moonwindow', name: 'Moonlit window', unlockAt: 475, atlas: 2, sprite: [2, 1] },
  { id: 'apple', name: 'Little apple', unlockAt: 500, atlas: 2, sprite: [0, 2] },
  { id: 'ribbonbow', name: 'Ribbon bow', unlockAt: 525, atlas: 2, sprite: [1, 2] },
  { id: 'gardenlantern', name: 'Garden lantern', unlockAt: 550, atlas: 2, sprite: [2, 2] },
]

export function getUnlockedConnectFourTokens(lifetimeNights = 0) {
  const nights = Math.max(0, Number(lifetimeNights) || 0)
  return CONNECT_FOUR_TOKENS.filter((token) => token.unlockAt <= nights)
}

export function isConnectFourTokenUnlocked(tokenId, lifetimeNights = 0) {
  return getUnlockedConnectFourTokens(lifetimeNights).some((token) => token.id === tokenId)
}

export function getConnectFourPlayerTokenIds(state) {
  const selected = Array.isArray(state?.playerTokenIds) ? [...state.playerTokenIds] : [null, null]
  for (let playerIndex = 0; playerIndex < 2; playerIndex += 1) {
    if (selected[playerIndex]) continue
    const cellIndex = state?.board?.findIndex((owner) => owner === playerIndex) ?? -1
    if (cellIndex >= 0) selected[playerIndex] = state?.tokenIds?.[cellIndex] || null
  }
  return selected
}

export function getConnectFourTokenPreferences(progress, playerUids = []) {
  const preferences = { ...progress?.connectFourTokenPreferences }
  const matchTokens = getConnectFourPlayerTokenIds(progress?.connectFour)
  playerUids.slice(0, 2).forEach((uid, index) => {
    if (uid && !preferences[uid]) preferences[uid] = matchTokens[index] || (index === 0 ? 'garnet' : 'moon')
  })
  return preferences
}

export function createConnectFourState(playerUids = [], starterUid = playerUids[0] || null) {
  return {
    board: Array(CONNECT_FOUR_CELLS).fill(-1),
    lastMove: null,
    moveCount: 0,
    playerUids: [...playerUids],
    playerTokenIds: [null, null],
    starterUid,
    nextPlayerUid: starterUid,
    tokenIds: Array(CONNECT_FOUR_CELLS).fill(null),
    winnerUid: null,
  }
}

export function getConnectFourMovePlayer(progress, playerUids, state) {
  if (!playerUids?.length) return null
  if (!state?.winnerUid && state?.moveCount < CONNECT_FOUR_CELLS) {
    const activeUid = state?.nextPlayerUid || state?.starterUid
    if (activeUid && playerUids.includes(activeUid)) return activeUid
  }
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

export function placeConnectFourPiece(state, { column, playerUid, sessionId, tokenId }) {
  if (!state?.playerUids?.includes(playerUid)) throw new Error('You are not a player in this game.')
  if (state.lastMove?.sessionId === sessionId) throw new Error('This move has already been played.')
  if (state.winnerUid || state.moveCount >= CONNECT_FOUR_CELLS) throw new Error('This match is complete.')
  if (state.nextPlayerUid && state.nextPlayerUid !== playerUid && state.moveCount > 0) throw new Error('It’s your partner’s turn.')
  const boardBeforeMove = state.board
  const tokenIdsBeforeMove = state.tokenIds || Array(CONNECT_FOUR_CELLS).fill(null)
  const row = findConnectFourLandingRow(boardBeforeMove, column)
  if (row < 0) throw new Error('That column is full. Choose another one.')
  const playerIndex = state.playerUids.indexOf(playerUid)
  const playerTokenIds = getConnectFourPlayerTokenIds(state)
  const previousTokenId = playerTokenIds[playerIndex]
  const opposingTokenId = playerTokenIds[1 - playerIndex]
  const selectedTokenId = tokenId || previousTokenId || (playerIndex === 0 ? 'garnet' : 'moon')
  if (previousTokenId && previousTokenId !== selectedTokenId) throw new Error('Choose the same token you picked for this match.')
  if (!previousTokenId && opposingTokenId === selectedTokenId) throw new Error('Your partner already chose that token. Pick a different one.')
  playerTokenIds[playerIndex] = selectedTokenId
  const board = [...boardBeforeMove]
  const landingIndex = row * CONNECT_FOUR_COLUMNS + column
  board[landingIndex] = playerIndex
  const tokenIds = [...tokenIdsBeforeMove]
  for (let index = 0; index < tokenIds.length; index += 1) {
    if (board[index] === playerIndex) tokenIds[index] = selectedTokenId
  }
  const winnerIndex = getConnectFourWinner(board, column, row)
  const winnerUid = winnerIndex >= 0 ? state.playerUids[winnerIndex] : null
  const moveCount = state.moveCount + 1
  const tied = !winnerUid && moveCount === CONNECT_FOUR_CELLS
  return {
    state: {
      ...state,
      board,
      lastMove: { column, playerUid, row, sessionId },
      moveCount,
      nextPlayerUid: winnerUid || tied ? null : state.playerUids[1 - playerIndex],
      playerTokenIds,
      starterUid: state.starterUid || state.playerUids[0],
      tokenIds,
      winnerUid: winnerUid || null,
    },
    result: winnerUid ? { type: 'win', winnerUid } : tied ? { type: 'tie' } : null,
  }
}
