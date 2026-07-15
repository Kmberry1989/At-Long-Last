import { useState } from 'react'

function SparkCheckInCard({ activity, disabled, onSubmit, players }) {
  const [mood, setMood] = useState(3)
  const [note, setNote] = useState('')

  return (
    <div className="overlay-card">
      <p className="eyebrow">Connection Event</p>
      <h3>{activity.label}</h3>
      <p className="support-copy">{activity.state.prompt}</p>
      <div className="mood-row">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            className={`mood-chip${mood === value ? ' active' : ''}`}
            disabled={disabled}
            onClick={() => setMood(value)}
            type="button"
          >
            {value}
          </button>
        ))}
      </div>
      <textarea
        className="text-entry"
        disabled={disabled}
        onChange={(event) => setNote(event.target.value)}
        placeholder="One sentence is enough."
        rows={3}
        value={note}
      />
      <button
        className="primary-btn"
        disabled={disabled || !note.trim()}
        onClick={() => onSubmit({ mood, note })}
        type="button"
      >
        Lock It In
      </button>
      <div className="activity-log">
        {activity.state.entries.map((entry, index) => (
          <div key={`${entry.playerIndex}-${index}`} className="activity-log-card">
            <strong>{players[entry.playerIndex].displayName}</strong>
            <span>Mood {entry.mood}/5</span>
            <p>{entry.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function StoryChainCard({ activity, disabled, onSubmit, players }) {
  const [line, setLine] = useState('')

  return (
    <div className="overlay-card">
      <p className="eyebrow">Connection Event</p>
      <h3>{activity.label}</h3>
      <p className="support-copy">{activity.state.prompt}</p>
      <div className="story-paper">
        {activity.state.lines.map((entry, index) => (
          <p key={`${entry.playerIndex}-${index}`}>
            <strong>{players[entry.playerIndex].displayName}:</strong> {entry.text}
          </p>
        ))}
      </div>
      <textarea
        className="text-entry"
        disabled={disabled}
        onChange={(event) => setLine(event.target.value)}
        placeholder="Add the next beat."
        rows={3}
        value={line}
      />
      <button
        className="primary-btn"
        disabled={disabled || !line.trim()}
        onClick={() => onSubmit({ text: line })}
        type="button"
      >
        Add Line
      </button>
    </div>
  )
}

function GratitudeDropCard({ activity, disabled, onSubmit, players }) {
  const [note, setNote] = useState('')

  return (
    <div className="overlay-card">
      <p className="eyebrow">Connection Event</p>
      <h3>{activity.label}</h3>
      <p className="support-copy">{activity.state.prompt}</p>
      <textarea
        className="text-entry"
        disabled={disabled}
        onChange={(event) => setNote(event.target.value)}
        placeholder="What landed for you lately?"
        rows={3}
        value={note}
      />
      <button
        className="primary-btn"
        disabled={disabled || !note.trim()}
        onClick={() => onSubmit({ text: note })}
        type="button"
      >
        Send It
      </button>
      <div className="activity-log">
        {activity.state.notes.map((entry, index) => (
          <div key={`${entry.playerIndex}-${index}`} className="activity-log-card">
            <strong>{players[entry.playerIndex].displayName}</strong>
            <p>{entry.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function commonJournalShape(type, label, summary, payload, heartBonus) {
  return {
    heartBonus,
    label,
    payload,
    summary,
    title: label,
    type,
  }
}

export const activityRegistry = {
  'gratitude-drop': {
    id: 'gratitude-drop',
    intro: 'Fast appreciation, no overthinking.',
    label: 'Gratitude Drop',
    render: GratitudeDropCard,
    createInitialState() {
      return {
        notes: [],
        prompt: 'Name one thing your person did lately that still feels good.',
        turnIndex: 0,
      }
    },
    advance(state, { input, playerIndex }) {
      const notes = [
        ...state.notes,
        { playerIndex, text: input.text.trim() },
      ]
      return {
        completed: notes.length >= 2,
        state: {
          ...state,
          notes,
          turnIndex: state.turnIndex === 0 ? 1 : 0,
        },
      }
    },
    resolve(state, players) {
      const summary = `${players[0].displayName} and ${players[1].displayName} traded two fresh gratitude notes.`
      return commonJournalShape(
        'activity',
        'Gratitude Drop',
        summary,
        state,
        4,
      )
    },
  },
  'spark-checkin': {
    id: 'spark-checkin',
    intro: 'Two turns, tiny honesty, instant bonus.',
    label: 'Spark Check-In',
    render: SparkCheckInCard,
    createInitialState() {
      return {
        entries: [],
        prompt: 'What kind of energy are you bringing into tonight?',
        turnIndex: 0,
      }
    },
    advance(state, { input, playerIndex }) {
      const entries = [
        ...state.entries,
        {
          mood: input.mood,
          note: input.note.trim(),
          playerIndex,
        },
      ]
      return {
        completed: entries.length >= 2,
        state: {
          ...state,
          entries,
          turnIndex: state.turnIndex === 0 ? 1 : 0,
        },
      }
    },
    resolve(state, players) {
      const summary = `${players[0].displayName} and ${players[1].displayName} synced their moods before the next move.`
      return commonJournalShape(
        'activity',
        'Spark Check-In',
        summary,
        state,
        3,
      )
    },
  },
  'story-chain': {
    id: 'story-chain',
    intro: 'A fast little shared fiction sprint.',
    label: 'Story Chain',
    render: StoryChainCard,
    createInitialState() {
      return {
        lines: [],
        prompt: 'Start a tiny story about the two of you getting gloriously sidetracked.',
        turnIndex: 0,
      }
    },
    advance(state, { input, playerIndex }) {
      const lines = [
        ...state.lines,
        {
          playerIndex,
          text: input.text.trim(),
        },
      ]
      return {
        completed: lines.length >= 4,
        state: {
          ...state,
          lines,
          turnIndex: state.turnIndex === 0 ? 1 : 0,
        },
      }
    },
    resolve(state, players) {
      const summary = `${players[0].displayName} and ${players[1].displayName} wrote a four-line story that should probably get framed.`
      return commonJournalShape(
        'activity',
        'Story Chain',
        summary,
        state,
        5,
      )
    },
  },
}

export const activityIds = Object.keys(activityRegistry)

export function pickRandomActivityId(random = Math.random) {
  return activityIds[Math.floor(random() * activityIds.length)]
}
