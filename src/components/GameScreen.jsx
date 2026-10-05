import { Suspense, lazy, startTransition, useEffect, useRef, useState } from 'react'
import { DuelRevealOverlay } from './DuelRevealOverlay.jsx'
import { useAudio } from '../audio/AudioProvider.jsx'
import { ChecklistRail } from './ChecklistRail.jsx'
import { LoveTank } from './LoveTank.jsx'
import { MoodPulse } from './MoodPulse.jsx'
import { VibeDial } from './VibeDial.jsx'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { COMPANION_STAGES, COMPANION_STAGE_EMOJI } from '../features/couple/progressService.js'
import { activityRegistry } from '../features/session/activityRegistry.jsx'
import { duelRegistry } from '../features/session/duelRegistry.jsx'
import { getScrapbookMomentCount } from '../features/session/journalHelpers.js'
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

const MOMENTUM_BONUS_COPY = {
  playful: 'Double pick armed',
  spicy: 'Heat boost armed',
  tender: 'Soft landing armed',
}

const MOMENTUM_SYMBOLS = {
  playful: '✦',
  spicy: '♨',
  tender: '♡',
}

function capitalize(value = '') {
  if (!value) {
    return ''
  }

  return value[0].toUpperCase() + value.slice(1)
}

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
  const { playAction } = useAudio()
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
    error,
    enabled,
    finalSummary,
    forceDuelReveal,
    isHost,
    isSessionStale,
    journalEntries,
    myDuelResult,
    myMoodVote,
    myVibeVote,
    playerIndex,
    readyToPlay,
    resumeSession,
    rollTurn,
    selectActivityOption,
    session,
    sessionStatusMessage,
    skipActivity,
    skipDuel,
    spinDuelWheel,
    startFreshSession,
    submitActivityTurn,
    submitDuelResult,
    submitMoodVote,
    submitVibeVote,
    working,
  } = useSession()
  const [journalOpen, setJournalOpen] = useState(false)
  const [heartGuideOpen, setHeartGuideOpen] = useState(false)
  const [diceRolling, setDiceRolling] = useState(false)
  const diceSettleTimerRef = useRef(null)
  const scrapbookMomentCount = getScrapbookMomentCount(journalEntries)
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

  useSynth(session)

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
        latestTitle: journalEntries[0]?.title || null,
        latestType: journalEntries[0]?.type || null,
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

  if (!hasPartner || !couple || !readyToPlay || !session) {
    return null
  }

  const activePlayer = session.players[session.activePlayerIndex]
  const ActivityComponent = activityEntry?.render ?? null
  const duelEntry = session.currentDuel ? duelRegistry[session.currentDuel.id] : null
  const DuelComponent = duelEntry?.start ?? null
  const canChooseActivity = session.phase === 'activityChoice' && session.activePlayerIndex === playerIndex
  const dominantVibe = session.vibeWeights
    ? Object.entries(session.vibeWeights).sort((left, right) => right[1] - left[1])[0]?.[0]
    : null
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
  const otherPlayer = session.players[playerIndex === 0 ? 1 : 0]
  const otherPlayerName = otherPlayer?.displayName || 'Your partner'
  const duelBothSubmitted =
    session.phase === 'duel' &&
    session.currentDuel &&
    session.players.length === 2 &&
    session.players.every((player) => session.duelResults?.[player.uid])

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
  const momentumCards = ['tender', 'playful', 'spicy'].map((vibe) => ({
    active: Boolean(session.momentum?.unlocked?.[vibe] && !session.momentum?.consumed?.[vibe]),
    label: capitalize(vibe),
    value: session.momentum?.[vibe] || 0,
    vibe,
  }))
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
          ? 'Choosing the mood…'
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
    <section className="screen active game-screen">
      <div className="board-wrap">
        <Suspense fallback={<div className="board-loading">Loading board…</div>}>
          <BoardScene
            activePlayerIndex={session.activePlayerIndex}
            boardState={boardState}
            lastRoll={session.lastRoll}
            players={session.players}
            positions={session.positions}
            round={session.round}
            rolling={diceAnimating}
            themeId={progress?.selectedTheme || null}
          />
        </Suspense>
        <div className="hud top">
          <LoveTank hearts={session.hearts} onOpenGuide={() => setHeartGuideOpen(true)} />
          <div className="chip" aria-label={`Round ${session.round} of ${session.totalRounds}`}>
            <span aria-hidden="true">◷</span><strong>{session.round}/{session.totalRounds}</strong>
          </div>
          <div
            aria-label={dominantVibe ? `Tonight feels ${dominantVibe}` : 'Choose tonight’s mood together'}
            className="chip vibe-chip"
          >
            <span aria-hidden="true">☼</span><strong>{dominantVibe || 'Mood'}</strong>
          </div>
          {progress?.companion && (
            <div
              aria-label={`${progress.companion.name || 'Your companion'}, ${(COMPANION_STAGES[progress.companion.stage] || {}).label || ''}`}
              className="chip companion-chip"
              title="Your companion grows with every heart you earn together."
            >
              <span aria-hidden="true">{COMPANION_STAGE_EMOJI[progress.companion.stage] || '🥚'}</span>
              <strong>{progress.companion.name || 'Companion'}</strong>
            </div>
          )}
          <button
            aria-label={`Open scrapbook. ${scrapbookMomentCount} saved moments.`}
            className="chip button-chip"
            onClick={() => {
              playAction?.()
              startTransition(() => setJournalOpen(true))
            }}
            type="button"
          >
            <span>Book</span><strong>▤ {scrapbookMomentCount}</strong>
          </button>
        </div>
        <ChecklistRail session={session} />
        <div className="hud momentum-hud">
          <div className="spotlight-banner">
            <span className="spotlight-kicker">✦ Next</span>
            <strong>{session.spotlight?.label}</strong>
            <p>{session.spotlight?.description}</p>
          </div>
          <div className="momentum-row">
            {momentumCards.map((card) => (
              <div
                key={card.vibe}
                aria-label={`${card.label}: ${Math.min(card.value, 2)} of 2. ${card.active ? MOMENTUM_BONUS_COPY[card.vibe] : 'In progress'}.`}
                className={`momentum-pill${card.active ? ' active' : ''} vibe-${card.vibe}`}
                title={`${card.label}: ${card.active ? MOMENTUM_BONUS_COPY[card.vibe] : 'In progress'}`}
              >
                <span aria-hidden="true">{MOMENTUM_SYMBOLS[card.vibe]}</span>
                <strong>{Math.min(card.value, 2)}/2</strong>
                <small>{card.active ? 'Ready' : 'In progress'}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="hud players">
          {session.players.map((player, index) => (
            <div
              key={player.uid}
              className={`player-strip${index === session.activePlayerIndex ? ' active' : ''}${index === playerIndex ? ' mine' : ''}`}
            >
              <span className="dot" style={{ background: player.color }} />
              <strong title={player.displayName}>{player.displayName}</strong>
            </div>
          ))}
        </div>
        {!gameplayOverlayOpen && (
          <div className="bottom-tray">
            {renderPlayState()}
            {!needsSessionRecovery && <p className="status-line">{sessionStatusMessage}</p>}
            <div className="button-row">
              <button
                className="primary-btn pulse"
                disabled={!canRoll || working || diceAnimating}
                onClick={() => {
                  playAction?.()
                  handleDiceRoll()
                }}
                type="button"
              >
                {rollButtonLabel}
              </button>
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
        <div className="overlay-screen">
          <div className="overlay-card">
            <p className="eyebrow">Keepsake Stop</p>
            <h3>{session.pendingKeepsake.label}</h3>
            <p className="support-copy">{session.pendingKeepsake.blurb}</p>
            <div className="perk-copy">
              <span>{session.pendingKeepsake.perkLabel}</span>
              <p>{session.pendingKeepsake.perkDescription}</p>
            </div>
            <p className="price-copy">
              Costs <strong>{session.pendingKeepsake.cost}</strong> hearts.
            </p>
            <div className="button-row">
              <button
                className="primary-btn"
                disabled={working || session.hearts < session.pendingKeepsake.cost}
                onClick={() => {
                  playAction?.()
                  chooseKeepsake(true)
                }}
                type="button"
              >
                Buy It
              </button>
              <button
                className="primary-btn alt"
                onClick={() => {
                  playAction?.()
                  chooseKeepsake(false)
                }}
                type="button"
              >
                Save Hearts
              </button>
            </div>
          </div>
        </div>
      )}

      {!diceAnimating && session.phase === 'vibeSetup' && (
        <div className="overlay-screen">
          {!myMoodVote ? (
            <MoodPulse
              disabled={working}
              onConfirm={(mood) => {
                playAction?.()
                submitMoodVote(mood)
              }}
              playerName={session.players[playerIndex]?.displayName || 'You'}
            />
          ) : (
            <VibeDial
              defaultWeights={myVibeVote || session.vibeWeights || undefined}
              disabled={working || Boolean(myVibeVote)}
              onConfirm={(vote) => {
                playAction?.()
                submitVibeVote(vote)
              }}
              playerName={session.players[playerIndex]?.displayName || 'You'}
            />
          )}
          {myMoodVote && myVibeVote && (
            <div className="overlay-note">
              <WaitingState
                actorName={otherPlayerName}
                activityVerb="locking in the mood"
                nextHint="The board opens once both moods are locked."
                privateNote="Private: their vote stays hidden."
              />
            </div>
          )}
        </div>
      )}

      {!diceAnimating && session.phase === 'activityChoice' && (
        <div className="overlay-screen">
          <div className="overlay-card">
            <p className="eyebrow">Momentum Pick</p>
            <h3>Choose The Next Beat</h3>
            <p className="support-copy">
              Playful momentum opened two options. {canChooseActivity ? 'Pick one and open it together.' : 'Waiting for the active phone to choose.'}
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
        <div className="overlay-screen">
          <ActivityComponent
            activity={activity}
            disabled={activity.state.turnIndex !== playerIndex || working}
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

      {!diceAnimating && session.phase === 'duelWheel' && (
        <div className="overlay-screen">
          <div className="overlay-card">
            <p className="eyebrow">Round Duel</p>
            <h3>Spin For The Head-To-Head</h3>
            <p className="support-copy">
              This round is worth {3 + session.roundDuelBonus} shared hearts.
            </p>
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
          ) : myDuelResult ? (
            <WaitingState
              actorName={otherPlayerName}
              activityVerb="locking in their answer"
              nextHint="The reveal opens when both answers are in."
              privateNote="Private: answers stay hidden until the reveal."
            />
          ) : (
            <DuelComponent
              disabled={working}
              onComplete={submitDuelResult}
              onSkip={() => {
                playAction?.()
                skipDuel()
              }}
              playerIndex={playerIndex}
              players={session.players}
            />
          )}
        </div>
      )}

      {!diceAnimating && session.phase === 'finale' && finalSummary && (
        <div className="overlay-screen">
          <div className="overlay-card finale-card">
            <p className="eyebrow">Finale</p>
            <h3>{finalSummary.headline}</h3>
            <p className="support-copy">{finalSummary.coda}</p>
            <div className="finale-note-row">
              <span>{finalSummary.tierLabel}</span>
              <span>{finalSummary.duelOutcomeLabel}</span>
            </div>
            <div className="summary-grid">
              <div>
                <strong>{session.hearts}</strong>
                <span>Shared Hearts</span>
              </div>
              <div>
                <strong>{session.keepsakes.length}</strong>
                <span>Keepsakes</span>
              </div>
              <div>
                <strong>{finalSummary.journalCount}</strong>
                <span>Journal Beats</span>
              </div>
              <div>
                <strong>{finalSummary.completedSpotlightCount}</strong>
                <span>Spotlights</span>
              </div>
            </div>
            {finalSummary.keepsakeLabels.length > 0 && (
              <div className="finale-tag-row">
                {finalSummary.keepsakeLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            )}
            {finalSummary.momentumLabels.length > 0 && (
              <div className="finale-tag-row momentum-tags">
                {finalSummary.momentumLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            )}
            <p className="support-copy finale-vibes">{finalSummary.vibes}</p>
            <button
              className="primary-btn"
              onClick={() => {
                playAction?.()
                startTransition(() => setJournalOpen(true))
              }}
              type="button"
            >
              Open Scrapbook
            </button>
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        <JournalDrawer
          entries={journalEntries}
          onClose={() => startTransition(() => setJournalOpen(false))}
          open={journalOpen}
        />
      </Suspense>

      {heartGuideOpen && !diceAnimating && !gameplayOverlayOpen && (
        <div className="overlay-screen heart-guide-overlay">
          <div className="overlay-card heart-guide-card">
            <p className="eyebrow">No Scoreboard</p>
            <h3>One stash, shared by both of you.</h3>
            <p className="support-copy">
              Hearts are a keepsake currency, not points and not a player-versus-player score.
            </p>
            <div className="heart-rule-list">
              <div><strong>Start</strong><span>Begin every night with 6 shared hearts.</span></div>
              <div><strong>Earn</strong><span>Connection moments, duels, heart spaces, and spotlights add to the same stash.</span></div>
              <div><strong>Spend</strong><span>Only keepsakes cost hearts, and their perks help both players.</span></div>
              <div><strong>Finish</strong><span>The scrapbook is the outcome. Nobody wins the night overall.</span></div>
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
    </section>
  )
}
