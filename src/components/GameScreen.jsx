import { startTransition, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { BoardScene } from '../board/BoardScene.jsx'
import { VibeDial } from './VibeDial.jsx'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { activityRegistry } from '../features/session/activityRegistry.jsx'
import { duelRegistry } from '../features/session/duelRegistry.jsx'
import { useSession } from '../features/session/SessionProvider.jsx'
import { JournalDrawer } from './JournalDrawer.jsx'
import { useSynth } from './useSynth.js'

export function GameScreen() {
  const { couple, hasPartner } = useCouple()
  const { playAction } = useAudio()
  const {
    activity,
    boardState,
    canRoll,
    canSpinDuel,
    chooseKeepsake,
    error,
    finalSummary,
    journalEntries,
    myDuelResult,
    myVibeVote,
    playerIndex,
    readyToPlay,
    rollTurn,
    session,
    skipActivity,
    skipDuel,
    spinDuelWheel,
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

  return (
    <section className="screen active game-screen">
      <div className="board-wrap">
        <BoardScene
          activePlayerIndex={session.activePlayerIndex}
          boardState={boardState}
          players={session.players}
          positions={session.positions}
          round={session.round}
        />
        <div className="hud top">
          <div className="chip heart">
            Hearts <strong>{session.hearts}</strong>
          </div>
          <div className="chip">
            Round <strong>{session.round}</strong> / {session.totalRounds}
          </div>
          {session.vibeWeights && (
            <div className="chip vibe-chip">
              Vibe <strong>{Object.entries(session.vibeWeights).sort((left, right) => right[1] - left[1])[0][0]}</strong>
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
            Journal {journalEntries.length}
          </button>
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
          <p className="status-line">{session.actionText}</p>
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
              {canRoll ? 'Roll Dice' : `${activePlayer.displayName} is up`}
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
            defaultWeights={session.vibeWeights || session.vibeVotes?.[userId] || undefined}
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
            <h3>Night Closed Out</h3>
            <p className="support-copy">{finalSummary.vibes}</p>
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
                <strong>{journalEntries.length}</strong>
                <span>Journal Beats</span>
              </div>
            </div>
            <button
              className="primary-btn"
              onClick={() => {
                playAction?.()
                startTransition(() => setJournalOpen(true))
              }}
              type="button"
            >
              Open Journal
            </button>
          </div>
        </div>
      )}

      <JournalDrawer
        entries={journalEntries}
        onClose={() => startTransition(() => setJournalOpen(false))}
        open={journalOpen}
      />
    </section>
  )
}
