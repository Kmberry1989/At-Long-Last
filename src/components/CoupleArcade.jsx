import { useEffect, useRef, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { BrandIcon } from './BrandIcon.jsx'
import { applyCoupleArcadeAction, createCoupleArcadeState, runCoupleArcadeAction, subscribeCoupleArcades, prepareCoupleArcade, resetCoupleArcade, COUPLE_ARCADE_IDS } from '../features/couple/coupleArcadeService.js'
import { UNO_CARD_LABELS, UNO_COLORS_LIST, SAY_IT_WITHOUT_SAYING_PROMPTS } from '../features/session/coupleArcade.js'
import './couple-arcade.css'

const GAMES = [
  { id: 'my-one-and-only', name: 'My One and Only!', subtitle: 'A little card match' },
  { id: 'say-it-without-saying', name: 'Say Without Saying', subtitle: 'Camera charades' },
  { id: 'catch-my-heart', name: 'Catch My Heart', subtitle: 'Go Fish, together' },
  { id: 'radar-love', name: 'Radar Love', subtitle: 'A hidden-fleet duel' },
]
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

function playArcadeFeedback(audio, next, move, currentUid) {
  if (move.kind === 'play' || move.kind === 'draw' || move.kind === 'charade') audio?.playCardSlide?.()
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
    <div className={`uno-discard uno-${state.activeColor}`}><span>{state.activeColor}</span><strong>{UNO_CARD_LABELS[top?.value] || top?.value || '?'}</strong></div>
    <p className="arcade-turn" aria-live="polite">{status}</p>
    {state.status === 'finished' ? <button className="arcade-primary" onClick={onReset} type="button">Play again</button> : <>
      <div className="uno-hand" aria-label="Your hand">
        {hand.map(card => {
          const canPlay = card.color === 'wild' || card.color === state.activeColor || card.value === top?.value
          const isRequiredDraw = state.drawnCardId ? card.id === state.drawnCardId : true
          return <button className={`uno-card uno-${card.color}`} disabled={!ownTurn || !canPlay || !isRequiredDraw} key={card.id} onClick={() => play(card)} type="button" aria-label={`${card.color} ${UNO_CARD_LABELS[card.value] || card.value}`}>
          {UNO_CARD_LABELS[card.value] || card.value}
          </button>
        })}
      </div>
      {wildId && <div className="uno-color-picker" role="group" aria-label="Choose a color">{UNO_COLORS_LIST.map(color => <button className={`uno-color-dot uno-${color}`} key={color} onClick={async () => { await onAction({ kind: 'play', cardId: wildId, color }); setWildId('') }} type="button" aria-label={`Choose ${color}`} />)}</div>}
      <div className="arcade-actions"><button className="arcade-primary" disabled={!ownTurn || Boolean(state.drawnCardId)} onClick={() => onAction({ kind: 'draw' })} type="button">Draw a card</button>
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
  const shots = new Set(state.shots[playerUid] || [])
  const hits = new Set(state.hits[playerUid] || [])
  const status = state.status === 'finished'
    ? state.winnerUid === playerUid ? 'You found the fleet.' : `${otherName} found your fleet.`
    : ownTurn ? 'Your scan' : `${otherName} is scanning`
  return <div className="arcade-game radar-game">
    <p aria-live="polite" className="arcade-turn">{status}</p>
    <div aria-label="Radar grid" className="radar-grid" role="grid">
      {Array.from({ length: 64 }, (_, index) => {
        const row = Math.floor(index / 8), column = index % 8, key = `${row}:${column}`
        const hit = hits.has(key)
        const miss = shots.has(key) && !hit
        return <button aria-label={`Radar row ${row + 1}, column ${column + 1}${hit ? ', hit' : miss ? ', clear' : ''}`} className={hit ? 'radar-hit' : miss ? 'radar-miss' : ''} disabled={!ownTurn || shots.has(key) || state.status === 'finished'} key={key} onClick={() => onAction({ kind: 'shot', row, column })} role="gridcell" type="button">{hit ? '✦' : miss ? '·' : ''}</button>
      })}
    </div>
    {state.status === 'finished' && <button className="arcade-primary" onClick={onReset} type="button">Play again</button>}
  </div>
}

function CharadesGame({ state, playerUid, otherName, onAction, onReset }) {
  const cameraRef = useRef(null)
  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const recordingTimeoutRef = useRef(0)
  const chunksRef = useRef([])
  const [recording, setRecording] = useState(false)
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
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is unavailable in this browser.')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 15, max: 20 } }, audio: false })
      streamRef.current = stream
      if (cameraRef.current) cameraRef.current.srcObject = stream
      setCameraError('')
    } catch {
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
        {!streamRef.current && <button className="arcade-secondary" onClick={startCamera} type="button">Open camera</button>}
        {streamRef.current && !recording && <button className="arcade-primary" onClick={startRecording} type="button">Record clip</button>}
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
      setGames(current => ({ ...current, [selectedGame]: { state: createCoupleArcadeState(selectedGame, playerUids) } }))
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
  if (state && selectedGame === 'say-it-without-saying') gameUi = <CharadesGame state={state} playerUid={currentUid} otherName={otherName} onAction={action} onReset={reset} />

  return <ArcadeModal title={selectedGame ? selectedTitle : 'A little game'} onClose={onClose}>
    {!selectedGame ? <div className="arcade-game-list">{GAMES.map(game => <button className="arcade-game-tile" disabled={!COUPLE_ARCADE_IDS.includes(game.id)} key={game.id} onClick={() => openGame(game.id)} type="button"><strong>{game.name}</strong><span>{game.subtitle}</span><BrandIcon name="chevron" /></button>)}</div> : <>
      <button className="arcade-back" onClick={() => { setSelectedGame(''); setError('') }} type="button">All games</button>
      {busy && !state ? <p role="status">Opening…</p> : gameUi}
    </>}
    {error && <p className="arcade-error" role="alert">{error}</p>}
  </ArcadeModal>
}
