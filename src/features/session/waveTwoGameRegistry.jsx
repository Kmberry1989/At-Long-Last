import { useEffect, useMemo, useRef, useState } from 'react'
import {
  TEMPO_TAP_ROUNDS,
  VIBE_CHECK_PROMPTS,
  WORD_WEAVER_PUZZLES,
} from './waveTwoGameData.js'

function pickItem(items, random = Math.random) {
  const index = Math.min(
    items.length - 1,
    Math.max(0, Math.floor(random() * items.length)),
  )
  return items[index]
}

function getPlayerName(players, playerIndex) {
  return players[playerIndex]?.displayName || `Player ${playerIndex + 1}`
}

function getNextPlayerIndex(playerIndex) {
  return playerIndex === 0 ? 1 : 0
}

function useActivityUiState(state) {
  useEffect(() => {
    window.__atLongLastActivityUiState = state

    return () => {
      if (window.__atLongLastActivityUiState === state) {
        delete window.__atLongLastActivityUiState
      }
    }
  }, [state])
}

function ActivityHeader({ definition, disabled, eyebrow, onSkip }) {
  return (
    <>
      <div className="overlay-head">
        <p className="eyebrow">{eyebrow}</p>
        {definition.skippable && (
          <button
            className="secondary-link"
            disabled={disabled}
            onClick={onSkip}
            type="button"
          >
            Skip This
          </button>
        )}
      </div>
      <h3>{definition.label}</h3>
      <p className="support-copy">{definition.description}</p>
    </>
  )
}

function WaitingCard({ detail, playerName }) {
  return (
    <div className="connection-waiting-card">
      <span aria-hidden="true">⌛</span>
      <strong>{playerName} is taking a turn.</strong>
      <p>{detail}</p>
    </div>
  )
}

function VibeCheckCard({
  activity,
  definition,
  disabled,
  onSkip,
  onSubmit,
  playerIndex,
  players,
}) {
  const state = activity.state
  const [value, setValue] = useState(50)
  const activeName = getPlayerName(players, state.turnIndex)
  const ownValue = state.values?.[String(playerIndex)]
  const hasOwnValue = Number.isFinite(ownValue)

  useEffect(() => {
    setValue(50)
  }, [activity.id, state.turnIndex])

  useActivityUiState(useMemo(() => ({
    control: 'continuum',
    leftLabel: state.leftLabel,
    rightLabel: state.rightLabel,
    value,
  }), [state.leftLabel, state.rightLabel, value]))

  return (
    <div className="overlay-card activity-card wave-two-card vibe-playful">
      <ActivityHeader
        definition={definition}
        disabled={disabled}
        eyebrow="Slider Sync"
        onSkip={onSkip}
      />
      <div className="connection-game-prompt">
        <span>Place your marker</span>
        <p>{state.prompt}</p>
      </div>
      <div className="turn-badge connection-turn-badge">
        <div>
          <strong>{activeName}</strong>
          <span> places a secret marker</span>
        </div>
        <span className="sealed-chip">{Object.keys(state.values || {}).length}/2 placed</span>
      </div>

      {hasOwnValue ? (
        <div className="connection-waiting-card">
          <span aria-hidden="true">◆</span>
          <strong>Your marker is hidden at {ownValue}.</strong>
          <p>The continuum reveals after both markers are locked.</p>
        </div>
      ) : disabled ? (
        <WaitingCard
          detail="Their marker stays hidden until yours is ready too."
          playerName={activeName}
        />
      ) : (
        <>
          <div className="vibe-check-surface">
            <div className="vibe-check-value">{value}</div>
            <input
              aria-label={state.prompt}
              className="range-input vibe-check-range"
              max="100"
              min="0"
              onChange={(event) => setValue(Number(event.target.value))}
              type="range"
              value={value}
            />
            <div className="vibe-check-labels">
              <span>{state.leftLabel}</span>
              <span>{state.rightLabel}</span>
            </div>
          </div>
          <button
            className="primary-btn"
            onClick={() => onSubmit({ value })}
            type="button"
          >
            Place My Marker
          </button>
        </>
      )}
    </div>
  )
}

