import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { DEFAULT_VIBE_WEIGHTS, normalizeVibeWeights } from '../features/session/sessionWiring.js'

function weightsToPosition(weights) {
  const normalized = normalizeVibeWeights(weights)
  const y = (1 - normalized.tender) * 100
  const horizontalBase = normalized.playful + normalized.spicy || 1
  const x = horizontalBase === 0 ? 50 : (normalized.spicy / horizontalBase) * 100

  return {
    x: Math.max(8, Math.min(92, x)),
    y: Math.max(8, Math.min(92, y)),
  }
}

function positionToWeights(x, y) {
  const tender = Math.max(0, 1 - y / 100)
  const playfulFactor = y / 100
  const playful = playfulFactor * (1 - x / 100)
  const spicy = playfulFactor * (x / 100)

  return normalizeVibeWeights({ tender, playful, spicy })
}

export function VibeDial({
  defaultWeights = DEFAULT_VIBE_WEIGHTS,
  disabled = false,
  onConfirm,
  playerName,
}) {
  const surfaceRef = useRef(null)
  const initialPosition = useMemo(
    () => weightsToPosition(defaultWeights),
    [defaultWeights],
  )
  const [position, setPosition] = useState(initialPosition)
  const [weights, setWeights] = useState(() => normalizeVibeWeights(defaultWeights))

  useEffect(() => {
    setPosition(weightsToPosition(defaultWeights))
    setWeights(normalizeVibeWeights(defaultWeights))
  }, [defaultWeights])

  function handleDrag(_, info) {
    if (!surfaceRef.current) {
      return
    }

    const rect = surfaceRef.current.getBoundingClientRect()
    const x = ((info.point.x - rect.left) / rect.width) * 100
    const y = ((info.point.y - rect.top) / rect.height) * 100
    const clampedX = Math.max(8, Math.min(92, x))
    const clampedY = Math.max(8, Math.min(92, y))

    setPosition({ x: clampedX, y: clampedY })
    setWeights(positionToWeights(clampedX, clampedY))
  }

  const dominant = useMemo(() => {
    if (weights.tender >= weights.playful && weights.tender >= weights.spicy) {
      return 'Tender'
    }

    if (weights.playful >= weights.spicy) {
      return 'Playful'
    }

    return 'Spicy'
  }, [weights])

  return (
    <div className="overlay-card vibe-card">
      <p className="eyebrow">Set The Tone</p>
      <h3>How should tonight feel?</h3>
      <p className="support-copy">
        {playerName
          ? `${playerName}, drag toward the energy you want more of.`
          : 'Drag toward the energy you want more of tonight.'}
      </p>

      <div className="vibe-surface" ref={surfaceRef}>
        <svg className="vibe-triangle" viewBox="0 0 300 300" aria-hidden="true">
          <polygon points="150,26 34,258 266,258" />
        </svg>
        <span className="vibe-label tender">Tender {Math.round(weights.tender * 100)}%</span>
        <span className="vibe-label playful">Playful {Math.round(weights.playful * 100)}%</span>
        <span className="vibe-label spicy">Spicy {Math.round(weights.spicy * 100)}%</span>
        <motion.button
          aria-label="Move the vibe mix"
          className={`vibe-handle dominant-${dominant.toLowerCase()}`}
          drag={!disabled}
          dragConstraints={surfaceRef}
          dragElastic={0}
          dragMomentum={false}
          onDrag={handleDrag}
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
          }}
          type="button"
        >
          <span />
        </motion.button>
      </div>

      <div className="vibe-meter">
        <span className="vibe-fill tender" style={{ width: `${weights.tender * 100}%` }} />
        <span className="vibe-fill playful" style={{ width: `${weights.playful * 100}%` }} />
        <span className="vibe-fill spicy" style={{ width: `${weights.spicy * 100}%` }} />
      </div>

      <div className="vibe-summary">
        <strong>{dominant} leads.</strong>
        <span>Spicy intensity 3 only unlocks when both of you lean that way.</span>
      </div>

      <button
        className="primary-btn"
        disabled={disabled}
        onClick={() => onConfirm(weights)}
        type="button"
      >
        Lock My Vote
      </button>
    </div>
  )
}
