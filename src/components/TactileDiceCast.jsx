import { useEffect, useRef, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'

const PIP_COORDINATES = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 25], [28, 50], [28, 75], [72, 25], [72, 50], [72, 75]],
}

export function DieFace({ value = 1, isDie2 = false, offset = { x: 0, y: 0, rot: 0 } }) {
  const pips = PIP_COORDINATES[Math.min(6, Math.max(1, value))] || PIP_COORDINATES[1]
  const baseRotation = isDie2 ? 8 : -6

  return (
    <div
      className={`tactile-die${isDie2 ? ' die-secondary' : ' die-primary'}`}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${baseRotation + offset.rot}deg)`,
      }}
      aria-hidden="true"
    >
      <svg className="die-svg" viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <radialGradient id={`die-grad-${isDie2 ? '2' : '1'}`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#2c2833" />
            <stop offset="60%" stopColor="#18161c" />
            <stop offset="100%" stopColor="#0e0d11" />
          </radialGradient>
          <radialGradient id="pip-grad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ffecb3" />
            <stop offset="60%" stopColor="#f5c768" />
            <stop offset="100%" stopColor="#cfa13a" />
          </radialGradient>
          <filter id="die-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.55" />
          </filter>
        </defs>
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="18"
          ry="18"
          fill={`url(#die-grad-${isDie2 ? '2' : '1'})`}
          stroke="#42394a"
          strokeWidth="2.5"
          filter="url(#die-shadow)"
        />
        {pips.map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="8"
            fill="url(#pip-grad)"
            stroke="#967527"
            strokeWidth="0.8"
          />
        ))}
      </svg>
    </div>
  )
}

export function TactileDiceCast({
  canRoll = true,
  disabled = false,
  isRolling = false,
  lastDice = [1, 1],
  onRoll,
  statusLabel = '',
}) {
  const { playDiceRattle, playDiceCast } = useAudio()
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0, rot: 0 })
  const [isRubbing, setIsRubbing] = useState(false)
  const lastRattleTimeRef = useRef(0)
  const pointerStartRef = useRef(null)
  const activePointerIdRef = useRef(null)

  const triggerHaptic = (ms = 12) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms)
      } catch {
        // Ignore haptic failures
      }
    }
  }

  const handleRattleFeedback = () => {
    const now = performance.now()
    if (now - lastRattleTimeRef.current > 75) {
      lastRattleTimeRef.current = now
      playDiceRattle?.()
      triggerHaptic(14)
    }
  }

  const handlePointerDown = (event) => {
    if (!canRoll || disabled || isRolling) return

    activePointerIdRef.current = event.pointerId
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
    }
    setIsRubbing(true)
    handleRattleFeedback()
    if (event.currentTarget.setPointerCapture) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // Fallback for environments lacking pointer capture
      }
    }
  }

  const handlePointerMove = (event) => {
    if (!pointerStartRef.current || activePointerIdRef.current !== event.pointerId) return

    const deltaX = event.clientX - pointerStartRef.current.x
    const deltaY = event.clientY - pointerStartRef.current.y
    const distance = Math.hypot(deltaX, deltaY)

    if (distance > 6) {
      handleRattleFeedback()
    }

    // Limit drag to reasonable thumb zone travel (-60px up, +/-40px sides)
    const clampedX = Math.max(-40, Math.min(40, deltaX * 0.45))
    const clampedY = Math.max(-65, Math.min(25, deltaY * 0.55))
    const rotation = (deltaX * 0.35) % 30

    setDragOffset({ x: clampedX, y: clampedY, rot: rotation })
  }

  const handlePointerUp = (event) => {
    if (activePointerIdRef.current !== event.pointerId) return

    const start = pointerStartRef.current
    pointerStartRef.current = null
    activePointerIdRef.current = null
    setIsRubbing(false)
    setDragOffset({ x: 0, y: 0, rot: 0 })

    if (!start || !canRoll || disabled || isRolling) return

    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    const upwardFlick = deltaY < -24
    const tapDistance = Math.hypot(deltaX, deltaY)

    // Either a flick up, or a tap, or a settled rub release
    if (upwardFlick || tapDistance < 14 || Math.abs(deltaX) > 20) {
      playDiceCast?.()
      triggerHaptic(28)
      onRoll?.()
    }
  }

  const handlePointerCancel = () => {
    pointerStartRef.current = null
    activePointerIdRef.current = null
    setIsRubbing(false)
    setDragOffset({ x: 0, y: 0, rot: 0 })
  }

  const handleKeyDown = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (canRoll && !disabled && !isRolling) {
        playDiceCast?.()
        triggerHaptic(25)
        onRoll?.()
      }
    }
  }

  useEffect(() => {
    return () => {
      pointerStartRef.current = null
      activePointerIdRef.current = null
    }
  }, [])

  const diceSum = (lastDice?.[0] || 1) + (lastDice?.[1] || 1)

  return (
    <div
      className={`tactile-dice-container${isRolling ? ' is-rolling' : ''}${isRubbing ? ' is-rubbing' : ''}${!canRoll ? ' is-disabled' : ''}`}
      aria-label="Tactile dice roll area"
    >
      <div
        className="tactile-dice-pad"
        data-testid="tactile-dice-pad"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
        tabIndex={canRoll && !disabled && !isRolling ? 0 : -1}
        aria-label={
          canRoll
            ? `Tactile dice pad. Current total is ${diceSum}. Rub to rattle or swipe up to cast.`
            : statusLabel || 'Dice waiting'
        }
      >
        <div className="tactile-dice-pair">
          <DieFace
            value={lastDice?.[0] || 1}
            isDie2={false}
            offset={{
              x: dragOffset.x * 0.7 - (isRubbing ? 4 : 0),
              y: dragOffset.y * 0.9,
              rot: dragOffset.rot * 0.8,
            }}
          />
          <DieFace
            value={lastDice?.[1] || 1}
            isDie2={true}
            offset={{
              x: dragOffset.x * 0.9 + (isRubbing ? 4 : 0),
              y: dragOffset.y * 0.8,
              rot: -dragOffset.rot * 0.8,
            }}
          />
        </div>
        <div className="tactile-gesture-hint" aria-hidden="true">
          {isRolling ? (
            <span className="hint-text animate-pulse">Casting dice…</span>
          ) : canRoll ? (
            <span className="hint-text">
              <span className="hint-arrow">▲</span> Rub to rattle • Swipe or tap to cast
            </span>
          ) : (
            <span className="hint-text">{statusLabel}</span>
          )}
        </div>
      </div>

      <button
        type="button"
        className="primary-btn dice-roll-btn"
        disabled={!canRoll || disabled || isRolling}
        onClick={() => {
          playDiceCast?.()
          triggerHaptic(25)
          onRoll?.()
        }}
        aria-label={isRolling ? 'Rolling two dice' : canRoll ? 'Roll 2 Dice (2–12)' : statusLabel || 'Waiting'}
      >
        {isRolling ? 'Rolling 2 Dice…' : canRoll ? `Roll 2 Dice (2–12)` : statusLabel || 'Waiting'}
      </button>
    </div>
  )
}
