import { getPlayerPiece } from '../features/couple/playerAvatar.js'
import './duel-arena.css'

export function DuelArena({
  duel,
  session,
  playerIndex = 0,
  players = [],
  myDuelResult = null,
  onComplete,
  onSkip,
  disabled = false,
  wavelengthPrompts = null,
  DuelComponent = null,
}) {
  const myPlayer = players[playerIndex]
  const partnerIndex = playerIndex === 0 ? 1 : 0
  const partner = players[partnerIndex]

  const myPiece = myPlayer?.avatar ? getPlayerPiece(myPlayer.avatar) : null
  const partnerPiece = partner?.avatar ? getPlayerPiece(partner.avatar) : null

  const partnerLockedIn = Boolean(partner?.uid && session?.duelResults?.[partner.uid])
  const myLockedIn = Boolean(myDuelResult)

  return (
    <div className="duel-arena-overlay" role="dialog" aria-label={`${duel?.label || 'Duel'} Arena`}>
      {/* Top Header */}
      <div className="duel-arena-header">
        <div className="duel-arena-meta">
          <span className="duel-arena-vibe-tag">✦ {duel?.vibe || 'Playful'} Duel ✦</span>
          <h2 className="duel-arena-title">{duel?.label || 'Head-to-Head Duel'}</h2>
        </div>
        {duel?.skippable && (
          <button
            type="button"
            className="duel-arena-skip-btn"
            onClick={onSkip}
            disabled={disabled || myLockedIn}
          >
            Skip Duel
          </button>
        )}
      </div>

      <div className="duel-arena-split">
        {/* Top Arena Zone: Partner */}
        <div className="duel-partner-zone" aria-label={`${partner?.displayName || 'Partner'}'s arena frame`}>
          <div className="duel-player-badge">
            <div className="duel-avatar-wrap">
              <img
                src={partnerPiece?.thumbnail || '/assets/players/thumbs/heart.webp'}
                alt=""
                className="duel-avatar-img"
              />
            </div>
            <div className="duel-player-info">
              <span className="duel-player-name">{partner?.displayName || 'Partner'}</span>
              <span className="duel-player-role">Partner</span>
            </div>
          </div>

          <div className={`duel-partner-status ${partnerLockedIn ? 'is-locked' : ''}`}>
            {partnerLockedIn ? '✓ Locked In' : 'Thinking… 💭'}
          </div>
        </div>

        {/* Center Golden Dividing Beam */}
        <div className="duel-golden-beam" aria-hidden="true">
          <div className="duel-beam-insignia">
            <span className="duel-beam-pulse-dot" />
            <span>Head-to-Head Arena</span>
            <span className="duel-beam-pulse-dot" />
          </div>
        </div>

        {/* Bottom Arena Zone: You */}
        <div className="duel-my-zone" aria-label="Your arena frame">
          <div className="duel-my-header">
            <div className="duel-player-badge">
              <div className="duel-avatar-wrap">
                <img
                  src={myPiece?.thumbnail || '/assets/players/thumbs/heart.webp'}
                  alt=""
                  className="duel-avatar-img"
                />
              </div>
              <div className="duel-player-info">
                <span className="duel-player-name">{myPlayer?.displayName || 'You'}</span>
                <span className="duel-player-role">{myLockedIn ? 'Locked In ✓' : 'Your Challenge'}</span>
              </div>
            </div>
          </div>

          {/* Interactive Game or Sealed Waiting State */}
          {myLockedIn ? (
            <div className="duel-sealed-waiting-card">
              <div className="duel-sealed-wax-stamp" aria-hidden="true">
                ✦
              </div>
              <h3 className="duel-sealed-title">Your Answer is Sealed</h3>
              <p className="duel-sealed-desc">
                {partnerLockedIn
                  ? 'Both answers are locked in! Preparing the synchronized reveal…'
                  : `Waiting for ${partner?.displayName || 'Partner'} to lock in their choice…`}
              </p>
            </div>
          ) : (
            DuelComponent && (
              <DuelComponent
                disabled={disabled}
                prompts={wavelengthPrompts}
                onComplete={onComplete}
                onSkip={onSkip}
                playerIndex={playerIndex}
                players={players}
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}
