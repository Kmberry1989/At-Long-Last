import { buildFinalSummary } from './sessionLogic.js'

function getFirstImageDataUrl(results = {}) {
  return Object.values(results).find((result) => result?.dataUrl)?.dataUrl ?? null
}

export function buildActivityJournalEntry({ coupleId, result, sessionId }) {
  if (!result?.savesToJournal) {
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

export function buildDuelJournalEntry({
  coupleId,
  duel,
  duelResults,
  heartBonus,
  outcome,
  players,
  sessionId,
}) {
  if (!duel || outcome.status === 'noContest') {
    return null
  }

  const imageDataUrl = getFirstImageDataUrl(duelResults)
  const highlights = Object.entries(duelResults)
    .map(([uid, result]) => {
      const player = players.find((entry) => entry.uid === uid)
      return `${player?.displayName ?? 'Player'}: ${result.highlight}`
    })
    .join('\n')

  const summary =
    outcome.status === 'shared'
      ? `You both landed ${duel.label} and banked ${heartBonus} shared hearts.`
      : `${players[outcome.winnerIndex].displayName} won ${duel.label} and banked ${heartBonus} shared hearts.`

  return {
    coupleId,
    payload: {
      duelId: duel.id,
      heartBonus,
      imageDataUrl,
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

export function buildFinaleJournalEntry({ coupleId, journalCount, session, sessionId }) {
  const summary = buildFinalSummary(session, journalCount)
  return {
    coupleId,
    payload: summary,
    sessionId,
    summary: summary.vibes,
    text: `${summary.keepsakeCount} keepsakes, ${summary.journalCount} journal beats, ${summary.hearts} hearts left.`,
    title: 'Night Closed Out',
    type: 'finale',
    vibe: session.vibeWeights?.spicy >= 0.5 ? 'spicy' : session.vibeWeights?.playful >= 0.34 ? 'playful' : 'tender',
  }
}
