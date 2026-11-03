import { TruceTradeModal } from './TruceTradeModal.jsx'
import { BrandIcon } from './BrandIcon.jsx'
import { musicStageFor } from '../audio/musicPatterns.js'
import { PlayerPortrait } from './PlayerPortrait.jsx'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { useFirebaseApp } from '../features/couple/FirebaseAppContext.jsx'
import { useSession } from '../features/session/SessionProvider.jsx'
import { activityRegistry } from '../features/session/activityRegistry.jsx'
import { duelRegistry } from '../features/session/duelRegistry.jsx'
import { advanceNightStep, changeNightTrade, canAnswerStep, finishIndependentNight, getNightProgress, isIndependentActivity, makeRollSteps } from '../features/session/independentNight.js'
import { runNightCommand, subscribeToNightSteps } from '../features/session/independentNightService.js'
import { buildFinalSummary } from '../features/session/sessionLogic.js'
import { getWavelengthPromptsForSession, isWavelengthCommit, WAVELENGTH_DUEL_ID } from '../features/session/wavelengthDuelData.js'
import { commitChoice } from '../features/session/choiceCommitment.js'
import { useAudio } from '../audio/AudioProvider.jsx'
import { MysteryKeepsakeCard } from './MysteryKeepsakeCard.jsx'
import { DuelArena } from './DuelArena.jsx'
import { FinaleScreen } from './FinaleScreen.jsx'
import { NightTransitionBanner } from './NightTransitionBanner.jsx'
import { MomentCard } from './MomentCard.jsx'
import './independent-night.css'

const BoardScene = lazy(() => import('../board/BoardScene.jsx').then(module => ({ default: module.BoardScene })))
const JournalDrawer = lazy(() => import('./JournalDrawer.jsx').then(module => ({ default: module.JournalDrawer })))

