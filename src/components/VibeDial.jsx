import { useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_VIBE_WEIGHTS, normalizeVibeWeights } from '../features/session/sessionWiring.js'

const DEFAULT_TRIANGLE_SIZE = {
  height: 239.2,
  width: 260,
}
const HANDLE_RADIUS = 15

export function getInsetTriangle(
  width = DEFAULT_TRIANGLE_SIZE.width,
  height = DEFAULT_TRIANGLE_SIZE.height,
  radius = HANDLE_RADIUS,
) {
  const safeWidth = Math.max(1, width)
  const safeHeight = Math.max(1, height)
  const safeRadius = Math.min(radius, safeWidth * 0.12, safeHeight * 0.12)
  const slope = safeWidth / (2 * safeHeight)
  const normalLength = Math.hypot(1, slope)
  const topY = (safeRadius * normalLength) / slope
  const bottomY = safeHeight - safeRadius
  const bottomInset = safeRadius * (slope + normalLength)

  return {
    playful: { x: bottomInset, y: bottomY },
    spicy: { x: safeWidth - bottomInset, y: bottomY },
    tender: { x: safeWidth / 2, y: topY },
  }
}

function getBarycentricWeights(point, triangle) {
  const tender = triangle.tender
  const playful = triangle.playful
  const spicy = triangle.spicy
  const denominator =
    (playful.y - spicy.y) * (tender.x - spicy.x) +
    (spicy.x - playful.x) * (tender.y - spicy.y)

  const tenderWeight =
    ((playful.y - spicy.y) * (point.x - spicy.x) +
      (spicy.x - playful.x) * (point.y - spicy.y)) /
    denominator
  const playfulWeight =
    ((spicy.y - tender.y) * (point.x - spicy.x) +
      (tender.x - spicy.x) * (point.y - spicy.y)) /
    denominator

  return {
    playful: playfulWeight,
    spicy: 1 - tenderWeight - playfulWeight,
    tender: tenderWeight,
  }
}

function closestPointOnSegment(point, start, end) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSquared = dx * dx + dy * dy
  const progress = lengthSquared
    ? ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared
    : 0
  const clampedProgress = Math.max(0, Math.min(1, progress))

  return {
    x: start.x + dx * clampedProgress,
    y: start.y + dy * clampedProgress,
  }
}

export function clampPointToTriangle(point, triangle) {
  const weights = getBarycentricWeights(point, triangle)
  if (Object.values(weights).every((weight) => weight >= 0)) {
    return point
  }

  const edges = [
    [triangle.tender, triangle.playful],
    [triangle.playful, triangle.spicy],
    [triangle.spicy, triangle.tender],
  ]
  return edges
    .map(([start, end]) => closestPointOnSegment(point, start, end))
    .sort((left, right) => {
      const leftDistance = (left.x - point.x) ** 2 + (left.y - point.y) ** 2
      const rightDistance = (right.x - point.x) ** 2 + (right.y - point.y) ** 2
      return leftDistance - rightDistance
    })[0]
}

export function weightsToPosition(
  weights,
  triangle = getInsetTriangle(),
) {
  const normalized = normalizeVibeWeights(weights)

  return {
    x:
      normalized.tender * triangle.tender.x +
      normalized.playful * triangle.playful.x +
      normalized.spicy * triangle.spicy.x,
    y:
      normalized.tender * triangle.tender.y +
      normalized.playful * triangle.playful.y +
      normalized.spicy * triangle.spicy.y,
  }
}

export function positionToWeights(
  x,
  y,
  triangle = getInsetTriangle(),
) {
  return normalizeVibeWeights(getBarycentricWeights({ x, y }, triangle))
}

