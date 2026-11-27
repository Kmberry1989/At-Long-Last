import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAudio } from '../audio/AudioProvider.jsx'
import { arcadeStage } from '../audio/arcadeThemes.js'
import { PlayerPortrait } from './PlayerPortrait.jsx'
import './arcade-turn-portraits.css'
import { JigsawUnboxing } from './JigsawUnboxing.jsx'
import { applyCoupleArcadeAction, createCoupleArcadeState, runCoupleArcadeAction, subscribeCoupleArcades, prepareCoupleArcade, resetCoupleArcade, COUPLE_ARCADE_IDS } from '../features/couple/coupleArcadeService.js'
import { UNO_CARD_LABELS, UNO_COLORS_LIST, SAY_IT_WITHOUT_SAYING_PROMPTS, getSayWithoutSayingGuessOptions, RADAR_BOARD_SIZE, RADAR_FLEET } from '../features/session/coupleArcade.js'
import './couple-arcade.css'
import './uno-cards.css'

const GAMES = [
  { id: 'my-one-and-only', name: 'My One and Only!', icon: '/assets/arcade/icons/my-one-and-only.png' },
  { id: 'say-it-without-saying', name: 'Say Without Saying', icon: '/assets/arcade/icons/say-it-without-saying.png' },
  { id: 'catch-my-heart', name: 'Catch My Heart', icon: '/assets/arcade/icons/catch-my-heart.png' },
  { id: 'radar-love', name: 'Radar Love', icon: '/assets/arcade/icons/radar-love.png' },
  { id: 'four-ever', name: 'Four Ever', icon: '/assets/arcade/icons/four-ever.png' },
  { id: 'our-little-pieces', name: 'Our Little Pieces', icon: '/assets/arcade/icons/our-little-pieces.png' },
]
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const JIGSAW_ART = [
  { title: 'Lakeside tea', src: '/assets/arcade/our-little-pieces/golden-hour-lakeside.webp', unlockAt: 0 },
  { title: 'First journey', src: '/assets/arcade/our-little-pieces/first-journey.webp', unlockAt: 1 },
  { title: 'Our garden ritual', src: '/assets/arcade/our-little-pieces/garden-ritual.webp', unlockAt: 3 },
  { title: 'A rainy Tuesday', src: '/assets/arcade/our-little-pieces/rainy-tuesday.webp', unlockAt: 5 },
  { title: 'A shared picnic', src: '/assets/arcade/our-little-pieces/shared-picnic.webp', unlockAt: 7 },
  { title: 'Windowlight tea', src: '/assets/arcade/our-little-pieces/windowlight-tea.webp', unlockAt: 9 },
  { title: 'The last train home', src: '/assets/arcade/our-little-pieces/last-train-home.webp', unlockAt: 11 },
  { title: 'After-dinner glow', src: '/assets/arcade/our-little-pieces/after-dinner-glow.webp', unlockAt: 14 },
]
const FISH_CARD_BACK = '/assets/arcade/catch-my-heart/card-back.webp'
const FISH_SUIT_ART = '/assets/arcade/catch-my-heart/suit-emblems.webp'
const RADAR_FLEET_ART = [
  'carrier', 'battleship', 'cruiser', 'submarine', 'destroyer',
].map(ship => `/assets/arcade/radar-love/fleet/${ship}.png`)
const RADAR_HIT_ART = '/assets/arcade/radar-love/sonar-hit.webp'
const RADAR_MISS_ART = '/assets/arcade/radar-love/sonar-miss.webp'
const RADAR_SINK_ART = '/assets/arcade/radar-love/ship-sinking.webp'
const CHARADE_PROMPT_ART = [
  '/assets/arcade/say-without-saying/prompt-art.webp',
  '/assets/arcade/say-without-saying/prompt-art-everyday.webp',
  '/assets/arcade/say-without-saying/prompt-art-everyday-2.webp',
]
const FISH_SUIT_POSITIONS = { hearts: '0%', diamonds: '33.333%', clubs: '66.667%', spades: '100%' }
const CHARADE_PROMPT_SPRITES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 2, 10, 13, 12, 11]
const RADAR_REWARDS = [
  { id: 'silver-sonar', name: 'Silver Sonar', wins: 0 },
  { id: 'rose-signal', name: 'Rose Signal', wins: 1 },
  { id: 'moonlit-fleet', name: 'Moonlit Fleet', wins: 3 },
]
const UNO_CARD_ART = {
  coral: '/assets/arcade/my-one-and-only/faces-v2/coral.webp',
  plum: '/assets/arcade/my-one-and-only/faces-v2/plum.webp',
  teal: '/assets/arcade/my-one-and-only/faces-v2/teal.webp',
  gold: '/assets/arcade/my-one-and-only/faces-v2/gold.webp',
  wild: '/assets/arcade/my-one-and-only/faces-v2/wild.webp',
  back: '/assets/arcade/my-one-and-only/back.jpg',
}

function getActiveArcadePlayerUid(gameId, state, currentUid) {
  if (!state || state.status === 'finished') return null
  if (gameId === 'say-it-without-saying') {
    const activeIndex = state.phase === 'act' ? state.actorIndex : state.phase === 'guess' ? (state.actorIndex + 1) % 2 : -1
    return state.playerUids?.[activeIndex] || null
  }
  if (gameId === 'radar-love' && state.status === 'placing') {
    return state.fleetReady?.[currentUid] ? null : currentUid
  }
  if (gameId === 'our-little-pieces') return null
  return Number.isInteger(state.turnIndex) ? state.playerUids?.[state.turnIndex] || null : null
}

