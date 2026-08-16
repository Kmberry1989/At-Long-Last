import { buildFinalSummary } from './sessionLogic.js'

export function getScrapbookMomentCount(entries = []) {
  return entries.filter((entry) => entry?.type !== 'finale').length
}

function getFirstImageDataUrl(results = {}) {
  return Object.values(results).find((result) => result?.dataUrl)?.dataUrl ?? null
}

export function buildActivityJournalEntry({ coupleId, result, sessionId }) {
  if (!result) {
    return null
  }

  return {
    coupleId,
    openAt: result.openAt ?? null,
    payload: result.payload,
    sessionId,
    summary: result.summary,
    text: result.text ?? result.summary,
    title: result.title,
    type: result.type,
    vibe: result.vibe,
  }
}

export function buildSkippedActivityJournalEntry({
  activity,
  coupleId,
  sessionId,
  usedPocketLoveNote = false,
}) {
  if (!activity) {
    return null
  }

  return {
    coupleId,
    payload: {
      originalType: activity.type,
      prompt: activity.state?.prompt || null,
      skipped: true,
    },
    sessionId,
    summary: usedPocketLoveNote
      ? `${activity.label} got passed, and Pocket Love Note kept a tiny trace of it.`
      : `${activity.label} was passed this time.`,
    text: activity.state?.prompt
      ? `Passed on: ${activity.state.prompt}`
      : 'Passed this time.',
    title: usedPocketLoveNote
      ? `${activity.label} (Saved Anyway)`
      : `${activity.label} (Passed)`,
    type: 'activity-pass',
    vibe: activity.vibe,
  }
}

function formatVibeVote(vote = {}) {
  return [
    `Tender ${Math.round((vote.tender || 0) * 100)}%`,
    `Playful ${Math.round((vote.playful || 0) * 100)}%`,
    `Spicy ${Math.round((vote.spicy || 0) * 100)}%`,
  ].join(' · ')
}

export function buildVibeSetupJournalEntry({
  coupleId,
  players,
  sessionId,
  vibeVotes,
  vibeWeights,
}) {
  if (!players?.length || !vibeVotes || !vibeWeights) {
    return null
  }

  const leadingVibe = Object.entries(vibeWeights)
    .sort(([, left], [, right]) => right - left)[0]?.[0] || 'tender'
  const text = players
    .map((player) => `${player.displayName}: ${formatVibeVote(vibeVotes[player.uid])}`)
    .join('\n')

  return {
    coupleId,
    payload: {
      players: players.map((player) => ({
        displayName: player.displayName,
        uid: player.uid,
      })),
      vibeVotes,
      vibeWeights,
    },
    sessionId,
    summary: 'You both set the tone for this night.',
    text,
    title: 'Tonight’s Vibe',
    type: 'vibe-setup',
    vibe: leadingVibe,
  }
}

export function buildDuelJournalEntry({
  coupleId,
  duel,
  duelResults,
  heartBonus,
  outcome,
  players,
  sessionId,
}) {
  if (!duel || !outcome) {
    return null
  }

  const imageDataUrl = getFirstImageDataUrl(duelResults)
  const highlights = Object.entries(duelResults)
    .map(([uid, result]) => {
      const player = players.find((entry) => entry.uid === uid)
      return `${player?.displayName ?? 'Player'}: ${result.highlight}`
    })
    .join('\n')

  let summary
  let awardedHeartBonus = heartBonus
  if (outcome.status === 'shared') {
    summary = `You both landed ${duel.label} and banked ${heartBonus} shared hearts.`
  } else if (outcome.status === 'noContest') {
    summary = `You both passed ${duel.label}. No hearts were added, but the choice was saved.`
    awardedHeartBonus = 0
  } else if (outcome.status === 'repick') {
    summary = `${duel.label} was passed, so you picked another duel.`
    awardedHeartBonus = 0
  } else {
    const winner = players[outcome.winnerIndex]
    summary = `${winner?.displayName || 'One player'} won ${duel.label} and banked ${heartBonus} shared hearts.`
  }

  return {
    coupleId,
    payload: {
      duelId: duel.id,
      heartBonus: awardedHeartBonus,
      imageDataUrl,
      outcomeStatus: outcome.status,
      results: duelResults,
    },
    sessionId,
    summary,
    text: highlights || summary,
    title: duel.label,
    type: 'duel',
    vibe: duel.vibe,
  }
}

export function buildFinaleJournalEntry({ coupleId, journalEntries, session, sessionId }) {
  const summary = buildFinalSummary(session, journalEntries)
  return {
    coupleId,
    payload: summary,
    sessionId,
    summary: summary.vibes,
    text: `${summary.presetLabel} night, ${summary.keepsakeCount} keepsakes, ${summary.journalCount} journal beats, ${summary.hearts} hearts left, ${summary.completedGoalCount}/${summary.goalCount} goals hit, ${summary.completedSpotlightCount} spotlights cleared, ${summary.momentumUnlockedCount} momentum bonuses armed.`,
    title: 'Night Closed Out',
    type: 'finale',
    vibe: session.vibeWeights?.spicy >= 0.5 ? 'spicy' : session.vibeWeights?.playful >= 0.34 ? 'playful' : 'tender',
  }
}