export function VibeDial({
  defaultWeights = DEFAULT_VIBE_WEIGHTS,
  disabled = false,
  onConfirm,
  playerName,
}) {
  const activePointerIdRef = useRef(null)
  const triangleRef = useRef(null)
  const [triangleSize, setTriangleSize] = useState(DEFAULT_TRIANGLE_SIZE)
  const [weights, setWeights] = useState(() => normalizeVibeWeights(defaultWeights))

  useEffect(() => {
    setWeights(normalizeVibeWeights(defaultWeights))
  }, [defaultWeights])

  useEffect(() => {
    const triangle = triangleRef.current
    if (!triangle) {
      return undefined
    }

    const updateSize = () => {
      const rect = triangle.getBoundingClientRect()
      if (rect.width && rect.height) {
        setTriangleSize({
          height: rect.height,
          width: rect.width,
        })
      }
    }
    const observer = new ResizeObserver(updateSize)
    observer.observe(triangle)
    updateSize()

    return () => observer.disconnect()
  }, [])

  const triangle = useMemo(
    () => getInsetTriangle(triangleSize.width, triangleSize.height),
    [triangleSize],
  )
  const position = useMemo(
    () => weightsToPosition(weights, triangle),
    [triangle, weights],
  )

  useEffect(() => {
    const exposedState = {
      marker: {
        x: Number(position.x.toFixed(2)),
        y: Number(position.y.toFixed(2)),
      },
      weights: Object.fromEntries(
        Object.entries(weights).map(([vibe, value]) => [
          vibe,
          Number(value.toFixed(4)),
        ]),
      ),
      withinTriangle: true,
    }
    window.__atLongLastVibeDialState = exposedState

    return () => {
      if (window.__atLongLastVibeDialState === exposedState) {
        delete window.__atLongLastVibeDialState
      }
    }
  }, [position, weights])

  function updateFromPointer(event) {
    if (!triangleRef.current) {
      return
    }

    const rect = triangleRef.current.getBoundingClientRect()
    const liveTriangle = getInsetTriangle(rect.width, rect.height)
    const point = clampPointToTriangle(
      {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
      liveTriangle,
    )

    setWeights(positionToWeights(point.x, point.y, liveTriangle))
  }

  function handlePointerDown(event) {
    if (disabled) {
      return
    }

    activePointerIdRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    updateFromPointer(event)
  }

  function handlePointerMove(event) {
    if (disabled || activePointerIdRef.current !== event.pointerId) {
      return
    }

    updateFromPointer(event)
  }

  function handlePointerUp(event) {
    if (activePointerIdRef.current !== event.pointerId) {
      return
    }

    activePointerIdRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handleKeyDown(event) {
    const movement = {
      ArrowDown: { x: 0, y: 8 },
      ArrowLeft: { x: -8, y: 0 },
      ArrowRight: { x: 8, y: 0 },
      ArrowUp: { x: 0, y: -8 },
    }[event.key]
    if (disabled || !movement) {
      return
    }

    event.preventDefault()
    const point = clampPointToTriangle(
      {
        x: position.x + movement.x,
        y: position.y + movement.y,
      },
      triangle,
    )
    setWeights(positionToWeights(point.x, point.y, triangle))
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

      <div className="vibe-surface">
        <div
          className="vibe-triangle-stage"
          onPointerCancel={handlePointerUp}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          ref={triangleRef}
        >
          <svg className="vibe-triangle" viewBox="0 0 300 300" aria-hidden="true">
            <polygon points="150,26 34,258 266,258" />
          </svg>
          <button
            aria-label="Move the vibe mix"
            aria-valuetext={`Tender ${Math.round(weights.tender * 100)}%, Playful ${Math.round(weights.playful * 100)}%, Spicy ${Math.round(weights.spicy * 100)}%`}
            className={`vibe-handle dominant-${dominant.toLowerCase()}`}
            disabled={disabled}
            onKeyDown={handleKeyDown}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
            type="button"
          >
            <span />
          </button>
        </div>
        <span className="vibe-label tender">Tender {Math.round(weights.tender * 100)}%</span>
        <span className="vibe-label playful">Playful {Math.round(weights.playful * 100)}%</span>
        <span className="vibe-label spicy">Spicy {Math.round(weights.spicy * 100)}%</span>
      </div>

      <div className="vibe-meter">
        <span className="vibe-fill tender" style={{ width: `${weights.tender * 100}%` }} />
        <span className="vibe-fill playful" style={{ width: `${weights.playful * 100}%` }} />
        <span className="vibe-fill spicy" style={{ width: `${weights.spicy * 100}%` }} />
      </div>

      <div className="vibe-summary">
        <strong>{dominant} leads.</strong>
        <span>Your two votes are averaged to weight prompts, duels, and the Spark spotlight.</span>
        <small>Spicy intensity 3 unlocks only when the shared Spicy mix reaches 50%.</small>
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