export function IndependentNight() {
  const { couple, hasPartner, progress: coupleProgress } = useCouple()
  const { db, enabled, userId } = useFirebaseApp()
  const { session, gameOpen, boardState, journalEntries, applyPreviewNight, startFreshSession, canRecoverSession, error: providerError } = useSession()
  const selectedIdStorageKey = `at-long-last:selected-night-step:${session?.id || 'none'}:${userId || 'preview'}`
  const [selectedId, setSelectedId] = useState(() => {
    try { return sessionStorage.getItem(selectedIdStorageKey) || null } catch { return null }
  })
  const audio = useAudio()
  const [steps, setSteps] = useState([])
  const [loaded, setLoaded] = useState(!enabled)
  const [previewPlayer, setPreviewPlayer] = useState(0)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [rolling, setRolling] = useState(false)
  const [boardReady, setBoardReady] = useState(false)
  const [rollGesture, setRollGesture] = useState(null)
  const [tradeOpen, setTradeOpen] = useState(false)
  const [journalOpen, setJournalOpen] = useState(false)
  const lock = useRef(false)
  const timer = useRef(null)
  const arrivalCueKeyRef = useRef('')
  const playerIndex = enabled ? session.players.findIndex(player => player.uid === userId) : previewPlayer
  const progress = getNightProgress(session, steps, playerIndex)
  const selected = steps.find(step => step.id === selectedId && canAnswerStep(step, playerIndex, progress.readyToReveal))
  const entry = selected?.kind === 'activity' ? activityRegistry[selected.type] : null
  const Activity = entry?.render
  const duel = selected?.kind === 'duel' ? duelRegistry[selected.type] : null
  const duelSession = selected?.kind === 'duel' ? { ...session, round: selected.round, currentDuel: { id: selected.type, attempt: 1 }, duelResults: {} } : null

  useEffect(() => {
    try {
      if (selectedId) sessionStorage.setItem(selectedIdStorageKey, selectedId)
      else sessionStorage.removeItem(selectedIdStorageKey)
    } catch { /* Keep the night usable when tab storage is unavailable. */ }
  }, [selectedId, selectedIdStorageKey])

  useEffect(() => {
    const active = selected?.kind === 'activity' ? { type: selected.type, vibe: entry?.vibe, state: selected.state } : null
    const phase = session.phase === 'finale' ? 'finale' : !gameOpen ? null : selected?.kind === 'duel' ? 'duel' : active ? 'activity' : 'turn'
    audio?.setStage?.(phase ? musicStageFor({ ...session, phase, currentDuel: duelSession?.currentDuel }, active) : 'menu')
    if (!gameOpen) {
      return
    }
    const themeId = coupleProgress?.selectedTheme || 'cozy'
    const arrivalKey = `${session.id}:${themeId}`
    if (arrivalCueKeyRef.current !== arrivalKey) {
      arrivalCueKeyRef.current = arrivalKey
      audio?.playThemeArrival?.(themeId)
    }
  }, [audio?.setStage, audio?.playThemeArrival, coupleProgress?.selectedTheme, gameOpen, selected?.id, selected?.state?.phase, entry?.vibe, session.id, session.phase])

  useEffect(() => {
    if (!enabled || !db) return undefined
    return subscribeToNightSteps(db, session.id, next => { setSteps(next); setLoaded(true) }, nextError => setError(nextError.message))
  }, [db, enabled, session.id])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    const exposed = {
      phase: session.phase === 'finale' ? 'finale' : selected ? selected.kind : 'turn',
      pacing: 'independent', playerIndex, round: Math.min(progress.nextRound, session.totalRounds),
      canAct: !working && (Boolean(selected) || progress.canRoll || progress.available.length > 0),
      ownRolls: progress.ownRolls, readyToReveal: progress.readyToReveal,
      comparisons: progress.comparisons,
      available: progress.available.map(step => ({ id: step.id, type: step.type, kind: step.kind })),
      activity: selected?.kind === 'activity' ? { id: selected.type, stage: selected.state.phase || 'input' } : null,
    }
    window.__atLongLastGameState = exposed
  }, [session.phase, selected, playerIndex, progress.nextRound, progress.ownRolls, progress.readyToReveal, progress.comparisons, progress.canRoll, progress.available, working])

  useEffect(() => () => { delete window.__atLongLastGameState }, [])

  async function run(command) {
    if (lock.current || playerIndex < 0 || !loaded) return
    lock.current = true
    setWorking(true)
    setError('')
    try {
      if (enabled) await runNightCommand(db, session.id, userId, command)
      else if (command.kind.startsWith('trade')) applyPreviewNight(changeNightTrade(session, playerIndex, command))
      else if (command.kind === 'roll') {
        const result = makeRollSteps(session, steps, playerIndex, command.dice, journalEntries)
        setSteps(current => [...current, ...result.created])
        applyPreviewNight(result.session)
      } else if (command.kind === 'submit') {
        const result = await advanceNightStep(session, steps, command.stepId, playerIndex, command.input)
        if (result) {
          setSteps(current => current.map(step => step.id === result.step.id ? result.step : step))
          applyPreviewNight(result.session)
        }
      } else if (command.kind === 'finish') {
        const result = finishIndependentNight(session, steps)
        applyPreviewNight(result.session, result.entries.map((item, index) => ({ ...item, id: `${session.id}-reveal-${index}` })))
      }
      return true
    } catch (nextError) { setError(nextError.message); return false }
    finally { lock.current = false; setWorking(false) }
  }

  async function roll(gesture) {
    if (!progress.canRoll || working || rolling || !boardReady || !loaded) return
    audio?.playAction?.()
    setRollGesture(gesture || null)
    setRolling(true)
    // One-shot development fixture keeps browser QA deterministic without
    // replacing global randomness used by Firebase and the renderer.
    const fixture = import.meta.env.DEV ? window.__atLongLastTestRoll : null
    if (import.meta.env.DEV) delete window.__atLongLastTestRoll
    const dice = fixture?.dice || [1, 2].map(() => Math.floor(Math.random() * 6) + 1)
    const round = progress.nextRound
    const ok = await run({ kind: 'roll', round, dice, history: journalEntries, ...(fixture ? { selectionSeed: fixture.selectionSeed } : {}) })
    if (ok) {
      setSelectedId(`roll-${round}-${playerIndex}`)
      timer.current = window.setTimeout(() => { setRolling(false); setRollGesture(null) }, 12000)
    } else {
      setRolling(false)
      setRollGesture(null)
    }
  }

  async function submit(input) {
    if (!selected) return
    if (selected.kind === 'duel' && selected.type === WAVELENGTH_DUEL_ID && !input.skipped && !input.skip) {
      const key = `at-long-last:night-duel:${session.id}:${selected.id}:${session.players[playerIndex].uid}`
      if (progress.readyToReveal && isWavelengthCommit(selected.state.results?.[String(playerIndex)])) {
        const saved = JSON.parse(sessionStorage.getItem(key) || 'null')
        if (!saved) { setError('Return to the tab where you sealed this challenge, or pass this card.'); return }
        input = { ...saved.result, nonce: saved.nonce }
      } else {
        const sealed = await commitChoice(input.excerpt)
        sessionStorage.setItem(key, JSON.stringify({ result: input, nonce: sealed.nonce }))
        input = { ...input, excerpt: `h=${sealed.commitment}` }
      }
    }
    const ok = await run({ kind: 'submit', stepId: selected.id, revealing: progress.readyToReveal, input })
    if (ok) {
      setSelectedId(null)
    }
  }

  if (!hasPartner || !couple || !gameOpen || playerIndex < 0) return null
  const phase = session.phase === 'finale' ? 'finale' : selected?.kind === 'activity' ? 'activity' : selected?.kind === 'keepsake' ? 'keepsake' : 'turn'
  const tonight = journalEntries.filter(item => item.sessionId === session.id)

  return (
    <section className={`screen active game-screen independent-night${selected && !rolling ? ' has-gameplay-overlay' : ''}`} data-board-theme={coupleProgress?.selectedTheme || 'cozy'}>
      <div className="board-wrap">
        <Suspense fallback={<div className="board-loading">Loading board…</div>}>
          <BoardScene activePlayerIndex={playerIndex} boardState={boardState} dice={session.lastMove?.dice} lastMove={session.lastMove} lastRoll={session.lastRoll}
            onReady={() => setBoardReady(true)} onPieceStep={() => audio?.playPieceStep?.()} onPieceMoveComplete={({ playerIndex: mover }) => {
              if (mover !== playerIndex) return
              if (timer.current) window.clearTimeout(timer.current)
              timer.current = null
              setRolling(false)
              setRollGesture(null)
            }} pacingMode="freeFlow" phase={phase} players={session.players}
            canRoll={progress.canRoll && loaded && boardReady && !working && !rolling} onDiceCast={audio?.playDiceCast} onDiceImpact={audio?.playDiceImpact}
            onDiceRattle={audio?.playDiceRattle} onRoll={roll} rollGesture={rollGesture}
            positions={session.positions} round={Math.min(progress.nextRound, session.totalRounds)} rolling={rolling && selectedId?.startsWith('roll-') && boardReady} themeId={coupleProgress?.selectedTheme || 'cozy'} />
        </Suspense>
        <div className="hud top">
          <button className="trade-hud-btn control-badge" type="button" aria-label={session.lastMove?.tradeOffer?.status === 'pending' && session.lastMove.tradeOffer.fromPlayerIndex !== playerIndex ? 'Review trade offer' : 'Trade'} onClick={() => setTradeOpen(true)}><BrandIcon className="control-badge-mark" name="trade" /><span className="trade-hud-label">{session.lastMove?.tradeOffer?.status === 'pending' && session.lastMove.tradeOffer.fromPlayerIndex !== playerIndex ? 'Review offer' : 'Trade'}</span></button>
        </div>
        <div className="hud players" aria-label="Players">
          {session.players.map((player, index) => <div key={player.uid} aria-label={`${player.displayName}${index === playerIndex ? ', you' : ', your person'}`} className={`player-strip${index === playerIndex ? ' active mine' : ''}`}>
            <PlayerPortrait player={player} label={`${player.displayName}${index === playerIndex ? ', you' : ', your person'}`} />
          </div>)}
        </div>
        {!selected && session.phase !== 'finale' && (progress.available.length > 0 || progress.readyToFinish || (!progress.canRoll && loaded)) && <div className="bottom-tray independent-tray">
          <div className="night-action-list" aria-label={progress.readyToReveal ? 'End of night reveals' : 'Your next moments'}>
            {progress.available.map(step => <button className="primary-btn alt" key={step.id} type="button" disabled={working || rolling || !loaded}
              onClick={() => { audio?.playAction?.(); setSelectedId(step.id) }}>
              {progress.readyToReveal ? 'Reveal: ' : ''}{step.state.momentCard && !step.state.momentResolution ? `${step.state.momentCard.category} moment` : step.kind === 'activity' ? activityRegistry[step.type].label : step.kind === 'duel' ? duelRegistry[step.type].label : 'Collect mystery card'} <small>· round {step.round}</small>
            </button>)}
          </div>
          {progress.readyToFinish && <button className="primary-btn" type="button" disabled={working} onClick={() => run({ kind: 'finish' })}>Open tonight’s reveals</button>}
          {!progress.canRoll && !progress.available.length && !progress.readyToFinish && loaded && <p className="support-copy">Your part is saved. {session.players[1 - playerIndex]?.displayName} still has moments to finish. You can return later.</p>}
          {!enabled && <button className="secondary-link" type="button" onClick={() => setPreviewPlayer(index => 1 - index)}>Preview as {session.players[1 - playerIndex]?.displayName}</button>}
        </div>}
      </div>
      <NightTransitionBanner phase={selected?.kind === 'duel' ? 'duel' : phase}
        transitionKey={`${session.id}:${selected?.id || session.phase}:${selected?.state?.phase || progress.nextRound}:${phase}`} playPhase={audio?.playPhase} />
      {selected && !rolling && <div className={`overlay-screen independent-overlay${selected.state.momentCard && !selected.state.momentResolution ? ' moment-card-overlay' : ''}`}>
        <button className="secondary-link night-back" type="button" disabled={working} onClick={() => setSelectedId(null)}>Back to board</button>
        <p className="night-seal-note">{progress.readyToReveal ? 'End of night · reveal together' : 'Your input · comparison saved for the end of the night'}</p>
        {selected.state.momentCard && !selected.state.momentResolution && <MomentCard key={`${selected.id}-moment`} card={selected.state.momentCard} disabled={working} onResolve={() => submit({ resolveMoment: true })} />}
        {(!selected.state.momentCard || selected.state.momentResolution) && selected.kind === 'activity' && Activity && <Activity key={`${selected.id}-${playerIndex}`} activity={{ ...selected, id: `${session.id}-${selected.id}`, state: isIndependentActivity(selected.type) ? { ...selected.state, turnIndex: playerIndex } : selected.state }}
          deferReveal={!progress.readyToReveal} disabled={working} error={error} onSkip={() => submit({ skip: true })} onSubmit={submit} playerIndex={playerIndex} players={session.players} />}
        {(!selected.state.momentCard || selected.state.momentResolution) && selected.kind === 'keepsake' && <MysteryKeepsakeCard key={selected.id} item={selected.state.keepsake} onReveal={() => audio?.playAction?.()} onCollect={() => submit({ collect: true })} player={session.players[playerIndex]} />}
        {selected.kind === 'duel' && progress.readyToReveal && isWavelengthCommit(selected.state.results?.[String(playerIndex)]) ? <div className="overlay-card"><h3>Open your sealed challenge</h3><button className="primary-btn" disabled={working} type="button" onClick={() => submit({})}>Reveal my challenge</button><button className="secondary-link" disabled={working} type="button" onClick={() => submit({ skip: true })}>Pass this card</button></div> : selected.kind === 'duel' && <DuelArena key={`${selected.id}-${playerIndex}`} duel={duel} session={duelSession} playerIndex={playerIndex} players={session.players}
          disabled={working} DuelComponent={duel.start} onComplete={submit} onSkip={() => submit({ highlight: 'Passed this time', time: 0, won: false, skipped: true })}
          wavelengthPrompts={selected.type === WAVELENGTH_DUEL_ID ? getWavelengthPromptsForSession(duelSession) : null} />}
      </div>}
      {(error || providerError) && <p className="error-copy night-error" role="alert">{error || providerError}</p>}
      {session.phase === 'finale' && <FinaleScreen session={session} finalSummary={buildFinalSummary(session, tonight)} journalEntries={journalEntries}
        themeId={coupleProgress?.selectedTheme || 'cozy'} players={session.players} canPlayAgain={canRecoverSession} working={working}
        onOpenScrapbook={() => setJournalOpen(true)} onPlayAgain={startFreshSession} />}
      <TruceTradeModal isOpen={tradeOpen} onClose={() => setTradeOpen(false)} session={session} playerIndex={playerIndex}
        onSendOffer={offer => run({ kind: 'tradeOffer', ...offer })}
        onRespondOffer={accept => run({ kind: 'tradeRespond', accept })}
        onDismissOffer={() => run({ kind: 'tradeDismiss' })} />
      <Suspense fallback={null}><JournalDrawer sessionId={session.id} entries={journalEntries} onClose={() => setJournalOpen(false)} open={journalOpen} /></Suspense>
    </section>
  )
}
