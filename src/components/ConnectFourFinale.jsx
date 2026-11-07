import { useEffect, useRef, useState } from 'react'
import { CONNECT_FOUR_COLUMNS, CONNECT_FOUR_ROWS } from '../features/session/connectFour.js'
import './connect-four-finale.css'

const BOARD_ART = '/assets/connect-four/board.webp'
const TOKEN_ART = ['/assets/connect-four/heart-token.webp', '/assets/connect-four/crescent-token.webp']

export function ConnectFourFinale({ state, players, moverUid, playerUid, sessionId, disabled, onDrop, onContinue, onLand }) {
  const [animatingKey, setAnimatingKey] = useState(null)
  const seenMove = useRef(state?.lastMove?.sessionId ? `${state.lastMove.sessionId}:${state.lastMove.column}:${state.lastMove.row}` : '')
  const move = state?.lastMove
  const moveKey = move ? `${move.sessionId}:${move.column}:${move.row}` : ''
  const isYourMove = playerUid === moverUid
  const isTonightDone = move?.sessionId === sessionId
  const nextGame = Boolean(state?.winnerUid) || state?.moveCount === CONNECT_FOUR_COLUMNS * CONNECT_FOUR_ROWS
  const winnerName = state?.winnerUid ? players.find(player => player.uid === state.winnerUid)?.displayName : null
  const draw = !state?.winnerUid && state?.moveCount === CONNECT_FOUR_COLUMNS * CONNECT_FOUR_ROWS

  useEffect(() => {
    if (!moveKey || seenMove.current === moveKey) return
    seenMove.current = moveKey
    setAnimatingKey(moveKey)
    const landTimer = window.setTimeout(() => onLand?.(state?.winnerUid), 720)
    const timer = window.setTimeout(() => setAnimatingKey(null), 900)
    return () => { window.clearTimeout(timer); window.clearTimeout(landTimer) }
  }, [moveKey, state?.winnerUid, onLand])

  function columnButtons(column) {
    const full = state.board[(CONNECT_FOUR_ROWS - 1) * CONNECT_FOUR_COLUMNS + column] !== -1
    const cells = Array.from({ length: CONNECT_FOUR_ROWS }, (_, visualRow) => {
      const row = CONNECT_FOUR_ROWS - 1 - visualRow
      const index = row * CONNECT_FOUR_COLUMNS + column
      const token = state.board[index]
      const thisMove = move?.column === column && move?.row === row
      const shouldAnimate = thisMove && animatingKey === moveKey
      const isWinningPiece = state.winnerUid && token === state.playerUids.indexOf(state.winnerUid) && belongsToWinningLine(state.board, column, row)
      return <span className={`connect-four-cell${token >= 0 ? ' has-token' : ''}${isWinningPiece ? ' is-winning' : ''}`} key={index}>
        {token >= 0 && <img className={`connect-four-token${shouldAnimate ? ' is-dropping' : ''}`} src={TOKEN_ART[token]} alt={shouldAnimate ? `${players.find(player => player.uid === move.playerUid)?.displayName || 'Player'} piece falling` : ''} />}
      </span>
    })
    return <>
      {cells}
      <button type="button" className="connect-four-column-hit" aria-label={`Drop piece in column ${column + 1}`} disabled={!isYourMove || disabled || isTonightDone || (!nextGame && full)} onClick={() => onDrop(column)} />
    </>
  }

  function belongsToWinningLine(board, column, row) {
    const token = board[row * CONNECT_FOUR_COLUMNS + column]
    if (token < 0) return false
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      let count = 1
      for (const direction of [-1, 1]) {
        let x = column + dx * direction
        let y = row + dy * direction
        while (x >= 0 && x < CONNECT_FOUR_COLUMNS && y >= 0 && y < CONNECT_FOUR_ROWS && board[y * CONNECT_FOUR_COLUMNS + x] === token) {
          count += 1
          x += dx * direction
          y += dy * direction
        }
      }
      if (count >= 4) return true
    }
    return false
  }

  const status = winnerName ? `${winnerName} wins` : draw ? 'A lovely draw' : isTonightDone ? 'Move placed' : isYourMove ? 'Your move' : `${players.find(player => player.uid === moverUid)?.displayName || 'Your person'}’s move`

  return <div className="overlay-screen connect-four-overlay" role="dialog" aria-modal="true" aria-labelledby="connect-four-title">
    <section className="connect-four-card">
      <header className="connect-four-header">
        <div className="connect-four-players">
          {players.slice(0, 2).map((player, index) => <div className={`connect-four-player player-${index}`} key={player.uid}>
            <img src={TOKEN_ART[index]} alt="" />
            <span>{player.displayName}</span>
          </div>)}
        </div>
        <div className="connect-four-title-block">
          <span className="connect-four-kicker">TONIGHT’S LAST MOVE</span>
          <h2 id="connect-four-title">Connect Four</h2>
          <p className={`connect-four-status${winnerName ? ' is-winner' : ''}`} aria-live="polite">{status}</p>
        </div>
        <button className="connect-four-close" type="button" onClick={onContinue} aria-label="Close Connect Four">×</button>
      </header>

      <div className="connect-four-board-wrap">
        <div className="connect-four-board-stage">
          <img className="connect-four-board-art" src={BOARD_ART} alt="" />
          <div className="connect-four-grid" aria-label="Connect Four board">
            {Array.from({ length: CONNECT_FOUR_COLUMNS }, (_, column) => <div className="connect-four-column" key={column}>
              {columnButtons(column)}
            </div>)}
          </div>
        </div>
      </div>

      {draw && <p className="connect-four-result">Every space found its place.</p>}
      {winnerName && <p className="connect-four-result">Four in a row, kept in your story.</p>}
      {isTonightDone ? <button className="connect-four-done" type="button" onClick={onContinue}>Continue the night <span>→</span></button>
        : isYourMove ? <p className="connect-four-hint">Choose a column</p>
          : <p className="connect-four-hint">The board will update when the piece lands.</p>}
    </section>
  </div>
}