function getArcadeTileNotice(gameId, state, currentUid, partnerUid) {
  if (!state || !currentUid || !partnerUid || state.status === 'finished') return ''
  const ownIndex = state.playerUids?.indexOf(currentUid) ?? -1
  const partnerIndex = state.playerUids?.indexOf(partnerUid) ?? -1
  if (ownIndex < 0 || partnerIndex < 0) return ''
  if (gameId === 'my-one-and-only') {
    return state.turnIndex === ownIndex && state.lastActionBy === partnerUid ? 'YOUR TURN' : ''
  }
  if (gameId === 'catch-my-heart') {
    return state.turnIndex === ownIndex && state.lastAction?.playerUid === partnerUid ? 'YOUR TURN' : ''
  }
  if (gameId === 'radar-love') {
    if (state.status === 'placing' && state.fleetReady?.[partnerUid] && !state.fleetReady?.[currentUid]) return 'READY UP'
    return state.status === 'playing' && state.turnIndex === ownIndex && state.lastShot?.playerUid === partnerUid ? 'YOUR TURN' : ''
  }
  if (gameId === 'say-it-without-saying') {
    const lastActionBy = state.lastActionBy || (state.phase === 'guess' ? state.playerUids?.[state.actorIndex] : '')
    const partnerActed = lastActionBy === partnerUid || (state.phase === 'act' && state.guesses?.[partnerUid] !== undefined)
    const yourTurn = state.phase === 'guess'
      ? state.actorIndex === partnerIndex && Boolean(state.clips?.[partnerUid])
      : state.phase === 'act' && state.actorIndex === ownIndex && partnerActed
    return yourTurn ? 'YOUR TURN' : ''
  }
  if (gameId === 'our-little-pieces') {
    return state.moveCount > 0 && state.lastActionBy === partnerUid ? 'NEW MOVE' : ''
  }
  return ''
}

function playArcadeFeedback(audio, gameId, next, move, currentUid) {
  let event = 'tap'
  if (gameId === 'my-one-and-only') event = move.kind === 'draw' || move.kind === 'keep' ? 'draw' : 'card-play'
  if (gameId === 'catch-my-heart' && move.kind === 'ask') {
    event = next.lastAction?.bookedRanks?.length ? 'book' : next.lastAction?.found ? 'correct' : 'miss'
  }
  if (gameId === 'radar-love') {
    if (move.kind === 'place-ship' || move.kind === 'auto-place') event = 'place'
    else if (move.kind === 'shot') event = typeof next.lastShot?.sunkShipId === 'number' ? 'sink' : next.lastShot?.hit ? 'hit' : 'miss'
    else if (move.kind === 'ready') event = 'send'
  }
  if (gameId === 'our-little-pieces') event = move.kind === 'rotate-piece' ? 'rotate' : move.kind === 'move-piece' ? 'move' : 'tap'
  if (gameId === 'say-it-without-saying') {
    if (move.kind === 'charade') event = 'send'
    if (move.kind === 'guess') event = next.guesses?.[currentUid] === next.promptIndex ? 'correct' : 'miss'
  }
  audio?.playArcadeSfx?.(gameId, event)
  if (next.status === 'finished') audio?.playArcadeSfx?.(gameId, next.winnerUid ? 'win' : 'solved')
}

function ArcadeModal({ children, title, onClose, busy = false }) {
  return <section aria-busy={busy} aria-label={title} aria-modal="true" className="couple-arcade-modal" role="dialog">
    <header><h2>{title}</h2><button aria-label="Close games" className="arcade-close" onClick={onClose} type="button">×</button></header>
    {children}
  </section>
}

function unoFaceLabel(value) {
  const labels = { skip: '⊘', reverse: '↻', 'draw-two': '+2', wild: 'WILD', 'wild-draw-four': '+4' }
  return labels[value] || value || '?'
}

