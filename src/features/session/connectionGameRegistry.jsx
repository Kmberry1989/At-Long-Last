import { useEffect, useState } from 'react'
import {
  MIND_MELD_PROMPTS,
  PREDICTION_BOX_PROMPTS,
  VAULT_PROMPTS,
} from './connectionGameData.js'
import { commitChoice } from './choiceCommitment.js'

import { pickFreshPrompt as pickPrompt } from './promptRotation.js'
function getOption(options, answerId) {
  return options.find((option) => option.id === answerId) || null
}

function getPlayerName(players, playerIndex) {
  return players[playerIndex]?.displayName || `Player ${playerIndex + 1}`
}

function ChoiceGameCard({
  activity,
  definition,
  disabled,
  onSkip,
  onSubmit,
  playerIndex,
  players,
  error,
}) {
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [sealing, setSealing] = useState(false)
  const [localError, setLocalError] = useState('')
  const state = activity.state
  const storageKey = `at-long-last:choice:${activity.id}:${players[playerIndex]?.uid}`
  const activeName = getPlayerName(players, state.turnIndex)
  const isPrediction = definition.id === 'prediction-box'
  const isPredictor = playerIndex === state.predictorIndex
  const ownAnswer = state.commitments?.[String(playerIndex)] || (isPrediction
    ? isPredictor
      ? state.predictionId
      : state.actualId
    : state.answers?.[String(playerIndex)])
  const stageCopy = isPrediction
    ? isPredictor
      ? `Predict the answer ${getPlayerName(players, state.subjectIndex)} will choose.`
      : `${getPlayerName(players, state.predictorIndex)} sealed a prediction. Choose your honest answer.`
    : 'Choose the answer you think your partner will choose. No peeking.'

  useEffect(() => {
    setSelectedAnswer('')
  }, [activity.id, state.turnIndex])
  useEffect(() => {
    if (state.phase === 'reveal') sessionStorage.removeItem(storageKey)
  }, [state.phase, storageKey])

  async function sealAnswer() {
    if (sealing || !selectedAnswer) return
    setSealing(true)
    setLocalError('')
    try {
      if (!state.commitments) { await onSubmit({ answerId: selectedAnswer }); return }
      const record = await commitChoice(selectedAnswer)
      sessionStorage.setItem(storageKey, JSON.stringify(record))
      await onSubmit({ commitment: record.commitment })
    } catch {
      setLocalError('Could not lock that choice. Please try again.')
    } finally { setSealing(false) }
  }

  async function openAnswer() {
    setSealing(true)
    setLocalError('')
    try {
      const record = JSON.parse(sessionStorage.getItem(storageKey) || 'null')
      if (!record) throw new Error('Missing choice')
      await onSubmit({ answerId: record.answerId, nonce: record.nonce })
    } catch {
      setLocalError('This choice was locked on another tab. Return there to reveal, or pass this card.')
    } finally { setSealing(false) }
  }

  if (state.phase === 'opening') {
    return (
      <div className="overlay-card activity-card connection-game-card">
        <p className="eyebrow">Both choices locked</p>
        <h3>Ready for the reveal?</h3>
        <p className="support-copy">{state.prompt}</p>
        <button className="primary-btn" disabled={disabled || sealing} onClick={openAnswer} type="button">Reveal my choice</button>
        {disabled && <p className="sealed-note">{activeName} opens first.</p>}
        {(localError || error) && <p className="error-copy">{localError || error}</p>}
        <button className="secondary-link" disabled={disabled || sealing} onClick={onSkip} type="button">Pass this card</button>
      </div>
    )
  }

  if (state.phase === 'reveal') {
    const matched = isPrediction
      ? state.predictionId === state.actualId
      : state.answers?.['0'] === state.answers?.['1']
    const acked = (state.revealAcks || []).includes(playerIndex)
    const rows = isPrediction
      ? [
          { playerIndex: state.predictorIndex, id: state.predictionId, verb: 'guessed' },
          { playerIndex: state.subjectIndex, id: state.actualId, verb: 'chose' },
        ]
      : [0, 1].map((index) => ({ playerIndex: index, id: state.answers[String(index)], verb: 'chose' }))
    return (
      <div className="overlay-card activity-card connection-game-card choice-reveal">
        <p className="eyebrow">Both locked in</p>
        <h3>{matched ? 'You called it.' : 'A little surprise.'}</h3>
        <p className="support-copy">{state.prompt}</p>
        <div className="scrapbook-response-grid">
          {rows.map((row) => (
            <div className="scrapbook-response-card" key={row.playerIndex}>
              <strong>{getPlayerName(players, row.playerIndex)} {row.verb}</strong>
              <p>{getOption(state.options, row.id)?.label}</p>
            </div>
          ))}
        </div>
        <p className="support-copy">{matched ? 'What gave it away?' : 'What made that your pick?'}</p>
        <p className="sealed-note">+{matched ? (isPrediction ? 5 : 4) : 2} shared hearts · A page to keep</p>
        <button className="primary-btn" disabled={disabled || acked} onClick={() => onSubmit({ action: 'continue' })} type="button">
          {acked ? 'Waiting for your partner…' : 'Continue together'}
        </button>
      </div>
    )
  }

  return (
    <div className={`overlay-card activity-card connection-game-card vibe-${definition.vibe}`}>
      <div className="overlay-head">
        <p className="eyebrow">{isPrediction ? 'Prediction Game' : 'Sync Game'}</p>
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

      <div className="connection-game-prompt">
        <span>{isPrediction ? 'Inside the box' : 'Match this'}</span>
        <p>{state.prompt}</p>
      </div>

      <div className="turn-badge connection-turn-badge">
        <div>
          <strong>{activeName}</strong>
          <span>{isPrediction && state.phase === 'answer' ? ' answers now' : ' chooses now'}</span>
        </div>
        <span className="sealed-chip">
          {Object.keys(state.commitments || state.answers || {}).length || (state.predictionId ? 1 : 0)}/2 sealed
        </span>
      </div>

      {ownAnswer ? (
        <div className="connection-waiting-card">
          <span aria-hidden="true">✦</span>
          <strong>Your answer is sealed.</strong>
          <p>It stays hidden until both choices are locked.</p>
        </div>
      ) : disabled ? (
        <div className="connection-waiting-card">
          <span aria-hidden="true">⌛</span>
          <strong>{activeName} is choosing.</strong>
          <p>Their answer will stay hidden while you wait.</p>
        </div>
      ) : (
        <>
          <p className="connection-stage-copy">{stageCopy}</p>
          <div className="connection-choice-grid" role="radiogroup" aria-label={state.prompt}>
            {state.options.map((option) => (
              <button
                aria-checked={selectedAnswer === option.id}
                className={`connection-choice${selectedAnswer === option.id ? ' active' : ''}`}
                key={option.id}
                onClick={() => setSelectedAnswer(option.id)}
                role="radio"
                type="button"
              >
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          <button
            className="primary-btn"
            disabled={!selectedAnswer || sealing}
            onClick={sealAnswer}
            type="button"
          >
            Seal My Answer
          </button>
        </>
      )}
      {localError && <p className="error-copy">{localError}</p>}
    </div>
  )
}

function VaultCard({
  activity,
  definition,
  disabled,
  onSkip,
  onSubmit,
  playerIndex,
  players,
}) {
  const [text, setText] = useState('')
  const state = activity.state
  const activeName = getPlayerName(players, state.turnIndex)
  const ownEntry = state.entries.find((entry) => entry.playerIndex === playerIndex)

  useEffect(() => {
    setText('')
  }, [activity.id, state.turnIndex])

  return (
    <div className="overlay-card activity-card vault-card vibe-tender">
      <div className="overlay-head">
        <p className="eyebrow">Finale Time Capsule</p>
        <button
          className="secondary-link"
          disabled={disabled}
          onClick={onSkip}
          type="button"
        >
          Skip This
        </button>
      </div>
      <h3>{definition.label}</h3>
      <p className="support-copy">{definition.description}</p>

      <div className="vault-envelope" aria-hidden="true">
        <span>At Long Last</span>
        <strong>For the finale</strong>
      </div>

      <div className="connection-game-prompt">
        <span>Seal this away</span>
        <p>{state.prompt}</p>
      </div>

      {ownEntry ? (
        <div className="connection-waiting-card">
          <span aria-hidden="true">✉</span>
          <strong>Your note is in the Vault.</strong>
          <p>It will open in the scrapbook when this night reaches its finale.</p>
        </div>
      ) : disabled ? (
        <div className="connection-waiting-card">
          <span aria-hidden="true">⌛</span>
          <strong>{activeName} is sealing a note.</strong>
          <p>You will get the envelope next.</p>
        </div>
      ) : (
        <>
          <div className="turn-badge">
            <strong>{activeName}</strong>
            <span>writes privately now</span>
          </div>
          <textarea
            className="text-entry vault-entry"
            maxLength={400}
            onChange={(event) => setText(event.target.value)}
            placeholder="A compliment, wish, or memory worth opening later…"
            rows={5}
            value={text}
          />
          <div className="vault-entry-meta">
            <span>Hidden from your partner until the finale</span>
            <strong>{text.length}/400</strong>
          </div>
          <button
            className="primary-btn"
            disabled={!text.trim()}
            onClick={() => onSubmit({ text })}
            type="button"
          >
            Seal It In The Vault
          </button>
        </>
      )}
    </div>
  )
}

function createChoiceState(prompts, activePlayerIndex, random, history) {
  const selected = pickPrompt(prompts, random, history)
  return {
    activityId: null,
    answers: {},
    options: selected.options,
    prompt: selected.prompt,
    promptId: selected.id,
    turnIndex: activePlayerIndex,
  }
}

function advanceChoiceReveal(state, { input, playerIndex }) {
  if (input.action !== 'continue' || playerIndex !== state.turnIndex) {
    return { completed: false, state }
  }
  const revealAcks = Array.from(new Set([...(state.revealAcks || []), playerIndex]))
  return {
    completed: revealAcks.length === 2,
    state: { ...state, revealAcks, turnIndex: playerIndex === 0 ? 1 : 0 },
  }
}

function advanceCommittedChoice(state, { input, playerIndex }) {
  if (playerIndex !== state.turnIndex) return { completed: false, state }
  const index = String(playerIndex)
  const nextPlayer = playerIndex === 0 ? 1 : 0
  if (state.phase === 'opening') {
    if (!getOption(state.options, input.answerId)) return { completed: false, state }
    const answers = { ...state.answers, [index]: input.answerId }
    const bothOpen = Object.keys(answers).length === 2
    return { completed: false, state: {
      ...state, answers,
      ...(state.mode === 'prediction-box' ? { [playerIndex === state.predictorIndex ? 'predictionId' : 'actualId']: input.answerId } : {}),
      phase: bothOpen ? 'reveal' : 'opening',
      turnIndex: nextPlayer,
      ...(bothOpen ? { revealAcks: [] } : {}),
    } }
  }
  if (!/^[a-f0-9]{64}$/.test(input.commitment || '') || state.commitments[index]) return { completed: false, state }
  const commitments = { ...state.commitments, [index]: input.commitment }
  return { completed: false, state: {
    ...state, commitments, turnIndex: nextPlayer,
    phase: Object.keys(commitments).length === 2 ? 'opening' : state.mode === 'prediction-box' ? 'answer' : 'choosing',
  } }
}

function createMindMeldEntry(definition) {
  return {
    ...definition,
    createInitialState(_players, options = {}) {
      return {
        ...createChoiceState(
          MIND_MELD_PROMPTS,
          options.activePlayerIndex ?? 0,
          options.random,
          options.history,
        ),
        activityId: definition.id,
        commitments: {},
        mode: 'mind-meld',
      }
    },
    advance(state, { input, playerIndex }) {
      if (state.phase === 'reveal') return advanceChoiceReveal(state, { input, playerIndex })
      if (state.commitments) return advanceCommittedChoice(state, { input, playerIndex })
      if (
        playerIndex !== state.turnIndex ||
        state.answers?.[String(playerIndex)] ||
        !getOption(state.options, input.answerId)
      ) {
        return { completed: false, state }
      }

      const answers = {
        ...state.answers,
        [String(playerIndex)]: input.answerId,
      }
      return {
        completed: false,
        state: {
          ...state,
          answers,
          ...(Object.keys(answers).length === 2 ? { phase: 'reveal', revealAcks: [] } : {}),
          turnIndex: playerIndex === 0 ? 1 : 0,
        },
      }
    },
    render(props) {
      return <ChoiceGameCard {...props} definition={definition} />
    },
    resolve(state, players) {
      const answerRows = [0, 1].map((playerIndex) => {
        const answerId = state.answers[String(playerIndex)]
        return {
          answerId,
          label: getOption(state.options, answerId)?.label || 'No answer',
          playerIndex,
        }
      })
      const matched = answerRows[0].answerId === answerRows[1].answerId
      const heartBonus = matched ? 4 : 2
      const summary = matched
        ? `${players[0].displayName} and ${players[1].displayName} landed the same answer.`
        : 'Two different instincts, one useful reveal.'

      return {
        heartBonus,
        label: definition.label,
        payload: {
          answers: answerRows,
          heartBonus,
          matched,
          options: state.options,
          prompt: state.prompt,
          promptId: state.promptId,
        },
        savesToJournal: true,
        summary,
        text: answerRows
          .map((answer) => `${getPlayerName(players, answer.playerIndex)}: ${answer.label}`)
          .join('\n'),
        title: definition.label,
        type: definition.type,
        vibe: definition.vibe,
      }
    },
  }
}

function createPredictionBoxEntry(definition) {
  return {
    ...definition,
    createInitialState(_players, options = {}) {
      const activePlayerIndex = options.activePlayerIndex ?? 0
      const selected = pickPrompt(PREDICTION_BOX_PROMPTS, options.random, options.history)
      return {
        activityId: definition.id,
        actualId: null,
        answers: {},
        commitments: {},
        mode: 'prediction-box',
        options: selected.options,
        phase: 'prediction',
        predictionId: null,
        predictorIndex: activePlayerIndex,
        prompt: selected.prompt,
        promptId: selected.id,
        subjectIndex: activePlayerIndex === 0 ? 1 : 0,
        turnIndex: activePlayerIndex,
      }
    },
    advance(state, { input, playerIndex }) {
      if (state.phase === 'reveal') return advanceChoiceReveal(state, { input, playerIndex })
      if (state.commitments) return advanceCommittedChoice(state, { input, playerIndex })
      if (
        playerIndex !== state.turnIndex ||
        !getOption(state.options, input.answerId)
      ) {
        return { completed: false, state }
      }

      if (state.phase === 'prediction' && playerIndex === state.predictorIndex) {
        return {
          completed: false,
          state: {
            ...state,
            phase: 'answer',
            predictionId: input.answerId,
            turnIndex: state.subjectIndex,
          },
        }
      }

      if (state.phase === 'answer' && playerIndex === state.subjectIndex) {
        return {
          completed: false,
          state: {
            ...state,
            actualId: input.answerId,
            phase: 'reveal',
            revealAcks: [],
            turnIndex: state.predictorIndex,
          },
        }
      }

      return { completed: false, state }
    },
    render(props) {
      return <ChoiceGameCard {...props} definition={definition} />
    },
    resolve(state, players) {
      const prediction = getOption(state.options, state.predictionId)
      const actual = getOption(state.options, state.actualId)
      const matched = state.predictionId === state.actualId
      const predictorName = getPlayerName(players, state.predictorIndex)
      const subjectName = getPlayerName(players, state.subjectIndex)
      const heartBonus = matched ? 5 : 2

      return {
        heartBonus,
        label: definition.label,
        payload: {
          actual: {
            answerId: state.actualId,
            label: actual?.label || 'No answer',
            playerIndex: state.subjectIndex,
          },
          heartBonus,
          matched,
          options: state.options,
          prediction: {
            answerId: state.predictionId,
            label: prediction?.label || 'No prediction',
            playerIndex: state.predictorIndex,
          },
          prompt: state.prompt,
          promptId: state.promptId,
        },
        savesToJournal: true,
        summary: matched
          ? `${predictorName} called ${subjectName}'s answer exactly.`
          : `${predictorName} guessed one way; ${subjectName} revealed another.`,
        text: `${predictorName} predicted: ${prediction?.label || 'No prediction'}\n${subjectName} answered: ${actual?.label || 'No answer'}`,
        title: definition.label,
        type: definition.type,
        vibe: definition.vibe,
      }
    },
  }
}

function createVaultEntry(definition) {
  return {
    ...definition,
    createInitialState(_players, options = {}) {
      const selected = pickPrompt(VAULT_PROMPTS, options.random, options.history)
      return {
        activityId: definition.id,
        entries: [],
        mode: 'vault',
        prompt: selected.prompt,
        promptId: selected.id,
        revealAt: 'finale',
        turnIndex: options.activePlayerIndex ?? 0,
      }
    },
    advance(state, { input, playerIndex }) {
      const text = input.text?.trim().slice(0, 400)
      if (
        !text ||
        playerIndex !== state.turnIndex ||
        state.entries.some((entry) => entry.playerIndex === playerIndex)
      ) {
        return { completed: false, state }
      }

      const entries = [...state.entries, { playerIndex, text }]
      return {
        completed: entries.length === 2,
        state: {
          ...state,
          entries,
          turnIndex: playerIndex === 0 ? 1 : 0,
        },
      }
    },
    render(props) {
      return <VaultCard {...props} definition={definition} />
    },
    resolve(state, players) {
      return {
        heartBonus: 3,
        label: definition.label,
        payload: {
          entries: state.entries,
          heartBonus: 3,
          prompt: state.prompt,
          promptId: state.promptId,
          revealAt: 'finale',
          sealed: true,
        },
        savesToJournal: true,
        summary: 'Two private notes were sealed for this night’s finale.',
        text: state.entries
          .map((entry) => `${getPlayerName(players, entry.playerIndex)}: ${entry.text}`)
          .join('\n'),
        title: definition.label,
        type: definition.type,
        vibe: definition.vibe,
      }
    },
  }
}

export function createConnectionGameEntry(definition) {
  if (definition.id === 'mind-meld') {
    return createMindMeldEntry(definition)
  }

  if (definition.id === 'prediction-box') {
    return createPredictionBoxEntry(definition)
  }

  if (definition.id === 'the-vault') {
    return createVaultEntry(definition)
  }

  return null
}