function calculateTempoResult(tapTimes, targetIntervalMs) {
  const intervals = tapTimes
    .slice(1)
    .map((tapTime, index) => Math.round(tapTime - tapTimes[index]))
  const averageIntervalMs = Math.round(
    intervals.reduce((total, interval) => total + interval, 0) / intervals.length,
  )
  const averageErrorMs = Math.round(
    intervals.reduce(
      (total, interval) => total + Math.abs(interval - targetIntervalMs),
      0,
    ) / intervals.length,
  )
  const accuracy = Math.max(
    0,
    Math.round(100 - (averageErrorMs / targetIntervalMs) * 100),
  )

  let bestStreak = 0
  let currentStreak = 0
  intervals.forEach((interval) => {
    if (Math.abs(interval - targetIntervalMs) <= targetIntervalMs * 0.14) {
      currentStreak += 1
      bestStreak = Math.max(bestStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  })

  return {
    accuracy,
    averageErrorMs,
    averageIntervalMs,
    bestStreak,
    intervals,
  }
}

function TempoTapCard({
  activity,
  definition,
  disabled,
  onSkip,
  onSubmit,
  playerIndex,
  players,
}) {
  const state = activity.state
  const [phase, setPhase] = useState('ready')
  const [tapTimes, setTapTimes] = useState([])
  const [result, setResult] = useState(null)
  const activeName = getPlayerName(players, state.turnIndex)
  const ownResult = state.results?.[String(playerIndex)]

  useEffect(() => {
    setPhase('ready')
    setResult(null)
    setTapTimes([])
  }, [activity.id, state.turnIndex])

  useActivityUiState(useMemo(() => ({
    accuracy: result?.accuracy ?? null,
    control: 'five-beat-tap',
    phase,
    targetIntervalMs: state.targetIntervalMs,
    tapsCompleted: tapTimes.length,
  }), [phase, result?.accuracy, state.targetIntervalMs, tapTimes.length]))

  function start() {
    setPhase('running')
    setResult(null)
    setTapTimes([])
  }

  function tap() {
    if (phase !== 'running') {
      return
    }

    const nextTapTimes = [...tapTimes, performance.now()]
    setTapTimes(nextTapTimes)
    if (nextTapTimes.length === 5) {
      setResult(calculateTempoResult(nextTapTimes, state.targetIntervalMs))
      setPhase('result')
    }
  }

  return (
    <div className="overlay-card activity-card wave-two-card tempo-card vibe-playful">
      <ActivityHeader
        definition={definition}
        disabled={disabled}
        eyebrow="Heartbeat Rush"
        onSkip={onSkip}
      />
      <div className="connection-game-prompt">
        <span>{state.roundLabel}</span>
        <p>{state.prompt}</p>
      </div>
      <div className="turn-badge connection-turn-badge">
        <div>
          <strong>{activeName}</strong>
          <span> keeps the pulse</span>
        </div>
        <span className="sealed-chip">{Object.keys(state.results || {}).length}/2 played</span>
      </div>

      {ownResult ? (
        <div className="connection-waiting-card">
          <span aria-hidden="true">♥</span>
          <strong>Your {ownResult.accuracy}% rhythm is locked.</strong>
          <p>The shared tempo reveals after both turns.</p>
        </div>
      ) : disabled ? (
        <WaitingCard
          detail="Listen for your turn; their rhythm stays hidden."
          playerName={activeName}
        />
      ) : (
        <>
          <div className={`tempo-stage phase-${phase}`}>
            <button
              aria-label="Tap the heartbeat"
              className="tempo-heart"
              disabled={phase !== 'running'}
              onClick={tap}
              style={{ '--tempo-duration': `${state.targetIntervalMs}ms` }}
              type="button"
            >
              <span>♥</span>
            </button>
            <div className="tempo-progress" aria-label={`${tapTimes.length} of 5 taps`}>
              {[0, 1, 2, 3, 4].map((index) => (
                <span className={index < tapTimes.length ? 'hit' : ''} key={index} />
              ))}
            </div>
            {phase === 'ready' && <p>Start the pulse, then tap the heart five times.</p>}
            {phase === 'running' && (
              <p>{tapTimes.length === 0 ? 'Tap once to set your beat.' : 'Keep that exact spacing.'}</p>
            )}
            {result && (
              <div className="tempo-result">
                <strong>{result.accuracy}%</strong>
                <span>{result.bestStreak} steady intervals</span>
              </div>
            )}
          </div>
          {phase === 'ready' && (
            <button className="primary-btn" onClick={start} type="button">
              Start Pulse
            </button>
          )}
          {result && (
            <button
              className="primary-btn"
              onClick={() => onSubmit(result)}
              type="button"
            >
              Lock My Rhythm
            </button>
          )}
        </>
      )}
    </div>
  )
}

function WordWeaverCard({
  activity,
  definition,
  disabled,
  onSkip,
  onSubmit,
  playerIndex,
  players,
}) {
  const state = activity.state
  const [draft, setDraft] = useState('')
  const [feedback, setFeedback] = useState('')
  const [remaining, setRemaining] = useState(state.timeLimitSec)
  const [words, setWords] = useState([])
  const wordsRef = useRef(words)
  const activeName = getPlayerName(players, state.turnIndex)
  const ownSubmission = state.submissions?.[String(playerIndex)]
  const allowedWords = useMemo(() => new Set(state.allowedWords), [state.allowedWords])

  useEffect(() => {
    setDraft('')
    setFeedback('')
    setRemaining(state.timeLimitSec)
    setWords([])
    wordsRef.current = []
  }, [activity.id, state.timeLimitSec, state.turnIndex])

  useEffect(() => {
    wordsRef.current = words
  }, [words])

  useEffect(() => {
    if (disabled || ownSubmission) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [activity.id, disabled, ownSubmission, state.turnIndex])

  useActivityUiState(useMemo(() => ({
    acceptedWords: words,
    control: 'letter-tray',
    draft,
    letters: state.letters,
    remainingSeconds: remaining,
    wordCount: words.length,
  }), [draft, remaining, state.letters, words]))

  function addWord(event) {
    event.preventDefault()
    if (remaining <= 0) {
      setFeedback('Time is up—finish this turn.')
      return
    }

    const normalized = draft.trim().toLowerCase()
    if (!allowedWords.has(normalized)) {
      setFeedback('That word is not hiding in this tray.')
      return
    }
    if (words.includes(normalized)) {
      setFeedback('Already woven.')
      return
    }

    const nextWords = [...words, normalized]
    setWords(nextWords)
    setDraft('')
    setFeedback(`${normalized.toUpperCase()} added`)
  }

  return (
    <div className="overlay-card activity-card wave-two-card word-weaver-card vibe-playful">
      <ActivityHeader
        definition={definition}
        disabled={disabled}
        eyebrow="Letterpress Duel"
        onSkip={onSkip}
      />
      <div className="connection-game-prompt">
        <span>Shared letter tray</span>
        <p>{state.prompt}</p>
      </div>
      <div className="turn-badge connection-turn-badge">
        <div>
          <strong>{activeName}</strong>
          <span> weaves now</span>
        </div>
        <span className="sealed-chip">{Object.keys(state.submissions || {}).length}/2 played</span>
      </div>

      {ownSubmission ? (
        <div className="connection-waiting-card">
          <span aria-hidden="true">W</span>
          <strong>{ownSubmission.words.length} words are locked.</strong>
          <p>The shared letterpress reveal comes after both turns.</p>
        </div>
      ) : disabled ? (
        <WaitingCard
          detail="You will receive the same tray when their turn is sealed."
          playerName={activeName}
        />
      ) : (
        <>
          <div className="letter-tray" aria-label={`Letters ${state.letters.join(' ')}`}>
            {state.letters.map((letter, index) => (
              <span key={`${letter}-${index}`}>{letter}</span>
            ))}
          </div>
          <div className="word-weaver-score">
            <span><strong>{remaining}</strong> seconds</span>
            <span><strong>{words.length}</strong> words found</span>
          </div>
          <form className="word-weaver-form" onSubmit={addWord}>
            <input
              aria-label="Word from the letter tray"
              autoComplete="off"
              disabled={remaining <= 0}
              maxLength={state.letters.length}
              onChange={(event) => setDraft(event.target.value.replace(/[^a-z]/gi, ''))}
              placeholder="Type a word"
              value={draft}
            />
            <button disabled={!draft.trim() || remaining <= 0} type="submit">Add</button>
          </form>
          <p className="word-weaver-feedback" aria-live="polite">{feedback || 'Three letters minimum.'}</p>
          <div className="woven-words">
            {words.length > 0
              ? words.map((word) => <span key={word}>{word}</span>)
              : <span className="empty">Your words will gather here.</span>}
          </div>
          <button
            className="primary-btn"
            onClick={() => onSubmit({ words: wordsRef.current })}
            type="button"
          >
            Finish My Turn
          </button>
        </>
      )}
    </div>
  )
}

function createVibeCheckEntry(definition) {
  return {
    ...definition,
    createInitialState(_players, options = {}) {
      const selected = pickItem(VIBE_CHECK_PROMPTS, options.random)
      return {
        activityId: definition.id,
        leftLabel: selected.leftLabel,
        mode: 'vibe-check',
        prompt: selected.prompt,
        promptId: selected.id,
        rightLabel: selected.rightLabel,
        turnIndex: options.activePlayerIndex ?? 0,
        values: {},
      }
    },
    advance(state, { input, playerIndex }) {
      const value = Number(input.value)
      if (
        playerIndex !== state.turnIndex ||
        Number.isFinite(state.values?.[String(playerIndex)]) ||
        !Number.isInteger(value) ||
        value < 0 ||
        value > 100
      ) {
        return { completed: false, state }
      }

      const values = {
        ...state.values,
        [String(playerIndex)]: value,
      }
      return {
        completed: Object.keys(values).length === 2,
        state: {
          ...state,
          turnIndex: getNextPlayerIndex(playerIndex),
          values,
        },
      }
    },
    render(props) {
      return <VibeCheckCard {...props} definition={definition} />
    },
    resolve(state, players) {
      const markers = [0, 1].map((playerIndex) => ({
        playerIndex,
        value: state.values[String(playerIndex)],
      }))
      const distance = Math.abs(markers[0].value - markers[1].value)
      const syncScore = 100 - distance
      const heartBonus = distance <= 8 ? 5 : distance <= 20 ? 4 : distance <= 35 ? 3 : 2

      return {
        heartBonus,
        label: definition.label,
        payload: {
          distance,
          heartBonus,
          leftLabel: state.leftLabel,
          markers,
          prompt: state.prompt,
          promptId: state.promptId,
          rightLabel: state.rightLabel,
          syncScore,
        },
        savesToJournal: true,
        summary: distance <= 8
          ? 'The two markers nearly became one.'
          : `The markers landed ${distance} points apart.`,
        text: markers
          .map((marker) => `${getPlayerName(players, marker.playerIndex)}: ${marker.value}/100`)
          .join('\n'),
        title: definition.label,
        type: definition.type,
        vibe: definition.vibe,
      }
    },
  }
}

function isValidTempoInput(input) {
  return Number.isInteger(input.accuracy) &&
    input.accuracy >= 0 &&
    input.accuracy <= 100 &&
    Number.isInteger(input.averageErrorMs) &&
    input.averageErrorMs >= 0 &&
    input.averageErrorMs <= 5000 &&
    Number.isInteger(input.averageIntervalMs) &&
    input.averageIntervalMs >= 0 &&
    input.averageIntervalMs <= 5000 &&
    Number.isInteger(input.bestStreak) &&
    input.bestStreak >= 0 &&
    input.bestStreak <= 4
}

function createTempoTapEntry(definition) {
  return {
    ...definition,
    createInitialState(_players, options = {}) {
      const selected = pickItem(TEMPO_TAP_ROUNDS, options.random)
      return {
        activityId: definition.id,
        mode: 'tempo-tap',
        prompt: selected.prompt,
        promptId: selected.id,
        results: {},
        roundLabel: selected.label,
        targetIntervalMs: selected.targetIntervalMs,
        turnIndex: options.activePlayerIndex ?? 0,
      }
    },
    advance(state, { input, playerIndex }) {
      if (
        playerIndex !== state.turnIndex ||
        state.results?.[String(playerIndex)] ||
        !isValidTempoInput(input)
      ) {
        return { completed: false, state }
      }

      const result = {
        accuracy: input.accuracy,
        averageErrorMs: input.averageErrorMs,
        averageIntervalMs: input.averageIntervalMs,
        bestStreak: input.bestStreak,
      }
      const results = {
        ...state.results,
        [String(playerIndex)]: result,
      }
      return {
        completed: Object.keys(results).length === 2,
        state: {
          ...state,
          results,
          turnIndex: getNextPlayerIndex(playerIndex),
        },
      }
    },
    render(props) {
      return <TempoTapCard {...props} definition={definition} />
    },
    resolve(state, players) {
      const results = [0, 1].map((playerIndex) => ({
        ...state.results[String(playerIndex)],
        playerIndex,
      }))
      const averageAccuracy = Math.round(
        (results[0].accuracy + results[1].accuracy) / 2,
      )
      const heartBonus = averageAccuracy >= 90
        ? 5
        : averageAccuracy >= 75
          ? 4
          : averageAccuracy >= 55
            ? 3
            : 2

      return {
        heartBonus,
        label: definition.label,
        payload: {
          averageAccuracy,
          heartBonus,
          results,
          roundLabel: state.roundLabel,
          targetIntervalMs: state.targetIntervalMs,
        },
        savesToJournal: true,
        summary: averageAccuracy >= 90
          ? 'Two remarkably steady heartbeats found the same room.'
          : `Together you held ${averageAccuracy}% of the target rhythm.`,
        text: results
          .map((result) => `${getPlayerName(players, result.playerIndex)}: ${result.accuracy}% rhythm`)
          .join('\n'),
        title: definition.label,
        type: definition.type,
        vibe: definition.vibe,
      }
    },
  }
}

function createWordWeaverEntry(definition) {
  return {
    ...definition,
    createInitialState(_players, options = {}) {
      const selected = pickItem(WORD_WEAVER_PUZZLES, options.random)
      return {
        activityId: definition.id,
        allowedWords: selected.allowedWords,
        letters: selected.letters,
        mode: 'word-weaver',
        prompt: selected.prompt,
        promptId: selected.id,
        submissions: {},
        timeLimitSec: 30,
        turnIndex: options.activePlayerIndex ?? 0,
      }
    },
    advance(state, { input, playerIndex }) {
      const words = Array.isArray(input.words)
        ? input.words.map((word) => String(word).trim().toLowerCase())
        : null
      const uniqueWords = words ? Array.from(new Set(words)) : null
      if (
        playerIndex !== state.turnIndex ||
        state.submissions?.[String(playerIndex)] ||
        !uniqueWords ||
        uniqueWords.length > 20 ||
        uniqueWords.some((word) => !state.allowedWords.includes(word))
      ) {
        return { completed: false, state }
      }

      const submission = {
        longest: [...uniqueWords].sort((left, right) => right.length - left.length)[0] || '',
        words: uniqueWords,
      }
      const submissions = {
        ...state.submissions,
        [String(playerIndex)]: submission,
      }
      return {
        completed: Object.keys(submissions).length === 2,
        state: {
          ...state,
          submissions,
          turnIndex: getNextPlayerIndex(playerIndex),
        },
      }
    },
    render(props) {
      return <WordWeaverCard {...props} definition={definition} />
    },
    resolve(state, players) {
      const submissions = [0, 1].map((playerIndex) => ({
        ...state.submissions[String(playerIndex)],
        playerIndex,
      }))
      const combinedWords = new Set(submissions.flatMap((submission) => submission.words))
      const sharedWords = submissions[0].words.filter((word) =>
        submissions[1].words.includes(word),
      )
      const uniqueFinds = submissions.map((submission, playerIndex) => ({
        playerIndex,
        words: submission.words.filter((word) =>
          !submissions[getNextPlayerIndex(playerIndex)].words.includes(word),
        ),
      }))
      const heartBonus = combinedWords.size >= 10
        ? 5
        : combinedWords.size >= 7
          ? 4
          : combinedWords.size >= 4
            ? 3
            : 2

      return {
        heartBonus,
        label: definition.label,
        payload: {
          combinedWordCount: combinedWords.size,
          heartBonus,
          letters: state.letters,
          sharedWords,
          submissions,
          uniqueFinds,
        },
        savesToJournal: true,
        summary: `${combinedWords.size} words emerged from one shared tray.`,
        text: submissions
          .map((submission) =>
            `${getPlayerName(players, submission.playerIndex)}: ${submission.words.join(', ') || 'No words'}`,
          )
          .join('\n'),
        title: definition.label,
        type: definition.type,
        vibe: definition.vibe,
      }
    },
  }
}

export function createWaveTwoGameEntry(definition) {
  if (definition.id === 'vibe-check') {
    return createVibeCheckEntry(definition)
  }

  if (definition.id === 'tempo-tap') {
    return createTempoTapEntry(definition)
  }

  if (definition.id === 'word-weaver') {
    return createWordWeaverEntry(definition)
  }

  return null
}