function UnoGame({ state, playerUid, otherName, onAction, onReset }) {
  const audio = useAudio()
  const ownIndex = state.playerUids.indexOf(playerUid)
  const hand = state.hands[playerUid] || []
  const top = state.discardPile.at(-1)
  const [wildId, setWildId] = useState('')
  const ownTurn = state.turnIndex === ownIndex
  const status = state.status === 'finished'
    ? state.winnerUid === playerUid ? 'You won this hand.' : `${otherName} won this hand.`
    : ownTurn ? 'Your turn' : `${otherName} is playing`

  async function play(card) {
    if (card.color === 'wild') {
      setWildId(card.id)
      audio?.playArcadeSfx?.('my-one-and-only', 'tap')
      return
    }
    await onAction({ kind: 'play', cardId: card.id })
  }

  return <div className="arcade-game arcade-uno">
    <div aria-label="Draw and discard piles" className="uno-table">
      <button aria-label="Draw a card" className="uno-draw-pile" disabled={!ownTurn || Boolean(state.drawnCardId)} onClick={() => onAction({ kind: 'draw' })} style={{ backgroundImage: `url("${UNO_CARD_ART.back}")` }} type="button" />
      <div aria-label={`Top card: ${UNO_CARD_LABELS[top?.value] || top?.value || 'none'}`} className={`uno-discard uno-${top?.color || state.activeColor}`} key={top?.id || 'empty-discard'} style={{ backgroundImage: `url("${UNO_CARD_ART[top?.color] || UNO_CARD_ART[state.activeColor]}")` }}><strong aria-hidden="true">{unoFaceLabel(top?.value)}</strong></div>
    </div>
    <p className="arcade-turn" aria-live="polite">{status}</p>
    {state.status === 'finished' ? <button className="arcade-primary" onClick={onReset} type="button">Play again</button> : <>
      <div className="uno-hand" aria-label="Your hand">
        {hand.map(card => {
          const canPlay = card.color === 'wild' || card.color === state.activeColor || card.value === top?.value
          const isRequiredDraw = state.drawnCardId ? card.id === state.drawnCardId : true
          return <button className={`uno-card uno-${card.color}`} disabled={!ownTurn || !canPlay || !isRequiredDraw} key={card.id} onClick={() => play(card)} style={{ backgroundImage: `url("${UNO_CARD_ART[card.color] || UNO_CARD_ART.back}")` }} type="button" aria-label={`${card.color} ${UNO_CARD_LABELS[card.value] || card.value}`}>
          <span aria-hidden="true">{unoFaceLabel(card.value)}</span>
          </button>
        })}
      </div>
      {wildId && <div className="uno-color-picker" role="group" aria-label="Choose a color">{UNO_COLORS_LIST.map(color => <button className={`uno-color-dot uno-${color}`} key={color} onClick={async () => { await onAction({ kind: 'play', cardId: wildId, color }); setWildId('') }} type="button" aria-label={`Choose ${color}`} />)}</div>}
      <div className="arcade-actions">
        {state.drawnCardId && <button className="arcade-secondary" onClick={() => onAction({ kind: 'keep' })} type="button">Keep it</button>}
      </div>
      <p className="arcade-small">{hand.length} in your hand · {state.hands[state.playerUids[1 - ownIndex]]?.length || 0} in theirs</p>
    </>}
  </div>
}

function FishGame({ state, playerUid, otherName, onAction, onReset }) {
  const ownIndex = state.playerUids.indexOf(playerUid)
  const hand = state.hands[playerUid] || []
  const otherUid = state.playerUids[1 - ownIndex]
  const ownTurn = state.turnIndex === ownIndex
  const status = state.status === 'finished'
    ? !state.winnerUid ? 'A perfect tie.' : state.winnerUid === playerUid ? 'You caught the most hearts.' : `${otherName} caught the most hearts.`
    : ownTurn ? 'Your turn' : `${otherName} is fishing`
  return <div className="arcade-game">
    <div className="fish-books"><span aria-label={`Your keepsakes: ${state.books[playerUid].length}`} className={`fish-book-score${state.lastAction?.playerUid === playerUid && state.lastAction.bookedRanks?.length ? ' is-booked' : ''}`} key={`${playerUid}-${state.lastAction?.playerUid}-${state.lastAction?.rank}-${state.lastAction?.bookedRanks?.length || 0}`}>♥ {state.books[playerUid].length}</span><span aria-label={`${state.drawPile.length} cards remaining in the draw pile`} className="fish-draw-pile" role="img" style={{ backgroundImage: `url("${FISH_CARD_BACK}")` }}><i aria-hidden="true">{state.drawPile.length}</i></span><span aria-label={`${otherName}'s keepsakes: ${state.books[otherUid].length}`} className={`fish-book-score${state.lastAction?.playerUid === otherUid && state.lastAction.bookedRanks?.length ? ' is-booked' : ''}`} key={`${otherUid}-${state.lastAction?.playerUid}-${state.lastAction?.rank}-${state.lastAction?.bookedRanks?.length || 0}`}>{otherName} ♥ {state.books[otherUid].length}</span></div>
    <p aria-live="polite" className="arcade-turn">{status}</p>
    <p className="arcade-small">Your cards</p>
    <div className="fish-hand">{hand.map(card => <span aria-label={`${card.rank} of ${card.suit}`} className={`fish-card fish-${card.suit}`} key={card.id}>{card.rank}<i aria-hidden="true" className="fish-suit-mark" style={{ backgroundImage: `url("${FISH_SUIT_ART}")`, backgroundPositionX: FISH_SUIT_POSITIONS[card.suit] }} /></span>)}</div>
    {state.status === 'finished' ? <button className="arcade-primary" onClick={onReset} type="button">Play again</button> : <>
      <p className="arcade-small">Ask {otherName} for a rank you hold.</p>
      <div className="fish-ranks">{RANKS.filter(rank => hand.some(card => card.rank === rank)).map(rank => <button disabled={!ownTurn} key={rank} onClick={() => onAction({ kind: 'ask', rank })} type="button">{rank}</button>)}</div>
      {state.lastAction && <p className="arcade-result" aria-live="polite">{state.lastAction.found ? 'They had it. Go again.' : state.lastAction.drew ? 'Go fish.' : 'The pond is empty.'}</p>}
    </>}
  </div>
}

