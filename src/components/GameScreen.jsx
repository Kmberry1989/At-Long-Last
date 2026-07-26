import { Suspense, lazy, startTransition, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { VibeDial } from './VibeDial.jsx'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { activityRegistry } from '../features/session/activityRegistry.jsx'
import { duelRegistry } from '../features/session/duelRegistry.jsx'
import { useSession } from '../features/session/SessionProvider.jsx'
import { useSynth } from './useSynth.js'

const BoardScene = lazy(() =>
  import('../board/BoardScene.jsx').then((module) => ({ default: module.BoardScene })),
)
const JournalDrawer = lazy(() =>
  import('./JournalDrawer.jsx').then((module) => ({ default: module.JournalDrawer })),
)

const ACT_LABELS = {
  finale: 'Finale',
  spark: 'Spark',
  warmup: 'Warmup',
}

const MOMENTUM_BONUS_COPY = {
  playful: 'Double pick armed',
  spicy: 'Heat boost armed',
  tender: 'Soft landing armed',
}

function capitalize(value = '') {
  if (!value) {
    return ''
  }

  return value[0].toUpperCase() + value.slice(1)
}

export function GameScreen() {
  const { couple, hasPartner } = useCouple()
  const { playAction } = useAudio()
  const {
    activity,
    boardState,
    canRecoverSession,
    canRoll,
    canSpinDuel,
    claimSessionHost,
    chooseKeepsake,
    connectionState,
    error,
    finalSummary,
    isHost,
    isSessionStale,
    journalEntries,
    myDuelResult,
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
    submitVibeVote,
    working,
  } = useSession()
  const [journalOpen, setJournalOpen] = useState(false)

  useSynth(session)

  if (!hasPartner || !couple || !readyToPlay || !session) {
    return null
  }

  const activePlayer = session.players[session.activePlayerIndex]
  const activityEntry = activity ? activityRegistry[activity.type] : null
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
  const spotlightActLabel = ACT_LABELS[session.spotlight?.act] || 'Warmup'
  const needsSessionRecovery = connectionState === 'syncing' || isSessionStale || Boolean(error)
  const momentumCards = ['tender', 'playful', 'spicy'].map((vibe) => ({
    active: Boolean(session.momentum?.unlocked?.[vibe] && !session.momentum?.consumed?.[vibe]),
    label: capitalize(vibe),
    value: session.momentum?.[vibe] || 0,
    vibe,
  }))

  return (
    <section className="screen active game-screen">
      <div className="board-wrap">
        <Suspense fallback={<div className="board-loading">Loading board…</div>}>
          <BoardScene
            activePlayerIndex={session.activePlayerIndex}
            boardState={boardState}
            players={session.players}
            positions={session.positions}
            round={session.round}
          />
        </Suspense>
        <div className="hud top">
          <div className="chip heart">
            <span>Hearts</span><strong>{session.hearts}</strong>
          </div>
          <div className="chip">
            <span>Round</span><strong>{session.round}<small>/{session.totalRounds}</small></strong>
          </div>
          <div className="chip spotlight-chip">
            <span>Spotlight</span>
            <strong>{spotlightActLabel}</strong>
          </div>
          {dominantVibe && (
            <div className="chip vibe-chip">
              <span>Vibe</span><strong>{dominantVibe}</strong>
            </div>
          )}
          <button
            className="chip button-chip"
            onClick={() => {
              playAction?.()
              startTransition(() => setJournalOpen(true))
            }}
            type="button"
          >
            <span>Scrapbook</span><strong>{journalEntries.length}</strong>
          </button>
        </div>
        <div className="hud momentum-hud">
          <div className="spotlight-banner">
            <span className="spotlight-kicker">{spotlightActLabel} Spotlight</span>
            <strong>{session.spotlight?.label}</strong>
            <p>{session.spotlight?.description}</p>
          </div>
          <div className="momentum-row">
            {momentumCards.map((card) => (
              <div
                key={card.vibe}
                className={`momentum-pill${card.active ? ' active' : ''} vibe-${card.vibe}`}
              >
                <span>{card.label}</span>
                <strong>{Math.min(card.value, 2)} / 2</strong>
                <small>{card.active ? MOMENTUM_BONUS_COPY[card.vibe] : 'Building'}</small>
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
              <strong>{player.displayName}</strong>
              <span>{session.positions[index] + 1}</span>
            </div>
          ))}
        </div>
        <div className="bottom-tray">
          {!needsSessionRecovery && <p className="status-line">{sessionStatusMessage}</p>}
          <div className="button-row">
            <button
              className="primary-btn pulse"
              disabled={!canRoll || working}
              onClick={() => {
                playAction?.()
                rollTurn()
              }}
              type="button"
            >
              {canRoll ? 'Roll Dice' : `Waiting on ${activePlayer.displayName}`}
            </button>
            {session.phase === 'duelWheel' && (
              <button
                className="primary-btn alt"
                disabled={!canSpinDuel}
                onClick={() => {
                  playAction?.()
                  spinDuelWheel()
                }}
                type="button"
              >
                {canSpinDuel ? 'Spin Duel Wheel' : 'Waiting For Spin'}
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
      </div>

      {session.phase === 'keepsake' && session.pendingKeepsake && (
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

      {session.phase === 'vibeSetup' && (
        <div className="overlay-screen">
          <VibeDial
            defaultWeights={myVibeVote || session.vibeWeights || undefined}
            disabled={working || Boolean(myVibeVote)}
            onConfirm={(vote) => {
              playAction?.()
              submitVibeVote(vote)
            }}
            playerName={session.players[playerIndex]?.displayName || 'You'}
          />
          {myVibeVote && (
            <div className="overlay-note">
              <p className="eyebrow">Vote Locked</p>
              <p className="support-copy">Waiting for the other phone to lock the mood.</p>
            </div>
          )}
        </div>
      )}

      {session.phase === 'activityChoice' && (
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

      {session.phase === 'activity' && activity && ActivityComponent && (
        <div className="overlay-screen">
          <ActivityComponent
            activity={activity}
            disabled={activity.state.turnIndex !== playerIndex || working}
            onSkip={() => {
              playAction?.()
              skipActivity()
            }}
            onSubmit={submitActivityTurn}
            players={session.players}
          />
        </div>
      )}

      {session.phase === 'duelWheel' && (
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

      {session.phase === 'duel' && DuelComponent && (
        <div className="overlay-screen">
          {myDuelResult ? (
            <div className="overlay-card">
              <p className="eyebrow">Result Sent</p>
              <h3>Locked In</h3>
              <p className="support-copy">
                {myDuelResult.highlight}. Waiting on the other phone.
              </p>
            </div>
          ) : (
            <DuelComponent
              disabled={working}
              onComplete={submitDuelResult}
              onSkip={() => {
                playAction?.()
                skipDuel()
              }}
            />
          )}
        </div>
      )}

      {session.phase === 'finale' && finalSummary && (
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
                <span>Hearts Left</span>
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
