import { useEffect, useMemo, useRef, useState } from 'react'
import { DoodleDuel } from '../../components/DoodleDuel.jsx'
import { KissCourier } from '../../components/KissCourier.jsx'
import { duelDefinitions } from './contentPackData.js'
import {
  WAVELENGTH_DUEL_ID,
  WAVELENGTH_PROMPT_COUNT,
  WAVELENGTH_PROMPTS,
  encodeWavelengthSubmission,
  isValidWavelengthSubmission,
  scoreWavelengthDuel,
  wavelengthHearts,
} from './wavelengthDuelData.js'

function DuelShell({ children, duel, onSkip }) {
  return (
    <div className={`overlay-card duel-card vibe-${duel.vibe}`}>
      <div className="overlay-head">
        <p className="eyebrow">{duel.vibe} duel</p>
        {duel.skippable && (
          <button className="secondary-link" onClick={onSkip} type="button">
            Skip Duel
          </button>
        )}
      </div>
      <h3>{duel.label}</h3>
      <p className="support-copy">{duel.prompt}</p>
      {children}
    </div>
  )
}

function QuickFlipDuel({ disabled, duel, onComplete, onSkip }) {
  const [phase, setPhase] = useState('ready')
  const [target, setTarget] = useState('HEART')
  const startAt = useRef(0)

  useEffect(() => {
    if (phase !== 'arming') {
      return undefined
    }

    const delay = 700 + Math.random() * 1200
    const timer = window.setTimeout(() => {
      const nextTarget = Math.random() > 0.5 ? 'HEART' : 'SPARK'
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
        score: 0,
        time: 99,
        won: false,
      })
      return
    }

    const won = choice === target
    const time = (performance.now() - startAt.current) / 1000
    setPhase('done')
    onComplete({
      highlight: won
        ? `hit ${target.toLowerCase()} in ${time.toFixed(2)}s`
        : 'went for the wrong symbol',
      score: won ? 1 : 0,
      time,
      won,
    })
  }

  return (
    <DuelShell duel={duel} onSkip={onSkip}>
      <div className="duel-stage">
        <div className={`flip-signal phase-${phase}`}>{phase === 'live' ? target : 'WAIT'}</div>
      </div>
      <div className="duel-actions">
        <button className="primary-btn alt" disabled={disabled} onClick={() => press('HEART')} type="button">
          Heart
        </button>
        <button className="primary-btn alt" disabled={disabled} onClick={() => press('SPARK')} type="button">
          Spark
        </button>
      </div>
      <button
        className="primary-btn"
        disabled={disabled || phase !== 'ready'}
        onClick={() => setPhase('arming')}
        type="button"
      >
        Ready
      </button>
    </DuelShell>
  )
}

