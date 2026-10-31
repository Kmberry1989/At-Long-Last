import { Suspense, lazy, startTransition, useEffect, useMemo, useRef, useState } from 'react'
import { DuelRevealOverlay } from './DuelRevealOverlay.jsx'
import { DuelArena } from './DuelArena.jsx'
import { FinaleScreen } from './FinaleScreen.jsx'

import { useAudio } from '../audio/AudioProvider.jsx'
import { LoveTank } from './LoveTank.jsx'
import { MysteryKeepsakeCard } from './MysteryKeepsakeCard.jsx'
import { TactileDiceCast } from './TactileDiceCast.jsx'
import { TruceTradeModal } from './TruceTradeModal.jsx'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { getPlayerPiece } from '../features/couple/playerAvatar.js'
import { activityRegistry } from '../features/session/activityRegistry.jsx'
import { duelRegistry } from '../features/session/duelRegistry.jsx'
import { getScrapbookMomentCount } from '../features/session/journalHelpers.js'
import {
  WAVELENGTH_DUEL_ID,
  getWavelengthPromptsForSession,
  isWavelengthCommit,
} from '../features/session/wavelengthDuelData.js'
import { useSession } from '../features/session/SessionProvider.jsx'
import { useSynth } from './useSynth.js'
import {
  ActiveTurnState,
  PartnerAwayState,
  WaitingState,
} from './PlayStates.jsx'

const BoardScene = lazy(() =>
  import('../board/BoardScene.jsx').then((module) => ({ default: module.BoardScene })),
)
const JournalDrawer = lazy(() =>
  import('./JournalDrawer.jsx').then((module) => ({ default: module.JournalDrawer })),
)

function getActivitySubmissionCount(state) {
  return Math.max(
    Object.keys(state?.answers || {}).length,
    Object.keys(state?.choices || {}).length,
    Object.keys(state?.sealed || {}).length,
    Object.keys(state?.values || {}).length,
    Object.keys(state?.results || {}).length,
    Object.keys(state?.submissions || {}).length,
    Object.keys(state?.captions || {}).length,
    state?.entries?.length || 0,
    state?.halves?.length || 0,
    state?.predictionId ? 1 : 0,
  )
}

