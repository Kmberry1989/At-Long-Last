import { activityDefinitions, duelDefinitions } from './contentPackData.js'
import { getSessionPreset } from './sessionPresets.js'

export const DEFAULT_VIBE_WEIGHTS = {
  playful: 0.3,
  spicy: 0.2,
  tender: 0.5,
}

export function normalizeVibeWeights(weights = DEFAULT_VIBE_WEIGHTS) {
  const tender = Math.max(0, Number(weights.tender) || 0)
  const playful = Math.max(0, Number(weights.playful) || 0)
  const spicy = Math.max(0, Number(weights.spicy) || 0)
  const total = tender + playful + spicy || 1

  return {
    tender: tender / total,
    playful: playful / total,
    spicy: spicy / total,
  }
}

export function averageVibeVotes(votes = {}) {
  const values = Object.values(votes)
  if (!values.length) {
    return normalizeVibeWeights(DEFAULT_VIBE_WEIGHTS)
  }

  const totals = values.reduce(
    (current, vote) => ({
      tender: current.tender + (vote.tender || 0),
      playful: current.playful + (vote.playful || 0),
      spicy: current.spicy + (vote.spicy || 0),
    }),
    { tender: 0, playful: 0, spicy: 0 },
  )

  return normalizeVibeWeights({
    tender: totals.tender / values.length,
    playful: totals.playful / values.length,
    spicy: totals.spicy / values.length,
  })
}

export function getAllowedIntensities(weights = DEFAULT_VIBE_WEIGHTS) {
  return normalizeVibeWeights(weights).spicy >= 0.5 ? [1, 2, 3] : [1, 2]
}

function scoreEntry(entry, weights, usedIds, entries, presetId, random = Math.random) {
  const weight = weights[entry.vibe] ?? 0.1
  const preset = getSessionPreset(presetId)
  const usedEntries = entries.filter((candidate) => usedIds.includes(candidate.id))
  const vibeCounts = usedEntries.reduce(
    (counts, candidate) => ({
      ...counts,
      [candidate.vibe]: (counts[candidate.vibe] || 0) + 1,
    }),
    { tender: 0, playful: 0, spicy: 0 },
  )
  const minUsed = Math.min(vibeCounts.tender, vibeCounts.playful, vibeCounts.spicy)
  const vibePenalty = vibeCounts[entry.vibe] - minUsed
  const varietyBias = preset.id === 'quick' ? 0.3 : preset.id === 'long' ? 0.18 : 0.24
  const intensityBias = preset.id === 'quick'
    ? Math.max(0.82, 1 - entry.intensity * 0.05)
    : preset.id === 'long'
      ? 1 + entry.intensity * 0.04
      : 1

  return weight * intensityBias * (1 - vibePenalty * varietyBias * 0.1) * (0.84 + random() * 0.32)
}

export function pickWeightedEntry(
  entries,
  weights,
  usedIds = [],
  random = Math.random,
  options = {},
) {
  const normalized = normalizeVibeWeights(weights)
  const allowedIntensities = getAllowedIntensities(normalized)
  const usable = entries.filter(
    (entry) =>
      allowedIntensities.includes(entry.intensity) && !usedIds.includes(entry.id),
  )
  const pool = usable.length
    ? usable
    : entries.filter((entry) => allowedIntensities.includes(entry.intensity))

  const scored = pool
    .map((entry) => ({
      entry,
      score: scoreEntry(entry, normalized, usedIds, entries, options.preset, random),
    }))
    .sort((left, right) => right.score - left.score)

  const topCount = Math.max(3, Math.floor(scored.length * 0.4))
  const topPool = scored.slice(0, topCount)

  return topPool[Math.floor(random() * topPool.length)]?.entry ?? pool[0]
}

export function pickWeightedActivityId(weights, usedIds = [], random = Math.random, options = {}) {
  return pickWeightedEntry(activityDefinitions, weights, usedIds, random, options).id
}

export function pickWeightedActivityOptions(
  weights,
  usedIds = [],
  count = 2,
  random = Math.random,
  options = {},
) {
  const picks = []
  const seen = new Set(usedIds)

  while (picks.length < count) {
    const nextId = pickWeightedActivityId(weights, Array.from(seen), random, options)
    if (!nextId || seen.has(nextId)) {
      break
    }

    picks.push(nextId)
    seen.add(nextId)
  }

  return picks
}

export function pickWeightedDuelId(weights, usedIds = [], random = Math.random, options = {}) {
  return pickWeightedEntry(duelDefinitions, weights, usedIds, random, options).id
}

export function createDefaultBoardState() {
  return {
    playfulStickerIds: [],
    spicyGlowLevel: 0,
    tenderStars: 0,
  }
}

export function buildBoardRewardPatch(boardState, vibe, rewardId) {
  const next = {
    ...createDefaultBoardState(),
    ...boardState,
  }

  if (vibe === 'tender') {
    next.tenderStars += 1
  } else if (vibe === 'playful') {
    next.playfulStickerIds = Array.from(
      new Set([...(next.playfulStickerIds || []), rewardId]),
    )
  } else if (vibe === 'spicy') {
    next.spicyGlowLevel = Math.min(5, (next.spicyGlowLevel || 0) + 1)
  }

  return next
}
