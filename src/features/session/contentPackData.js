import { ACTIVITIES as RAW_ACTIVITIES } from '../../../at-long-last-content-pack-v2/activityRegistry.ts'
import { DUELS as RAW_DUELS } from '../../../at-long-last-content-pack-v2/duelRegistry.ts'
import { CONNECTION_ACTIVITY_DEFINITIONS } from './connectionGameData.js'
import { WAVE_TWO_ACTIVITY_DEFINITIONS } from './waveTwoGameData.js'
import { WAVE_THREE_ACTIVITY_DEFINITIONS } from './waveThreeGameData.js'
import { WAVE_FOUR_ACTIVITY_DEFINITIONS } from './waveFourGameData.js'

export const activityDefinitions = [
  ...RAW_ACTIVITIES.map((activity) => ({
    ...activity,
    label: activity.title,
  })),
  ...CONNECTION_ACTIVITY_DEFINITIONS,
  ...WAVE_TWO_ACTIVITY_DEFINITIONS,
  ...WAVE_THREE_ACTIVITY_DEFINITIONS,
  ...WAVE_FOUR_ACTIVITY_DEFINITIONS,
]

export const duelDefinitions = RAW_DUELS.map((duel) => ({
  ...duel,
  label: duel.name,
  prompt: duel.howToPlay?.[0] || duel.tagline,
}))
