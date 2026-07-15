import { useEffect, useMemo, useRef, useState } from 'react'

function DuelShell({ children, label, prompt }) {
  return (
    <div className="overlay-card duel-card">
      <p className="eyebrow">Round Duel</p>
      <h3>{label}</h3>
      <p className="support-copy">{prompt}</p>
      {children}
    </div>
  )
}

function QuickFlipDuel({ disabled, onComplete }) {
  const [phase, setPhase] = useState('ready')
  const [target, setTarget] = useState('HEADS')
  const startAt = useRef(0)

  useEffect(() => {
    if (phase !== 'arming') {
      return undefined
    }

    const delay = 700 + Math.random() * 1200
    const timer = window.setTimeout(() => {
      const nextTarget = Math.random() > 0.5 ? 'HEADS' : 'TAILS'
      setTarget(nextTarget)
      startAt.current = performance.now()
      setPhase('live')
    }, delay)

    return () => window.clearTimeout(timer)
  }, [phase])

  function press(choice) {
    if (disabled) {
      return
    }

    if (phase !== 'live') {
      setPhase('done')
      onComplete({
        highlight: 'jumped too early',
        time: 99,
        won: false,
      })
      return
    }

    const won = choice === target
    const time = (performance.now() - startAt.current) / 1000
    setPhase('done')
    onComplete({
      highlight: won ? `called ${target.toLowerCase()} in ${time.toFixed(2)}s` : 'called the wrong side',
      time,
      won,
    })
  }

  return (
    <DuelShell
      label="Quick Flip"
      prompt="Wait for the call, then tap the right side before your partner does."
    >
      <div className="duel-stage">
        <div className={`flip-signal phase-${phase}`}>{phase === 'live' ? target : 'WAIT'}</div>
      </div>
      <div className="duel-actions">
        <button className="primary-btn alt" disabled={disabled} onClick={() => press('HEADS')} type="button">
          Heads
        </button>
        <button className="primary-btn alt" disabled={disabled} onClick={() => press('TAILS')} type="button">
          Tails
        </button>
      </div>
      <button
        className="primary-btn"
        disabled={disabled || phase !== 'ready'}
        onClick={() => setPhase('arming')}
        type="button"
      >
        Arm It
      </button>
    </DuelShell>
  )
}

function TargetTapDuel({ disabled, onComplete }) {
  const [running, setRunning] = useState(false)
  const [targetX, setTargetX] = useState(52)
  const [targetY, setTargetY] = useState(50)
  const startAt = useRef(0)
  const intervalRef = useRef(0)

  useEffect(() => {
    if (!running) {
      window.clearInterval(intervalRef.current)
      return undefined
    }

    intervalRef.current = window.setInterval(() => {
      setTargetX(15 + Math.random() * 70)
      setTargetY(18 + Math.random() * 62)
    }, 420)

    startAt.current = performance.now()

    const timeout = window.setTimeout(() => {
      setRunning(false)
      onComplete({
        highlight: 'timed out on the target',
        time: 99,
        won: false,
      })
    }, 4500)

    return () => {
      window.clearInterval(intervalRef.current)
      window.clearTimeout(timeout)
    }
  }, [onComplete, running])

  function hitTarget() {
    if (disabled || !running) {
      return
    }

    setRunning(false)
    const time = (performance.now() - startAt.current) / 1000
    onComplete({
      highlight: `nailed the target in ${time.toFixed(2)}s`,
      time,
      won: true,
    })
  }

  const style = useMemo(
    () => ({
      left: `${targetX}%`,
      top: `${targetY}%`,
    }),
    [targetX, targetY],
  )

  return (
    <DuelShell
      label="Target Tap"
      prompt="Start the hunt, then smash the moving target the moment it lands."
    >
      <div className="target-stage">
        {running && (
          <button
            className="moving-target"
            onClick={hitTarget}
            style={style}
            type="button"
          >
            ✦
          </button>
        )}
      </div>
      <button
        className="primary-btn"
        disabled={disabled || running}
        onClick={() => setRunning(true)}
        type="button"
      >
        Start Hunt
      </button>
    </DuelShell>
  )
}

function SteadyHoldDuel({ disabled, onComplete }) {
  const [running, setRunning] = useState(false)
  const [fill, setFill] = useState(0)
  const startAt = useRef(0)
  const frameRef = useRef(0)

  useEffect(() => {
    if (!running) {
      cancelAnimationFrame(frameRef.current)
      return undefined
    }

    startAt.current = performance.now()

    const tick = () => {
      const elapsed = (performance.now() - startAt.current) / 1000
      const progress = Math.min(elapsed / 2, 1)
      setFill(progress * 100)

      if (progress >= 1) {
        setRunning(false)
        onComplete({
          highlight: 'held too long',
          time: 99,
          won: false,
        })
        return
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameRef.current)
  }, [onComplete, running])

  function release() {
    if (disabled || !running) {
      return
    }

    setRunning(false)
    const elapsed = (performance.now() - startAt.current) / 1000
    const delta = Math.abs(elapsed - 1.25)
    const won = delta <= 0.18
    onComplete({
      highlight: won
        ? `stuck the sweet spot at ${elapsed.toFixed(2)}s`
        : `missed the sweet spot by ${delta.toFixed(2)}s`,
      time: elapsed,
      won,
    })
  }

  return (
    <DuelShell
      label="Steady Hold"
      prompt="Press and release when the bar lands inside the green window."
    >
      <div className="hold-track">
        <div className="hold-window" />
        <div className="hold-fill" style={{ width: `${fill}%` }} />
      </div>
      <div className="duel-actions">
        <button
          className="primary-btn"
          disabled={disabled || running}
          onPointerDown={() => setRunning(true)}
          onPointerUp={release}
          type="button"
        >
          Hold
        </button>
        <button className="primary-btn alt" disabled={disabled || !running} onClick={release} type="button">
          Release
        </button>
      </div>
    </DuelShell>
  )
}

export function resolveTieByTime(resultA, resultB) {
  if (resultA.won && resultB.won) {
    const delta = Math.abs(resultA.time - resultB.time)
    if (delta < 0.12) {
      return { retry: true }
    }

    return { winnerIndex: resultA.time < resultB.time ? 0 : 1 }
  }

  if (resultA.won || resultB.won) {
    return { winnerIndex: resultA.won ? 0 : 1 }
  }

  return { retry: true }
}

export const duelRegistry = {
  'quick-flip': {
    durationMs: 5000,
    id: 'quick-flip',
    label: 'Quick Flip',
    prompt: 'Call the right side after the reveal.',
    resolveTie: resolveTieByTime,
    start: QuickFlipDuel,
  },
  'steady-hold': {
    durationMs: 5000,
    id: 'steady-hold',
    label: 'Steady Hold',
    prompt: 'Release inside the green window.',
    resolveTie: resolveTieByTime,
    start: SteadyHoldDuel,
  },
  'target-tap': {
    durationMs: 4500,
    id: 'target-tap',
    label: 'Target Tap',
    prompt: 'Catch the moving target fast.',
    resolveTie: resolveTieByTime,
    start: TargetTapDuel,
  },
}

export const duelIds = Object.keys(duelRegistry)

export function pickRandomDuelId(random = Math.random) {
  return duelIds[Math.floor(random() * duelIds.length)]
}