function RadarGame({ state, playerUid, otherName, onAction, onReset }) {
  const audio = useAudio()
  const ownIndex = state.playerUids.indexOf(playerUid)
  const ownTurn = state.turnIndex === ownIndex
  const [selectedShip, setSelectedShip] = useState(0)
  const [vertical, setVertical] = useState(false)
  const shots = new Set(state.shots[playerUid] || [])
  const hits = new Set(state.hits[playerUid] || [])
  const fleet = state.fleets[playerUid] || []
  const boardSize = state.boardSize || (fleet.length === 3 ? 8 : RADAR_BOARD_SIZE)
  const targetFleet = state.fleets[state.playerUids[1 - ownIndex]] || []
  const isPlacing = state.status === 'placing'
  const visibleShips = isPlacing ? fleet.filter(ship => ship.cells.length) : targetFleet.filter(ship => ship.cells.length && ship.cells.every(cell => hits.has(cell)))
  const placedCells = new Set(fleet.flatMap(ship => ship.cells))
  const isReady = Boolean(state.fleetReady[playerUid])
  const allPlaced = fleet.length > 0 && fleet.every(ship => ship.cells.length === ship.length)
  const wins = state.wins?.[playerUid] || 0
  const status = isPlacing
    ? isReady ? `Fleet ready · waiting for ${otherName}` : 'Place your fleet'
    : state.status === 'finished'
    ? state.winnerUid === playerUid ? 'You found the fleet.' : `${otherName} found your fleet.`
    : ownTurn ? 'Your scan' : `${otherName} is scanning`
  return <div className="arcade-game radar-game">
    <p aria-live="polite" className="arcade-turn">{status}</p>
    <div aria-label="Fleet collectibles" className="arcade-collectibles">
      {RADAR_REWARDS.map(reward => <span className={wins >= reward.wins ? 'is-collected' : ''} key={reward.id} title={wins >= reward.wins ? `${reward.name} collected` : `${reward.name} · ${Math.max(0, reward.wins - wins)} wins to unlock`}>{wins >= reward.wins ? '✦' : '◇'} {reward.name}</span>)}
    </div>
    {isPlacing && !isReady && <>
      <div className="radar-ships" aria-label="Choose ship">
        {fleet.map(ship => {
          const shipName = ship.name || (fleet.length === RADAR_FLEET.length ? RADAR_FLEET[ship.id]?.name : null) || `Ship ${ship.id + 1}`
          return <button aria-label={`${shipName}, ${ship.length} spaces${ship.cells.length ? ', placed' : ''}`} aria-pressed={selectedShip === ship.id} className={`radar-ship-choice${selectedShip === ship.id ? ' selected' : ''}${ship.cells.length ? ' is-placed' : ''}`} key={ship.id} onClick={() => { setSelectedShip(ship.id); audio?.playArcadeSfx?.('radar-love', 'tap') }} type="button">
            <img alt="" aria-hidden="true" src={RADAR_FLEET_ART[ship.id] || RADAR_FLEET_ART[4]} />
            <span aria-hidden="true" className="radar-ship-length">{ship.length}</span>
          </button>
        })}
      </div>
      <div className="arcade-actions">
        <button className="arcade-secondary" onClick={() => { setVertical(value => !value); audio?.playArcadeSfx?.('radar-love', 'rotate') }} type="button">{vertical ? 'Vertical' : 'Horizontal'}</button>
        <button className="arcade-secondary" onClick={() => onAction({ kind: 'auto-place' })} type="button">Randomize fleet</button>
      </div>
      <p className="arcade-small">Choose a ship, direction, then tap its first space.</p>
    </>}
    <div aria-label="Radar grid" className="radar-grid" role="grid" style={{ '--radar-columns': boardSize }}>
      {Array.from({ length: boardSize * boardSize }, (_, index) => {
        const row = Math.floor(index / boardSize), column = index % boardSize, key = `${row}:${column}`
        const hit = hits.has(key)
        const miss = shots.has(key) && !hit
        const hasShip = placedCells.has(key)
        const cells = Array.from({ length: fleet[selectedShip]?.length || 0 }, (_, part) => vertical ? `${row + part}:${column}` : `${row}:${column + part}`)
        const skin = wins >= 3 ? 'radar-skin-moonlit' : wins >= 1 ? 'radar-skin-rose' : 'radar-skin-silver'
        const sunkShip = !isPlacing && visibleShips.find(ship => ship.cells.includes(key))
        const className = [isPlacing && hasShip ? `radar-ship ${skin}` : hit ? 'radar-hit' : miss ? 'radar-miss' : '', sunkShip ? 'radar-sunk-cell' : ''].filter(Boolean).join(' ')
        return <button aria-label={`Radar row ${row + 1}, column ${column + 1}${isPlacing && hasShip ? ', ship placed' : hit ? ', hit' : miss ? ', clear' : ''}`} className={className} disabled={isPlacing ? isReady : !ownTurn || shots.has(key) || state.status === 'finished'} key={key} onClick={() => isPlacing
          ? !isReady && onAction({ kind: 'place-ship', shipId: selectedShip, cells })
          : onAction({ kind: 'shot', row, column })} role="gridcell" type="button">{!isPlacing && (hit ? '✦' : miss ? '·' : '')}</button>
      })}
      {visibleShips.map(ship => {
        const origin = ship.cells[0]
        const [row, column] = origin.split(':').map(Number)
        const next = ship.cells[1]?.split(':').map(Number)
        const horizontal = Boolean(next && next[0] === row)
        const cellPercent = 100 / boardSize
        const gridGap = 3
        const shipExtent = `calc(${ship.length * cellPercent}% + ${(ship.length - 1) * gridGap}px)`
        const cellSize = `calc(${cellPercent}% - ${gridGap * (boardSize - 1) / boardSize}px)`
        const rowStep = `calc(${row * cellPercent}% + ${row * gridGap}px)`
        const columnStep = `calc(${column * cellPercent}% + ${column * gridGap}px)`
        const offset = `(${shipExtent} - ${cellSize}) / 2`
        const sinking = state.lastShot?.sunkShipId === ship.id
        return <span aria-hidden="true" className={`radar-vessel${horizontal ? ' is-horizontal' : ''}${sinking ? ' is-sinking' : ''}`} key={`ship-${ship.id}`} style={{
          height: shipExtent,
          left: horizontal ? `calc(${columnStep} + ${offset})` : columnStep,
          top: horizontal ? `calc(${rowStep} - ${offset})` : rowStep,
          width: cellSize,
          '--ship-rotation': horizontal ? 'rotate(90deg)' : 'none',
        }}><img alt="" src={RADAR_FLEET_ART[ship.id] || RADAR_FLEET_ART[4]} /></span>
      })}
      {!isPlacing && state.lastShot && <span
        aria-hidden="true"
        className="radar-scan-sweep"
        key={`radar-scan-${state.lastShot.row}-${state.lastShot.column}`}
      />}
      {!isPlacing && typeof state.lastShot?.sunkShipId === 'number' && (() => {
        const ship = targetFleet.find(item => item.id === state.lastShot.sunkShipId)
        if (!ship?.cells?.length) return null
        const coordinates = ship.cells.map(cell => cell.split(':').map(Number))
        const minRow = Math.min(...coordinates.map(([r]) => r)), maxRow = Math.max(...coordinates.map(([r]) => r))
        const minColumn = Math.min(...coordinates.map(([, c]) => c)), maxColumn = Math.max(...coordinates.map(([, c]) => c))
        const horizontal = minRow === maxRow
        const cellPercent = 100 / boardSize
        const extent = `calc(${ship.length * cellPercent}% + ${(ship.length - 1) * 3}px)`
        return <img
          alt=""
          aria-hidden="true"
          className="radar-sink-art"
          key={`radar-sink-${state.lastShot.row}-${state.lastShot.column}-${ship.id}`}
          src={RADAR_SINK_ART}
          style={{
            left: `calc(${(minColumn + maxColumn + 1) * cellPercent / 2}% + ${((minColumn + maxColumn) / 2 - (boardSize - 1) / (2 * boardSize)) * 3}px)`,
            top: `calc(${(minRow + maxRow + 1) * cellPercent / 2}% + ${((minRow + maxRow) / 2 - (boardSize - 1) / (2 * boardSize)) * 3}px)`,
            width: extent,
            '--sink-rotation': horizontal ? 'translate(-50%,-50%)' : 'translate(-50%,-50%) rotate(90deg)',
          }}
        />
      })()}
      {!isPlacing && state.lastShot?.hit && <img
        alt=""
        aria-hidden="true"
        className="radar-sonar-hit"
        key={`sonar-hit-${state.lastShot.row}-${state.lastShot.column}-${state.lastShot.sunkShipId ?? 'hit'}`}
        src={RADAR_HIT_ART}
        style={{
          left: `calc(${(state.lastShot.column + 0.5) * 100 / boardSize}% + ${(state.lastShot.column - (boardSize - 1) / 2) * 3 / boardSize}px)`,
          top: `calc(${(state.lastShot.row + 0.5) * 100 / boardSize}% + ${(state.lastShot.row - (boardSize - 1) / 2) * 3 / boardSize}px)`,
        }}
      />}
      {!isPlacing && state.lastShot && !state.lastShot.hit && <img
        alt=""
        aria-hidden="true"
        className="radar-sonar-miss"
        key={`sonar-miss-${state.lastShot.row}-${state.lastShot.column}`}
        src={RADAR_MISS_ART}
        style={{
          left: `calc(${(state.lastShot.column + 0.5) * 100 / boardSize}% + ${(state.lastShot.column - (boardSize - 1) / 2) * 3 / boardSize}px)`,
          top: `calc(${(state.lastShot.row + 0.5) * 100 / boardSize}% + ${(state.lastShot.row - (boardSize - 1) / 2) * 3 / boardSize}px)`,
        }}
      />}
    </div>
    {isPlacing && !isReady && <button className="arcade-primary" disabled={!allPlaced} onClick={() => onAction({ kind: 'ready' })} type="button">Ready</button>}
    {isPlacing && isReady && state.fleetReady[state.playerUids[1 - ownIndex]] && <p className="arcade-result">Both fleets ready · starting…</p>}
    {state.status === 'finished' && <button className="arcade-primary" onClick={onReset} type="button">Play again</button>}
  </div>
}

