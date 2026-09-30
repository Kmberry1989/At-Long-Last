import { useState } from 'react'
import { MOOD_OPTIONS } from '../features/session/sessionLogic.js'

/**
 * MoodPulse — the 10-second check-in that opens the night (research: Coupleness,
 * Official, Flamme). One tap, no paragraphs. The combined pulse seeds the
 * board's first activity so the night starts where the couple actually is.
 */
export function MoodPulse({ disabled = false, onConfirm, playerName }) {
  const [selected, setSelected] = useState('')

  return (
    <div className="overlay-card mood-card">
      <p className="eyebrow">Tonight&apos;s Pulse</p>
      <h3>How are you arriving tonight?</h3>
      <p className="support-copy">
        {playerName
          ? `${playerName}, tap the mood that fits. One tap — no essay.`
          : 'Tap the mood that fits. One tap — no essay.'}
      </p>

      <div className="mood-grid" role="radiogroup" aria-label="Your mood tonight">
        {MOOD_OPTIONS.map((option) => (
          <button
            aria-checked={selected === option.id}
            className={`mood-option${selected === option.id ? ' active' : ''}`}
            disabled={disabled}
            key={option.id}
            onClick={() => setSelected(option.id)}
            role="radio"
            type="button"
          >
            <span aria-hidden="true" className="mood-emoji">{option.emoji}</span>
            <span className="mood-label">{option.label}</span>
          </button>
        ))}
      </div>

      <button
        className="primary-btn"
        disabled={disabled || !selected}
        onClick={() => onConfirm(selected)}
        type="button"
      >
        Share My Mood
      </button>
    </div>
  )
}
