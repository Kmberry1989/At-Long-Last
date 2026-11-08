import { useEffect, useMemo, useRef, useState } from 'react'
import { CONNECT_FOUR_COLUMNS, CONNECT_FOUR_ROWS, CONNECT_FOUR_TOKENS, getConnectFourMovePlayer, getConnectFourPlayerTokenIds } from '../features/session/connectFour.js'
import { PlayerPortrait } from './PlayerPortrait.jsx'
import './connect-four-finale.css'

const BOARD_ART = '/assets/connect-four/board.webp'
const TOKEN_SHEETS = ['/assets/connect-four/token-atlas.webp', '/assets/connect-four/token-atlas-2.webp', '/assets/connect-four/token-atlas-3.webp']

function tokenStyle(tokenId) {
  const token = CONNECT_FOUR_TOKENS.find((entry) => entry.id === tokenId) || CONNECT_FOUR_TOKENS[0]
  const [x, y] = token.sprite
  return { backgroundImage: `url(${TOKEN_SHEETS[token.atlas]})`, backgroundPosition: `${x * 50}% ${y * 50}%` }
}

function getWinningCells(board) {
  for (let row = 0; row < CONNECT_FOUR_ROWS; row += 1) {
    for (let column = 0; column < CONNECT_FOUR_COLUMNS; column += 1) {
      const token = board[row * CONNECT_FOUR_COLUMNS + column]
      if (token < 0) continue
      for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
        const cells = Array.from({ length: 4 }, (_, step) => [column + dx * step, row + dy * step])
        if (cells.every(([x, y]) => x >= 0 && x < CONNECT_FOUR_COLUMNS && y >= 0 && y < CONNECT_FOUR_ROWS && board[y * CONNECT_FOUR_COLUMNS + x] === token)) {
          return new Set(cells.map(([x, y]) => y * CONNECT_FOUR_COLUMNS + x))
        }
      }
    }
  }
  return new Set()
}

export function ConnectFourFinale({ state, players, playerUid, lifetimeNights = 0, tokenPreferences = {}, disabled, onDrop, onClose, onNewGame, onLand }) {
  const [animatingKey, setAnimatingKey] = useState(null)
  const playerTokenIds = useMemo(() => getConnectFourPlayerTokenIds(state), [state])
  const playerIndex = Math.max(0, state.playerUids?.indexOf(playerUid) ?? players.findIndex((player) => player.uid === playerUid))
  const ownTokenId = playerTokenIds[playerIndex] || tokenPreferences[playerUid]
  const seenMove = useRef(state?.lastMove?.sessionId || '')
  const move = state?.lastMove
  const moveKey = move?.sessionId || ''
  const moverUid = getConnectFourMovePlayer({ lifetimeNights }, players.map((player) => player.uid), state)
  const isYourMove = playerUid === moverUid
  const winnerName = state?.winnerUid ? players.find((player) => player.uid === state.winnerUid)?.displayName : null
  const draw = !state?.winnerUid && state?.moveCount === CONNECT_FOUR_COLUMNS * CONNECT_FOUR_ROWS
  const winningCells = useMemo(() => getWinningCells(state.board), [state.board])
  const nextGame = Boolean(state?.winnerUid) || draw

  useEffect(() => {
    if (!moveKey || seenMove.current === moveKey) return
    seenMove.current = moveKey
    setAnimatingKey(moveKey)
    const landTimer = window.setTimeout(() => onLand?.(state?.winnerUid), 720)
    const timer = window.setTimeout(() => setAnimatingKey(null), 900)
    return () => { window.clearTimeout(timer); window.clearTimeout(landTimer) }
  }, [moveKey, state?.winnerUid, onLand])

  const status = winnerName ? `${winnerName} wins` : draw ? 'A lovely draw' : isYourMove ? 'Your turn' : `${players.find((player) => player.uid === moverUid)?.displayName || 'Your person'}’s turn`

  function renderColumn(column) {
    const full = state.board[(CONNECT_FOUR_ROWS - 1) * CONNECT_FOUR_COLUMNS + column] !== -1
    const cells = Array.from({ length: CONNECT_FOUR_ROWS }, (_, visualRow) => {
      const row = CONNECT_FOUR_ROWS - 1 - visualRow
      const index = row * CONNECT_FOUR_COLUMNS + column
      const owner = state.board[index]
      const ownerUid = state.playerUids?.[owner]
      const tokenId = playerTokenIds[owner] || tokenPreferences[ownerUid] || (owner === 1 ? 'moon' : 'garnet')
      const shouldAnimate = move?.column === column && move?.row === row && animatingKey === moveKey
      const isWinningPiece = winningCells.has(index)
      return <span className={`connect-four-cell${owner >= 0 ? ' has-token' : ''}${isWinningPiece ? ' is-winning' : ''}`} key={index}>
        {owner >= 0 && <span className={`connect-four-token-frame player-token-${owner}${shouldAnimate ? ' is-dropping' : ''}`}>
          <span aria-hidden="true" className="connect-four-token-art" style={tokenStyle(tokenId)} />
        </span>}
      </span>
    })
    return <>
      {cells}
          <button type="button" className="connect-four-column-hit" aria-label={`Drop piece in column ${column + 1}`} disabled={!isYourMove || disabled || nextGame || full} onClick={() => onDrop(column, ownTokenId)} />
    </>
  }

  return <div className="overlay-screen connect-four-overlay" role="dialog" aria-modal="true" aria-labelledby="connect-four-title">
    <section className="connect-four-card">
      <header className="connect-four-header">
        <div className="connect-four-players">
          {players.slice(0, 2).map((player, index) => <div className={`connect-four-player player-${index}`} key={player.uid}>
            <PlayerPortrait player={player} label={`${player.displayName} portrait`} className="connect-four-player-portrait" />
            <span>{player.displayName}</span>
          </div>)}
        </div>
        <div className="connect-four-title-block">
          <span className="connect-four-kicker">A LITTLE MATCH, ANYTIME</span>
          <h2 id="connect-four-title">Connect Four</h2>
          <p className={`connect-four-status${winnerName ? ' is-winner' : ''}`} aria-live="polite">{status}</p>
        </div>
        <button className="connect-four-close" type="button" onClick={onClose} aria-label="Close Connect Four">×</button>
      </header>

      <div className="connect-four-board-wrap">
        <div className="connect-four-board-stage">
          <img className="connect-four-board-art" src={BOARD_ART} alt="" />
          <div className="connect-four-grid" aria-label="Connect Four board">
            {Array.from({ length: CONNECT_FOUR_COLUMNS }, (_, column) => <div className="connect-four-column" key={column}>{renderColumn(column)}</div>)}
          </div>
        </div>
      </div>

      {draw && <p className="connect-four-result">Every space found its place.</p>}
      {winnerName && <p className="connect-four-result">Four in a row, kept in your story.</p>}
      {nextGame ? <button className="connect-four-done" type="button" onClick={onNewGame}>Play again <span>↻</span></button>
        : <p className="connect-four-hint">{isYourMove ? 'Drop a piece' : 'The board updates as you play'}</p>}
      <button className="connect-four-close-match" type="button" onClick={onClose}>Done for now</button>
    </section>
  </div>
}
