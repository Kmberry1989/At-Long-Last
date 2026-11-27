import { BrandIcon, BrandText } from '../../components/BrandIcon.jsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DoodleDuel } from '../../components/DoodleDuel.jsx'
import { PortraitPanicDuel } from '../../components/PortraitPanicDuel.jsx'
import { KissCourier } from '../../components/KissCourier.jsx'
import { duelDefinitions } from './contentPackData.js'
import { STAR_MAP_VALUES, encodeStarMapRanking } from './starMapData.js'
import { getLetterpressPrompt } from './letterpressData.js'
import { getGratitudePrompt } from './gratitudeData.js'
import { MAD_LIBS_BLANKS, MAD_LIBS_TEMPLATES, fillLoveInTheBlanks } from './coupleArcade.js'
import {
  WAVELENGTH_DUEL_ID,
  WAVELENGTH_PROMPT_COUNT,
  WAVELENGTH_PROMPTS,
  encodeWavelengthSubmission,
  isValidWavelengthSubmission,
  scoreWavelengthDuel,
  wavelengthHearts,
} from './wavelengthDuelData.js'

function DuelShell({ children, duel }) {
  return (
    <div className={`overlay-card duel-card vibe-${duel.vibe}`}>
      <h3>{duel.label}</h3>
      <p className="support-copy">{duel.prompt}</p>
      {children}
    </div>
  )
}

