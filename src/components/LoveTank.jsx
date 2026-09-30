import { useEffect, useRef, useState } from 'react'

const LOVE_TANK_GOAL = 24

/**
 * The Love Tank: a shared meter for the night's hearts. It fills as the
 * couple earns hearts together — never drains into a scoreboard, it is
 * purely "look what we built."
 */
export function LoveTank({ hearts, onOpenGuide }) {
  const [displayed, setDisplayed] = useState(hearts)
  const rafRef = useRef(null)

  useEffect(() => {
    const start = displayed
    const delta = hearts - start

    if (delta === 0) {
      return undefined
    }

    const startTime = performance.now()
    const duration = Math.min(1200, 300 + Math.abs(delta) * 120)

    function tick(now) {
      const progress = Math.min(1, (now - startTime) / duration)
      const eased = 1 - (1 - progress) ** 3
      setDisplayed(Math.round(start + delta * eased))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
    // Animate toward the latest hearts value on each change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hearts])

  const fillPercent = Math.min(100, Math.max(4, (displayed / LOVE_TANK_GOAL) * 100))

  return (
    <button
      aria-label={`Love Tank: ${displayed} shared hearts. Open guide.`}
      className="chip love-tank"
      onClick={onOpenGuide}
      type="button"
    >
      <span className="love-tank-liquid" style={{ height: `${fillPercent}%` }} aria-hidden="true" />
      <span className="love-tank-label" aria-hidden="true">♥</span>
      <strong>{displayed}</strong>
    </button>
  )
}
