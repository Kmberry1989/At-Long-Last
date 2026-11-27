import { BrandText } from './BrandIcon.jsx'
import { useAudio } from '../audio/AudioProvider.jsx'
import { PLAYER_THEMES } from '../features/couple/playerAvatar.js'
import { getActivityChoiceConfig, getChoiceLabel } from '../features/session/activityChoiceData.js'

export function ActivityCardModal({
  activity,
  definition,
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
  const entries = activity?.state?.answers || {}
  const state = activity?.state || {}
  const fallbackChoiceConfig = getActivityChoiceConfig(definition)
  const options = state.options || fallbackChoiceConfig.options
  const answererIndex = state.answererIndex ?? activity?.ownerIndex ?? 0
  const predictorIndex = 1 - answererIndex
  const partnerIndex = 1 - playerIndex
  const currentPlayer = players[playerIndex] || { displayName: 'You' }
  const partnerPlayer = players[partnerIndex] || { displayName: 'Partner' }
  const answerer = players[answererIndex] || { displayName: 'Player 1' }
  const predictor = players[predictorIndex] || { displayName: 'Player 2' }
  const prompt = state.prompt || definition?.description || 'Choose the answer that fits you best.'
  const mode = state.responseMode || fallbackChoiceConfig.mode
  const isMatchMode = mode === 'match'
  const answerId = state.answerId || null
  const predictionId = state.predictionId || null
  const myAnswer = entries[String(playerIndex)] || null
  const partnerAnswer = entries[String(partnerIndex)] || null
  const submittedCount = isMatchMode ? Object.keys(entries).length : Number(Boolean(answerId)) + Number(Boolean(predictionId))
  const isBothSubmitted = isMatchMode ? submittedCount === 2 : Boolean(answerId && predictionId)
  const predictionCorrect = !isMatchMode && isBothSubmitted && predictionId === answerId
  const matched = isMatchMode && isBothSubmitted && entries['0'] === entries['1']
  const bonusHearts = (predictionCorrect || matched) ? 2 : 0
  const baseHearts = 2 + (definition?.intensity || 1)
  const heartReward = baseHearts + bonusHearts
  const vibe = definition?.vibe || activity?.vibe || 'tender'
  const artSrc = definition?.image ?? definition?.tileImage ?? definition?.art
  const canAnswererSubmit = !disabled && playerIndex === answererIndex && !answerId
  const canPredictorSubmit = !disabled && playerIndex === predictorIndex && Boolean(answerId) && !predictionId
  const canMatchSubmit = !disabled && !myAnswer && playerIndex === (state.turnIndex ?? answererIndex)
  const canChoose = isMatchMode ? canMatchSubmit : canAnswererSubmit || canPredictorSubmit
  const roleCopy = isMatchMode
    ? `Choose your own answer. ${partnerPlayer.displayName} will choose privately too.`
    : playerIndex === answererIndex
      ? 'Choose your own answer first. Your partner will make a private prediction.'
      : `Predict the answer ${answerer.displayName} chose. Their answer stays hidden until you lock yours.`

  async function submitChoice(choiceId) {
    if (!canChoose || !options.some(option => option.id === choiceId)) return
    audio.playCardSeal?.()
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([25, 45, 30])
    await onSubmit?.({ choiceId })
  }

  function finishReveal() {
    audio.playSuccess?.()
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([20, 40, 20])
    onRevealComplete?.()
  }

  if (isMinimized) {
    return (
      <div className="activity-minimized-container">
        <button className={`activity-minimized-pill vibe-${vibe}`} onClick={onToggleMinimize} type="button" aria-label={`Resume active moment: ${definition?.label || 'Moment'}`}>
          <span className="minimized-seal-badge" aria-hidden="true"><BrandText text="✉️" /></span>
          <div className="minimized-pill-info">
            <strong>{definition?.label || 'Shared Moment'}</strong>
            <span className="minimized-pill-status"><BrandText text={isBothSubmitted ? '✨ Ready to reveal — Tap to view' : myAnswer || (playerIndex === answererIndex && answerId) ? 'Sealed • Waiting for your person' : 'In progress • Tap to resume'} /></span>
          </div>
          <span className="minimized-expand-arrow" aria-hidden="true"><BrandText text="↗" /></span>
        </button>
      </div>
    )
  }

  return (
    <div className={`activity-tile-rise-overlay vibe-${vibe}`}>
      <div className="activity-modal-top-bar">
        <div className="activity-top-left">
          {onToggleMinimize && <button className="activity-peek-btn" onClick={onToggleMinimize} type="button" aria-label="Peek at the board"><span aria-hidden="true"><BrandText text="👁️" /></span> Peek Board</button>}
        </div>
      </div>

      {isBothSubmitted ? (
        <div className="activity-reveal-card" role="status" aria-live="polite">
          <div className="reveal-banner"><span className="reveal-sparkle" aria-hidden="true"><BrandText text="✨" /></span><h3>{isMatchMode ? matched ? 'You chose the same answer' : 'Different answers, both welcome' : predictionCorrect ? 'Good guess' : 'A little surprise'}</h3><span className="reveal-sparkle" aria-hidden="true"><BrandText text="✨" /></span></div>
          <p className="activity-modal-title">{definition?.label || 'Shared Moment'}</p>
          <blockquote className="activity-prompt-quote">“{prompt}”</blockquote>
          <div className="reveal-cards-container">
            {isMatchMode ? [0, 1].map(index => (
              <div className="reveal-entry-block" key={index} style={{ '--border-accent': PLAYER_THEMES[index]?.color }}>
                <div className="entry-head"><strong>{players[index]?.displayName || `Player ${index + 1}`}</strong><span className="entry-role-tag">Answer</span></div>
                <p className="entry-answer-text">{getChoiceLabel(options, entries[String(index)])}</p>
              </div>
            )) : <>
              <div className="reveal-entry-block" style={{ '--border-accent': PLAYER_THEMES[answererIndex]?.color }}>
                <div className="entry-head"><strong>{answerer.displayName}</strong><span className="entry-role-tag">Chose</span></div>
                <p className="entry-answer-text">{getChoiceLabel(options, answerId)}</p>
              </div>
              <div className="reveal-entry-block" style={{ '--border-accent': PLAYER_THEMES[predictorIndex]?.color }}>
                <div className="entry-head"><strong>{predictor.displayName}</strong><span className="entry-role-tag">Predicted</span></div>
                <p className="entry-answer-text">{getChoiceLabel(options, predictionId)}</p>
              </div>
            </>}
          </div>
          <div className="reveal-reward-banner">
            <span className="reward-heart" aria-hidden="true"><BrandText text="💛" /></span>
            <span>{isMatchMode ? matched ? `+${heartReward} hearts for matching` : `+${heartReward} shared hearts` : predictionCorrect ? `+${heartReward} hearts — correct prediction` : `+${heartReward} shared hearts`}</span>
          </div>
          <button className="primary-btn activity-reveal-done-btn" onClick={finishReveal} type="button">Keep This Memory &amp; Return to Board</button>
        </div>
      ) : !canChoose ? (
        <div className="activity-wax-sealed-state" role="status" aria-live="polite">
          <div className="wax-seal-ornament"><div className="wax-stamp-outer"><div className="wax-stamp-inner"><span className="wax-stamp-monogram" aria-hidden="true"><BrandText text="✉️" /></span></div></div><div className="wax-shimmer-ring" /></div>
          <h3>{isMatchMode && myAnswer || playerIndex === answererIndex && answerId || playerIndex === predictorIndex && predictionId ? 'Sealed with Care' : `${(isMatchMode ? players[state.turnIndex] : answerer)?.displayName || 'Your person'} is choosing`}</h3>
          <p className="support-copy">{isMatchMode ? 'Your answer is saved privately until both choices are ready.' : playerIndex === predictorIndex && !answerId ? `${answerer.displayName} chooses first. Their answer stays hidden until you make your prediction.` : 'Your answer is saved. You will see both choices together when the prediction is sealed.'}</p>
          <div className="sealed-progress-pill"><span className={`sealed-dot${submittedCount > 0 ? ' is-complete' : ' is-pending'}`}>{submittedCount > 0 ? '✓ ' : '⏳ '}{currentPlayer.displayName}</span><span className="sealed-dot-divider">—</span><span className="sealed-dot is-pending">⏳ {partnerPlayer.displayName}</span></div>
          {error && <p className="error-copy">{error}</p>}
        </div>
      ) : (
        <div className="activity-perspective-wrapper">
          <div className="activity-flip-container"><div className="activity-card-face face-front">
            {artSrc ? <img src={artSrc} alt="" aria-hidden="true" className="activity-tile__art" loading="lazy" /> : null}
            <div className="face-header"><h3 className="activity-modal-title">{definition?.label || 'Shared Moment'}</h3><p className="activity-prompt-text">{prompt}</p></div>
            <p className="activity-choice-role">{roleCopy}</p>
            <div className="activity-choice-grid" role="radiogroup" aria-label={prompt}>
              {options.map(option => <button aria-label={option.label} className="activity-choice-option" key={option.id} onClick={() => submitChoice(option.id)} type="button" disabled={!canChoose}>{option.label}</button>)}
            </div>
          </div></div>
        </div>
      )}

      {error && <p className="error-copy activity-error-banner">{error}</p>}
    </div>
  )
}
