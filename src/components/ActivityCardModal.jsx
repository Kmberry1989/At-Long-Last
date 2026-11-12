import { BrandIcon, BrandText } from './BrandIcon.jsx'
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
  const { playCardFlip, playCardSeal, playSuccess } = audio

  const [flipped, setFlipped] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [guessText, setGuessText] = useState('')
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



  const handleFlipToGuess = () => {
    if (!hasThreeLetters(answerText) && !myEntry) return
    playCardFlip?.()
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([15, 25, 15])
    }
    setFlipped(true)
  }

  const handleFlipToAnswer = () => {
    playCardFlip?.()
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15)
    }
    setFlipped(false)
  }



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

    onSubmit?.({
      guess: guessText.trim(),
      text: answerText.trim(),
    })
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
    onSubmit?.({ completed: true, guess: myEntry?.guess || guessText.trim(), text: myEntry?.text || answerText.trim() })
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
                <span className="entry-role-tag">Answer & Guess</span>
              </div>
              <p className="entry-answer-text">
                {myEntry?.text || answerText || '(No response recorded)'}
              </p>
              {(partnerEntry?.guess || guessText) && (
                <div className="entry-guess-preview">
                  <span className="guess-label">{partnerPlayer.displayName} guessed:</span>
                  <p className="guess-content">
                    "{partnerEntry?.guess || '(No guess provided)'}"
                  </p>
                </div>
              )}
            </div>

            {/* Partner Player Card */}
            <div className="reveal-entry-block" style={{ '--border-accent': partnerTheme.color }}>
              <div className="entry-head">
                <strong>{partnerPlayer.displayName}</strong>
                <span className="entry-role-tag">Answer & Guess</span>
              </div>
              <p className="entry-answer-text">
                {partnerEntry?.text || '(Waiting for entry)'}
              </p>
              {(myEntry?.guess || guessText) && (
                <div className="entry-guess-preview">
                  <span className="guess-label">You guessed:</span>
                  <p className="guess-content">
                    "{myEntry?.guess || guessText || '(No guess provided)'}"
                  </p>
                </div>
              )}
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
            Your reflection and guess are locked in wax. When {partnerPlayer.displayName} seals their turn, both answers will reveal together.
          </p>

          <div className="sealed-progress-pill">
            <span className="sealed-dot is-complete"><BrandText text={"✓ You"} /></span>
            <span className="sealed-dot-divider">—</span>
            <span className="sealed-dot is-pending"><BrandText text={"⏳ "} />{partnerPlayer.displayName}</span>
          </div>

          {error && <p className="error-copy">{error}</p>}
        </div>
      ) : (
        /* 3D Perspective Flip Container (Face 1: Your Answer, Face 2: Guess for Partner) */
        <div className="activity-perspective-wrapper">
          <div className={`activity-flip-container ${flipped ? 'is-flipped' : ''}`}>
            {/* Front Face: Your Answer */}
            <div className="activity-card-face face-front">
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
                  onClick={handleFlipToGuess}
                  type="button"
                >
                  NEXT
                </button>
              </div>
            </div>

            {/* Back Face: Guess for Partner */}
            <div className="activity-card-face face-back">
              <div className="face-header">
                <h3 className="activity-modal-title">
                  Guess for {partnerPlayer.displayName}
                </h3>
              </div>

              <div className="activity-input-area">
                <label htmlFor="activity-guess-input" className="visually-hidden">
                  Your guess for {partnerPlayer.displayName}
                </label>
                <textarea
                  id="activity-guess-input"
                  className="text-entry activity-textarea"
                  disabled={disabled}
                  onChange={(e) => setGuessText(e.target.value)}
                  rows={3}
                  value={guessText}
                />
              </div>

              <div className="face-actions-split">
                <button
                  className="secondary-btn back-flip-btn"
                  disabled={disabled}
                  onClick={handleFlipToAnswer}
                  type="button"
                >
                  <BrandIcon name="back" /> My Answer
                </button>
                <button
                  className="primary-btn seal-btn"
                  disabled={disabled || !hasThreeLetters(answerText)}
                  onClick={handleSealAndSubmit}
                  type="button"
                >
                  <BrandText text={!deferReveal && isPartnerAnswerSubmitted
                    ? '✨ Seal & Reveal'
                    : 'Seal My Turn ✉️'} />
                </button>
              </div>

              <span className="private-hint-copy">
                <BrandText text={deferReveal ? 'Seal your answer, then continue. Compare at the end of the night.' : isPartnerAnswerSubmitted
                  ? `💛 ${partnerPlayer.displayName} has sealed their response! Ready to reveal.`
                  : `✉️ Stamped in wax until ${partnerPlayer.displayName} answers.`} />
              </span>
            </div>
          </div>
        </div>
      )}

      {error && <p className="error-copy activity-error-banner">{error}</p>}
    </div>
  )
}
