import { activityDefinitions } from './contentPackData.js'
import { createConnectionGameEntry } from './connectionGameRegistry.jsx'
import { createSealedActivityEntry } from './sealedActivityRegistry.jsx'
import { createWaveTwoGameEntry } from './waveTwoGameRegistry.jsx'
import { createWaveThreeGameEntry } from './waveThreeGameRegistry.jsx'
import { createWaveFourGameEntry } from './waveFourGameRegistry.jsx'
import { pickActivityPrompt } from './expandedPromptData.js'
import { ActivityCardModal } from '../../components/ActivityCardModal.jsx'

function buildEntrySummary(definition, entries, players) {
  if (entries.length < 2) {
    return `${definition.label} started.`
  }

  const p1 = players[0]?.displayName || 'Player 1'
  const p2 = players[1]?.displayName || 'Player 2'
  return `${p1} and ${p2} left a ${definition.vibe} ${definition.type} beat together.`
}

function buildEntryText(entries, players) {
  return entries
    .map((entry) => {
      const playerName = players[entry.playerIndex]?.displayName || `Player ${entry.playerIndex + 1}`
      let line = `${playerName}: ${entry.text}`
      if (entry.guess) {
        const partnerIndex = entry.playerIndex === 0 ? 1 : 0
        const partnerName = players[partnerIndex]?.displayName || 'Partner'
        line += `\n  (Guessed for ${partnerName}: "${entry.guess}")`
      }
      return line
    })
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

function createRegistryEntry(definition) {
  return {
    ...definition,
    supportsPrivateFlow: true,
    createInitialState(_players, { random = Math.random, history = [] } = {}) {
      return {
        activityId: definition.id,
        entries: [],
        prompt: pickActivityPrompt(definition, random, history),
        turnIndex: 0,
      }
    },
    advance(state, { input, playerIndex }) {
      const existing = state.entries || []
      const filtered = existing.filter((e) => e.playerIndex !== playerIndex)
      const nextEntries = [
        ...filtered,
        {
          playerIndex,
          text: (input?.text || '').trim(),
          ...(input?.guess ? { guess: input.guess.trim() } : {}),
        },
      ]

      return {
        completed: nextEntries.length >= 2,
        state: {
          ...state,
          entries: nextEntries,
          turnIndex: nextEntries.length >= 2 ? -1 : (playerIndex === 0 ? 1 : 0),
        },
      }
    },
    render(props) {
      return <ActivityCardModal {...props} definition={definition} />
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
