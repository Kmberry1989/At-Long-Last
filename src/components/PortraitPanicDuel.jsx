import { useState } from 'react'
import { DoodleDuel } from './DoodleDuel.jsx'
import { PORTRAIT_GUIDE_CUES, getPortraitPanicStage, isValidPortraitGuide } from '../features/session/portraitPanic.js'

export function PortraitPanicDuel({ disabled, onComplete, duel, duelState = {}, playerIndex = 0, round = 0, promptSeed = '' }) {
  const [selectedCues, setSelectedCues] = useState([])
  const stage = getPortraitPanicStage(duelState, playerIndex)

  function toggleCue(id) {
    if (disabled) return
    setSelectedCues((current) => current.includes(id)
      ? current.filter((cue) => cue !== id)
      : current.length < 3 ? [...current, id] : current)
  }

  function sendCues() {
    if (!isValidPortraitGuide(selectedCues) || disabled) return
    onComplete({ guideCues: selectedCues })
  }

  if (stage === 'waiting' || stage === 'complete') return null

  if (stage === 'guide') {
    return (
      <div className="overlay-card duel-card portrait-panic-guide">
        <h3>{duel.label}</h3>
        <div aria-label="Choose three drawing cues" className="portrait-panic-cues">
          {PORTRAIT_GUIDE_CUES.map((cue) => (
            <button aria-pressed={selectedCues.includes(cue.id)} className={selectedCues.includes(cue.id) ? 'is-selected' : ''} disabled={disabled || (!selectedCues.includes(cue.id) && selectedCues.length === 3)} key={cue.id} onClick={() => toggleCue(cue.id)} type="button">
              {cue.label}
            </button>
          ))}
        </div>
        <button className="primary-btn" disabled={disabled || selectedCues.length !== 3} onClick={sendCues} type="button">Send cues</button>
      </div>
    )
  }

  const partnerCues = duelState.guides?.[String(1 - playerIndex)] || []
  const cueText = partnerCues.map((id) => PORTRAIT_GUIDE_CUES.find((cue) => cue.id === id)?.label.toLowerCase()).filter(Boolean).join(', ')
  return (
    <DoodleDuel
      disabled={disabled}
      duel={duel}
      onComplete={(result) => onComplete({ ...result, highlight: 'drew from your partner’s cues' })}
      prompt={`Draw your partner: ${cueText}.`}
      promptSeed={promptSeed}
      round={round}
      title={duel.label}
    />
  )
}
