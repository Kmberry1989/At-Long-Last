export const SESSION_PRESETS = {
  quick: {
    description: 'Four rounds with a tight, replayable pace.',
    id: 'quick',
    label: 'Quick',
    totalRounds: 4,
  },
  standard: {
    description: 'Six rounds with the default board-night rhythm.',
    id: 'standard',
    label: 'Standard',
    totalRounds: 6,
  },
  long: {
    description: 'Eight rounds with more room for keepsakes and variety.',
    id: 'long',
    label: 'Long',
    totalRounds: 8,
  },
}

export const SESSION_PRESET_OPTIONS = Object.values(SESSION_PRESETS)

const GOAL_LIBRARY = {
  heartReserve: {
    badge: '10+ hearts',
    description: 'Finish the night with 10 or more shared hearts.',
    id: 'heartReserve',
    label: 'Heart Reserve',
    target: 10,
  },
  keepsakeCollector: {
    badge: '3 keepsakes',
    description: 'Collect at least 3 keepsakes before the finale.',
    id: 'keepsakeCollector',
    label: 'Keepsake Collector',
    target: 3,
  },
  vibeSampler: {
    badge: 'All 3 vibes',
    description: 'Complete at least one activity in each vibe.',
    id: 'vibeSampler',
    label: 'Vibe Sampler',
    target: 3,
  },
}

function getGoalIdsForPreset(presetId) {
  if (presetId === 'quick') {
    return ['heartReserve', 'vibeSampler']
  }

  if (presetId === 'long') {
    return ['keepsakeCollector', 'heartReserve', 'vibeSampler']
  }

  return ['keepsakeCollector', 'heartReserve']
}

function countActivityVibes(entries = []) {
  return new Set(
    entries
      .filter((entry) => ['journal', 'prompt', 'ritual'].includes(entry.type))
      .map((entry) => entry.vibe)
      .filter(Boolean),
  ).size
}

export function getSessionPreset(presetId = 'standard') {
  return SESSION_PRESETS[presetId] || SESSION_PRESETS.standard
}

export function getPresetGoals(presetId = 'standard') {
  return getGoalIdsForPreset(getSessionPreset(presetId).id).map((goalId) => ({
    ...GOAL_LIBRARY[goalId],
  }))
}

export function summarizeSessionGoals(session, journalEntries = []) {
  const goals = Array.isArray(session?.goals) && session.goals.length
    ? session.goals
    : getPresetGoals(session?.preset)

  const keepsakeCount = session?.keepsakes?.length || 0
  const hearts = session?.hearts || 0
  const vibeCount = countActivityVibes(journalEntries)

  return goals.map((goal) => {
    let progress = 0

    if (goal.id === 'keepsakeCollector') {
      progress = keepsakeCount
    } else if (goal.id === 'heartReserve') {
      progress = hearts
    } else if (goal.id === 'vibeSampler') {
      progress = vibeCount
    }

    return {
      ...goal,
      completed: progress >= goal.target,
      progress,
      progressLabel: `${Math.min(progress, goal.target)} / ${goal.target}`,
    }
  })
}
