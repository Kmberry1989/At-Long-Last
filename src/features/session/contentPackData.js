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

export const NIGHT_WRITING_DUELS = [
  {
    id: 'love-in-the-blanks', vibe: 'playful', intensity: 1,
    name: 'Love in the Blanks', tagline: 'Make tonight’s little story', durationSec: 60, players: 2,
    mechanics: 'Each player fills a short romantic Mad Lib privately with At Long Last word choices. Both stories reveal together.',
    howToPlay: ['Pick one word for each blank', 'Seal your story', 'Read both stories together later'],
    firebaseEvents: ['duel:madLibSealed', 'duel:madLibReveal'], boardReward: 'A shared story for the scrapbook',
    assetsNeeded: ['word-choice cards', 'story reveal'], skippable: true,
  },
  {
    id: 'our-next-line', vibe: 'tender', intensity: 1,
    name: 'Our Next Line', tagline: 'Write a story or song one word at a time', durationSec: 90, players: 2,
    mechanics: 'Each player privately adds eight single words to a shared story or song seed, then the night reveal alternates their words.',
    howToPlay: ['Choose a story or song seed', 'Add eight words, one at a time', 'Read the lines woven together later'],
    firebaseEvents: ['duel:lineSealed', 'duel:lineReveal'], boardReward: 'A co-written line for the scrapbook',
    assetsNeeded: ['one-word steps', 'woven line reveal'], skippable: true,
  },
]

export const duelDefinitions = [...RAW_DUELS, WAVELENGTH_DUEL_DEFINITION, ...NIGHT_WRITING_DUELS].map((duel) => ({
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
  'love-in-the-blanks': 'creative-calm',
  'our-next-line': 'creative-calm',
}

export const selectableDuelDefinitions = duelDefinitions
  .filter((duel) => Object.hasOwn(MINI_GAME_FAMILIES, duel.id))
  .map((duel) => ({ ...duel, family: MINI_GAME_FAMILIES[duel.id] }))
