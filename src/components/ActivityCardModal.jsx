import { BrandText } from './BrandIcon.jsx'
import { useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { PLAYER_THEMES } from '../features/couple/playerAvatar.js'
import { hasThreeLetters } from '../features/session/responseValidation.js'

export function ActivityCardModal({
  activity,
  definition,
  deferReveal = false,
  disabled = false,
  error = null,
  isMinimized = false,
  onSubmit,
  onRevealComplete,
  onToggleMinimize,
  playerIndex = 0,
  players = [],
}) {
  const audio = useAudio() || {}
  const { playCardSeal, playSuccess } = audio

  const [answerText, setAnswerText] = useState('')
  const [revealedLocally, setRevealedLocally] = useState(false)

  const partnerIndex = playerIndex === 0 ? 1 : 0
  const currentPlayer = players[playerIndex] || { displayName: 'You' }
  const partnerPlayer = players[partnerIndex] || { displayName: 'Partner' }

  const currentTheme = PLAYER_THEMES[playerIndex] || PLAYER_THEMES[0]
  const partnerTheme = PLAYER_THEMES[partnerIndex] || PLAYER_THEMES[1]


  const entries = activity?.state?.entries || []
  const myEntry = entries.find((e) => e.playerIndex === playerIndex)
  const partnerEntry = entries.find((e) => e.playerIndex === partnerIndex)

  const isMyAnswerSubmitted = Boolean(myEntry)
  const isPartnerAnswerSubmitted = Boolean(partnerEntry)
  const isBothSubmitted = isMyAnswerSubmitted && isPartnerAnswerSubmitted
  const isRevealed = !deferReveal && (isBothSubmitted || revealedLocally)

  const vibe = definition?.vibe || activity?.vibe || 'tender'
  const prompt = activity?.state?.prompt || definition?.description || 'Share a memory together.'
  const artSrc = definition?.image ?? definition?.tileImage ?? definition?.art



  const handleSealAndSubmit = () => {
    if (!hasThreeLetters(answerText) && !myEntry) return
    playCardSeal?.()
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([25, 45, 30])
    }

    // If partner already submitted, locally trigger reveal for smooth delight before unmounting
    if (isPartnerAnswerSubmitted && !deferReveal) {
      setRevealedLocally(true)
    }

    onSubmit?.({ text: answerText.trim() })
  }

  const handleCompleteReveal = () => {
    playSuccess?.()
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([20, 40, 20])
    }
    if (onRevealComplete) {
      onRevealComplete()
      return
    }
    onSubmit?.({ completed: true, text: myEntry?.text || answerText.trim() })
  }

  // If user chose to peek at the board, render an elegant, non-intrusive floating pill
  if (isMinimized) {
    return (
      <div className="activity-minimized-container">
        <button
          className={`activity-minimized-pill vibe-${vibe}`}
          onClick={onToggleMinimize}
          type="button"
          aria-label={`Resume active moment: ${definition?.label || 'Moment'}`}
        >
          <span className="minimized-seal-badge" aria-hidden="true"><BrandText text={"✉️"} /></span>
          <div className="minimized-pill-info">
            <strong>{definition?.label || 'Shared Moment'}</strong>
            <span className="minimized-pill-status">
              <BrandText text={isBothSubmitted
                ? '✨ Ready to reveal — Tap to view'
                : isMyAnswerSubmitted
                  ? `Sealed • Waiting for ${partnerPlayer.displayName}`
                  : 'In progress • Tap to resume'} />
            </span>
          </div>
          <span className="minimized-expand-arrow" aria-hidden="true"><BrandText text={"↗"} /></span>
        </button>
      </div>
    )
  }

  return (
    <div className={`activity-tile-rise-overlay vibe-${vibe}`}>
      {/* Top Controls Bar */}
      <div className="activity-modal-top-bar">
        <div className="activity-top-left">
          {onToggleMinimize && (
            <button
              className="activity-peek-btn"
              onClick={onToggleMinimize}
              type="button"
              aria-label="Peek at the board"
            >
              <span aria-hidden="true"><BrandText text={"👁️"} /></span> Peek Board
            </button>
          )}
        </div>


      </div>

      {/* Synchronized Reveal State */}
      {isRevealed ? (
        <div className="activity-reveal-card" role="status" aria-live="polite">
          <div className="reveal-banner">
            <span className="reveal-sparkle" aria-hidden="true"><BrandText text={"✨"} /></span>
            <h3>Revealed Together</h3>
            <span className="reveal-sparkle" aria-hidden="true"><BrandText text={"✨"} /></span>
          </div>

          <p className="activity-modal-title">{definition?.label || 'Shared Moment'}</p>
          <blockquote className="activity-prompt-quote">"{prompt}"</blockquote>

          <div className="reveal-cards-container">
            {/* Current Player Card */}
            <div className="reveal-entry-block" style={{ '--border-accent': currentTheme.color }}>
              <div className="entry-head">
                <strong>{currentPlayer.displayName}</strong>
                <span className="entry-role-tag">Answer</span>
              </div>
              <p className="entry-answer-text">
                {myEntry?.text || answerText || '(No response recorded)'}
              </p>
            </div>

            {/* Partner Player Card */}
            <div className="reveal-entry-block" style={{ '--border-accent': partnerTheme.color }}>
              <div className="entry-head">
                <strong>{partnerPlayer.displayName}</strong>
                <span className="entry-role-tag">Answer</span>
              </div>
              <p className="entry-answer-text">
                {partnerEntry?.text || '(Waiting for entry)'}
              </p>
            </div>
          </div>

          <div className="reveal-reward-banner">
            <span className="reward-heart" aria-hidden="true"><BrandText text={"💛"} /></span>
            <span>+{2 + (definition?.intensity || 1)} Hearts Added to Your Bloom</span>
          </div>

          <button
            className="primary-btn activity-reveal-done-btn"
            onClick={handleCompleteReveal}
            type="button"
          >
            Keep This Memory & Return to Board
          </button>
        </div>
      ) : isMyAnswerSubmitted ? (
        /* Sealed State: Current player finished, waiting for partner */
        <div className="activity-wax-sealed-state" role="status" aria-live="polite">
          <div className="wax-seal-ornament">
            <div className="wax-stamp-outer">
              <div className="wax-stamp-inner">
                <span className="wax-stamp-monogram" aria-hidden="true"><BrandText text={"✉️"} /></span>
              </div>
            </div>
            <div className="wax-shimmer-ring" />
          </div>

          <h3>Sealed with Care</h3>
          <p className="support-copy">
            Your answer is saved. When {partnerPlayer.displayName} finishes, you’ll see both responses together.
          </p>

          <div className="sealed-progress-pill">
            <span className="sealed-dot is-complete"><BrandText text={"✓ You"} /></span>
            <span className="sealed-dot-divider">—</span>
            <span className="sealed-dot is-pending"><BrandText text={"⏳ "} />{partnerPlayer.displayName}</span>
          </div>

          {error && <p className="error-copy">{error}</p>}
        </div>
      ) : (
        /* One private answer per player; prediction lives in its dedicated game. */
        <div className="activity-perspective-wrapper">
          <div className="activity-flip-container">
            <div className="activity-card-face face-front">
              {artSrc ? <img src={artSrc} alt="" aria-hidden="true" className="activity-tile__art" loading="lazy" /> : null}
              <div className="face-header">
                <h3 className="activity-modal-title">{definition?.label || 'Shared Moment'}</h3>
                <p className="activity-prompt-text">{prompt}</p>
              </div>

              <div className="activity-input-area">
                <label htmlFor="activity-answer-input" className="visually-hidden">
                  Your Answer
                </label>
                <textarea
                  id="activity-answer-input"
                  className="text-entry activity-textarea"
                  disabled={disabled}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={4}
                  value={answerText}
                />
              </div>

              <div className="face-actions">
                <button
                  className="primary-btn activity-flip-btn"
                  disabled={disabled || !hasThreeLetters(answerText)}
                  onClick={handleSealAndSubmit}
                  type="button"
                >
                  Seal My Turn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <p className="error-copy activity-error-banner">{error}</p>}
    </div>
  )
}