function OurLittlePieces({ state, onAction, onReset, audio }) {
  const [selectedPiece, setSelectedPiece] = useState('')
  const art = JIGSAW_ART[state.artIndex] || JIGSAW_ART[0]
  const entries = Object.entries(state.pieces)
  const correct = entries.filter(([id, piece]) => piece.slot === Number(id.slice(1)) && piece.rotation === 0).length
  const pieceAt = slot => entries.find(([, piece]) => piece.slot === slot)
  const finish = state.status === 'finished'
  const solvedCount = state.solvedCount || 0
  return <div className="arcade-game jigsaw-game">
    <p className="arcade-turn" aria-live="polite">{finish ? 'Solved together.' : `${correct} / 9 fit · ${art.title}`}</p>
    <div aria-label={`Puzzle art collection, ${JIGSAW_ART.filter(item => solvedCount >= item.unlockAt).length} of ${JIGSAW_ART.length} unlocked`} className="jigsaw-collection">
      {JIGSAW_ART.map(item => <span aria-label={solvedCount >= item.unlockAt ? `${item.title}, collected` : `${item.title}, locked; ${item.unlockAt - solvedCount} solves to unlock`} className={solvedCount >= item.unlockAt ? 'is-collected' : ''} key={item.title} role="img" title={solvedCount >= item.unlockAt ? `${item.title} collected` : `${item.title} · ${item.unlockAt - solvedCount} solves to unlock`} style={{ backgroundImage: `url("${item.src}")` }}><i aria-hidden="true">{solvedCount >= item.unlockAt ? '✓' : '·'}</i></span>)}
    </div>
    <JigsawUnboxing key={`unbox-${state.puzzleNumber || 1}-${art.src}`} image={art.src} title={art.title} audio={audio} />
    <div aria-label="Shared three-dimensional jigsaw puzzle" className="jigsaw-board" role="grid">
      {Array.from({ length: 9 }, (_, slot) => {
        const entry = pieceAt(slot)
        const [pieceId, piece] = entry || ['', null]
        const pieceIndex = Number(pieceId.slice(1))
        const classes = ['jigsaw-piece', pieceId === selectedPiece ? 'selected' : '', pieceId && pieceIndex === slot && piece.rotation === 0 ? 'piece-correct' : ''].filter(Boolean).join(' ')
        return <button aria-label={pieceId ? `Piece ${pieceIndex + 1}, rotated ${piece.rotation} degrees, at space ${slot + 1}` : `Empty space ${slot + 1}`} aria-pressed={pieceId === selectedPiece} className={classes} disabled={finish} key={slot} onClick={() => {
          if (!selectedPiece && pieceId) {
            setSelectedPiece(pieceId)
            audio?.playArcadeSfx?.('our-little-pieces', 'tap')
          }
          else if (selectedPiece === pieceId) {
            setSelectedPiece('')
            audio?.playArcadeSfx?.('our-little-pieces', 'tap')
          }
          else if (selectedPiece && pieceId) { onAction({ kind: 'move-piece', pieceId: selectedPiece, slot }); setSelectedPiece('') }
        }} role="gridcell" style={pieceId ? {
          backgroundImage: `url("${art.src}")`,
          backgroundPosition: `${(pieceIndex % 3) * 50}% ${Math.floor(pieceIndex / 3) * 50}%`,
          transform: `rotate(${piece.rotation}deg)`,
        } : undefined} type="button">{pieceId ? '' : '·'}</button>
      })}
    </div>
    <div className="arcade-actions">
      <button className="arcade-secondary" disabled={!selectedPiece || finish} onClick={() => selectedPiece && onAction({ kind: 'rotate-piece', pieceId: selectedPiece, direction: -1 })} type="button">↶ Rotate</button>
      <button className="arcade-secondary" disabled={!selectedPiece || finish} onClick={() => selectedPiece && onAction({ kind: 'rotate-piece', pieceId: selectedPiece, direction: 1 })} type="button">Rotate ↷</button>
    </div>
    {finish && <button className="arcade-primary" onClick={onReset} type="button">A new puzzle</button>}
  </div>
}

