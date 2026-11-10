import { useEffect, useRef, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { arcadeStage } from '../audio/arcadeThemes.js'
import { PlayerPortrait } from './PlayerPortrait.jsx'
import './arcade-turn-portraits.css'
import { JigsawUnboxing } from './JigsawUnboxing.jsx'
import { applyCoupleArcadeAction, createCoupleArcadeState, runCoupleArcadeAction, subscribeCoupleArcades, prepareCoupleArcade, resetCoupleArcade, COUPLE_ARCADE_IDS } from '../features/couple/coupleArcadeService.js'
import { UNO_CARD_LABELS, UNO_COLORS_LIST, SAY_IT_WITHOUT_SAYING_PROMPTS } from '../features/session/coupleArcade.js'
import './couple-arcade.css'
import './uno-cards.css'

const GAMES = [
  { id: 'my-one-and-only', name: 'My One and Only!', icon: '/assets/arcade/icons/my-one-and-only.png' },
  { id: 'say-it-without-saying', name: 'Say Without Saying', icon: '/assets/arcade/icons/say-it-without-saying.png' },
  { id: 'catch-my-heart', name: 'Catch My Heart', icon: '/assets/arcade/icons/catch-my-heart.png' },
  { id: 'radar-love', name: 'Radar Love', icon: '/assets/arcade/icons/radar-love.png' },
  { id: 'our-little-pieces', name: 'Our Little Pieces', icon: '/assets/arcade/icons/our-little-pieces.png' },
]
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const JIGSAW_ART = [
  { title: 'Chose us', src: '/assets/moment-cards/chose-us.jpg', unlockAt: 0 },
  { title: 'First trip', src: '/assets/moment-cards/first-trip-photo.jpg', unlockAt: 1 },
  { title: 'A new tradition', src: '/assets/moment-cards/new-tradition.jpg', unlockAt: 3 },
  { title: 'Ordinary Tuesday', src: '/assets/moment-cards/ordinary-tuesday.jpg', unlockAt: 5 },
]
const RADAR_REWARDS = [
  { id: 'silver-sonar', name: 'Silver Sonar', wins: 0 },
  { id: 'rose-signal', name: 'Rose Signal', wins: 1 },
  { id: 'moonlit-fleet', name: 'Moonlit Fleet', wins: 3 },
]
const UNO_CARD_ART = {
  coral: '/assets/arcade/my-one-and-only/coral.jpg',
  plum: '/assets/arcade/my-one-and-only/plum.jpg',
  teal: '/assets/arcade/my-one-and-only/teal.jpg',
  gold: '/assets/arcade/my-one-and-only/gold.jpg',
  wild: '/assets/arcade/my-one-and-only/wild.jpg',
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

function playArcadeFeedback(audio, next, move, currentUid) {
  if (move.kind === 'play' || move.kind === 'draw' || move.kind === 'charade') audio?.playCardSlide?.()
  if (move.kind === 'place-ship' || move.kind === 'auto-place' || move.kind === 'move-piece') audio?.playCardSlide?.()
  if (move.kind === 'rotate-piece') audio?.playCardFlip?.()
  if (move.kind === 'ask') {
    if (next.lastAction?.found) audio?.playSuccess?.()
    else audio?.playCardFlip?.()
  }
  if (move.kind === 'shot') {
    if (next.lastShot?.hit) audio?.playSuccess?.()
    else audio?.playDuelPulse?.(1)
  }
  if (next.status === 'finished') {
    if (next.winnerUid) audio?.playConnectFourWin?.()
    else audio?.playSuccess?.()
  } else if (move.kind === 'guess' && next.guesses?.[currentUid] === next.promptIndex) audio?.playSuccess?.()
}

function ArcadeModal({ children, title, onClose }) {
  return <section aria-label={title} aria-modal="true" className="couple-arcade-modal" role="dialog">
    <header><h2>{title}</h2><button aria-label="Close games" className="arcade-close" onClick={onClose} type="button">×</button></header>
    {children}
  </section>
}

function UnoGame({ state, playerUid, otherName, onAction, onReset }) {
  const ownIndex = state.playerUids.indexOf(playerUid)
  const hand = state.hands[playerUid] || []
  const top = state.discardPile.at(-1)
  const [wildId, setWildId] = useState('')
  const ownTurn = state.turnIndex === ownIndex
  const status = state.status === 'finished'
    ? state.winnerUid === playerUid ? 'You won this hand.' : `${otherName} won this hand.`
    : ownTurn ? 'Your turn' : `${otherName} is playing`

  async function play(card) {
    if (card.color === 'wild') { setWildId(card.id); return }
    await onAction({ kind: 'play', cardId: card.id })
  }

  return <div className="arcade-game arcade-uno">
    <div aria-label="Draw and discard piles" className="uno-table">
      <button aria-label="Draw a card" className="uno-draw-pile" disabled={!ownTurn || Boolean(state.drawnCardId)} onClick={() => onAction({ kind: 'draw' })} style={{ backgroundImage: `url("${UNO_CARD_ART.back}")` }} type="button" />
      <div aria-label={`Top card: ${UNO_CARD_LABELS[top?.value] || top?.value || 'none'}`} className={`uno-discard uno-${top?.color || state.activeColor}`} style={{ backgroundImage: `url("${UNO_CARD_ART[top?.color] || UNO_CARD_ART[state.activeColor]}")` }}><strong>{UNO_CARD_LABELS[top?.value] || top?.value || '?'}</strong></div>
    </div>
    <p className="arcade-turn" aria-live="polite">{status}</p>
    {state.status === 'finished' ? <button className="arcade-primary" onClick={onReset} type="button">Play again</button> : <>
      <div className="uno-hand" aria-label="Your hand">
        {hand.map(card => {
          const canPlay = card.color === 'wild' || card.color === state.activeColor || card.value === top?.value
          const isRequiredDraw = state.drawnCardId ? card.id === state.drawnCardId : true
          return <button className={`uno-card uno-${card.color}`} disabled={!ownTurn || !canPlay || !isRequiredDraw} key={card.id} onClick={() => play(card)} style={{ backgroundImage: `url("${UNO_CARD_ART[card.color] || UNO_CARD_ART.back}")` }} type="button" aria-label={`${card.color} ${UNO_CARD_LABELS[card.value] || card.value}`}>
          {UNO_CARD_LABELS[card.value] || card.value}
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
    <div className="fish-books"><span>♥ {state.books[playerUid].length}</span><span>{otherName} ♥ {state.books[otherUid].length}</span></div>
    <p aria-live="polite" className="arcade-turn">{status}</p>
    <p className="arcade-small">Your cards</p>
    <div className="fish-hand">{hand.map(card => <span className={`fish-card fish-${card.suit}`} key={card.id}>{card.rank}<i>{card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}</i></span>)}</div>
    {state.status === 'finished' ? <button className="arcade-primary" onClick={onReset} type="button">Play again</button> : <>
      <p className="arcade-small">Ask {otherName} for a rank you hold.</p>
      <div className="fish-ranks">{RANKS.filter(rank => hand.some(card => card.rank === rank)).map(rank => <button disabled={!ownTurn} key={rank} onClick={() => onAction({ kind: 'ask', rank })} type="button">{rank}</button>)}</div>
      {state.lastAction && <p className="arcade-result" aria-live="polite">{state.lastAction.found ? 'They had it. Go again.' : state.lastAction.drew ? 'Go fish.' : 'The pond is empty.'}</p>}
    </>}
  </div>
}

function RadarGame({ state, playerUid, otherName, onAction, onReset }) {
  const ownIndex = state.playerUids.indexOf(playerUid)
  const ownTurn = state.turnIndex === ownIndex
  const [selectedShip, setSelectedShip] = useState(0)
  const [vertical, setVertical] = useState(false)
  const shots = new Set(state.shots[playerUid] || [])
  const hits = new Set(state.hits[playerUid] || [])
  const fleet = state.fleets[playerUid] || []
  const placedCells = new Set(fleet.flatMap(ship => ship.cells))
  const isPlacing = state.status === 'placing'
  const isReady = Boolean(state.fleetReady[playerUid])
  const allPlaced = fleet.length === 3 && fleet.every((ship, index) => ship.cells.length === [3, 2, 2][index])
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
        {fleet.map(ship => <button aria-pressed={selectedShip === ship.id} className={selectedShip === ship.id ? 'radar-ship-choice selected' : 'radar-ship-choice'} key={ship.id} onClick={() => setSelectedShip(ship.id)} type="button">Ship {ship.id + 1} · {ship.length}{ship.cells.length ? ' ✓' : ''}</button>)}
      </div>
      <div className="arcade-actions">
        <button className="arcade-secondary" onClick={() => setVertical(value => !value)} type="button">{vertical ? 'Vertical' : 'Horizontal'}</button>
        <button className="arcade-secondary" onClick={() => onAction({ kind: 'auto-place' })} type="button">Randomize fleet</button>
      </div>
      <p className="arcade-small">Choose a ship, direction, then tap its first space.</p>
    </>}
    <div aria-label="Radar grid" className="radar-grid" role="grid">
      {Array.from({ length: 64 }, (_, index) => {
        const row = Math.floor(index / 8), column = index % 8, key = `${row}:${column}`
        const hit = hits.has(key)
        const miss = shots.has(key) && !hit
        const hasShip = placedCells.has(key)
        const cells = Array.from({ length: fleet[selectedShip]?.length || 0 }, (_, part) => vertical ? `${row + part}:${column}` : `${row}:${column + part}`)
        const skin = wins >= 3 ? 'radar-skin-moonlit' : wins >= 1 ? 'radar-skin-rose' : 'radar-skin-silver'
        const className = isPlacing && hasShip ? `radar-ship ${skin}` : hit ? 'radar-hit' : miss ? 'radar-miss' : ''
        return <button aria-label={`Radar row ${row + 1}, column ${column + 1}${isPlacing && hasShip ? ', ship placed' : hit ? ', hit' : miss ? ', clear' : ''}`} className={className} disabled={isPlacing ? isReady : !ownTurn || shots.has(key) || state.status === 'finished'} key={key} onClick={() => isPlacing
          ? !isReady && onAction({ kind: 'place-ship', shipId: selectedShip, cells })
          : onAction({ kind: 'shot', row, column })} role="gridcell" type="button">{isPlacing && hasShip ? '●' : hit ? '✦' : miss ? '·' : ''}</button>
      })}
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
    <p className="arcade-small">Tap one piece, then another to swap. Rotate the selected piece in quarter turns.</p>
    <div aria-label="Shared three-dimensional jigsaw puzzle" className="jigsaw-board" role="grid">
      {Array.from({ length: 9 }, (_, slot) => {
        const entry = pieceAt(slot)
        const [pieceId, piece] = entry || ['', null]
        const pieceIndex = Number(pieceId.slice(1))
        const classes = ['jigsaw-piece', pieceId === selectedPiece ? 'selected' : '', pieceId && pieceIndex === slot && piece.rotation === 0 ? 'piece-correct' : ''].filter(Boolean).join(' ')
        return <button aria-label={pieceId ? `Piece ${pieceIndex + 1}, rotated ${piece.rotation} degrees, at space ${slot + 1}` : `Empty space ${slot + 1}`} aria-pressed={pieceId === selectedPiece} className={classes} disabled={finish} key={slot} onClick={() => {
          if (!selectedPiece && pieceId) setSelectedPiece(pieceId)
          else if (selectedPiece && selectedPiece !== pieceId) { onAction({ kind: 'move-piece', pieceId: selectedPiece, slot }); setSelectedPiece('') }
          else if (pieceId) setSelectedPiece(pieceId)
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
    } catch {
      setCameraReady(false)
      setCameraError('Allow camera access to act this prompt.')
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
      <p className="arcade-small">Act it out silently. Record, preview, then send.</p>
      <video autoPlay className="charade-camera" muted playsInline ref={cameraRef} src={clip || undefined} />
      {!clip ? <div className="arcade-actions">
        {!cameraReady && <button className="arcade-secondary" onClick={startCamera} type="button">Open camera</button>}
        {cameraReady && !recording && <button className="arcade-primary" onClick={startRecording} type="button">Record clip</button>}
        {recording && <button className="arcade-primary recording" onClick={() => recorderRef.current?.stop()} type="button">Stop &amp; preview</button>}
      </div> : <button className="arcade-primary" disabled={working} onClick={submitClip} type="button">{working ? 'Sending…' : 'Send clip'}</button>}
      {cameraError && <p className="arcade-error" role="alert">{cameraError}</p>}
    </> : state.phase === 'guess' && !isActor ? <>
      {clipUrl
        ? <video autoPlay className="charade-camera" controls playsInline src={clipUrl} />
        : <p className="arcade-small">Loading the charade…</p>}
      <p className="arcade-small">What are they acting?</p>
      <div className="charade-choices">{SAY_IT_WITHOUT_SAYING_PROMPTS.map((choice, index) => <button disabled={working} key={choice} onClick={() => guess(index)} type="button">{choice}</button>)}</div>
    </> : <p className="arcade-small">Your person is getting ready to act.</p>}
  </div>
}

export function CoupleArcade({ db, enabled, coupleId, players, currentUid, onClose }) {
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
    audio?.playCardSlide?.()
    setBusy(true)
    try { await prepareCoupleArcade(db, coupleId, gameId, playerUids) }
    catch (nextError) { setError(nextError.message || 'Could not open this game.') }
    finally { setBusy(false) }
  }

  async function action(move) {
    if (busy) return
    audio?.playChoiceTap?.()
    if (!enabled || !db) {
      try {
      const next = applyCoupleArcadeAction(games[selectedGame].state, selectedGame, currentUid, move)
        setGames(current => ({ ...current, [selectedGame]: { state: next } }))
        playArcadeFeedback(audio, next, move, currentUid)
      } catch (nextError) { setError(nextError.message || 'That move could not be saved.') }
      return
    }
    setBusy(true)
    try {
      const next = await runCoupleArcadeAction(db, coupleId, selectedGame, currentUid, move)
      playArcadeFeedback(audio, next, move, currentUid)
    }
    catch (nextError) { setError(nextError.message || 'That move could not be saved.') }
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
      return
    }
    setBusy(true)
    audio?.playPhase?.('board')
    try { await resetCoupleArcade(db, coupleId, selectedGame, playerUids) }
    catch (nextError) { setError(nextError.message || 'Could not start a new match.') }
    finally { setBusy(false) }
  }

  const selectedTitle = GAMES.find(game => game.id === selectedGame)?.name || 'A little game'
  let gameUi = null
  if (state && selectedGame === 'my-one-and-only') gameUi = <UnoGame state={state} playerUid={currentUid} otherName={otherName} onAction={action} onReset={reset} />
  if (state && selectedGame === 'catch-my-heart') gameUi = <FishGame state={state} playerUid={currentUid} otherName={otherName} onAction={action} onReset={reset} />
  if (state && selectedGame === 'radar-love') gameUi = <RadarGame state={state} playerUid={currentUid} otherName={otherName} onAction={action} onReset={reset} />
  if (state && selectedGame === 'our-little-pieces') gameUi = <OurLittlePieces state={state} onAction={action} onReset={reset} audio={audio} />
  if (state && selectedGame === 'say-it-without-saying') gameUi = <CharadesGame state={state} playerUid={currentUid} otherName={otherName} onAction={action} onReset={reset} />

  return <ArcadeModal title={selectedGame ? selectedTitle : 'Our Arcade'} onClose={onClose}>
    {!selectedGame ? <div className="arcade-game-list">{GAMES.map(game => <button aria-label={game.name} className="arcade-game-tile" disabled={!COUPLE_ARCADE_IDS.includes(game.id)} key={game.id} onClick={() => openGame(game.id)} type="button"><img alt="" className="arcade-game-art" src={game.icon} /></button>)}</div> : <>
      <button className="arcade-back" onClick={() => { setSelectedGame(''); setError('') }} type="button">All games</button>
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
  </ArcadeModal>
}
