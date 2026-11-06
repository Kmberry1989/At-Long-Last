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
import { catchNightKiss, nightKissesCaughtByBothPlayers, sendNightKiss, subscribeToNightKisses } from '../features/session/nightKissService.js'
import { useAudio } from '../audio/AudioProvider.jsx'
import { MysteryKeepsakeCard } from './MysteryKeepsakeCard.jsx'
import { KISS_COURIER_VOICE_PROMPT, KissBookend } from './KissBookend.jsx'
import { DuelArena } from './DuelArena.jsx'
import { FinaleScreen } from './FinaleScreen.jsx'
import { NightTransitionBanner } from './NightTransitionBanner.jsx'
import { MomentCard } from './MomentCard.jsx'
import { VibeDial } from './VibeDial.jsx'
import './independent-night.css'

const BoardScene = lazy(() => import('../board/BoardScene.jsx').then(module => ({ default: module.BoardScene })))
const JournalDrawer = lazy(() => import('./JournalDrawer.jsx').then(module => ({ default: module.JournalDrawer })))

export function IndependentNight() {
  const { couple, hasPartner, progress: coupleProgress } = useCouple()
  const { db, enabled, userId } = useFirebaseApp()
  const { session, gameOpen, boardState, journalEntries, applyPreviewNight, startFreshSession, canRecoverSession, myVibeVote, submitVibeVote, working: providerWorking, error: providerError } = useSession()
  const selectedIdStorageKey = `at-long-last:selected-night-step:${session?.id || 'none'}:${userId || 'preview'}`
  const [selectedId, setSelectedId] = useState(() => {
    try { return sessionStorage.getItem(selectedIdStorageKey) || null } catch { return null }
  })
  const audio = useAudio()
  const [steps, setSteps] = useState([])
  const [nightKisses, setNightKisses] = useState({})
  const [nightKissesLoaded, setNightKissesLoaded] = useState(!enabled)
  const [sendIntroDismissed, setSendIntroDismissed] = useState(false)
  const [catchKissOpen, setCatchKissOpen] = useState(false)
  const [loaded, setLoaded] = useState(!enabled)
  const [previewPlayer, setPreviewPlayer] = useState(0)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [rolling, setRolling] = useState(false)
  const [rollingDice, setRollingDice] = useState(null)
  const [rollPresentation, setRollPresentation] = useState(null)
  const [cardDrawKey, setCardDrawKey] = useState(null)
  const [cardDrawReady, setCardDrawReady] = useState(false)
  const [coinFlipKey, setCoinFlipKey] = useState(null)
  const [coinOutcome, setCoinOutcome] = useState(null)
  const [coinGesture, setCoinGesture] = useState(null)
  const [boardReady, setBoardReady] = useState(false)
  const [rollGesture, setRollGesture] = useState(null)
  const [tradeOpen, setTradeOpen] = useState(false)
  const [journalOpen, setJournalOpen] = useState(false)
  const lock = useRef(false)
  const timer = useRef(null)
  const arrivalCueKeyRef = useRef('')
  const playerIndex = enabled ? session.players.findIndex(player => player.uid === userId) : previewPlayer
  const playerUid = session.players[playerIndex]?.uid
  const partnerUid = session.players[1 - playerIndex]?.uid
  const ownKiss = playerUid ? nightKisses[playerUid] : null
  const partnerKiss = partnerUid ? nightKisses[partnerUid] : null
  const partnerKissCaught = Boolean(partnerKiss?.caughtBy?.[playerUid])
  const bothKissesCaught = nightKissesCaughtByBothPlayers(nightKisses, session.players)
  const usesKissBookend = session.kissBookendVersion === 1
  const progress = getNightProgress(session, steps, playerIndex)
  const rollStep = rollPresentation ? steps.find(step => step.id === rollPresentation.stepId) : null
  const resumePendingStep = !rollPresentation && loaded ? steps.find(step => step.ownerIndex === playerIndex && step.state?.momentCard && !step.state?.momentResolution) : null
  const deferPieceMoveKey = rollPresentation
    ? rollPresentation.stage !== 'moving' && rollPresentation.stage !== 'confirm-landing' ? rollStep?.state?.move?.id || rollPresentation.stepId : null
    : resumePendingStep?.state?.move?.id || null
  const selected = steps.find(step => step.id === selectedId && canAnswerStep(step, playerIndex, progress.readyToReveal))
  const selectedContentReady = Boolean(selected && (cardDrawReady || !selected.state.momentCard || selected.state.momentResolution))
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
  useEffect(() => {
    if (!loaded || rollPresentation || session.phase !== 'turn' || playerIndex < 0) return
    const pending = steps.find(step => step.id === `roll-${progress.nextRound - 1}-${playerIndex}` && ((step.state?.momentPending) || (step.state?.momentCard && !step.state?.momentResolution)))
    if (!pending || selectedId === pending.id || cardDrawKey?.startsWith(`${pending.id}:`)) return
    if (pending.state.momentPending) {
      setRollPresentation({ stepId: pending.id, stage: 'confirm-landing', diceSettled: true, saved: true, resumed: true })
      return
    }
    setCoinOutcome(pending.state.coinResult || pending.state.momentCard.category)
    setRollPresentation({ stepId: pending.id, stage: 'drawing-card', diceSettled: true, saved: true, resumed: true })
    setCardDrawKey(`${pending.id}:card`)
  }, [cardDrawKey, loaded, playerIndex, progress.nextRound, rollPresentation, selectedId, session.phase, steps])
  useEffect(() => {
    setNightKisses({})
    setNightKissesLoaded(!enabled)
    setSendIntroDismissed(false)
    setCatchKissOpen(false)
    if (!enabled || !db || session.kissBookendVersion !== 1) return undefined
    return subscribeToNightKisses(db, session.id, next => { setNightKisses(next); setNightKissesLoaded(true) }, nextError => { setError(nextError.message); setNightKissesLoaded(true) })
  }, [db, enabled, session.id, session.kissBookendVersion])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    const exposed = {
      phase: session.phase === 'finale' ? 'finale' : selected ? selected.kind : 'turn',
      pacing: 'independent', playerIndex, round: Math.min(progress.nextRound, session.totalRounds),
      canAct: !working && (Boolean(selected) || progress.canRoll || progress.available.length > 0),
      canRoll: !working && !rolling && !rollPresentation && boardReady && loaded && progress.canRoll && (!usesKissBookend || Boolean(ownKiss)),
      rollStage: rollPresentation?.stage || null,
      ownRolls: progress.ownRolls, readyToReveal: progress.readyToReveal, readyToFinish: progress.readyToFinish,
      comparisons: progress.comparisons,
      available: progress.available.map(step => ({ id: step.id, type: step.type, kind: step.kind })),
      activity: selected?.kind === 'activity' ? { id: selected.type, stage: selected.state.phase || 'input' } : null,
    }
    window.__atLongLastGameState = exposed
    if (import.meta.env.DEV) window.__atLongLastNightSteps = steps.map(step => ({
      id: step.id, kind: step.kind, type: step.type, ready: step.ready,
      completed: step.completed, skipped: step.skipped,
      momentResolved: !step.state.momentPending && (!step.state.momentCard || Boolean(step.state.momentResolution)),
      resultCount: Object.keys(step.state.results || {}).length,
      entryCount: (step.state.entries || []).length,
      submittedBy: Object.keys(step.state.results || step.state.entries || {}),
    }))
  }, [session.phase, selected, playerIndex, progress.nextRound, progress.ownRolls, progress.readyToReveal, progress.comparisons, progress.canRoll, progress.available, steps, working, rolling, rollPresentation, boardReady, loaded, usesKissBookend, ownKiss])

  useEffect(() => () => { delete window.__atLongLastGameState; delete window.__atLongLastNightSteps }, [])

  async function run(command) {
    if (lock.current || playerIndex < 0 || !loaded) return
    lock.current = true
    setWorking(true)
    setError('')
    try {
      let commandResult = true
      if (enabled) commandResult = await runNightCommand(db, session.id, userId, command) || true
      else if (command.kind.startsWith('trade')) applyPreviewNight(changeNightTrade(session, playerIndex, command))
      else if (command.kind === 'roll') {
        const rollResult = makeRollSteps(session, steps, playerIndex, command.dice, journalEntries)
        setSteps(current => [...current, ...rollResult.created])
        applyPreviewNight(rollResult.session)
      } else if (command.kind === 'submit') {
        const submitResult = await advanceNightStep(session, steps, command.stepId, playerIndex, command.input)
        if (submitResult) {
          setSteps(current => current.map(step => step.id === submitResult.step.id ? submitResult.step : step))
          applyPreviewNight(submitResult.session)
          commandResult = submitResult.step
        }
      } else if (command.kind === 'finish') {
        if (usesKissBookend && !bothKissesCaught) throw new Error('Catch your partner’s kiss before opening the coda.')
        const finishResult = finishIndependentNight(session, steps)
        applyPreviewNight(finishResult.session, finishResult.entries.map((item, index) => ({ ...item, id: `${session.id}-reveal-${index}` })))
      }
      return commandResult
    } catch (nextError) { setError(nextError.message); return false }
    finally { lock.current = false; setWorking(false) }
  }

  async function sendOpeningKiss(recording) {
    if (!playerUid) throw new Error('Player details are still loading.')
    const note = { ...recording, caughtBy: {} }
    if (enabled) await sendNightKiss(db, session.id, playerUid, recording)
    setNightKisses(current => ({ ...current, [playerUid]: note }))
  }

  async function catchOpeningKiss() {
    if (!playerUid || !partnerUid || !partnerKiss) throw new Error('Your partner’s kiss has not arrived yet.')
    if (enabled) await catchNightKiss(db, session.id, playerUid, partnerUid)
    setNightKisses(current => ({
      ...current,
      [partnerUid]: { ...current[partnerUid], caughtBy: { ...current[partnerUid]?.caughtBy, [playerUid]: true } },
    }))
  }

  async function roll(gesture) {
    if (!progress.canRoll || (usesKissBookend && !ownKiss) || working || rolling || rollPresentation || !boardReady || !loaded) return
    audio?.playAction?.()
    setRollGesture(gesture || null)
    setRolling(true)
    setRollingDice(null)
    const round = progress.nextRound
    const stepId = `roll-${round}-${playerIndex}`
    setRollPresentation({ stepId, stage: 'rolling', diceSettled: false, saved: false })
    await new Promise(resolve => { timer.current = window.setTimeout(resolve, 620) })
    // One-shot development fixture keeps browser QA deterministic without
    // replacing global randomness used by Firebase and the renderer.
    const fixture = import.meta.env.DEV ? window.__atLongLastTestRoll : null
    if (import.meta.env.DEV) delete window.__atLongLastTestRoll
    const dice = fixture?.dice || [1, 2].map(() => Math.floor(Math.random() * 6) + 1)
    setRollingDice(dice)
    const ok = await run({ kind: 'roll', round, dice, history: journalEntries, ...(fixture ? { selectionSeed: fixture.selectionSeed } : {}) })
    if (ok) {
      setRollPresentation(current => current?.stepId === stepId ? { ...current, saved: true, stage: current.diceSettled ? 'confirm-roll' : current.stage } : current)
    } else {
      setRolling(false)
      setRollingDice(null)
      setRollGesture(null)
      setRollPresentation(null)
    }
  }

  function acknowledgeDice() {
    if (rollPresentation?.stage !== 'confirm-roll') return
    audio?.playAction?.()
    setRollPresentation(current => current ? { ...current, stage: 'moving' } : current)
  }

  async function flipCoin(gesture) {
    if (lock.current || rollPresentation?.stage !== 'confirm-landing' || !rollStep?.state?.momentPending) return
    audio?.playAction?.()
    if (gesture?.source === 'button') audio?.playDiceCast?.()
    setCardDrawReady(false)
    setCoinGesture(gesture || { direction: { x: 0.1, y: -0.6 }, power: 0.55 })
    setRolling(true)
    setRollPresentation(current => current ? { ...current, stage: 'flipping-coin' } : current)
    const result = await run({ kind: 'submit', stepId: rollPresentation.stepId, revealing: false, input: { flipMoment: true, gesture } })
    if (!result?.state?.momentCard) {
      setRolling(false)
      setRollPresentation(current => current ? { ...current, stage: 'confirm-landing' } : current)
      return
    }
    setCoinOutcome(result.state.coinResult)
    setCoinFlipKey(`${rollPresentation.stepId}:coin`)
  }

  function beginCardDraw(key) {
    if (key !== coinFlipKey || !rollPresentation) return
    setCardDrawReady(false)
    setCardDrawKey(`${rollPresentation.stepId}:card`)
    setRollPresentation(current => current ? { ...current, stage: 'drawing-card' } : current)
  }

  async function submitVibe(weights) {
    await submitVibeVote(weights)
  }

  async function submit(input) {
    if (!selected) return
    const resolvingCard = Boolean(input.resolveMoment)
    if (resolvingCard) setRolling(true)
    if (selected.kind === 'duel' && selected.type === WAVELENGTH_DUEL_ID && !input.skipped && !input.skip) {
      const key = `at-long-last:night-duel:${session.id}:${selected.id}:${session.players[playerIndex].uid}`
      if (progress.readyToReveal && isWavelengthCommit(selected.state.results?.[String(playerIndex)])) {
        const saved = JSON.parse(sessionStorage.getItem(key) || 'null')
        if (!saved) { setError('Return to the tab where you sealed this challenge to reveal it.'); return }
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
    } else if (resolvingCard) {
      setRolling(false)
    }
  }

  if (!hasPartner || !couple || !gameOpen || playerIndex < 0) return null
  const phase = session.phase === 'finale' ? 'finale' : selected?.kind === 'activity' ? 'activity' : selected?.kind === 'keepsake' ? 'keepsake' : 'turn'
  const tonight = journalEntries.filter(item => item.sessionId === session.id)

  return (
    <section className={`screen active game-screen independent-night${selected && !rolling ? ' has-gameplay-overlay' : ''}`} data-board-theme={coupleProgress?.selectedTheme || 'cozy'}>
      <div className="board-wrap">
        <Suspense fallback={<div className="board-loading">Loading board…</div>}>
          <BoardScene activePlayerIndex={playerIndex} boardState={boardState} dice={rolling ? rollingDice : session.lastMove?.dice} lastMove={session.lastMove} moveEvents={steps.flatMap(step => [step.state?.move, step.state?.momentMove]).filter(Boolean)} lastRoll={session.lastRoll}
            deferPieceMoveKey={deferPieceMoveKey} cardDrawKey={cardDrawKey} onCardDrawComplete={key => { if (key === cardDrawKey) { setCardDrawReady(true); setSelectedId(rollPresentation?.stepId || null); setRollPresentation(null); setRolling(false); setRollGesture(null) } }}
            canFlipCoin={rollPresentation?.stage === 'confirm-landing'} onCoinFlip={flipCoin} coinFlipKey={coinFlipKey} coinOutcome={coinOutcome} coinGesture={coinGesture} onCoinFlipComplete={beginCardDraw} momentCardCategory={coinOutcome}
            onDiceSettled={() => setRollPresentation(current => current ? { ...current, diceSettled: true, stage: current.saved ? 'confirm-roll' : current.stage } : current)}
            onReady={() => setBoardReady(true)} onPieceStep={() => audio?.playPieceStep?.()} onPieceMoveComplete={({ playerIndex: mover }) => {
              if (mover !== playerIndex) return
              if (timer.current) window.clearTimeout(timer.current)
              timer.current = null
              if (rollPresentation) setRollPresentation(current => current ? { ...current, stage: 'confirm-landing' } : current)
              else setRolling(false)
            }} pacingMode="freeFlow" phase={phase} players={session.players}
            canRoll={progress.canRoll && (!usesKissBookend || Boolean(ownKiss)) && loaded && boardReady && !working && !rolling} onDiceCast={audio?.playDiceCast} onDiceImpact={audio?.playDiceImpact}
            onDiceRattle={audio?.playDiceRattle} onRoll={roll} rollGesture={rollGesture}
            positions={session.positions} round={Math.min(progress.nextRound, session.totalRounds)} rolling={rolling && boardReady && rollPresentation?.stage === 'rolling'} themeId={coupleProgress?.selectedTheme || 'cozy'} />
        </Suspense>
        <div className="hud top">
          <button className="trade-hud-btn control-badge" type="button" aria-label={session.lastMove?.tradeOffer?.status === 'pending' && session.lastMove.tradeOffer.fromPlayerIndex !== playerIndex ? 'Review trade offer' : 'Trade'} onClick={() => setTradeOpen(true)}><BrandIcon className="control-badge-mark" name="trade" /><span className="trade-hud-label">{session.lastMove?.tradeOffer?.status === 'pending' && session.lastMove.tradeOffer.fromPlayerIndex !== playerIndex ? 'Review offer' : 'Trade'}</span></button>
        </div>
        <div className="hud players" aria-label="Players">
          {session.players.map((player, index) => <div key={player.uid} aria-label={`${player.displayName}${index === playerIndex ? ', you' : ', your person'}`} className={`player-strip${index === playerIndex ? ' active mine' : ''}`}>
            <PlayerPortrait player={player} label={`${player.displayName}${index === playerIndex ? ', you' : ', your person'}`} />
          </div>)}
        </div>
        {rollPresentation?.stage === 'confirm-roll' && <div className="roll-ack-tray"><span>{rollingDice?.join(' · ') || rollStep?.state?.move?.dice?.join(' · ')}</span><button className="primary-btn" type="button" onClick={acknowledgeDice}>Continue</button></div>}
        {rollPresentation?.stage === 'confirm-landing' && <div className="roll-ack-tray"><button className="primary-btn" type="button" disabled={working || rolling} onClick={() => flipCoin({ source: 'button', direction: { x: 0.1, y: -0.6 }, power: 0.65 })}>Flip coin</button></div>}
        {session.phase === 'vibeSetup' && ownKiss && sendIntroDismissed && !myVibeVote && <div className="overlay-screen independent-overlay"><VibeDial disabled={providerWorking} playerName={session.players[playerIndex]?.displayName} onConfirm={submitVibe} /></div>}
        {session.phase === 'vibeSetup' && myVibeVote && <div className="overlay-screen independent-overlay"><div className="overlay-card vibe-wait">Waiting</div></div>}
        {!selected && !rollPresentation && session.phase !== 'finale' && session.phase !== 'vibeSetup' && (progress.available.length > 0 || progress.readyToFinish || (!progress.canRoll && loaded)) && <div className="bottom-tray independent-tray">
          <div className="night-action-list" aria-label={progress.readyToReveal ? 'End of night reveals' : 'Your next moments'}>
            {progress.available.map(step => <button className="primary-btn alt" data-night-step={step.id} key={step.id} type="button" disabled={working || rolling || !loaded}
              onClick={() => {
                audio?.playAction?.()
                if (step.state?.momentPending) setRollPresentation({ stepId: step.id, stage: 'confirm-landing', diceSettled: true, saved: true, resumed: true })
                else if (step.state?.momentCard && !step.state?.momentResolution) {
                  setCoinOutcome(step.state.coinResult || step.state.momentCard.category)
                  setRollPresentation({ stepId: step.id, stage: 'drawing-card', diceSettled: true, saved: true, resumed: true })
                  setCardDrawKey(`${step.id}:card`)
                } else setSelectedId(step.id)
              }}>
              {progress.readyToReveal ? 'Reveal: ' : ''}{step.state.momentPending ? 'Flip coin' : step.state.momentCard && !step.state.momentResolution ? 'Draw moment' : step.kind === 'activity' ? activityRegistry[step.type].label : step.kind === 'duel' ? duelRegistry[step.type].label : 'Collect mystery card'} <small>· round {step.round}</small>
            </button>)}
          </div>
          {progress.readyToFinish && usesKissBookend && !partnerKissCaught && <button className="primary-btn" type="button" disabled={working || !nightKissesLoaded || !partnerKiss} onClick={() => setCatchKissOpen(true)}>Catch their kiss</button>}
          {progress.readyToFinish && usesKissBookend && partnerKissCaught && !bothKissesCaught && <p className="kiss-bookend-wait">Waiting for their catch</p>}
          {progress.readyToFinish && (!usesKissBookend || bothKissesCaught) && <button className="primary-btn" type="button" disabled={working || (usesKissBookend && !nightKissesLoaded)} onClick={() => run({ kind: 'finish' })}>Open tonight’s reveals</button>}
          {!progress.canRoll && !progress.available.length && !progress.readyToFinish && loaded && <p className="support-copy">Your part is saved. {session.players[1 - playerIndex]?.displayName} still has moments to finish. You can return later.</p>}
          {!enabled && <button className="secondary-link" type="button" onClick={() => setPreviewPlayer(index => 1 - index)}>Preview as {session.players[1 - playerIndex]?.displayName}</button>}
        </div>}
      </div>
      <NightTransitionBanner phase={selected?.kind === 'duel' ? 'duel' : phase}
        transitionKey={`${session.id}:${selected?.id || session.phase}:${selected?.state?.phase || progress.nextRound}:${phase}`} playPhase={audio?.playPhase} />
      {selectedContentReady && !rolling && <div className={`overlay-screen independent-overlay${selected.state.momentCard && !selected.state.momentResolution ? ' moment-card-overlay' : ''}`}>
        {selected.state.momentCard && !selected.state.momentResolution && <MomentCard key={`${selected.id}-moment`} card={selected.state.momentCard} disabled={working} onResolve={() => submit({ resolveMoment: true })} />}
        {(!selected.state.momentCard || selected.state.momentResolution) && selected.kind === 'activity' && Activity && <Activity key={`${selected.id}-${playerIndex}`} activity={{ ...selected, id: `${session.id}-${selected.id}`, state: isIndependentActivity(selected.type) ? { ...selected.state, turnIndex: playerIndex } : selected.state }}
          deferReveal={!progress.readyToReveal} disabled={working} error={error} onSubmit={submit} playerIndex={playerIndex} players={session.players} />}
        {(!selected.state.momentCard || selected.state.momentResolution) && selected.kind === 'keepsake' && <MysteryKeepsakeCard key={selected.id} item={selected.state.keepsake} onReveal={() => audio?.playAction?.()} onCollect={() => submit({ collect: true })} player={session.players[playerIndex]} />}
        {selected.kind === 'duel' && progress.readyToReveal && isWavelengthCommit(selected.state.results?.[String(playerIndex)]) ? <div className="overlay-card"><button className="primary-btn" disabled={working} type="button" onClick={() => submit({})}>Reveal</button></div> : selected.kind === 'duel' && <DuelArena key={`${selected.id}-${playerIndex}`} duel={duel} session={duelSession} playerIndex={playerIndex} players={session.players}
          disabled={working} DuelComponent={duel.start} onComplete={submit} duelState={selected.state}
          wavelengthPrompts={selected.type === WAVELENGTH_DUEL_ID ? getWavelengthPromptsForSession(duelSession) : null} />}
      </div>}
      {(error || providerError) && <p className="error-copy night-error" role="alert">{error || providerError}</p>}
      {usesKissBookend && gameOpen && (!ownKiss || !sendIntroDismissed) && <div className="overlay-screen independent-overlay kiss-bookend-overlay">
        {!nightKissesLoaded ? <p className="kiss-bookend-loading" role="status">Opening the night</p> : <KissBookend mode="send" recording={Boolean(ownKiss)} voicePrompt={KISS_COURIER_VOICE_PROMPT} working={working} onSend={sendOpeningKiss} onContinue={() => setSendIntroDismissed(true)} />}
      </div>}
      {usesKissBookend && catchKissOpen && partnerKiss && <div className="overlay-screen independent-overlay kiss-bookend-overlay">
        <KissBookend mode="catch" recording={partnerKiss} voicePrompt={KISS_COURIER_VOICE_PROMPT} working={working} onCatch={catchOpeningKiss} onContinue={() => setCatchKissOpen(false)} />
      </div>}
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