function CharadesGame({ state, playerUid, otherName, onAction, onReset }) {
  const audio = useAudio()
  const cameraRef = useRef(null)
  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const recordingTimeoutRef = useRef(0)
  const chunksRef = useRef([])
  const [recording, setRecording] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [clip, setClip] = useState(null)
  const [cameraError, setCameraError] = useState('')
  const [clipUrl, setClipUrl] = useState('')
  const [working, setWorking] = useState(false)
  const actorUid = state.playerUids[state.actorIndex]
  const isActor = actorUid === playerUid
  const prompt = SAY_IT_WITHOUT_SAYING_PROMPTS[state.promptIndex] || SAY_IT_WITHOUT_SAYING_PROMPTS[0]
  const promptSprite = CHARADE_PROMPT_SPRITES[state.promptIndex % CHARADE_PROMPT_SPRITES.length] ?? 0
  const promptArt = CHARADE_PROMPT_ART[Math.floor(state.promptIndex / CHARADE_PROMPT_SPRITES.length)] || CHARADE_PROMPT_ART[0]

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    if (clip) URL.revokeObjectURL(clip)
  }, [clip])

  useEffect(() => {
    const path = state.clips?.[actorUid]
    setClipUrl(typeof path === 'string' && path.startsWith('data:video/') ? path : '')
    return undefined
  }, [state.clips, actorUid])

  async function startCamera() {
    try {
      if (streamRef.current?.getTracks().some(track => track.readyState === 'live')) {
        setCameraReady(true)
        return
      }
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is unavailable in this browser.')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 15, max: 20 } }, audio: false })
      streamRef.current = stream
      if (cameraRef.current) cameraRef.current.srcObject = stream
      setCameraReady(true)
      setCameraError('')
      audio?.playArcadeSfx?.('say-it-without-saying', 'open')
    } catch {
      setCameraReady(false)
      setCameraError('Allow camera access to act this prompt.')
      audio?.playError?.()
    }
  }

  function startRecording() {
    if (!streamRef.current) { void startCamera(); return }
    if (!window.MediaRecorder) { setCameraError('Video recording is not supported in this browser.'); return }
    const mimeType = ['video/webm;codecs=vp8', 'video/webm', 'video/mp4;codecs=avc1', 'video/mp4'].find(type => MediaRecorder.isTypeSupported(type)) || ''
    const recorder = mimeType ? new MediaRecorder(streamRef.current, { mimeType, videoBitsPerSecond: 140000 }) : new MediaRecorder(streamRef.current, { videoBitsPerSecond: 140000 })
    recorderRef.current = recorder
    chunksRef.current = []
    recorder.ondataavailable = event => { if (event.data.size) chunksRef.current.push(event.data) }
    recorder.onstop = () => {
      window.clearTimeout(recordingTimeoutRef.current)
      if (cameraRef.current) cameraRef.current.srcObject = null
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || 'video/mp4' })
      if (blob.size > 190000) setCameraError('That clip is too large. Record a shorter one.')
      else setClip(URL.createObjectURL(blob))
      setRecording(false)
    }
    recorder.start(1000)
    recordingTimeoutRef.current = window.setTimeout(() => { if (recorder.state === 'recording') recorder.stop() }, 6000)
    setRecording(true)
    audio?.playArcadeSfx?.('say-it-without-saying', 'record')
  }

  async function submitClip() {
    if (!clip || !isActor || working) return
    setWorking(true)
    try {
      const response = await fetch(clip)
      const blob = await response.blob()
      if (blob.size > 190000) throw new Error('That clip is too large. Record a shorter one.')
      const clipDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = () => reject(new Error('Could not prepare the charade clip.'))
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })
      await onAction({ kind: 'charade', promptIndex: SAY_IT_WITHOUT_SAYING_PROMPTS.indexOf(prompt), clipDataUrl })
      streamRef.current?.getTracks().forEach(track => track.stop())
    } catch (error) {
      setCameraError(error.message || 'Could not save your charade.')
    } finally { setWorking(false) }
  }

  async function guess(guessId) {
    setWorking(true)
    try { await onAction({ kind: 'guess', guessId }) } finally { setWorking(false) }
  }

  const status = state.status === 'finished'
    ? !state.winnerUid ? `A tie · ${state.scores[0]}–${state.scores[1]}` : state.winnerUid === playerUid ? `You won · ${state.scores[0]}–${state.scores[1]}` : `${otherName} won · ${state.scores[0]}–${state.scores[1]}`
    : state.phase === 'act' && isActor ? 'Your turn to act' : state.phase === 'guess' && !isActor ? `${otherName} is acting` : `${otherName} is guessing`
  return <div className="arcade-game charades-game">
    <p className="arcade-turn" aria-live="polite">{status}</p>
    {state.status === 'finished' ? <button className="arcade-primary" onClick={onReset} type="button">Play again</button> : state.phase === 'act' && isActor ? <>
      <p className="charade-prompt">{prompt}</p>
      <span aria-hidden="true" className="charade-prompt-art" style={{ backgroundImage: `url("${promptArt}")`, backgroundPosition: `${(promptSprite % 4) * 33.333}% ${Math.floor(promptSprite / 4) * 33.333}%` }} />
      <p className="arcade-small">Act it out silently. Record, preview, then send.</p>
      <video autoPlay className="charade-camera" muted playsInline ref={cameraRef} src={clip || undefined} />
      {!clip ? <div className="arcade-actions">
        {!cameraReady && <button className="arcade-secondary" onClick={startCamera} type="button">Open camera</button>}
        {cameraReady && !recording && <button className="arcade-primary" onClick={startRecording} type="button">Record clip</button>}
      {recording && <button className="arcade-primary recording" onClick={() => { audio?.playArcadeSfx?.('say-it-without-saying', 'preview'); recorderRef.current?.stop() }} type="button">Stop &amp; preview</button>}
      </div> : <button className="arcade-primary" disabled={working} onClick={submitClip} type="button">{working ? 'Sending…' : 'Send clip'}</button>}
      {cameraError && <p className="arcade-error" role="alert">{cameraError}</p>}
    </> : state.phase === 'guess' && !isActor ? <>
      {clipUrl
        ? <video autoPlay className="charade-camera" controls playsInline src={clipUrl} />
        : <p className="arcade-small">Loading the charade…</p>}
      <p className="arcade-small">What are they acting?</p>
      <div className="charade-choices">{getSayWithoutSayingGuessOptions(state.promptIndex).map(index => <button disabled={working} key={index} onClick={() => guess(index)} type="button">{SAY_IT_WITHOUT_SAYING_PROMPTS[index]}</button>)}</div>
    </> : <p className="arcade-small">Your person is getting ready to act.</p>}
  </div>
}