export function GameScreen() {
  const { couple, hasPartner, progress } = useCouple()
  const { playAction, playPieceStep, playSuccess } = useAudio()
  const [pacingMode, setPacingMode] = useState(() => {
    try {
      return localStorage.getItem('atlonglast_pacing_mode') || 'freeFlow'
    } catch {
      return 'freeFlow'
    }
  })

  const togglePacingMode = () => {
    setPacingMode((current) => {
      const next = current === 'freeFlow' ? 'sharedSpotlight' : 'freeFlow'
      try {
        localStorage.setItem('atlonglast_pacing_mode', next)
      } catch {
        // Ignore storage errors
      }
      return next
    })
  }
  const [activityMinimized, setActivityMinimized] = useState(false)
  const {
    ackDuelReveal,
    activity,
    boardState,
    canRecoverSession,
    canRoll,
    canSpinDuel,
    claimSessionHost,
    chooseKeepsake,
    connectionState,
    continuePreviewDuel,
    dismissTradeOffer,
    error,
    enabled,
    finalSummary,
    forceDuelReveal,
    isHost,
    isSessionStale,
    journalEntries,
    myDuelResult,
    pendingTradeOffer,
    playerIndex,
    readyToPlay,
    gameOpen,
    respondTradeOffer,
    resumeSession,
    rollTurn,
    selectActivityOption,
    sendTradeOffer,
    session,
    sessionStatusMessage,
    skipActivity,
    skipDuel,
    spinDuelWheel,
    startFreshSession,
    submitActivityTurn,
    submitDuelResult,
    working,
  } = useSession()
  const [journalOpen, setJournalOpen] = useState(false)
  const [heartGuideOpen, setHeartGuideOpen] = useState(false)
  const [tradeModalOpen, setTradeModalOpen] = useState(false)
  const [diceRolling, setDiceRolling] = useState(false)
  const diceSettleTimerRef = useRef(null)
  const scrapbookMomentCount = getScrapbookMomentCount(journalEntries.filter(entry => entry.sessionId === session?.id))
  const lastMoveKey = session?.lastMove
    ? [
        session.lastMove.playerIndex,
        session.lastMove.from,
        session.lastMove.to,
        session.lastMove.steps,
      ].join(':')
    : null
  const animatedSessionIdRef = useRef(session?.id)
  const animatedMoveKeyRef = useRef(lastMoveKey)
  const syncedRollNeedsAnimation = Boolean(
    session?.id &&
    session.id === animatedSessionIdRef.current &&
    lastMoveKey &&
    lastMoveKey !== animatedMoveKeyRef.current,
  )
  const diceAnimating = diceRolling || syncedRollNeedsAnimation

  useSynth(session, activity)

  const activityEntry = activity ? activityRegistry[activity.type] : null

  useEffect(() => {
    if (!session) {
      delete window.__atLongLastGameState
      return undefined
    }

    const activityState = activity?.state || null
    const exposedState = {
      activity: activity && activityEntry
        ? {
            id: activity.type,
            label: activityEntry.label,
            options: activityState?.options?.map((option) => ({
              id: option.id,
              label: option.label,
            })) || [],
            ownSubmissionSealed: Boolean(
              activityState?.answers?.[String(playerIndex)] ||
              activityState?.choices?.[String(playerIndex)] ||
              activityState?.sealed?.[String(playerIndex)] ||
              Number.isFinite(activityState?.values?.[String(playerIndex)]) ||
              activityState?.results?.[String(playerIndex)] ||
              activityState?.submissions?.[String(playerIndex)] ||
              activityState?.captions?.[String(playerIndex)] ||
              activityState?.halves?.some((half) => half.playerIndex === playerIndex) ||
              (playerIndex === activityState?.predictorIndex && activityState?.predictionId) ||
              (playerIndex === activityState?.subjectIndex && activityState?.actualId) ||
              activityState?.entries?.some((entry) => entry.playerIndex === playerIndex),
            ),
            axis: activityState?.axes?.[String(playerIndex)] || null,
            bid: activityState?.currentBid || null,
            bidderIndex: activityState?.bidderIndex ?? null,
            goal: activityState?.goal || null,
            letters: activityState?.letters || [],
            leftLabel: activityState?.leftLabel || null,
            prompt: activityState?.prompt || null,
            position: activityState?.position || null,
            rightLabel: activityState?.rightLabel || null,
            sealedCount: getActivitySubmissionCount(activityState),
            stage: activityState?.phase || activityState?.mode || null,
            targetIntervalMs: activityState?.targetIntervalMs || null,
            timeLimitSec: activityState?.timeLimitSec || null,
            turnIndex: activityState?.turnIndex ?? null,
            walls: activityState?.obstacles || [],
          }
        : null,
      canAct:
        session.phase === 'activity'
          ? activityState?.turnIndex === playerIndex && !working
          : session.phase === 'turn'
            ? canRoll
            : false,
      phase: session.phase,
      playerIndex,
      round: session.round,
      scrapbook: {
        count: scrapbookMomentCount,
        latestTitle: journalEntries.find(entry => entry.sessionId === session.id)?.title || null,
        latestType: journalEntries.find(entry => entry.sessionId === session.id)?.type || null,
      },
      tone: session.vibeWeights
        ? {
            dominant: Object.entries(session.vibeWeights)
              .sort((left, right) => right[1] - left[1])[0]?.[0] || null,
            weights: session.vibeWeights,
          }
        : null,
    }
    window.__atLongLastGameState = exposedState

    return () => {
      if (window.__atLongLastGameState === exposedState) {
        delete window.__atLongLastGameState
      }
    }
  }, [
    activity,
    activityEntry,
    canRoll,
    journalEntries,
    scrapbookMomentCount,
    playerIndex,
    session?.phase,
    session?.round,
    session?.vibeWeights,
    working,
  ])

  useEffect(
    () => () => {
      if (diceSettleTimerRef.current) {
        window.clearTimeout(diceSettleTimerRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    if (session?.id !== animatedSessionIdRef.current) {
      animatedSessionIdRef.current = session?.id
      animatedMoveKeyRef.current = lastMoveKey
      return
    }

    if (!lastMoveKey || lastMoveKey === animatedMoveKeyRef.current) {
      return
    }

    animatedMoveKeyRef.current = lastMoveKey
    if (diceSettleTimerRef.current) {
      window.clearTimeout(diceSettleTimerRef.current)
    }
    setDiceRolling(true)
    diceSettleTimerRef.current = window.setTimeout(() => {
      setDiceRolling(false)
      diceSettleTimerRef.current = null
    }, 1450)
  }, [lastMoveKey, session?.id])

  useEffect(() => {
    setHeartGuideOpen(false)
  }, [session?.phase])

  const wavelengthPrompts = useMemo(
    () =>
      session?.currentDuel?.id === WAVELENGTH_DUEL_ID
        ? getWavelengthPromptsForSession(session)
        : null,
    [
      session?.id,
      session?.round,
      session?.currentDuel?.id,
      session?.currentDuel?.attempt,
    ],
  )

  if (!hasPartner || !couple || !readyToPlay || !session || !gameOpen) {
    return null
  }

  const activePlayer = session.players[session.activePlayerIndex]
  const ActivityComponent = activityEntry?.render ?? null
  const duelEntry = session.currentDuel ? duelRegistry[session.currentDuel.id] : null
  const DuelComponent = duelEntry?.start ?? null
  const canChooseActivity = session.phase === 'activityChoice' && session.activePlayerIndex === playerIndex
  const activityOptions = (session.pendingActivityOptions || [])
    .map((activityId) => activityRegistry[activityId])
    .filter(Boolean)
  const needsSessionRecovery = connectionState === 'syncing' || isSessionStale || Boolean(error)

  /**
   * Shared two-phone state contract: the non-active phone always sees who is
   * acting, what is private, and what happens next — never a dead spinner.
   */
  function renderPlayState() {
    if (isSessionStale) {
      return <PartnerAwayState />
    }

    if (session.phase === 'turn') {
      if (canRoll) {
        return <ActiveTurnState hint="One roll, then your partner takes over." />
      }

      return (
        <WaitingState
          actorName={activePlayer?.displayName || 'Your partner'}
          activityVerb="taking their turn"
          nextHint="You are up right after their roll."
          privateNote="Private: their card stays hidden until it lands on the board."
        />
      )
    }

    return null
  }
  const duelBothSubmitted =
    session.phase === 'duel' &&
    session.currentDuel &&
    session.players.length === 2 &&
    session.players.every((player) => session.duelResults?.[player.uid] && !isWavelengthCommit(session.duelResults[player.uid]))

  const gameplayOverlayOpen =
    !diceAnimating &&
    (
      session.phase === 'keepsake' ||
      session.phase === 'vibeSetup' ||
      session.phase === 'activityChoice' ||
      session.phase === 'activity' ||
      session.phase === 'duelWheel' ||
      session.phase === 'duel' ||
      session.phase === 'finale'
    )
  const rollButtonLabel = diceAnimating
    ? 'Rolling…'
    : canRoll
      ? 'Roll dice'
      : session.phase === 'turn'
        ? `${activePlayer.displayName}'s turn`
        : session.phase === 'vibeSetup'
          ? 'Opening board…'
          : 'Waiting…'

  async function handleDiceRoll() {
    if (!canRoll || working || diceAnimating) {
      return
    }

    if (diceSettleTimerRef.current) {
      window.clearTimeout(diceSettleTimerRef.current)
    }

    setDiceRolling(true)
    try {
      await rollTurn()
    } finally {
      diceSettleTimerRef.current = window.setTimeout(() => {
        setDiceRolling(false)
        diceSettleTimerRef.current = null
      }, 1450)
    }
  }

  return (
    <section className={`screen active game-screen${gameplayOverlayOpen ? ' has-gameplay-overlay' : ''}`}>
      <div className="board-wrap">
        <Suspense fallback={<div className="board-loading">Loading board…</div>}>
          <BoardScene
            activePlayerIndex={session.activePlayerIndex}
            boardState={boardState}
            dice={session.lastMove?.dice || null}
            lastRoll={session.lastRoll}
            onPieceStep={() => playPieceStep?.()}
            pacingMode={pacingMode}
            phase={session.phase}
            players={session.players}
            positions={session.positions}
            round={session.round}
            rolling={diceAnimating}
            themeId={progress?.selectedTheme || null}
          />
        </Suspense>
        <div className="hud top">
          <LoveTank hearts={session.hearts} onOpenGuide={() => setHeartGuideOpen(true)} />
          <button
            type="button"
            className={`pacing-mode-pill ${pacingMode}`}
            onClick={togglePacingMode}
            aria-label={`Pacing mode: ${pacingMode === 'freeFlow' ? 'Free Flow' : 'Shared Spotlight'}. Tap to switch.`}
            title="Switch between Free Flow (independent pacing) and Shared Spotlight (turn-by-turn focus)"
          >
            <span className="pacing-dot" aria-hidden="true" />
            <span className="pacing-label">{pacingMode === 'freeFlow' ? 'Free Flow' : 'Spotlight'}</span>
          </button>
          <button
            type="button"
            className="trade-hud-btn"
            onClick={() => setTradeModalOpen(true)}
            aria-label="Open Keepsake Trade"
            title="Open Keepsake Trade and Truce"
          >
            <span aria-hidden="true">🕊️</span>
            <span className="trade-hud-label">Trade</span>
          </button>
          <div className="chip" aria-label={`Round ${session.round} of ${session.totalRounds}`}>
            <span aria-hidden="true">◷</span><strong>{session.round}/{session.totalRounds}</strong>
          </div>
        </div>
        {pendingTradeOffer && pendingTradeOffer.fromPlayerIndex !== playerIndex && (
          <div className="trade-pill-wrap">
            <button
              type="button"
              className="truce-hud-notification-pill"
              onClick={() => setTradeModalOpen(true)}
              aria-label={`Trade offer from ${session.players[pendingTradeOffer.fromPlayerIndex]?.displayName || 'Partner'}. Tap to review.`}
            >
              🕊️ Trade Offer from {session.players[pendingTradeOffer.fromPlayerIndex]?.displayName || 'Partner'} • Review
            </button>
          </div>
        )}
        <div className="hud players" aria-label="Players">
          {session.players.map((player, index) => (
            <div
              key={player.uid}
              aria-label={`${player.displayName}, ${index === playerIndex ? 'you' : 'your partner'}${index === session.activePlayerIndex ? ', taking this turn' : ''}`}
              className={`player-strip${index === session.activePlayerIndex ? ' active' : ''}${index === playerIndex ? ' mine' : ''}`}
            >
              <img alt="" className="player-portrait" src={getPlayerPiece(player.avatar)?.thumbnail || '/assets/players/thumbs/heart.webp'} />
              <strong title={player.displayName}>{player.displayName}</strong>
            </div>
          ))}
        </div>
        {!gameplayOverlayOpen && (
          <div className="bottom-tray">
            {renderPlayState()}
            {!needsSessionRecovery && <p className="status-line">{sessionStatusMessage}</p>}
            <div className="button-row">
              <TactileDiceCast
                canRoll={canRoll}
                disabled={!canRoll || working || diceAnimating}
                isRolling={diceAnimating}
                lastDice={session.lastMove?.dice || [Math.min(6, Math.max(1, Math.floor((session.lastRoll || 2) / 2))), Math.min(6, Math.max(1, Math.ceil((session.lastRoll || 2) / 2)))]}
                onRoll={handleDiceRoll}
                statusLabel={rollButtonLabel}
              />
              {session.phase === 'duelWheel' && (
                <button
                  className="primary-btn alt"
                  disabled={!canSpinDuel || diceAnimating}
                  onClick={() => {
                    playAction?.()
                    spinDuelWheel()
                  }}
                  type="button"
                >
                  {diceAnimating
                    ? 'Waiting For Dice'
                    : canSpinDuel
                      ? 'Spin Duel Wheel'
                      : 'Waiting For Spin'}
                </button>
              )}
            </div>
            <div className="keepsake-row">
              {session.keepsakes.map((keepsake) => (
                <span key={`${keepsake.id}-${keepsake.label}`} className="keepsake-pill">
                  {keepsake.label}
                </span>
              ))}
            </div>
            {error && <p className="error-copy">{error}</p>}
          </div>
        )}
      </div>

      {!diceAnimating && session.phase === 'keepsake' && session.pendingKeepsake && (
        <div className="overlay-screen mystery-keepsake-overlay">
          <MysteryKeepsakeCard
            item={session.pendingKeepsake}
            onReveal={() => playAction?.()}
            onCollect={() => {
              playSuccess?.()
              chooseKeepsake(true)
            }}
            player={session.players[session.activePlayerIndex]}
          />
          {error && <p className="error-copy" role="alert">{error}</p>}
        </div>
      )}

      {!diceAnimating && session.phase === 'vibeSetup' && (
        <div className="overlay-screen">
          <div className="overlay-card" role="status">
            <h3>Opening board…</h3>
            {error && <p className="error-copy">{error}</p>}
            {error && <button className="primary-btn" onClick={() => window.location.reload()} type="button">Reconnect</button>}
          </div>
        </div>
      )}

      {!diceAnimating && session.phase === 'activityChoice' && (
        <div className="overlay-screen">
          <div className="overlay-card">
            <p className="eyebrow">Momentum Pick</p>
            <h3>Choose The Next Beat</h3>
            <p className="support-copy">
              {canChooseActivity ? 'Choose one together.' : 'Waiting for the active phone.'}
            </p>
            <div className="activity-option-grid">
              {activityOptions.map((option) => (
                <button
                  key={option.id}
                  className={`activity-option-card vibe-${option.vibe}`}
                  disabled={!canChooseActivity || working}
                  onClick={() => {
                    playAction?.()
                    selectActivityOption(option.id)
                  }}
                  type="button"
                >
                  <span className="eyebrow">{option.vibe} {option.type}</span>
                  <strong>{option.label}</strong>
                  <p>{option.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!diceAnimating && session.phase === 'activity' && activity && ActivityComponent && (
        <div className={`overlay-screen ${activityMinimized ? 'is-minimized' : ''}`}>
          <ActivityComponent
            activity={activity}
            error={error}
            disabled={
              activityEntry?.supportsPrivateFlow
                ? working
                : (activity.state.turnIndex !== playerIndex || working)
            }
            isMinimized={activityMinimized}
            onToggleMinimize={() => setActivityMinimized((current) => !current)}
            onSkip={() => {
              playAction?.()
              skipActivity()
            }}
            onSubmit={submitActivityTurn}
            playerIndex={playerIndex}
            players={session.players}
          />
        </div>
      )}
      {!diceAnimating && session.phase === 'activity' && !activity && (
        <div className="overlay-screen">
          <div className="overlay-card" role="status">
            <h3>Opening your next moment…</h3>
            {error && <p className="error-copy">{error}</p>}
            {error && <button className="primary-btn" onClick={() => window.location.reload()} type="button">Reconnect</button>}
          </div>
        </div>
      )}

      {!diceAnimating && session.phase === 'duelWheel' && (
        <div className="overlay-screen">
          <div className="overlay-card">
            <p className="eyebrow">Round Duel</p>
            <h3>Spin the wheel</h3>
            <p className="support-copy">+{3 + session.roundDuelBonus} shared hearts.</p>
            <div className="wheel-preview">
              {['tender', 'playful', 'spicy'].map((vibe) => (
                <span key={vibe}>
                  {vibe} {Math.round((session.vibeWeights?.[vibe] || 0) * 100)}%
                </span>
              ))}
            </div>
            <button
              className="primary-btn pulse"
              disabled={!canSpinDuel}
              onClick={() => {
                playAction?.()
                spinDuelWheel()
              }}
              type="button"
            >
              {canSpinDuel ? 'Spin It' : 'Host Is Spinning'}
            </button>
          </div>
        </div>
      )}

      {!diceAnimating && session.phase === 'duel' && DuelComponent && (
        <div className="overlay-screen">
          {duelBothSubmitted ? (
            <DuelRevealOverlay
              isHost={isHost}
              onAck={ackDuelReveal}
              onForceContinue={forceDuelReveal}
              onPreviewContinue={continuePreviewDuel}
              playerIndex={playerIndex}
              players={session.players}
              preview={!enabled}
              session={session}
            />
          ) : (
            <DuelArena
              duel={session.currentDuel}
              session={session}
              playerIndex={playerIndex}
              players={session.players}
              myDuelResult={myDuelResult}
              disabled={working}
              wavelengthPrompts={wavelengthPrompts}
              DuelComponent={DuelComponent}
              onComplete={submitDuelResult}
              onSkip={() => {
                playAction?.()
                skipDuel()
              }}
            />
          )}
        </div>
      )}

      {!diceAnimating && session.phase === 'finale' && finalSummary && (
        <FinaleScreen
          session={session}
          finalSummary={finalSummary}
          journalEntries={journalEntries}
          themeId={progress?.selectedTheme || 'cozy'}
          players={session.players}
          canPlayAgain={canRecoverSession}
          working={working}
          onOpenScrapbook={() => {
            playAction?.()
            startTransition(() => setJournalOpen(true))
          }}
          onPlayAgain={() => {
            playAction?.()
            startFreshSession()
          }}
        />
      )}

      <Suspense fallback={null}>
        <JournalDrawer
          sessionId={session.id}
          entries={journalEntries}
          onClose={() => startTransition(() => setJournalOpen(false))}
          open={journalOpen}
        />
      </Suspense>

      {heartGuideOpen && !diceAnimating && !gameplayOverlayOpen && (
        <div className="overlay-screen heart-guide-overlay">
          <div className="overlay-card heart-guide-card">
            <p className="eyebrow">No Scoreboard</p>
            <h3>One shared stash.</h3>
            <p className="support-copy">Hearts buy keepsakes. They are not a score.</p>
            <div className="heart-rule-list">
              <div><strong>Start</strong><span>6 shared hearts.</span></div>
              <div><strong>Earn</strong><span>Moments and duels add hearts.</span></div>
              <div><strong>Spend</strong><span>Keepsakes help both players.</span></div>
              <div><strong>Finish</strong><span>The scrapbook is the keepsake.</span></div>
            </div>
            <button
              className="primary-btn"
              onClick={() => setHeartGuideOpen(false)}
              type="button"
            >
              Back To The Board
            </button>
          </div>
        </div>
      )}

      {needsSessionRecovery && (
        <div className="overlay-screen session-recovery-overlay">
          <div className="overlay-card session-recovery-card">
            <p className="eyebrow">Session Check</p>
            <h3>{isSessionStale ? 'This night paused here.' : 'Reconnecting your night.'}</h3>
            <p className="support-copy">{error || sessionStatusMessage}</p>
            <div className="button-row compact">
              <button className="primary-btn alt" onClick={resumeSession} type="button">
                Resume
              </button>
              {canRecoverSession && (
                <button className="primary-btn alt" onClick={startFreshSession} type="button">
                  Start Fresh
                </button>
              )}
              {!isHost && isSessionStale && (
                <button className="primary-btn alt" onClick={claimSessionHost} type="button">
                  Claim Host
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <TruceTradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        session={session}
        playerIndex={playerIndex}
        onSendOffer={sendTradeOffer}
        onRespondOffer={respondTradeOffer}
        onDismissOffer={dismissTradeOffer}
      />
    </section>
  )
}