function TargetTapDuel({ disabled, duel, onComplete, onSkip }) {
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
        score: 0,
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
      highlight: `landed it in ${time.toFixed(2)}s`,
      score: 1,
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
    <DuelShell duel={duel} onSkip={onSkip}>
      <div className="target-stage">
        {running && (
          <button className="moving-target" onClick={hitTarget} style={style} type="button">
            ♥
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

function HoldSyncDuel({ disabled, duel, onComplete, onSkip }) {
  const [running, setRunning] = useState(false)
  const [fill, setFill] = useState(0)
  const startAt = useRef(0)
  const frameRef = useRef(0)
  const targetTime = duel.id === 'sync-breath' ? 2.6 : 1.8

  useEffect(() => {
    if (!running) {
      cancelAnimationFrame(frameRef.current)
      return undefined
    }

    startAt.current = performance.now()

    const tick = () => {
      const elapsed = (performance.now() - startAt.current) / 1000
      const progress = Math.min(elapsed / (targetTime * 1.5), 1)
      setFill(progress * 100)

      if (progress >= 1) {
        setRunning(false)
        onComplete({
          delta: Math.abs(elapsed - targetTime),
          highlight: 'held past the sweet spot',
          score: 0,
          time: elapsed,
          won: false,
        })
        return
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [onComplete, running, targetTime])

  function release() {
    if (disabled || !running) {
      return
    }

    setRunning(false)
    const elapsed = (performance.now() - startAt.current) / 1000
    const delta = Math.abs(elapsed - targetTime)
    onComplete({
      delta,
      highlight:
        delta <= 0.22
          ? `sat right on the pulse at ${elapsed.toFixed(2)}s`
          : `missed the pulse by ${delta.toFixed(2)}s`,
      score: Math.max(0, 100 - delta * 100),
      time: elapsed,
      won: delta <= 0.22,
    })
  }

  return (
    <DuelShell duel={duel} onSkip={onSkip}>
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

function TextSprintDuel({ disabled, duel, onComplete, onSkip }) {
  const [text, setText] = useState('')
  const startedAtRef = useRef(performance.now())

  function finish() {
    if (disabled || !text.trim()) {
      return
    }

    const time = (performance.now() - startedAtRef.current) / 1000
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length
    onComplete({
      excerpt: text.trim().slice(0, 80),
      highlight: `shared ${wordCount} ${wordCount === 1 ? 'word' : 'words'} in ${time.toFixed(2)}s`,
      score: wordCount,
      time,
      won: true,
    })
  }

  return (
    <DuelShell duel={duel} onSkip={onSkip}>
      <textarea
        className="text-entry"
        disabled={disabled}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type your answer fast."
        rows={4}
        value={text}
      />
      <button className="primary-btn" disabled={disabled || !text.trim()} onClick={finish} type="button">
        Lock Answer
      </button>
    </DuelShell>
  )
}

function SliderMatchDuel({ disabled, duel, onComplete, onSkip }) {
  const [value, setValue] = useState(5)

  return (
    <DuelShell duel={duel} onSkip={onSkip}>
      <div className="slider-stage">
        <input
          className="range-input"
          disabled={disabled}
          max="10"
          min="1"
          onChange={(event) => setValue(Number(event.target.value))}
          type="range"
          value={value}
        />
        <div className="slider-value">{value}</div>
      </div>
      <button
        className="primary-btn"
        disabled={disabled}
        onClick={() =>
          onComplete({
            highlight: `locked ${value}/10`,
            score: value,
            time: 10 - value,
            value,
            won: true,
          })}
        type="button"
      >
        Lock It
      </button>
    </DuelShell>
  )
}

function ConstellationDuel({ disabled, duel, onComplete, onSkip }) {
  const canvasRef = useRef(null)
  const dotsRef = useRef([])
  const [dotCount, setDotCount] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) {
      return undefined
    }

    const devicePixelRatio = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * devicePixelRatio
    canvas.height = rect.height * devicePixelRatio
    context.scale(devicePixelRatio, devicePixelRatio)

    function redraw() {
      context.clearRect(0, 0, rect.width, rect.height)
      dotsRef.current.forEach((dot) => {
        context.fillStyle = '#f0d39f'
        context.beginPath()
        context.arc(dot.x, dot.y, 4, 0, Math.PI * 2)
        context.fill()
      })
    }

    redraw()
    return undefined
  }, [dotCount])

  function placeDot(event) {
    if (disabled || dotCount >= 5) {
      return
    }

    const rect = canvasRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    dotsRef.current = [...dotsRef.current, { x, y }]
    setDotCount(dotsRef.current.length)
  }

  function finish() {
    if (dotCount < 5) {
      return
    }

    const average = dotsRef.current.reduce(
      (current, dot) => ({
        x: current.x + dot.x,
        y: current.y + dot.y,
      }),
      { x: 0, y: 0 },
    )
    const center = {
      x: average.x / dotsRef.current.length,
      y: average.y / dotsRef.current.length,
    }
    const spread =
      dotsRef.current.reduce(
        (total, dot) => total + Math.hypot(dot.x - center.x, dot.y - center.y),
        0,
      ) / dotsRef.current.length

    onComplete({
      center,
      highlight: 'plotted a little sky map',
      score: Math.max(0, 100 - spread),
      spread,
      time: spread,
      won: true,
    })
  }

  return (
    <DuelShell duel={duel} onSkip={onSkip}>
      <div className="constellation-stage">
        <canvas className="constellation-canvas" onClick={placeDot} ref={canvasRef} />
        <p className="constellation-hint">{dotCount}/5 stars placed</p>
      </div>
      <button className="primary-btn" disabled={disabled || dotCount < 5} onClick={finish} type="button">
        Reveal My Sky
      </button>
    </DuelShell>
  )
}

function resolveTieByTime(resultA, resultB) {
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

function resolveSharedByDelta(resultA, resultB, threshold = 0.2) {
  const delta = Math.abs((resultA.delta ?? 99) - (resultB.delta ?? 99))
  if (resultA.delta <= threshold && resultB.delta <= threshold && delta <= threshold) {
    return { shared: true }
  }

  return { winnerIndex: (resultA.delta ?? 99) < (resultB.delta ?? 99) ? 0 : 1 }
}

function resolveSharedCompletion() {
  return { shared: true }
}

function resolveWavelengthHearts(resultOne, resultTwo) {
  return wavelengthHearts(scoreWavelengthDuel(resultOne, resultTwo).matches)
}

/**
 * Wavelength Duel — simultaneous prediction duel (research: Happy Couple's
 * double-answer format). Each player answers for themselves and guesses their
 * partner's answer on the same 5 prompts. Everything stays sealed until both
 * phones submit; scoring happens cross-player at reveal time.
 */
function WavelengthDuel({ disabled, duel, onComplete, onSkip, playerIndex = 0, players = [] }) {
  const [promptIndex, setPromptIndex] = useState(0)
  const [stage, setStage] = useState('answer')
  const [picked, setPicked] = useState('')
  const [answers, setAnswers] = useState([])
  const [guesses, setGuesses] = useState([])
  const startAt = useRef(0)

  useEffect(() => {
    startAt.current = performance.now()
  }, [])

  const partnerName = useMemo(() => {
    const partner = players[playerIndex === 0 ? 1 : 0]
    return partner?.displayName || 'your partner'
  }, [playerIndex, players])

  const prompt = WAVELENGTH_PROMPTS[promptIndex]
  const isLastPrompt = promptIndex === WAVELENGTH_PROMPT_COUNT - 1

  function advance(nextPicked) {
    if (disabled || !nextPicked) {
      return
    }

    if (stage === 'answer') {
      setAnswers((current) => [...current, nextPicked])
      setStage('guess')
      setPicked('')
      return
    }

    const nextGuesses = [...guesses, nextPicked]
    const nextAnswers = [...answers]

    if (!isLastPrompt) {
      setGuesses(nextGuesses)
      setPromptIndex(promptIndex + 1)
      setStage('answer')
      setPicked('')
      return
    }

    if (!isValidWavelengthSubmission(nextAnswers, nextGuesses)) {
      return
    }

    onComplete({
      excerpt: encodeWavelengthSubmission(nextAnswers, nextGuesses),
      highlight: 'locked in 5 answers and 5 guesses',
      score: 0,
      time: Number(((performance.now() - startAt.current) / 1000).toFixed(1)),
      won: true,
    })
  }

  return (
    <DuelShell duel={duel} onSkip={onSkip}>
      <div className="wavelength-progress" aria-label={`Prompt ${promptIndex + 1} of ${WAVELENGTH_PROMPT_COUNT}`}>
        {WAVELENGTH_PROMPTS.map((entry, index) => (
          <span
            className={
              index < promptIndex || (index === promptIndex && stage === 'guess')
                ? 'wavelength-dot done'
                : index === promptIndex
                  ? 'wavelength-dot current'
                  : 'wavelength-dot'
            }
            key={entry.id}
          />
        ))}
      </div>

      <div className="wavelength-prompt">
        <span>{stage === 'answer' ? 'Your honest answer' : `What will ${partnerName} pick?`}</span>
        <p>{prompt.text}</p>
      </div>

      <div className="connection-choice-grid" role="radiogroup" aria-label={prompt.text}>
        {prompt.options.map((option) => (
          <button
            aria-checked={picked === option.id}
            className={`connection-choice${picked === option.id ? ' active' : ''}`}
            disabled={disabled}
            key={option.id}
            onClick={() => setPicked(option.id)}
            role="radio"
            type="button"
          >
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      <p className="sealed-note">
        🔒 Sealed — {partnerName} can&apos;t see this until you both finish.
      </p>

      <button
        className="primary-btn"
        disabled={disabled || !picked}
        onClick={() => advance(picked)}
        type="button"
      >
        {isLastPrompt && stage === 'guess' ? 'Seal My Guesses' : stage === 'answer' ? 'Lock My Answer' : 'Lock My Guess'}
      </button>
    </DuelShell>
  )
}

const duelComponentMap = {
  'constellation-home': {
    component: ConstellationDuel,
    resolveTie: resolveSharedCompletion,
  },
  'doodle-duel-memory': {
    component: DoodleDuel,
    resolveTie: resolveSharedCompletion,
  },
  'emoji-court': {
    component: TextSprintDuel,
    resolveTie: resolveSharedCompletion,
  },
  'fever-dream-date': {
    component: TextSprintDuel,
    resolveTie: resolveSharedCompletion,
  },
  'gratitude-duel': {
    component: TextSprintDuel,
    resolveTie: resolveSharedCompletion,
  },
  'heartbeat-hold-tender': {
    component: HoldSyncDuel,
    resolveTie: (a, b) => resolveSharedByDelta(a, b, 0.22),
  },
  'kiss-courier': {
    component: KissCourier,
    resolveTie: () => ({ shared: true }),
  },
  'letterpress-one-word': {
    component: TextSprintDuel,
    resolveTie: resolveSharedCompletion,
  },
  'portrait-panic-directed': {
    component: DoodleDuel,
    resolveTie: resolveSharedCompletion,
  },
  'reaction-heart': {
    component: QuickFlipDuel,
    resolveTie: resolveTieByTime,
  },
  'slow-draw-portrait-romantic': {
    component: DoodleDuel,
    resolveTie: resolveSharedCompletion,
  },
  'sync-breath': {
    component: HoldSyncDuel,
    resolveTie: (a, b) => resolveSharedByDelta(a, b, 0.26),
  },
  'temperature-check': {
    component: SliderMatchDuel,
    resolveTie: resolveSharedCompletion,
  },
  'voice-note-trailer': {
    component: TextSprintDuel,
    resolveTie: resolveSharedCompletion,
  },
  [WAVELENGTH_DUEL_ID]: {
    component: WavelengthDuel,
    resolveHearts: resolveWavelengthHearts,
    resolveTie: () => ({ shared: true }),
  },
  'wavelength-slider': {
    component: SliderMatchDuel,
    resolveTie: resolveSharedCompletion,
  },
}

function buildRegistryEntry(definition) {
  const mapping = duelComponentMap[definition.id] || {
    component: TargetTapDuel,
    resolveTie: resolveTieByTime,
  }

  return {
    ...definition,
    durationMs: definition.durationSec * 1000,
    resolveTie: mapping.resolveTie,
    start: function DuelStart(props) {
      const Component = mapping.component
      return (
        <Component
          {...props}
          duel={definition}
          durationSec={definition.durationSec}
          prompt={definition.prompt}
        />
      )
    },
  }
}

export const duelRegistry = Object.fromEntries(
  duelDefinitions.map((definition) => [definition.id, buildRegistryEntry(definition)]),
)

export const duelIds = Object.keys(duelRegistry)

export function pickRandomDuelId(random = Math.random) {
  return duelIds[Math.floor(random() * duelIds.length)]
}

export { resolveTieByTime }
