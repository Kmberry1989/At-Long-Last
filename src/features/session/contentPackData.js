import { ACTIVITIES as RAW_ACTIVITIES } from '../../../at-long-last-content-pack-v2/activityRegistry.ts'
import { DUELS as RAW_DUELS } from '../../../at-long-last-content-pack-v2/duelRegistry.ts'

export const activityDefinitions = RAW_ACTIVITIES.map((activity) => ({
  ...activity,
  label: activity.title,
}))

export const duelDefinitions = RAW_DUELS.map((duel) => ({
  ...duel,
  label: duel.name,
  prompt: duel.howToPlay?.[0] || duel.tagline,
}))