function QuickFlipDuel({ disabled, duel, onComplete }) {
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
    <DuelShell duel={duel} >
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

function TargetTapDuel({ disabled, duel, onComplete }) {
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
    <DuelShell duel={duel} >
      <div className="target-stage">
        {running && (
          <button className="moving-target" onClick={hitTarget} style={style} type="button"><BrandText text={"♥ "} /></button>
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

function HoldSyncDuel({ disabled, duel, onComplete }) {
  const [running, setRunning] = useState(false)
  const [fill, setFill] = useState(0)
  const startAt = useRef(0)
  const frameRef = useRef(0)
  const targetTime = 1.8

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
    <DuelShell duel={duel} >
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

const calmPractices = [
  { id: 'breathe', label: 'Breathe', detail: '3 slow rounds', icon: 'wave' },
  { id: 'ground', label: 'Ground', detail: '3 · 2 · 1 senses', icon: 'eye' },
  { id: 'release', label: 'Unclench', detail: 'Jaw · shoulders · hands', icon: 'bloom' },
]
const groundingSteps = ['Name 3 things you see', 'Notice 2 things you feel', 'Listen for 1 sound']
const releaseSteps = ['Soften your jaw', 'Let your shoulders drop', 'Unclench your hands']

function CalmPauseDuel({ disabled, duel, onComplete }) {
  const [practice, setPractice] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [step, setStep] = useState(0)
  const startAt = useRef(0)
  const completed = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  function finish(selectedPractice, durationSec) {
    if (disabled || completed.current) return
    completed.current = true
    const selected = calmPractices.find(option => option.id === selectedPractice)
    onCompleteRef.current({
      practice: selectedPractice,
      highlight: selected?.label || 'quiet pause',
      score: 1,
      time: durationSec,
      won: true,
    })
  }

  function choosePractice(id) {
    completed.current = false
    setElapsed(0)
    setStep(0)
    startAt.current = performance.now()
    setPractice(id)
  }

  useEffect(() => {
    if (practice !== 'breathe') return undefined
    const timer = window.setInterval(() => {
      const nextElapsed = Math.min((performance.now() - startAt.current) / 1000, 30)
      setElapsed(nextElapsed)
      if (nextElapsed >= 30) {
        window.clearInterval(timer)
        finish('breathe', 30)
      }
    }, 100)
    return () => window.clearInterval(timer)
  }, [practice])

  const phaseSeconds = elapsed % 10
  const breathingIn = phaseSeconds < 4
  const breathScale = breathingIn ? 0.8 + (phaseSeconds / 4) * 0.38 : 1.18 - ((phaseSeconds - 4) / 6) * 0.38
  const grounding = practice === 'ground'
  const steps = grounding ? groundingSteps : releaseSteps

  return (
    <DuelShell duel={duel} >
      {!practice ? (
        <div className="calm-practice-options" aria-label="Choose a calming pause">
          {calmPractices.map(option => (
            <button className="calm-practice-option" disabled={disabled} key={option.id} onClick={() => choosePractice(option.id)} type="button">
              <BrandIcon name={option.icon} />
              <span><strong>{option.label}</strong><small>{option.detail}</small></span>
            </button>
          ))}
        </div>
      ) : practice === 'breathe' ? (
        <div className="calm-practice-active breathe-practice" aria-live="polite">
          <div className="breath-orb" style={{ transform: `scale(${breathScale})` }} aria-hidden="true"><BrandIcon name="wave" /></div>
          <strong>{breathingIn ? 'Breathe in' : 'Breathe out'}</strong>
          <small>{Math.min(3, Math.floor(elapsed / 10) + 1)} of 3 · easy breath, no hold</small>
          <button className="secondary-link calm-change" disabled={disabled} onClick={() => setPractice(null)} type="button">Choose another</button>
        </div>
      ) : (
        <div className="calm-practice-active" aria-live="polite">
          <div className="calm-step-markers" aria-label={`Step ${step + 1} of 3`}>
            {steps.map((_, index) => <span className={index <= step ? 'is-current' : ''} key={index} />)}
          </div>
          <strong className="calm-step-prompt">{steps[step]}</strong>
          <button className="primary-btn calm-next" disabled={disabled} onClick={() => {
            if (step === steps.length - 1) finish(practice, (performance.now() - startAt.current) / 1000)
            else setStep(value => value + 1)
          }} type="button">{step === steps.length - 1 ? 'Complete pause' : 'Next'}</button>
          <button className="secondary-link calm-change" disabled={disabled} onClick={() => setPractice(null)} type="button">Choose another</button>
        </div>
      )}
    </DuelShell>
  )
}

function TextSprintDuel({ disabled, duel, onComplete }) {
  const startedAtRef = useRef(performance.now())
  const choicesById = {
    'emoji-court': [
      'Guilty: borrowed the blankets for extra closeness.',
      'Not guilty: the blankets simply chose me.',
      'Requesting a cuddle-based retrial.',
      'The court finds us both adorable.',
    ],
    'fever-dream-date': [
      'A cozy dinner, a slow walk, and nowhere else to be.',
      'Dress up, find a new place, and make a night of it.',
      'Stay in with favorite snacks, a film, and soft light.',
      'Take a small spontaneous trip and follow the evening.',
    ],
    'voice-note-trailer': [
      'I am thinking of you and sending a little warmth.',
      'I cannot wait for our next ordinary moment together.',
      'You made my day better just by being in it.',
      'Save me a little time for us when you can.',
    ],
  }
  const choices = choicesById[duel.id] || choicesById['fever-dream-date']

  function finish(text) {
    if (disabled) return
    const time = (performance.now() - startedAtRef.current) / 1000
    onComplete({
      excerpt: text,
      highlight: `locked a choice in ${time.toFixed(2)}s`,
      score: 1,
      time,
      won: true,
    })
  }

  return (
    <DuelShell duel={duel} >
      <p className="support-copy">Choose the response that fits you best.</p>
      <div className="connection-choice-grid" role="radiogroup" aria-label={duel.prompt}>
        {choices.map((choice) => <button className="connection-choice" disabled={disabled} key={choice} onClick={() => finish(choice)} role="radio" type="button">{choice}</button>)}
      </div>
    </DuelShell>
  )
}

function GratitudeDuel({ disabled, duel, onComplete, promptSeed = '', round = 1 }) {
  const [choiceId, setChoiceId] = useState('')
  const prompt = getGratitudePrompt(duel.prompts, promptSeed, round)
  const choices = [
    { id: 'noticed', label: 'You noticed a small detail that mattered to me.' },
    { id: 'helped', label: 'You made an ordinary task feel easier.' },
    { id: 'encouraged', label: 'You gave me encouragement at the right time.' },
    { id: 'laughed', label: 'You helped me laugh when I needed it.' },
  ]

  function finish() {
    const response = choices.find((choice) => choice.id === choiceId)?.label
    if (disabled || !response) return
    onComplete({
      excerpt: response,
      highlight: 'saved an appreciation',
      score: 0,
      time: 0,
      won: true,
    })
  }

  return (
    <div className="overlay-card duel-card vibe-tender letterpress-duel-card">
      <h3>{duel.label}</h3>
      <p className="letterpress-prompt">{prompt}</p>
      <div className="connection-choice-grid" role="radiogroup" aria-label="Choose what you appreciate">
        {choices.map((choice) => <button aria-checked={choiceId === choice.id} className={`connection-choice${choiceId === choice.id ? ' active' : ''}`} key={choice.id} onClick={() => setChoiceId(choice.id)} role="radio" type="button">{choice.label}</button>)}
      </div>
      <button className="primary-btn" disabled={disabled || !choiceId} onClick={finish} type="button">Save</button>
    </div>
  )
}

function LetterpressDuel({ disabled, promptSeed = '', round = 1, onComplete }) {
  const [words, setWords] = useState([])
  const prompt = getLetterpressPrompt(promptSeed, round)
  const wordChoices = ['we', 'laugh', 'make', 'room', 'for', 'small', 'bright', 'moments']

  function toggleWord(word) {
    if (disabled) return
    setWords((current) => current.includes(word)
      ? current.filter((entry) => entry !== word)
      : current.length < 4 ? [...current, word] : current)
  }

  function finish() {
    if (disabled || words.length !== 4) return
    onComplete({
      excerpt: words.join(' '),
      highlight: 'added four words to the shared sentence',
      score: 0,
      time: 0,
      won: true,
    })
  }

  return (
    <div className="overlay-card duel-card vibe-tender letterpress-duel-card">
      <h3>Letterpress</h3>
      <p className="letterpress-prompt">{prompt}</p>
      <p className="support-copy">Choose four words to complete the thought.</p>
      <div className="connection-choice-grid letterpress-word-choices" role="group" aria-label="Choose four words">
        {wordChoices.map((word) => <button aria-pressed={words.includes(word)} className={`connection-choice${words.includes(word) ? ' active' : ''}`} disabled={disabled || (!words.includes(word) && words.length >= 4)} key={word} onClick={() => toggleWord(word)} type="button">{word}</button>)}
      </div>
      <span aria-live="polite" className="letterpress-count">{words.length}/4</span>
      <button className="primary-btn" disabled={disabled || words.length !== 4} onClick={finish} type="button">Lock words</button>
    </div>
  )
}

const NEXT_LINE_SEEDS = [
  { mode: 'story', line: 'One evening, we found a small door…' },
  { mode: 'song', line: 'Our little song begins with…' },
  { mode: 'story', line: 'The map led us somewhere unexpected…' },
  { mode: 'song', line: 'If this moment had a chorus…' },
]

function getNextLineSeed(seed, round) {
  const text = `${seed}:${round}`
  let hash = 2166136261
  for (const character of text) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619)
  return NEXT_LINE_SEEDS[(hash >>> 0) % NEXT_LINE_SEEDS.length]
}

function OurNextLineDuel({ disabled, promptSeed = '', round = 1, onComplete }) {
  const seed = getNextLineSeed(promptSeed, round)
  const choices = [
    'We found a quiet place and stayed until the stars came out.',
    'The map led us home, but we took the scenic way.',
    'Our little song turned an ordinary night into a story.',
    'We laughed, got lost, and called it the perfect plan.',
  ]

  return (
    <div className="overlay-card duel-card vibe-tender letterpress-duel-card our-next-line-card">
      <h3>Our Next Line</h3>
      <p className="letterpress-prompt">{seed.line}</p>
      <p className="support-copy">Choose the line you would add next.</p>
      <div className="connection-choice-grid" role="radiogroup" aria-label="Choose the next line">
        {choices.map((choice) => <button className="connection-choice" disabled={disabled} key={choice} onClick={() => onComplete({ excerpt: choice, highlight: `chose the next ${seed.mode} line`, score: 0, time: 0, won: true })} role="radio" type="button">{choice}</button>)}
      </div>
    </div>
  )
}

function LoveInTheBlanksDuel({ disabled, promptSeed = '', round = 1, onComplete }) {
  const [answers, setAnswers] = useState({})
  const [step, setStep] = useState(0)
  const text = `${promptSeed}:${round}`
  let hash = 2166136261
  for (const character of text) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619)
  const template = MAD_LIBS_TEMPLATES[(hash >>> 0) % MAD_LIBS_TEMPLATES.length]
  const blank = MAD_LIBS_BLANKS[step]
  const story = fillLoveInTheBlanks(template, answers)

  function choose(value) {
    if (disabled || !blank) return
    const next = { ...answers, [blank.id]: value }
    setAnswers(next)
    if (step === MAD_LIBS_BLANKS.length - 1) {
      onComplete({ excerpt: JSON.stringify({ title: template.title, text: fillLoveInTheBlanks(template, next) }), highlight: 'made a little story together', score: 0, time: 0, won: true })
      return
    }
    setStep(current => current + 1)
  }

  return (
    <div className="overlay-card duel-card vibe-playful love-in-the-blanks-card">
      <h3>Love in the Blanks</h3>
      <p className="letterpress-prompt">{blank.label}</p>
      <div className="mad-lib-options" role="group" aria-label={blank.label}>
        {blank.choices.map(choice => <button className="mad-lib-choice" disabled={disabled} key={choice} onClick={() => choose(choice)} type="button">{choice}</button>)}
      </div>
      <span className="letterpress-count">{step + 1}/{MAD_LIBS_BLANKS.length}</span>
      <p className="sr-only" aria-live="polite">{story}</p>
    </div>
  )
}

function SliderMatchDuel({ disabled, duel, onComplete }) {
  const [value, setValue] = useState(5)

  return (
    <DuelShell duel={duel} >
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

function ConstellationDuel({ disabled, duel, onComplete }) {
  const [ranking, setRanking] = useState([])

  function toggleValue(id) {
    if (disabled) return
    setRanking((current) => current.includes(id)
      ? current.filter((value) => value !== id)
      : current.length < 5 ? [...current, id] : current)
  }

  function moveValue(index, direction) {
    if (disabled) return
    setRanking((current) => {
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function finish() {
    const excerpt = encodeStarMapRanking(ranking)
    if (!excerpt) return
    onComplete({
      excerpt,
      highlight: 'ranked five meaningful values',
      score: 0,
      time: 0,
      won: true,
    })
  }

  return (
    <div className="overlay-card duel-card constellation-duel-card">
      <h3>{duel.label}</h3>
      <p className="support-copy">Choose five in importance order</p>
      <ol aria-label="Your ranked values" className="star-map-ranking">
        {ranking.map((id, index) => {
          const value = STAR_MAP_VALUES.find((entry) => entry.id === id)
          return <li key={id}>
            <span>{index + 1}</span>{value.label}
            <button aria-label={`Move ${value.label} up`} disabled={disabled || index === 0} onClick={() => moveValue(index, -1)} type="button">↑</button>
            <button aria-label={`Move ${value.label} down`} disabled={disabled || index === ranking.length - 1} onClick={() => moveValue(index, 1)} type="button">↓</button>
            <button aria-label={`Remove ${value.label}`} disabled={disabled} onClick={() => toggleValue(id)} type="button">×</button>
          </li>
        })}
      </ol>
      <div aria-label="Sentimental values" className="star-map-values">
        {STAR_MAP_VALUES.map((value) => {
          const rank = ranking.indexOf(value.id)
          return <button aria-pressed={rank >= 0} className={rank >= 0 ? 'is-ranked' : ''} disabled={disabled || (rank < 0 && ranking.length === 5)} key={value.id} onClick={() => toggleValue(value.id)} type="button">
            {rank >= 0 && <span>{rank + 1}</span>}{value.label}
          </button>
        })}
      </div>
      <button className="primary-btn" disabled={disabled || ranking.length !== 5} onClick={finish} type="button">
        Reveal tonight
      </button>
    </div>
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

function resolveReactionHeart(resultA, resultB) {
  if (!resultA.won && !resultB.won) return { noContest: true }
  if (resultA.won && !resultB.won) return { winnerIndex: 0 }
  if (resultB.won && !resultA.won) return { winnerIndex: 1 }
  if (resultA.time === resultB.time) return { noContest: true }
  return { winnerIndex: resultA.time < resultB.time ? 0 : 1 }
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
 * Wavelength — simultaneous prediction game (research: Happy Couple's
 * double-answer format). Each player answers for themselves and guesses their
 * partner's answer on the same 5 prompts. Everything stays sealed until both
 * phones submit; scoring happens cross-player at reveal time.
 */
function WavelengthDuel({ disabled, duel, onComplete, playerIndex = 0, players = [], prompts = null }) {
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

  const activePrompts = prompts && prompts.length >= WAVELENGTH_PROMPT_COUNT ? prompts : WAVELENGTH_PROMPTS
  const prompt = activePrompts[promptIndex]
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
    <DuelShell duel={duel} >
      <div className="wavelength-progress" aria-label={`Prompt ${promptIndex + 1} of ${WAVELENGTH_PROMPT_COUNT}`}>
        {activePrompts.map((entry, index) => (
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
        <span>{stage === 'answer' ? 'Your honest answer' : `What will ${partnerName} ${prompt.scale ? 'rate' : 'pick'}?`}</span>
        <p>{prompt.text}</p>
      </div>

      {prompt.scale ? (
        <div className="wavelength-scale-stage">
          <span>{prompt.scaleLabels[0]}</span>
          <input
            aria-label={prompt.text}
            className="range-input"
            disabled={disabled}
            max="10"
            min="1"
            onChange={(event) => setPicked('abcdefghij'[Number(event.target.value) - 1])}
            onPointerDown={(event) => setPicked('abcdefghij'[Number(event.currentTarget.value) - 1])}
            type="range"
            value={picked ? picked.charCodeAt(0) - 96 : 5}
          />
          <strong>{prompt.options.find((option) => option.id === picked)?.label || '5'}</strong>
          <span>{prompt.scaleLabels[1]}</span>
        </div>
      ) : (
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
      )}

      <p className="sealed-note"><BrandText text={"🔒 Sealed — "} />{partnerName} can&apos;t see this until you both finish.
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
    component: GratitudeDuel,
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
    component: LetterpressDuel,
    resolveTie: resolveSharedCompletion,
  },
  'our-next-line': {
    component: OurNextLineDuel,
    resolveTie: resolveSharedCompletion,
  },
  'love-in-the-blanks': {
    component: LoveInTheBlanksDuel,
    resolveTie: resolveSharedCompletion,
  },
  'portrait-panic-directed': {
    component: PortraitPanicDuel,
    resolveTie: resolveSharedCompletion,
  },
  'reaction-heart': {
    component: QuickFlipDuel,
    resolveTie: resolveReactionHeart,
  },
  'slow-draw-portrait-romantic': {
    component: DoodleDuel,
    resolveTie: resolveSharedCompletion,
  },
  'sync-breath': {
    component: CalmPauseDuel,
    resolveTie: resolveSharedCompletion,
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
    resolveHearts: mapping.resolveHearts,
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
