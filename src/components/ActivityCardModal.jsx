import { useMemo, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { getPlayerPiece, PLAYER_THEMES } from '../features/couple/playerAvatar.js'

const VIBE_INSPIRATIONS = {
  tender: ['A quiet moment I cherish', 'How safe you make me feel', 'The look in your eyes when…', 'A gratitude I rarely say'],
  playful: ['A silly memory of us', 'Next time we get spontaneous', 'If we could teleport right now', 'A confession that makes me smile'],
  curious: ['Something I wonder about you', 'A question I have never asked', 'How we have grown lately', 'A hidden dream for us'],
  spicy: ['A memory that still gives me chills', 'Something that draws me to you', 'A secret desire for tonight', 'When you look at me like that'],
  reflective: ['Looking back at how far we came', 'What I want to remember this year', 'A gentle shift in our bond', 'Where my heart feels at home'],
}

export function ActivityCardModal({
  activity,
  definition,
  disabled = false,
  error = null,
  isMinimized = false,
  onSkip,
  onSubmit,
  onToggleMinimize,
  playerIndex = 0,
  players = [],
}) {
  const audio = useAudio() || {}
  const { playAction, playCardFlip, playCardSeal, playChoiceTap, playSuccess } = audio

  const [flipped, setFlipped] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [guessText, setGuessText] = useState('')
  const [revealedLocally, setRevealedLocally] = useState(false)

  const partnerIndex = playerIndex === 0 ? 1 : 0
  const currentPlayer = players[playerIndex] || { displayName: 'You' }
  const partnerPlayer = players[partnerIndex] || { displayName: 'Partner' }

  const currentTheme = PLAYER_THEMES[playerIndex] || PLAYER_THEMES[0]
  const partnerTheme = PLAYER_THEMES[partnerIndex] || PLAYER_THEMES[1]

  const currentPiece = getPlayerPiece(currentPlayer.avatar)
  const partnerPiece = getPlayerPiece(partnerPlayer.avatar)

  const entries = activity?.state?.entries || []
  const myEntry = entries.find((e) => e.playerIndex === playerIndex)
  const partnerEntry = entries.find((e) => e.playerIndex === partnerIndex)

  const isMyAnswerSubmitted = Boolean(myEntry)
  const isPartnerAnswerSubmitted = Boolean(partnerEntry)
  const isBothSubmitted = isMyAnswerSubmitted && isPartnerAnswerSubmitted
  const isRevealed = isBothSubmitted || revealedLocally

  const vibe = definition?.vibe || activity?.vibe || 'tender'
  const activityType = definition?.type || activity?.type || 'reflection'
  const prompt = activity?.state?.prompt || definition?.description || 'Share a memory together.'

  const inspirations = useMemo(() => {
    return VIBE_INSPIRATIONS[vibe] || VIBE_INSPIRATIONS.tender
  }, [vibe])

  const responsePlaceholder = useMemo(() => {
    if (activityType === 'ritual') {
      return 'Describe what you choose, leave, or imagine together…'
    }
    if (activityType === 'journal') {
      return 'Write a couple of lines worth remembering…'
    }
    return 'Share what honestly comes to mind…'
  }, [activityType])

  const handleFlipToGuess = () => {
    if (!answerText.trim() && !myEntry) return
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

  const handleInspirationTap = (starter) => {
    playChoiceTap?.()
    setAnswerText((prev) => {
      const trimmed = prev.trim()
      if (!trimmed) return `${starter}: `
      return `${trimmed}\n${starter}: `
    })
  }

  const handleSealAndSubmit = () => {
    if (!answerText.trim() && !myEntry) return
    playCardSeal?.()
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([25, 45, 30])
    }

    // If partner already submitted, locally trigger reveal for smooth delight before unmounting
    if (isPartnerAnswerSubmitted) {
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
    onSubmit?.({
      completed: true,
      guess: myEntry?.guess || guessText.trim(),
      text: myEntry?.text || answerText.trim(),
    })
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
          <span className="minimized-seal-badge" aria-hidden="true">✉️</span>
          <div className="minimized-pill-info">
            <strong>{definition?.label || 'Shared Moment'}</strong>
            <span className="minimized-pill-status">
              {isBothSubmitted
                ? '✨ Ready to reveal — Tap to view'
                : isMyAnswerSubmitted
                  ? `Sealed • Waiting for ${partnerPlayer.displayName}`
                  : 'In progress • Tap to resume'}
            </span>
          </div>
          <span className="minimized-expand-arrow" aria-hidden="true">↗</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`activity-tile-rise-overlay vibe-${vibe}`}>
      {/* Top Controls Bar */}
      <div className="activity-modal-top-bar">
        <div className="activity-top-left">
          <span className={`activity-vibe-tag vibe-${vibe}`}>
            {vibe} {activityType}
          </span>
          {onToggleMinimize && (
            <button
              className="activity-peek-btn"
              onClick={onToggleMinimize}
              type="button"
              aria-label="Peek at the board"
            >
              <span aria-hidden="true">👁️</span> Peek Board
            </button>
          )}
        </div>

        {definition?.skippable && !isRevealed && (
          <button
            className="secondary-link activity-skip-btn"
            disabled={disabled}
            onClick={() => {
              playAction?.()
              onSkip?.()
            }}
            type="button"
          >
            Skip This
          </button>
        )}
      </div>

      {/* Paired Player Portraits Spotlight */}
      <div className="activity-paired-portraits" role="region" aria-label="Participant status">
        <div
          className={`activity-portrait-badge ${!flipped && !isMyAnswerSubmitted ? 'is-active-spotlight' : ''} ${isMyAnswerSubmitted ? 'is-sealed' : ''}`}
          style={{ '--player-color': currentTheme.color }}
        >
          <div className="portrait-avatar-wrapper">
            {currentPiece?.thumbnail ? (
              <img
                src={currentPiece.thumbnail}
                alt=""
                className="portrait-avatar-thumb"
              />
            ) : (
              <span className="portrait-avatar-initial">
                {currentPlayer.displayName?.[0] || 'Y'}
              </span>
            )}
            {isMyAnswerSubmitted && (
              <span className="sealed-check-mark" aria-label="Response sealed">✓</span>
            )}
          </div>
          <span className="portrait-name">{currentPlayer.displayName}</span>
          <span className="portrait-role">
            {isRevealed
              ? 'Shared'
              : isMyAnswerSubmitted
                ? '✉️ Sealed'
                : !flipped
                  ? 'Your Turn'
                  : 'Ready'}
          </span>
        </div>

        <div className="portraits-connection-line">
          <span className="connection-heart-icon" aria-hidden="true">💛</span>
        </div>

        <div
          className={`activity-portrait-badge ${flipped ? 'is-active-spotlight' : ''} ${isPartnerAnswerSubmitted ? 'is-sealed' : ''}`}
          style={{ '--player-color': partnerTheme.color }}
        >
          <div className="portrait-avatar-wrapper">
            {partnerPiece?.thumbnail ? (
              <img
                src={partnerPiece.thumbnail}
                alt=""
                className="portrait-avatar-thumb"
              />
            ) : (
              <span className="portrait-avatar-initial">
                {partnerPlayer.displayName?.[0] || 'P'}
              </span>
            )}
            {isPartnerAnswerSubmitted && (
              <span className="sealed-check-mark" aria-label="Partner response sealed">✓</span>
            )}
          </div>
          <span className="portrait-name">{partnerPlayer.displayName}</span>
          <span className="portrait-role">
            {isRevealed
              ? 'Shared'
              : isPartnerAnswerSubmitted
                ? '✉️ Sealed'
                : flipped
                  ? 'Guessing'
                  : 'Waiting'}
          </span>
        </div>
      </div>

      {/* Synchronized Reveal State */}
      {isRevealed ? (
        <div className="activity-reveal-card" role="status" aria-live="polite">
          <div className="reveal-banner">
            <span className="reveal-sparkle" aria-hidden="true">✨</span>
            <h3>Revealed Together</h3>
            <span className="reveal-sparkle" aria-hidden="true">✨</span>
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
            <span className="reward-heart" aria-hidden="true">💛</span>
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
                <span className="wax-stamp-monogram" aria-hidden="true">✉️</span>
              </div>
            </div>
            <div className="wax-shimmer-ring" />
          </div>

          <h3>Sealed with Care</h3>
          <p className="support-copy">
            Your reflection and guess are locked in wax. When {partnerPlayer.displayName} seals their turn, both answers will reveal together.
          </p>

          <div className="sealed-progress-pill">
            <span className="sealed-dot is-complete">✓ You</span>
            <span className="sealed-dot-divider">—</span>
            <span className="sealed-dot is-pending">⏳ {partnerPlayer.displayName}</span>
          </div>

          {onToggleMinimize && (
            <button
              className="secondary-btn activity-peek-board-btn"
              onClick={onToggleMinimize}
              type="button"
            >
              👁️ Peek at Board While Waiting
            </button>
          )}

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

              {/* Inspiration Chips */}
              <div className="activity-inspiration-row" aria-label="Inspiration starters">
                <span className="inspiration-label">Need a spark?</span>
                <div className="inspiration-chips">
                  {inspirations.map((starter) => (
                    <button
                      key={starter}
                      className="inspiration-chip"
                      onClick={() => handleInspirationTap(starter)}
                      type="button"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
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
                  placeholder={responsePlaceholder}
                  rows={4}
                  value={answerText}
                />
              </div>

              <div className="face-actions">
                <button
                  className="primary-btn activity-flip-btn"
                  disabled={disabled || !answerText.trim()}
                  onClick={handleFlipToGuess}
                  type="button"
                >
                  Next: Guess for {partnerPlayer.displayName} ↷
                </button>
                <span className="private-hint-copy">
                  🔒 Kept private until both of you seal tonight's moment.
                </span>
              </div>
            </div>

            {/* Back Face: Guess for Partner */}
            <div className="activity-card-face face-back">
              <div className="face-header">
                <h3 className="activity-modal-title">
                  Guess for {partnerPlayer.displayName}
                </h3>
                <p className="activity-guess-subtitle">
                  Step into {partnerPlayer.displayName}'s mind — how do you think they will respond to this prompt?
                </p>
                <blockquote className="activity-prompt-mini">"{prompt}"</blockquote>
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
                  placeholder={`What would ${partnerPlayer.displayName} say or feel?`}
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
                  ↶ My Answer
                </button>
                <button
                  className="primary-btn seal-btn"
                  disabled={disabled || !answerText.trim()}
                  onClick={handleSealAndSubmit}
                  type="button"
                >
                  {isPartnerAnswerSubmitted
                    ? '✨ Seal & Reveal'
                    : 'Seal My Turn ✉️'}
                </button>
              </div>

              <span className="private-hint-copy">
                {isPartnerAnswerSubmitted
                  ? `💛 ${partnerPlayer.displayName} has sealed their response! Ready to reveal.`
                  : `✉️ Stamped in wax until ${partnerPlayer.displayName} answers.`}
              </span>
            </div>
          </div>
        </div>
      )}

      {error && <p className="error-copy activity-error-banner">{error}</p>}
    </div>
  )
}
