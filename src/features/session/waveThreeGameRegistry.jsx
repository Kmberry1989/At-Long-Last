import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BLIND_CANVAS_PROMPTS,
  DUAL_AXIS_MAZES,
  HARMONIC_LOCK_ROUNDS,
} from './waveThreeGameData.js'

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

function isSamePosition(left, right) {
  return left.x === right.x && left.y === right.y
}

function isBlocked(state, position) {
  return position.x < 0 ||
    position.y < 0 ||
    position.x >= state.width ||
    position.y >= state.height ||
    state.obstacles.some((obstacle) => isSamePosition(obstacle, position))
}

function MazeCard({
  activity,
  definition,
  disabled,
  onSkip,
  onSubmit,
  playerIndex,
  players,
}) {
  const state = activity.state
  const activeName = getPlayerName(players, state.turnIndex)
  const axis = state.axes[String(playerIndex)]
  const activeAxis = state.axes[String(state.turnIndex)]
  const cells = Array.from({ length: state.width * state.height }, (_, index) => ({
    x: index % state.width,
    y: Math.floor(index / state.width),
  }))

  useActivityUiState(useMemo(() => ({
    activeAxis,
    bumps: state.bumps,
    control: 'grid-nudge',
    controls: activeAxis === 'horizontal' ? ['left', 'hold', 'right'] : ['up', 'hold', 'down'],
    goal: state.goal,
    moves: state.moves,
    position: state.position,
  }), [activeAxis, state.bumps, state.goal, state.moves, state.position]))

  function move(delta) {
    onSubmit({ delta })
  }

  return (
    <div className="overlay-card activity-card wave-three-card maze-card vibe-playful">
      <ActivityHeader
        definition={definition}
        disabled={disabled}
        eyebrow="Cooperative Route"
        onSkip={onSkip}
      />
      <div className="connection-game-prompt">
        <span>{state.mazeLabel}</span>
        <p>{state.prompt}</p>
      </div>
      <div className="maze-role-row">
        {players.map((player, index) => (
          <div className={index === state.turnIndex ? 'active' : ''} key={player.uid}>
            <span>{getPlayerName(players, index)}</span>
            <strong>{state.axes[String(index)]}</strong>
          </div>
        ))}
      </div>
      <div
        aria-label={`Maze token at column ${state.position.x + 1}, row ${state.position.y + 1}`}
        className="dual-axis-maze"
        style={{
          '--maze-columns': state.width,
          '--maze-rows': state.height,
        }}
      >
        {cells.map((cell) => {
          const obstacle = state.obstacles.some((item) => isSamePosition(item, cell))
          const goal = isSamePosition(state.goal, cell)
          const token = isSamePosition(state.position, cell)
          return (
            <span
              className={`${obstacle ? 'obstacle' : ''}${goal ? ' goal' : ''}${token ? ' token' : ''}`}
              key={`${cell.x}-${cell.y}`}
            >
              {goal && '♥'}
              {token && <i>●</i>}
            </span>
          )
        })}
      </div>
      <div className="maze-status">
        <span><strong>{state.moves}</strong> moves</span>
        <span><strong>{state.bumps}</strong> bumps</span>
      </div>

      {disabled ? (
        <div className="connection-waiting-card compact">
          <span aria-hidden="true">↔</span>
          <strong>{activeName} controls {activeAxis} movement.</strong>
          <p>Talk through the route while the pearl waits.</p>
        </div>
      ) : (
        <>
          <p className="connection-stage-copy">
            You control <strong>{axis}</strong> movement. A hold passes the other axis unchanged.
          </p>
          <div className={`maze-controls axis-${axis}`}>
            {axis === 'horizontal' ? (
              <>
                <button aria-label="Move left" onClick={() => move(-1)} type="button">←</button>
                <button aria-label="Hold horizontal position" onClick={() => move(0)} type="button">Hold</button>
                <button aria-label="Move right" onClick={() => move(1)} type="button">→</button>
              </>
            ) : (
              <>
                <button aria-label="Move up" onClick={() => move(-1)} type="button">↑</button>
                <button aria-label="Hold vertical position" onClick={() => move(0)} type="button">Hold</button>
                <button aria-label="Move down" onClick={() => move(1)} type="button">↓</button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function setupDrawingCanvas(canvas) {
  const context = canvas.getContext('2d')
  canvas.width = 600
  canvas.height = 400
  context.fillStyle = '#fffaf1'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.lineWidth = 10
  context.strokeStyle = '#6b5368'
}

function CanvasCard({
  activity,
  definition,
  disabled,
  onSkip,
  onSubmit,
  playerIndex,
  players,
}) {
  const state = activity.state
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef(null)
  const [strokeCount, setStrokeCount] = useState(0)
  const activeName = getPlayerName(players, state.turnIndex)
  const ownHalf = state.halves.find((half) => half.playerIndex === playerIndex)
  const side = playerIndex === state.leftPlayerIndex ? 'left' : 'right'

  useEffect(() => {
    if (canvasRef.current) {
      setupDrawingCanvas(canvasRef.current)
    }
    setStrokeCount(0)
  }, [activity.id, state.turnIndex])

  useActivityUiState(useMemo(() => ({
    control: 'drawing-canvas',
    side,
    strokeCount,
  }), [side, strokeCount]))

  function getCanvasPoint(event) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  function startDrawing(event) {
    if (disabled) {
      return
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    drawingRef.current = true
    lastPointRef.current = getCanvasPoint(event)
  }

  function draw(event) {
    if (!drawingRef.current || disabled) {
      return
    }
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const point = getCanvasPoint(event)
    context.beginPath()
    context.moveTo(lastPointRef.current.x, lastPointRef.current.y)
    context.lineTo(point.x, point.y)
    context.stroke()
    lastPointRef.current = point
  }

  function stopDrawing() {
    if (!drawingRef.current) {
      return
    }
    drawingRef.current = false
    lastPointRef.current = null
    setStrokeCount((current) => current + 1)
  }

  function clearCanvas() {
    setupDrawingCanvas(canvasRef.current)
    setStrokeCount(0)
  }

  function submitHalf() {
    const canvas = canvasRef.current
    let imageDataUrl = canvas.toDataURL('image/webp', 0.72)
    if (!imageDataUrl.startsWith('data:image/webp')) {
      imageDataUrl = canvas.toDataURL('image/png')
    }
    onSubmit({ imageDataUrl, strokeCount })
  }

  return (
    <div className="overlay-card activity-card wave-three-card blind-canvas-card vibe-playful">
      <ActivityHeader
        definition={definition}
        disabled={disabled}
        eyebrow="Half And Half"
        onSkip={onSkip}
      />
      <div className="connection-game-prompt">
        <span>Draw one picture</span>
        <p>{state.prompt}</p>
      </div>
      <div className="turn-badge connection-turn-badge">
        <div>
          <strong>{activeName}</strong>
          <span> draws the {state.turnIndex === state.leftPlayerIndex ? 'left' : 'right'} half</span>
        </div>
        <span className="sealed-chip">{state.halves.length}/2 drawn</span>
      </div>

      {ownHalf ? (
        <div className="connection-waiting-card">
          <span aria-hidden="true">✎</span>
          <strong>Your {side} half is hidden.</strong>
          <p>The full picture appears after the other half is sealed.</p>
        </div>
      ) : disabled ? (
        <div className="connection-waiting-card">
          <span aria-hidden="true">▧</span>
          <strong>{activeName} is drawing out of view.</strong>
          <p>No peeking—the seam opens only after both halves arrive.</p>
        </div>
      ) : (
        <>
          <div className={`blind-canvas-wrap side-${side}`}>
            <span>{side} half</span>
            <canvas
              aria-label={`Draw the ${side} half`}
              className="blind-canvas"
              onPointerCancel={stopDrawing}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              ref={canvasRef}
            />
          </div>
          <div className="canvas-actions">
            <button className="ghost-btn" onClick={clearCanvas} type="button">Clear</button>
            <span>{strokeCount} strokes</span>
          </div>
          <button
            className="primary-btn"
            disabled={strokeCount < 1}
            onClick={submitHalf}
            type="button"
          >
            Seal My Half
          </button>
        </>
      )}
    </div>
  )
}

function getResonance(value, target) {
  return Math.max(0, Math.round(100 - Math.abs(value - target) * 3))
}

function HarmonicLockCard({
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
  const resonance = getResonance(value, state.target)

  useEffect(() => {
    setValue(50)
  }, [activity.id, state.turnIndex])

  useActivityUiState(useMemo(() => ({
    control: 'resonance-dial',
    resonance,
    value,
  }), [resonance, value]))

  function tune(nextValue) {
    setValue(nextValue)
    const nextResonance = getResonance(nextValue, state.target)
    if (nextResonance >= 84 && navigator.vibrate) {
      navigator.vibrate(nextResonance >= 96 ? 24 : 10)
    }
  }

  return (
    <div className="overlay-card activity-card wave-three-card harmonic-card vibe-tender">
      <ActivityHeader
        definition={definition}
        disabled={disabled}
        eyebrow="Resonance Puzzle"
        onSkip={onSkip}
      />
      <div className="connection-game-prompt">
        <span>{state.roundLabel}</span>
        <p>{state.prompt}</p>
      </div>
      <div className="turn-badge connection-turn-badge">
        <div>
          <strong>{activeName}</strong>
          <span> tunes privately</span>
        </div>
        <span className="sealed-chip">{Object.keys(state.values || {}).length}/2 tuned</span>
      </div>

      {hasOwnValue ? (
        <div className="connection-waiting-card">
          <span aria-hidden="true">◎</span>
          <strong>Your dial is locked at {ownValue}.</strong>
          <p>The chamber opens when both frequencies arrive.</p>
        </div>
      ) : disabled ? (
        <div className="connection-waiting-card">
          <span aria-hidden="true">⌁</span>
          <strong>{activeName} is following the resonance.</strong>
          <p>Your dial will wake when theirs is sealed.</p>
        </div>
      ) : (
        <>
          <div className="harmonic-chamber" style={{ '--resonance': resonance / 100 }}>
            <span className="harmonic-ring ring-one" />
            <span className="harmonic-ring ring-two" />
            <div className="harmonic-dial">
              <strong>{value}</strong>
              <span>{resonance}% resonance</span>
            </div>
          </div>
          <input
            aria-label="Tune the harmonic dial"
            className="range-input harmonic-range"
            max="100"
            min="0"
            onChange={(event) => tune(Number(event.target.value))}
            type="range"
            value={value}
          />
          <p className="harmonic-hint">
            The rings brighten—and supported phones hum—as you approach the lock.
          </p>
          <button
            className="primary-btn"
            onClick={() => onSubmit({ value })}
            type="button"
          >
            Lock My Frequency
          </button>
        </>
      )}
    </div>
  )
}

function createMazeEntry(definition) {
  return {
    ...definition,
    createInitialState(_players, options = {}) {
      const selected = pickItem(DUAL_AXIS_MAZES, options.random)
      const horizontalPlayerIndex = options.activePlayerIndex ?? 0
      return {
        activityId: definition.id,
        axes: {
          [String(horizontalPlayerIndex)]: 'horizontal',
          [String(getNextPlayerIndex(horizontalPlayerIndex))]: 'vertical',
        },
        bumps: 0,
        goal: selected.goal,
        height: selected.height,
        mazeId: selected.id,
        mazeLabel: selected.label,
        mode: 'dual-axis-maze',
        moves: 0,
        obstacles: selected.obstacles,
        path: [selected.start],
        position: selected.start,
        prompt: selected.prompt,
        turnIndex: horizontalPlayerIndex,
        width: selected.width,
      }
    },
    advance(state, { input, playerIndex }) {
      const delta = Number(input.delta)
      const axis = state.axes[String(playerIndex)]
      if (
        playerIndex !== state.turnIndex ||
        ![-1, 0, 1].includes(delta) ||
        !axis
      ) {
        return { completed: false, state }
      }

      const candidate = {
        x: state.position.x + (axis === 'horizontal' ? delta : 0),
        y: state.position.y + (axis === 'vertical' ? delta : 0),
      }
      const bumped = delta !== 0 && isBlocked(state, candidate)
      const position = bumped ? state.position : candidate
      const path = [...state.path, position].slice(-48)
      return {
        completed: isSamePosition(position, state.goal),
        state: {
          ...state,
          bumps: state.bumps + (bumped ? 1 : 0),
          moves: state.moves + 1,
          path,
          position,
          turnIndex: getNextPlayerIndex(playerIndex),
        },
      }
    },
    render(props) {
      return <MazeCard {...props} definition={definition} />
    },
    resolve(state) {
      const heartBonus = state.moves <= 8 && state.bumps === 0
        ? 5
        : state.moves <= 12
          ? 4
          : 3
      return {
        heartBonus,
        label: definition.label,
        payload: {
          bumps: state.bumps,
          goal: state.goal,
          heartBonus,
          mazeLabel: state.mazeLabel,
          moves: state.moves,
          path: state.path,
        },
        savesToJournal: true,
        summary: `The pearl reached the goal in ${state.moves} shared moves.`,
        text: `${state.moves} moves, ${state.bumps} bumps`,
        title: definition.label,
        type: definition.type,
        vibe: definition.vibe,
      }
    },
  }
}

function isValidCanvasImage(imageDataUrl) {
  return typeof imageDataUrl === 'string' &&
    imageDataUrl.length <= 200000 &&
    /^data:image\/(?:webp|png);base64,/.test(imageDataUrl)
}

function createCanvasEntry(definition) {
  return {
    ...definition,
    createInitialState(_players, options = {}) {
      const selected = pickItem(BLIND_CANVAS_PROMPTS, options.random)
      const leftPlayerIndex = options.activePlayerIndex ?? 0
      return {
        activityId: definition.id,
        halves: [],
        leftPlayerIndex,
        mode: 'blind-canvas',
        prompt: selected.prompt,
        promptId: selected.id,
        turnIndex: leftPlayerIndex,
      }
    },
    advance(state, { input, playerIndex }) {
      const strokeCount = Number(input.strokeCount)
      if (
        playerIndex !== state.turnIndex ||
        state.halves.some((half) => half.playerIndex === playerIndex) ||
        !Number.isInteger(strokeCount) ||
        strokeCount < 1 ||
        strokeCount > 200 ||
        !isValidCanvasImage(input.imageDataUrl)
      ) {
        return { completed: false, state }
      }

      const halves = [
        ...state.halves,
        {
          imageDataUrl: input.imageDataUrl,
          playerIndex,
          side: playerIndex === state.leftPlayerIndex ? 'left' : 'right',
          strokeCount,
        },
      ]
      return {
        completed: halves.length === 2,
        state: {
          ...state,
          halves,
          turnIndex: getNextPlayerIndex(playerIndex),
        },
      }
    },
    render(props) {
      return <CanvasCard {...props} definition={definition} />
    },
    resolve(state, players) {
      const orderedHalves = [...state.halves].sort((left, right) =>
        left.side === right.side ? 0 : left.side === 'left' ? -1 : 1,
      )
      return {
        heartBonus: 4,
        label: definition.label,
        payload: {
          halves: orderedHalves,
          heartBonus: 4,
          prompt: state.prompt,
          promptId: state.promptId,
        },
        savesToJournal: true,
        summary: 'Two hidden halves met at one wonderfully questionable seam.',
        text: orderedHalves
          .map((half) => `${getPlayerName(players, half.playerIndex)}: ${half.side} half, ${half.strokeCount} strokes`)
          .join('\n'),
        title: definition.label,
        type: definition.type,
        vibe: definition.vibe,
      }
    },
  }
}

function createHarmonicEntry(definition) {
  return {
    ...definition,
    createInitialState(_players, options = {}) {
      const selected = pickItem(HARMONIC_LOCK_ROUNDS, options.random)
      return {
        activityId: definition.id,
        mode: 'harmonic-lock',
        prompt: selected.prompt,
        promptId: selected.id,
        roundLabel: selected.label,
        target: selected.target,
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
      return <HarmonicLockCard {...props} definition={definition} />
    },
    resolve(state, players) {
      const frequencies = [0, 1].map((playerIndex) => ({
        playerIndex,
        resonance: getResonance(state.values[String(playerIndex)], state.target),
        value: state.values[String(playerIndex)],
      }))
      const averageResonance = Math.round(
        (frequencies[0].resonance + frequencies[1].resonance) / 2,
      )
      const distance = Math.abs(frequencies[0].value - frequencies[1].value)
      const heartBonus = averageResonance >= 92
        ? 5
        : averageResonance >= 75
          ? 4
          : 3
      return {
        heartBonus,
        label: definition.label,
        payload: {
          averageResonance,
          distance,
          frequencies,
          heartBonus,
          roundLabel: state.roundLabel,
        },
        savesToJournal: true,
        summary: averageResonance >= 92
          ? 'Both dials found the chamber’s hidden lock.'
          : `The two frequencies settled ${distance} points apart.`,
        text: frequencies
          .map((frequency) =>
            `${getPlayerName(players, frequency.playerIndex)}: ${frequency.value}, ${frequency.resonance}% resonance`,
          )
          .join('\n'),
        title: definition.label,
        type: definition.type,
        vibe: definition.vibe,
      }
    },
  }
}

export function createWaveThreeGameEntry(definition) {
  if (definition.id === 'dual-axis-maze') {
    return createMazeEntry(definition)
  }

  if (definition.id === 'blind-canvas') {
    return createCanvasEntry(definition)
  }

  if (definition.id === 'harmonic-lock') {
    return createHarmonicEntry(definition)
  }

  return null
}
