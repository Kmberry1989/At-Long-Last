import { ACTIVITIES as RAW_ACTIVITIES } from '../../../at-long-last-content-pack-v2/activityRegistry.ts'
import { DUELS as RAW_DUELS } from '../../../at-long-last-content-pack-v2/duelRegistry.ts'
import { CONNECTION_ACTIVITY_DEFINITIONS } from './connectionGameData.js'
import { SEALED_ACTIVITY_DEFINITIONS } from './sealedActivityData.js'
import { WAVE_TWO_ACTIVITY_DEFINITIONS } from './waveTwoGameData.js'
import { WAVE_THREE_ACTIVITY_DEFINITIONS } from './waveThreeGameData.js'
import { WAVE_FOUR_ACTIVITY_DEFINITIONS } from './waveFourGameData.js'
import { WAVELENGTH_DUEL_DEFINITION } from './wavelengthDuelData.js'

export const activityDefinitions = [
  ...RAW_ACTIVITIES.map((activity) => ({
    ...activity,
    label: activity.title,
    savesToJournal: true,
  })),
  ...CONNECTION_ACTIVITY_DEFINITIONS,
  ...WAVE_TWO_ACTIVITY_DEFINITIONS,
  ...WAVE_THREE_ACTIVITY_DEFINITIONS,
  ...WAVE_FOUR_ACTIVITY_DEFINITIONS,
  ...SEALED_ACTIVITY_DEFINITIONS,
]

export const duelDefinitions = [...RAW_DUELS, WAVELENGTH_DUEL_DEFINITION].map((duel) => ({
  ...duel,
  label: duel.id === 'constellation-home' ? 'Star Map' : duel.name,
  prompt: duel.howToPlay?.[0] || duel.tagline,
}))

// Keep the full registry available for in-progress and historical nights while
// drawing new nights from a small set of distinct interaction families.
export const MINI_GAME_FAMILIES = {
  'wavelength-duel': 'guess-reveal',
  'kiss-courier': 'playful-duel',
  'doodle-duel-memory': 'creative-calm',
  'portrait-panic-directed': 'creative-calm',
  'letterpress-one-word': 'creative-calm',
  'gratitude-duel': 'creative-calm',
  'constellation-home': 'creative-calm',
  'sync-breath': 'creative-calm',
}

export const selectableDuelDefinitions = duelDefinitions
  .filter((duel) => Object.hasOwn(MINI_GAME_FAMILIES, duel.id))
  .map((duel) => ({ ...duel, family: MINI_GAME_FAMILIES[duel.id] }))
