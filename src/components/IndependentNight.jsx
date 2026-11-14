import { BrandIcon } from './BrandIcon.jsx'
import { musicStageFor } from '../audio/musicPatterns.js'
import { PlayerPortrait } from './PlayerPortrait.jsx'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { useFirebaseApp } from '../features/couple/FirebaseAppContext.jsx'
import { subscribePieceStyles } from '../features/couple/portraitService.js'
import { useSession } from '../features/session/SessionProvider.jsx'
import { activityRegistry } from '../features/session/activityRegistry.jsx'
import { duelRegistry } from '../features/session/duelRegistry.jsx'
import { advanceNightStep, changeNightTrade, canAnswerStep, finishIndependentNight, getNightProgress, hasSubmitted, isIndependentActivity, makeRollSteps, mergeNightSteps, updateNightTurn } from '../features/session/independentNight.js'
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
import './independent-night.css'

const BoardScene = lazy(() => import('../board/BoardScene.jsx').then(module => ({ default: module.BoardScene })))
const JournalDrawer = lazy(() => import('./JournalDrawer.jsx').then(module => ({ default: module.JournalDrawer })))
const DICE_SETTLE_FALLBACK_MS = 4500

export function IndependentNight() {
  const { couple, hasPartner, progress: coupleProgress } = useCouple()
  const { db, enabled, userId } = useFirebaseApp()
  const { session, gameOpen, boardState, journalEntries, applyPreviewNight, startFreshSession, canRecoverSession, error: providerError } = useSession()
  const selectedIdStorageKey = `at-long-last:selected-night-step:${session?.id || 'none'}:${userId || 'preview'}`
  const [selectedId, setSelectedId] = useState(() => {
    try { return sessionStorage.getItem(selectedIdStorageKey) || null } catch { return null }
  })
  const [activityMinimized, setActivityMinimized] = useState(false)
  const audio = useAudio()
  const [steps, setSteps] = useState([])
  const [nightKisses, setNightKisses] = useState({})
  const [nightKissesLoaded, setNightKissesLoaded] = useState(!enabled)
  const sendDismissKey = `at-long-last:kiss-intro-dismissed:${session?.id || 'none'}`
  const [sendIntroDismissed, setSendIntroDismissed] = useState(() => {
    try { return sessionStorage.getItem(sendDismissKey) === 'yes' } catch { return false }
  })
  const [catchKissOpen, setCatchKissOpen] = useState(false)
  const [loaded, setLoaded] = useState(!enabled)
  const [previewPlayer, setPreviewPlayer] = useState(0)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [rolling, setRolling] = useState(false)
  const [rollingDice, setRollingDice] = useState(null)
  const [activeMomentMoveKey, setActiveMomentMoveKey] = useState(null)
  const rollTraceRef = useRef([])
  const [rollPresentation, setRollPresentation] = useState(null)
  const [cardDrawKey, setCardDrawKey] = useState(null)
  const [cardDrawReady, setCardDrawReady] = useState(false)
  const [coinFlipKey, setCoinFlipKey] = useState(null)
  const [coinOutcome, setCoinOutcome] = useState(null)
  const [coinGesture, setCoinGesture] = useState(null)
  const [boardReady, setBoardReady] = useState(false)
  const [pieceStyles, setPieceStyles] = useState({})
  const [rollGesture, setRollGesture] = useState(null)
  const [journalOpen, setJournalOpen] = useState(false)
  const firstTurnRevealKey = `at-long-last:first-turn-toss:${session?.id || 'none'}:${userId || `preview-${previewPlayer}`}`
  const [firstTurnRevealDismissed, setFirstTurnRevealDismissed] = useState(() => {
    try { return sessionStorage.getItem(firstTurnRevealKey) === 'yes' } catch { return false }
  })
  const [firstTurnCoinFlipping, setFirstTurnCoinFlipping] = useState(false)
  const [firstTurnCoinRevealed, setFirstTurnCoinRevealed] = useState(false)
  const lock = useRef(false)
  const timer = useRef(null)
  const arrivalCueKeyRef = useRef('')
  const completedCardDrawKeysRef = useRef(new Set())
  useEffect(() => {
    if (!import.meta.env.DEV) return
    rollTraceRef.current = [...rollTraceRef.current, { stepId: rollPresentation?.stepId || null, stage: rollPresentation?.stage || null, saved: Boolean(rollPresentation?.saved), diceSettled: Boolean(rollPresentation?.diceSettled), rolling, at: Math.round(performance.now()) }].slice(-32)
    window.__atLongLastRollTrace = rollTraceRef.current
  }, [rollPresentation, rolling])
  useEffect(() => {
    if (!db || !couple?.id || !enabled) return undefined
    return subscribePieceStyles(db, couple.id, setPieceStyles, () => {})
  }, [db, couple?.id, enabled])

  const boardPlayers = useMemo(() => session.players.map(player => {
    const style = pieceStyles[player.uid]
    return style ? { ...player, pieceColor: style.pieceColor || player.color, pieceMaterial: style.pieceMaterial } : player
  }), [pieceStyles, session.players])
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
  const selectedCandidate = steps.find(step => step.id === selectedId)
  const selected = selectedCandidate && (
    canAnswerStep(selectedCandidate, playerIndex, progress.readyToReveal) ||
    selectedCandidate.kind === 'activity' && hasSubmitted(selectedCandidate, playerIndex)
  ) ? selectedCandidate : null
  const selectedContentReady = Boolean(selected && (cardDrawReady || !selected.state.momentCard || selected.state.momentResolution))
  const entry = selected?.kind === 'activity' ? activityRegistry[selected.type] : null
  const Activity = entry?.render
  const duel = selected?.kind === 'duel' ? duelRegistry[selected.type] : null
  const duelSession = selected?.kind === 'duel' ? { ...session, round: selected.round, currentDuel: { id: selected.type, attempt: 1 }, duelResults: {} } : null
  const isOpeningTurn = session?.phase === 'turn' && session.round === 1 && session.turnsTakenThisRound === 0 && !session.lastRoll && !session.lastMove
  const showFirstTurnCoin = isOpeningTurn && !firstTurnRevealDismissed

  useEffect(() => {
    try {
      if (selectedId) sessionStorage.setItem(selectedIdStorageKey, selectedId)
      else sessionStorage.removeItem(selectedIdStorageKey)
    } catch { /* Keep the night usable when tab storage is unavailable. */ }
  }, [selectedId, selectedIdStorageKey])

  useEffect(() => {
    setActivityMinimized(false)
  }, [selected?.id])

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
    return subscribeToNightSteps(db, session.id, next => {
      setSteps(current => mergeNightSteps(current, next))
      setLoaded(true)
    }, nextError => setError(nextError.message))
  }, [db, enabled, session.id])
  useEffect(() => {
    if (rollPresentation?.stage !== 'rolling' || !rollPresentation.saved || rollPresentation.diceSettled) return undefined
    const { stepId } = rollPresentation
    const timeout = window.setTimeout(() => {
      setRollPresentation(current => current?.stepId === stepId && current.stage === 'rolling'
        ? { ...current, diceSettled: true, stage: 'confirm-roll', settleFallback: true }
        : current)
    }, DICE_SETTLE_FALLBACK_MS)
    return () => window.clearTimeout(timeout)
  }, [rollPresentation])
  useEffect(() => {
    if (!loaded || rolling || rollPresentation || session.phase !== 'turn' || playerIndex < 0) return
    const pending = steps.find(step => step.ownerIndex === playerIndex && (
      (step.state?.momentPending && !step.state?.momentCard) ||
      (step.state?.momentCard && !step.state?.momentResolution)
    ))
    if (!pending) return
    if (pending.state.momentPending && !pending.state.momentCard) {
      // The Firestore listener can briefly lag behind the flip transaction.
      // Do not reopen the coin while its card is being drawn.
      if (cardDrawKey?.startsWith(`${pending.id}:`)) return
      if (selectedId) setSelectedId(null)
      setRollPresentation({ stepId: pending.id, stage: 'confirm-landing', diceSettled: true, saved: true, resumed: true })
      return
    }
    if (selectedId === pending.id || cardDrawKey?.startsWith(`${pending.id}:`)) return
    setCoinOutcome(pending.state.coinResult || pending.state.momentCard.category)
    setRollPresentation({ stepId: pending.id, stage: 'drawing-card', diceSettled: true, saved: true, resumed: true })
    setCardDrawKey(`${pending.id}:card`)
  }, [cardDrawKey, loaded, playerIndex, progress.nextRound, rolling, rollPresentation, selectedId, session.phase, steps])
  useEffect(() => {
    if (rollPresentation?.stage !== 'drawing-card') return
    const step = steps.find(item => item.id === rollPresentation.stepId)
    if (!step?.state?.momentPending || step.state.momentCard) return
    // A delayed animation callback may outlive a stale Firestore snapshot.
    // If the flip has not produced a saved card, restore the coin interaction.
    setCardDrawKey(null)
    setCardDrawReady(false)
    setRolling(false)
    setRollPresentation(current => current?.stepId === step.id && current.stage === 'drawing-card'
      ? { ...current, stage: 'confirm-landing' }
      : current)
  }, [rollPresentation, steps])
  useEffect(() => {
    setNightKisses({})
    setNightKissesLoaded(!enabled)
    setCatchKissOpen(false)
    if (!enabled || !db || session.kissBookendVersion !== 1) return undefined
    return subscribeToNightKisses(db, session.id, next => { setNightKisses(next); setNightKissesLoaded(true) }, nextError => { setError(nextError.message); setNightKissesLoaded(true) })
  }, [db, enabled, session.id, session.kissBookendVersion])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    const exposed = {
      phase: session.phase === 'finale' ? 'finale' : selected ? selected.kind : 'turn',
      selectedId, selectedContentReady, working, rolling, loaded,
      pacing: 'alternating', activeTurnPlayer: progress.activeTurnPlayer,
      playerIndex, round: Math.min(progress.nextRound, session.totalRounds),
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
      momentPending: Boolean(step.state.momentPending), hasMomentCard: Boolean(step.state.momentCard),
      hasMomentResolution: Boolean(step.state.momentResolution), ownerIndex: step.ownerIndex,
      diceReturned: Boolean(step.state.diceReturned), turnEnded: Boolean(step.state.turnEnded),
      turnEndRequested: Boolean(step.state.turnEndRequested),
      momentMovement: step.state.momentResolution?.movement ?? null,
      momentMove: step.state.momentMove || null,
      answerableByViewer: canAnswerStep(step, playerIndex, progress.readyToReveal),
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
      if (enabled) {
        commandResult = await runNightCommand(db, session.id, userId, command) || true
        if ((command.kind === 'submit' || command.kind === 'turn') && commandResult?.id) {
          setSteps(current => current.map(step => step.id === commandResult.id ? commandResult : step))
        }
      }
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
      } else if (command.kind === 'turn') {
        const result = updateNightTurn(session, steps, command.stepId, playerIndex, command.action)
        if (result) {
          setSteps(current => current.map(step => step.id === result.step.id ? result.step : step))
          applyPreviewNight(result.session)
          commandResult = result.step
        } else commandResult = false
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
      setRollPresentation(current => {
        if (current?.stepId === stepId) return { ...current, saved: true, stage: current.diceSettled ? 'confirm-roll' : current.stage }
        if (current) return current
        // If a concurrent recovery render cleared this presentation while the
        // transaction was saving, restore this roll and require its normal
        // settled-dice acknowledgement before movement can begin.
        return { stepId, stage: 'rolling', diceSettled: false, saved: true, resumed: true }
      })
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

  function acknowledgeLanding() {
    if (rollPresentation?.stage !== 'confirm-landing' || rollStep?.state?.momentPending) return
    audio?.playAction?.()
    setRollPresentation(null)
    setRolling(false)
    setRollingDice(null)
    setRollGesture(null)
    if (rollStep?.kind === 'activity' || rollStep?.kind === 'keepsake') setSelectedId(rollStep.id)
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
    setSteps(current => current.map(step => step.id === result.id ? result : step))
    setCoinOutcome(result.state.coinResult)
    setCoinFlipKey(`${rollPresentation.stepId}:coin`)
  }

  function beginCardDraw(key) {
    if (
      key !== coinFlipKey ||
      !rollPresentation ||
      rollPresentation.stage !== 'flipping-coin' ||
      key !== `${rollPresentation.stepId}:coin`
    ) return
    setCardDrawReady(false)
    setCardDrawKey(`${rollPresentation.stepId}:card`)
    setRollPresentation(current => current ? { ...current, stage: 'drawing-card' } : current)
  }

  function dismissKissIntro() {
    setSendIntroDismissed(true)
    try { sessionStorage.setItem(sendDismissKey, 'yes') } catch { /* Dismissal remains active for this view. */ }
  }

  function tossFirstTurnCoin() {
    if (firstTurnCoinFlipping || firstTurnCoinRevealed) return
    audio?.playAction?.()
    audio?.playDiceCast?.()
    setFirstTurnCoinFlipping(true)
    window.setTimeout(() => {
      setFirstTurnCoinFlipping(false)
      setFirstTurnCoinRevealed(true)
    }, 1500)
  }

  function continueAfterFirstTurnToss() {
    setFirstTurnRevealDismissed(true)
    try { sessionStorage.setItem(firstTurnRevealKey, 'yes') } catch { /* Keep the reveal dismissed for this view. */ }
  }

  async function submit(input) {
    if (!selected) return
    const resolvingCard = Boolean(input.resolveMoment || input.resolvePenalty)
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
    const result = await run({ kind: 'submit', stepId: selected.id, revealing: progress.readyToReveal, input })
    const ok = Boolean(result)
    if (ok) {
      if (resolvingCard && (result?.state?.momentMove || result?.state?.penaltyMove)) setActiveMomentMoveKey((result.state.momentMove || result.state.penaltyMove).id)
      else if (resolvingCard) setRolling(false)
      setSelectedId(resolvingCard && (result?.kind === 'activity' || result?.kind === 'keepsake') ? result.id : null)
    } else if (resolvingCard) {
      setRolling(false)
    }
  }

  if (!hasPartner || !couple || !gameOpen || playerIndex < 0) return null
  const phase = session.phase === 'finale' ? 'finale' : selected?.kind === 'activity' ? 'activity' : selected?.kind === 'keepsake' ? 'keepsake' : 'turn'
  const tonight = journalEntries.filter(item => item.sessionId === session.id)
  const pendingTurnStep = progress.pendingTurnStep
  const currentRollStep = pendingTurnStep || steps.find(step => step.id === `roll-${progress.ownRolls}-${playerIndex}`)
  const canEndTurn = Boolean(pendingTurnStep && !selected && !rollPresentation && !working && loaded)
  const canReturnDice = Boolean(currentRollStep && !currentRollStep.state?.diceReturned && !currentRollStep.state?.turnEnded && !currentRollStep.state?.turnEndRequested && !rolling)

  async function returnDiceToCup() {
    if (!canReturnDice || !currentRollStep || working) return
    audio?.playDiceRattle?.({ energy: 0.55 })
    await run({ kind: 'turn', action: 'return-dice', stepId: currentRollStep.id })
  }

  async function endTurn() {
    if (!canEndTurn || !pendingTurnStep) return
    audio?.playAction?.()
    const result = await run({ kind: 'turn', action: 'end-turn', stepId: pendingTurnStep.id })
    if (result?.state?.penaltyCard && !result.state.penaltyResolution) {
      setCardDrawReady(true)
      setSelectedId(result.id)
      audio?.playAction?.()
    }
  }

  return (
    <section className={`screen active game-screen independent-night${selected && !rolling ? ' has-gameplay-overlay' : ''}`} data-board-theme={coupleProgress?.selectedTheme || 'cozy'}>
      <div className="board-wrap">
        <Suspense fallback={<div className="board-loading">Loading board…</div>}>
          <BoardScene activePlayerIndex={playerIndex} boardState={boardState} dice={rolling ? rollingDice : session.lastMove?.dice} lastMove={session.lastMove} moveEvents={steps.flatMap(step => [step.state?.move, step.state?.momentMove, step.state?.penaltyMove]).filter(Boolean)} activeMomentMoveKey={activeMomentMoveKey} lastRoll={session.lastRoll}
            deferPieceMoveKey={deferPieceMoveKey} pausePieceMovement={Boolean(rollPresentation && ['rolling', 'confirm-roll'].includes(rollPresentation.stage))} cardDrawKey={cardDrawKey} onCardDrawComplete={key => {
              if (key !== cardDrawKey || completedCardDrawKeysRef.current.has(key)) return
              if (!rollPresentation || rollPresentation.stage !== 'drawing-card' || `${rollPresentation.stepId}:card` !== key) return
              const drawnStep = steps.find(step => step.id === rollPresentation.stepId)
              if (!drawnStep?.state?.momentCard) return
              completedCardDrawKeysRef.current.add(key)
              if (completedCardDrawKeysRef.current.size > 24) completedCardDrawKeysRef.current.delete(completedCardDrawKeysRef.current.values().next().value)
              setCardDrawReady(true)
              setSelectedId(rollPresentation.stepId)
              setRollPresentation(null)
              setRolling(false)
              setRollGesture(null)
            }}
            canFlipCoin={rollPresentation?.stage === 'confirm-landing'} onCoinFlip={flipCoin} coinFlipKey={coinFlipKey} coinOutcome={coinOutcome} coinGesture={coinGesture} onCoinFlipComplete={beginCardDraw} momentCardCategory={coinOutcome}
            onDiceSettled={() => setRollPresentation(current => current ? { ...current, diceSettled: true, stage: current.saved ? 'confirm-roll' : current.stage } : current)}
            onReady={() => setBoardReady(true)} onPieceStep={() => audio?.playPieceStep?.()} onPieceMoveComplete={({ playerIndex: mover, moveId }) => {
              if (mover !== playerIndex) return
              const completedStep = steps.find(step => step.ownerIndex === mover && (step.state?.move?.id === moveId || step.state?.momentMove?.id === moveId || step.state?.penaltyMove?.id === moveId))
              if (!completedStep) return
              if (completedStep.state?.move?.id === moveId) {
                if (rollPresentation?.stepId !== completedStep.id || rollPresentation.stage !== 'moving') return
                if (timer.current) window.clearTimeout(timer.current)
                timer.current = null
                setRollPresentation(current => current?.stepId === completedStep.id && current.stage === 'moving'
                  ? { ...current, stage: 'confirm-landing' }
                  : current)
              } else if ((completedStep.state?.momentMove?.id === moveId || completedStep.state?.penaltyMove?.id === moveId) && rolling) {
                if (timer.current) window.clearTimeout(timer.current)
                timer.current = null
                setRolling(false)
                setActiveMomentMoveKey(null)
              }
            }} pacingMode="freeFlow" phase={phase}
            canRoll={progress.canRoll && !selected && !showFirstTurnCoin && (!usesKissBookend || Boolean(ownKiss)) && loaded && boardReady && !working && !rolling} canReturnDice={canReturnDice} diceReturnKey={currentRollStep?.state?.diceReturned ? currentRollStep.id : null} onReturnDice={returnDiceToCup} onDiceCast={audio?.playDiceCast} onDiceImpact={audio?.playDiceImpact}
            onDiceRattle={audio?.playDiceRattle} onRoll={roll} rollGesture={rollGesture}
            players={boardPlayers} positions={session.positions} round={Math.min(progress.nextRound, session.totalRounds)} rolling={rolling && boardReady && rollPresentation?.stage === 'rolling'} themeId={coupleProgress?.selectedTheme || 'cozy'} />
        </Suspense>
        <div className="hud top">
          <button className={`turn-pass-switch${canEndTurn ? ' is-ready' : ''}`} type="button" aria-label="End turn" title="End turn" disabled={!canEndTurn} onClick={endTurn}>
            <span className="turn-pass-rail" aria-hidden="true"><span className="turn-pass-knob"><span /></span></span>
          </button>
        </div>
        <div className="hud players" aria-label="Players">
          {session.players.map((player, index) => <div key={player.uid} aria-label={`${player.displayName}${index === playerIndex ? ', you' : ', your person'}`} className={`player-strip${index === playerIndex ? ' active mine' : ''}`}>
            <PlayerPortrait className={index === progress.activeTurnPlayer ? 'is-turn-active' : ''} player={player} label={`${player.displayName}${index === playerIndex ? ', you' : ', your person'}`} />
          </div>)}
        </div>
        {showFirstTurnCoin && <div className="first-turn-toss" role="dialog" aria-modal="true" aria-label="First turn coin toss">
          <div className="first-turn-toss-card">
            <h2>Who rolls first?</h2>
            <button className={`first-turn-coin${firstTurnCoinFlipping ? ' is-flipping' : ''}${firstTurnCoinRevealed ? ` shows-player-${session.startingPlayerIndex}` : ''}`} style={{ '--coin-end-rotation': `${session.startingPlayerIndex === 0 ? 1440 : 1620}deg` }} type="button" onClick={tossFirstTurnCoin} disabled={firstTurnCoinFlipping || firstTurnCoinRevealed} aria-label="Flip the coin to decide who rolls first">
              <span className="first-turn-coin-inner">
                {session.players.map((player, index) => <span className={`first-turn-coin-face first-turn-coin-face-${index}`} key={player.uid}>
                  <PlayerPortrait player={player} label={`${player.displayName} on the coin`} />
                </span>)}
              </span>
            </button>
            {firstTurnCoinRevealed ? <><p className="first-turn-result">{session.players[session.startingPlayerIndex]?.displayName || 'Your person'} rolls first</p><button className="primary-btn" type="button" onClick={continueAfterFirstTurnToss}>Continue</button></> : <p className="first-turn-hint">Tap the coin</p>}
          </div>
        </div>}
        {rollPresentation?.stage === 'confirm-roll' && <div className="roll-ack-tray"><span>{rollingDice?.join(' · ') || rollStep?.state?.move?.dice?.join(' · ')}</span><button className="primary-btn" type="button" onClick={acknowledgeDice}>Continue</button></div>}
        {rollPresentation?.stage === 'confirm-landing' && rollStep?.state?.momentPending && <div className="roll-ack-tray coin-touch-hint" role="status">Tap the coin</div>}
        {rollPresentation?.stage === 'confirm-landing' && !rollStep?.state?.momentPending && <div className="roll-ack-tray landing-ack-tray"><span>Piece landed</span><button className="primary-btn" type="button" onClick={acknowledgeLanding}>Continue</button></div>}
        {(!selected || activityMinimized) && !rollPresentation && session.phase !== 'finale' && (progress.available.length > 0 || progress.readyToFinish || (!progress.canRoll && loaded)) && <div className="bottom-tray independent-tray">
          <div className="night-action-list" aria-label={progress.readyToReveal ? 'End of night reveals' : 'Your next moments'}>
            {progress.available.filter(step => !step.state?.momentPending).map(step => <button className="primary-btn alt" data-night-step={step.id} key={step.id} type="button" disabled={working || rolling || !loaded}
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
          {!progress.canRoll && !progress.available.length && !progress.readyToFinish && loaded && <p className="support-copy turn-status-copy">{progress.activeTurnPlayer === playerIndex ? 'Finish this moment, then pass the turn.' : `Waiting for ${session.players[progress.activeTurnPlayer]?.displayName || 'your partner'} to finish their turn.`}</p>}
          {!enabled && <button className="secondary-link" type="button" onClick={() => setPreviewPlayer(index => 1 - index)}>Preview as {session.players[1 - playerIndex]?.displayName}</button>}
        </div>}
      </div>
      <NightTransitionBanner phase={selected?.kind === 'duel' ? 'duel' : phase}
        transitionKey={`${session.id}:${selected?.id || session.phase}:${selected?.state?.phase || progress.nextRound}:${phase}`} playPhase={audio?.playPhase} />
      {selectedContentReady && !rolling && <div className={`overlay-screen independent-overlay${selected.state.penaltyCard && !selected.state.penaltyResolution ? ' moment-card-overlay cup-penalty-overlay' : selected.state.momentCard && !selected.state.momentResolution ? ' moment-card-overlay' : ''}`}>
        {canReturnDice && <button className="dice-return-chip" type="button" aria-label="Return dice to cup" title="Return dice to cup" onClick={returnDiceToCup}><BrandIcon name="dice" /></button>}
        {selected.state.penaltyCard && !selected.state.penaltyResolution && <><p className="cup-penalty-banner" role="alert">The dice were left out. Flush!</p><MomentCard key={`${selected.id}-cup-penalty`} card={selected.state.penaltyCard} disabled={working} onResolve={() => submit({ resolvePenalty: true })} /></>}
        {(!selected.state.penaltyCard || selected.state.penaltyResolution) && selected.state.momentCard && !selected.state.momentResolution && <MomentCard key={`${selected.id}-moment`} card={selected.state.momentCard} disabled={working} onResolve={() => submit({ resolveMoment: true })} />}
        {(!selected.state.momentCard || selected.state.momentResolution) && (!selected.state.penaltyCard || selected.state.penaltyResolution) && selected.kind === 'activity' && Activity && <Activity key={`${selected.id}-${playerIndex}`} activity={{ ...selected, id: `${session.id}-${selected.id}`, state: isIndependentActivity(selected.type) ? { ...selected.state, turnIndex: playerIndex } : selected.state }}
          deferReveal={false} disabled={working} error={error} isMinimized={activityMinimized}
          onToggleMinimize={() => setActivityMinimized(value => !value)} onRevealComplete={() => setSelectedId(null)} onSubmit={submit} playerIndex={playerIndex} players={session.players} />}
        {(!selected.state.momentCard || selected.state.momentResolution) && (!selected.state.penaltyCard || selected.state.penaltyResolution) && selected.kind === 'keepsake' && <MysteryKeepsakeCard key={selected.id} item={selected.state.keepsake} onReveal={() => audio?.playAction?.()} onCollect={() => submit({ collect: true })} player={session.players[playerIndex]} />}
        {selected.kind === 'duel' && progress.readyToReveal && isWavelengthCommit(selected.state.results?.[String(playerIndex)]) ? <div className="overlay-card"><button className="primary-btn" disabled={working} type="button" onClick={() => submit({})}>Reveal</button></div> : selected.kind === 'duel' && <DuelArena key={`${selected.id}-${playerIndex}`} duel={duel} session={duelSession} playerIndex={playerIndex} players={session.players}
          disabled={working} DuelComponent={duel.start} onComplete={submit} duelState={selected.state}
          wavelengthPrompts={selected.type === WAVELENGTH_DUEL_ID ? getWavelengthPromptsForSession(duelSession) : null} />}
      </div>}
      {(error || providerError) && <p className="error-copy night-error" role="alert">{error || providerError}</p>}
      {usesKissBookend && gameOpen && (!ownKiss || !sendIntroDismissed) && <div className="overlay-screen independent-overlay kiss-bookend-overlay">
        {!nightKissesLoaded ? <p className="kiss-bookend-loading" role="status">Opening the night</p> : <KissBookend mode="send" recording={Boolean(ownKiss)} featuredPlayer={session.players[1 - playerIndex]} voicePrompt={KISS_COURIER_VOICE_PROMPT} working={working} onSend={sendOpeningKiss} onContinue={dismissKissIntro} />}
      </div>}
      {usesKissBookend && catchKissOpen && partnerKiss && <div className="overlay-screen independent-overlay kiss-bookend-overlay">
        <KissBookend mode="catch" recording={partnerKiss} featuredPlayer={session.players[1 - playerIndex]} voicePrompt={KISS_COURIER_VOICE_PROMPT} working={working} onCatch={catchOpeningKiss} onContinue={() => setCatchKissOpen(false)} />
      </div>}
      {session.phase === 'finale' && <FinaleScreen session={session} finalSummary={buildFinalSummary(session, tonight)} journalEntries={journalEntries}
        themeId={coupleProgress?.selectedTheme || 'cozy'} players={session.players} canPlayAgain={canRecoverSession} working={working}
        onOpenScrapbook={() => setJournalOpen(true)} onPlayAgain={startFreshSession} />}
      <Suspense fallback={null}><JournalDrawer sessionId={session.id} entries={journalEntries} onClose={() => setJournalOpen(false)} open={journalOpen} /></Suspense>
    </section>
  )
}
