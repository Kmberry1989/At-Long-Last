import { useMemo, useState } from 'react'
import { activityDefinitions } from './contentPackData.js'
import { createConnectionGameEntry } from './connectionGameRegistry.jsx'
import { createSealedActivityEntry } from './sealedActivityRegistry.jsx'
import { createWaveTwoGameEntry } from './waveTwoGameRegistry.jsx'
import { createWaveThreeGameEntry } from './waveThreeGameRegistry.jsx'
import { createWaveFourGameEntry } from './waveFourGameRegistry.jsx'
import { pickActivityPrompt } from './expandedPromptData.js'

function buildEntrySummary(definition, entries, players) {
  if (entries.length < 2) {
    return `${definition.label} started.`
  }

  return `${players[0].displayName} and ${players[1].displayName} left a ${definition.vibe} ${definition.type} beat together.`
}

function buildEntryText(entries, players) {
  return entries
    .map((entry) => `${players[entry.playerIndex].displayName}: ${entry.text}`)
    .join('\n')
}

function buildOpenAt(definition) {
  if (definition.id !== 'postcard-next-year') {
    return null
  }

  const openAt = new Date()
  openAt.setFullYear(openAt.getFullYear() + 1)
  return openAt.toISOString()
}

function ActivityCard({
  activity,
  definition,
  disabled,
  onSkip,
  onSubmit,
  playerIndex,
  players,
}) {
  const [text, setText] = useState('')
  const activeName =
    activity.state.turnIndex >= 0
      ? players[activity.state.turnIndex]?.displayName
      : null
  const revealed = activity.state.entries.length >= 2
  const responsePlaceholder = useMemo(() => {
    if (definition.type === 'ritual') {
      return 'Describe what you left, chose, or imagined.'
    }

    if (definition.type === 'journal') {
      return 'Write a couple of lines worth keeping.'
    }

    return 'One or two sentences is enough.'
  }, [definition.type])

  return (
    <div className={`overlay-card activity-card vibe-${definition.vibe}`}>
      <div className="overlay-head">
        <p className="eyebrow">{definition.vibe} {definition.type}</p>
        {definition.skippable && (
          <button className="secondary-link" disabled={disabled} onClick={onSkip} type="button">
            Skip This
          </button>
        )}
      </div>
      <h3>{definition.label}</h3>
      <p className="support-copy">{definition.description}</p>
      <div className="activity-prompt">
        <p>{activity.state.prompt}</p>
      </div>
      <div className="turn-badge">
        <strong>{activeName}</strong>
        <span>is up now</span>
        <span className="sealed-chip">{activity.state.entries.length}/2 sealed</span>
      </div>
      <textarea
        className="text-entry"
        disabled={disabled}
        onChange={(event) => setText(event.target.value)}
        placeholder={responsePlaceholder}
        rows={4}
        value={text}
      />
      <button
        className="primary-btn"
        disabled={disabled || !text.trim()}
        onClick={() => {
          onSubmit({ text })
          setText('')
        }}
        type="button"
      >
        Send It
      </button>
      <div className="activity-log">
        {revealed && (
          <p className="reveal-flourish" aria-live="polite">✨ revealed together</p>
        )}
        {activity.state.entries.map((entry, index) => {
          const isMine = entry.playerIndex === playerIndex
          const showText = revealed || isMine

          return (
            <div key={`${entry.playerIndex}-${index}`} className="activity-log-card">
              <strong>{players[entry.playerIndex].displayName}</strong>
              {showText ? (
                <p>{entry.text}</p>
              ) : (
                <p className="sealed-answer">✉️ Sealed — reveals when you both answer.</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function createRegistryEntry(definition) {
  return {
    ...definition,
    createInitialState(_players, { random = Math.random } = {}) {
      return {
        activityId: definition.id,
        entries: [],
        prompt: pickActivityPrompt(definition, random),
        turnIndex: 0,
      }
    },
    advance(state, { input, playerIndex }) {
      const nextEntries = [
        ...state.entries,
        {
          playerIndex,
          text: input.text.trim(),
        },
      ]

      return {
        completed: nextEntries.length >= 2,
        state: {
          ...state,
          entries: nextEntries,
          turnIndex: state.turnIndex === 0 ? 1 : 0,
        },
      }
    },
    render(props) {
      return <ActivityCard {...props} definition={definition} />
    },
    resolve(state, players) {
      const openAt = buildOpenAt(definition)
      return {
        heartBonus: 2 + definition.intensity,
        label: definition.label,
        payload: {
          ...state,
          imageDataUrl: null,
          openAt,
        },
        openAt,
        savesToJournal: definition.savesToJournal,
        summary: buildEntrySummary(definition, state.entries, players),
        text: buildEntryText(state.entries, players),
        title: definition.label,
        type: definition.type,
        vibe: definition.vibe,
      }
    },
  }
}

export const activityRegistry = Object.fromEntries(
  activityDefinitions.map((definition) => [
    definition.id,
    createSealedActivityEntry(definition) ||
      createConnectionGameEntry(definition) ||
      createWaveTwoGameEntry(definition) ||
      createWaveThreeGameEntry(definition) ||
      createWaveFourGameEntry(definition) ||
      createRegistryEntry(definition),
  ]),
)

export const activityIds = Object.keys(activityRegistry)

export function pickRandomActivityId(random = Math.random) {
  return activityIds[Math.floor(random() * activityIds.length)]
}