export function CoupleArcade({ db, enabled, coupleId, players, currentUid, onClose, onOpenFourEver, fourEverDisabled = false, fourEverYourTurn = false }) {
  const audio = useAudio()
  const [games, setGames] = useState({})
  const [selectedGame, setSelectedGame] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const playerUids = players.map(player => player.uid)
  const otherPlayer = players.find(player => player.uid !== currentUid)
  const otherName = otherPlayer?.displayName || 'your person'
  const state = games[selectedGame]?.state
  const activeArcadePlayerUid = getActiveArcadePlayerUid(selectedGame, state, currentUid)

  useEffect(() => {
    audio?.setStage?.(selectedGame ? arcadeStage(selectedGame) : 'menu')
    return () => audio?.setStage?.('menu')
  }, [audio, selectedGame])

  useEffect(() => {
    if (!enabled || !db || !coupleId) return undefined
    return subscribeCoupleArcades(db, coupleId, setGames, () => setError('Could not sync these games.'))
  }, [db, coupleId, enabled])

  async function openGame(gameId) {
    setSelectedGame(gameId)
    setError('')
    if (!enabled || !db) {
      setGames(current => current[gameId] ? current : { ...current, [gameId]: { state: createCoupleArcadeState(gameId, playerUids) } })
      return
    }
    audio?.playArcadeSfx?.(gameId, 'open')
    setBusy(true)
    try { await prepareCoupleArcade(db, coupleId, gameId, playerUids) }
    catch (nextError) { audio?.playError?.(); setError(nextError.message || 'Could not open this game.') }
    finally { setBusy(false) }
  }

  async function action(move) {
    if (busy) return
    if (!enabled || !db) {
      try {
      const next = applyCoupleArcadeAction(games[selectedGame].state, selectedGame, currentUid, move)
        setGames(current => ({ ...current, [selectedGame]: { state: next } }))
        playArcadeFeedback(audio, selectedGame, next, move, currentUid)
      } catch (nextError) { audio?.playError?.(); setError(nextError.message || 'That move could not be saved.') }
      return
    }
    setBusy(true)
    try {
      const next = await runCoupleArcadeAction(db, coupleId, selectedGame, currentUid, move)
      playArcadeFeedback(audio, selectedGame, next, move, currentUid)
    }
    catch (nextError) { audio?.playError?.(); setError(nextError.message || 'That move could not be saved.') }
    finally { setBusy(false) }
  }

  async function reset() {
    if (busy) return
    if (!enabled || !db) {
      setGames(current => {
        const old = current[selectedGame]?.state || {}
        const state = createCoupleArcadeState(selectedGame, playerUids, Math.random, {
          wins: selectedGame === 'radar-love' ? old.wins : undefined,
          solvedCount: selectedGame === 'our-little-pieces' ? old.solvedCount : undefined,
          puzzleNumber: selectedGame === 'our-little-pieces' ? (old.puzzleNumber || 1) + 1 : undefined,
        })
        return { ...current, [selectedGame]: { state } }
      })
      audio?.playArcadeSfx?.(selectedGame, 'new-match')
      return
    }
    setBusy(true)
    audio?.playPhase?.('board')
    try { await resetCoupleArcade(db, coupleId, selectedGame, playerUids); audio?.playArcadeSfx?.(selectedGame, 'new-match') }
    catch (nextError) { audio?.playError?.(); setError(nextError.message || 'Could not start a new match.') }
    finally { setBusy(false) }
  }

  const selectedTitle = GAMES.find(game => game.id === selectedGame)?.name || 'A little game'
  let gameUi = null
  if (state && selectedGame === 'my-one-and-only') gameUi = <UnoGame state={state} playerUid={currentUid} otherName={otherName} onAction={action} onReset={reset} />
  if (state && selectedGame === 'catch-my-heart') gameUi = <FishGame state={state} playerUid={currentUid} otherName={otherName} onAction={action} onReset={reset} />
  if (state && selectedGame === 'radar-love') gameUi = <RadarGame state={state} playerUid={currentUid} otherName={otherName} onAction={action} onReset={reset} />
  if (state && selectedGame === 'our-little-pieces') gameUi = <OurLittlePieces state={state} onAction={action} onReset={reset} audio={audio} />
  if (state && selectedGame === 'say-it-without-saying') gameUi = <CharadesGame state={state} playerUid={currentUid} otherName={otherName} onAction={action} onReset={reset} />

  return createPortal(<ArcadeModal busy={busy} title={selectedGame ? selectedTitle : 'Our Arcade'} onClose={() => { audio?.playArcadeSfx?.(selectedGame || 'four-ever', 'tap'); onClose() }}>
    {!selectedGame ? <div className="arcade-game-list">{GAMES.map(game => {
      const notice = game.id === 'four-ever'
        ? fourEverYourTurn ? 'YOUR TURN' : ''
        : getArcadeTileNotice(game.id, games[game.id]?.state, currentUid, otherPlayer?.uid)
      const label = notice ? `${game.name}, ${notice.toLowerCase()}` : game.name
      return <button aria-label={label} className="arcade-game-tile" disabled={game.id === 'four-ever' ? (!onOpenFourEver || fourEverDisabled) : !COUPLE_ARCADE_IDS.includes(game.id)} key={game.id} onClick={() => game.id === 'four-ever' ? onOpenFourEver?.() : openGame(game.id)} type="button">
        <img alt="" className="arcade-game-art" src={game.icon} />
        {notice && <span aria-hidden="true" className="arcade-notification-badge">{notice}</span>}
      </button>
    })}</div> : <>
      <button className="arcade-back" onClick={() => { audio?.playArcadeSfx?.(selectedGame, 'tap'); setSelectedGame(''); setError('') }} type="button">All games</button>
      {state && <div className="arcade-player-rail" aria-label="Players">
        {players.slice(0, 2).map(player => {
          const active = player.uid === activeArcadePlayerUid
          return <div className={`arcade-player-badge${active ? ' is-active' : ''}`} key={player.uid}>
            <PlayerPortrait className={`arcade-player-portrait${active ? ' is-turn-active' : ''}`} label={`${player.displayName}${active ? ', taking this turn' : ''}`} player={player} />
          </div>
        })}
      </div>}
      {busy && !state ? <p role="status">Opening…</p> : gameUi}
    </>}
    {error && <p className="arcade-error" role="alert">{error}</p>}
  </ArcadeModal>, document.body)
}
