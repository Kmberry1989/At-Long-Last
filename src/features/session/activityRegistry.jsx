import { useMemo, useState } from 'react'
import { activityDefinitions } from './contentPackData.js'

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

function ActivityCard({ activity, disabled, onSkip, onSubmit, players }) {
  const [text, setText] = useState('')
  const activeName =
    activity.state.turnIndex >= 0
      ? players[activity.state.turnIndex]?.displayName
      : null
  const responsePlaceholder = useMemo(() => {
    if (activity.type === 'ritual') {
      return 'Describe what you left, chose, or imagined.'
    }

    if (activity.type === 'journal') {
      return 'Write a couple of lines worth keeping.'
    }

    return 'One or two sentences is enough.'
  }, [activity.type])

  return (
    <div className={`overlay-card activity-card vibe-${activity.vibe}`}>
      <div className="overlay-head">
        <p className="eyebrow">{activity.vibe} {activity.type}</p>
        {activity.skippable && (
          <button className="secondary-link" disabled={disabled} onClick={onSkip} type="button">
            Skip This
          </button>
        )}
      </div>
      <h3>{activity.label}</h3>
      <p className="support-copy">{activity.intro}</p>
      <div className="activity-prompt">
        <p>{activity.state.prompt}</p>
      </div>
      <div className="turn-badge">
        <strong>{activeName}</strong>
        <span>is up now</span>
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
        {activity.state.entries.map((entry, index) => (
          <div key={`${entry.playerIndex}-${index}`} className="activity-log-card">
            <strong>{players[entry.playerIndex].displayName}</strong>
            <p>{entry.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function createRegistryEntry(definition) {
  return {
    ...definition,
    createInitialState() {
      return {
        activityId: definition.id,
        entries: [],
        prompt: definition.prompt,
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
    render: ActivityCard,
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
    createRegistryEntry(definition),
  ]),
)

export const activityIds = Object.keys(activityRegistry)

export function pickRandomActivityId(random = Math.random) {
  return activityIds[Math.floor(random() * activityIds.length)]
}
