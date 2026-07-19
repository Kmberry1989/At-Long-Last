import {
  BASE_DUEL_HEART_BONUS,
  BOARD_SPACES,
  KEEPSAKES,
  getBoardSpace,
} from './boardConfig.js'
import { getPresetGoals, getSessionPreset, summarizeSessionGoals } from './sessionPresets.js'
import { DEFAULT_VIBE_WEIGHTS } from './sessionWiring.js'

export function buildInitialSession(couple) {
  const preset = getSessionPreset(couple.sessionPreset)

  return {
    actionText: 'Set the vibe together before the first roll.',
    activePlayerIndex: 0,
    coupleId: couple.id,
    currentDuel: null,
    goals: getPresetGoals(preset.id),
    duelResults: {},
    hearts: 6,
    hostId: couple.players[0]?.uid || null,
    keepsakes: [],
    lastDuelOutcome: null,
    lastMove: null,
    lastRoll: null,
    pendingActivityId: null,
    pendingActivityType: null,
    pendingKeepsake: null,
    phase: 'vibeSetup',
    players: couple.players,
    positions: [0, 0],
    preset: preset.id,
    round: 1,
    roundDuelBonus: 0,
    startingPlayerIndex: 0,
    totalRounds: preset.totalRounds,
    turnsTakenThisRound: 0,
    usedActivityIds: [],
    usedDuelIds: [],
    vibeVotes: {},
    vibeWeights: null,
  }
}

export function finalizeVibeSetup(session, vibeWeights = DEFAULT_VIBE_WEIGHTS) {
  return {
    ...session,
    actionText: `${session.players[session.startingPlayerIndex]?.displayName || session.players[0].displayName} rolls first.`,
    phase: 'turn',
    vibeVotes: {},
    vibeWeights,
  }
}

export function getTurnPlayerIndex(startingPlayerIndex, turnsTaken, count = 2) {
  return (startingPlayerIndex + turnsTaken) % count
}

export function completeTurn(session) {
  const turnsTakenThisRound = session.turnsTakenThisRound + 1

  if (turnsTakenThisRound >= session.players.length) {
    return {
      ...session,
      actionText: 'Round duel time. Spin the wheel together.',
      phase: 'duelWheel',
      turnsTakenThisRound,
    }
  }

  const activePlayerIndex = getTurnPlayerIndex(
    session.startingPlayerIndex,
    turnsTakenThisRound,
    session.players.length,
  )
  const nextPlayer = session.players[activePlayerIndex]

  return {
    ...session,
    actionText: `${nextPlayer.displayName}, your turn.`,
    activePlayerIndex,
    phase: 'turn',
    turnsTakenThisRound,
  }
}

export function applyRollToSession(
  session,
  {
    activityType,
    keepsakeId,
    roll,
  },
) {
  const activePlayerIndex = session.activePlayerIndex
  const nextPositions = [...session.positions]
  const from = nextPositions[activePlayerIndex]
  const to = (from + roll) % BOARD_SPACES.length
  nextPositions[activePlayerIndex] = to
  const space = getBoardSpace(to)

  const base = {
    ...session,
    actionText: `${session.players[activePlayerIndex].displayName} landed on ${space.label}.`,
    lastMove: {
      from,
      playerIndex: activePlayerIndex,
      spaceId: space.id,
      steps: roll,
      to,
    },
    lastRoll: roll,
    positions: nextPositions,
  }

  if (space.type === 'heart') {
    return completeTurn({
      ...base,
      actionText: `${session.players[activePlayerIndex].displayName} picked up 2 shared hearts.`,
      hearts: session.hearts + 2,
    })
  }

  if (space.type === 'oops') {
    return completeTurn({
      ...base,
      actionText: `${session.players[activePlayerIndex].displayName} hit a snag. Lose 2 hearts.`,
      hearts: Math.max(0, session.hearts - 2),
    })
  }

  if (space.type === 'duel') {
    return completeTurn({
      ...base,
      actionText: 'Duel space. The round-end showdown is worth 1 extra heart.',
      hearts: session.hearts + 1,
      roundDuelBonus: session.roundDuelBonus + 1,
    })
  }

  if (space.type === 'keepsake') {
    return {
      ...base,
      actionText: 'Keepsake stop. Buy the memory or save your hearts.',
      pendingKeepsake: KEEPSAKES.find((item) => item.id === keepsakeId) || KEEPSAKES[0],
      phase: 'keepsake',
    }
  }

  return {
    ...base,
    actionText: 'Connection space. Time for a quick shared moment.',
    pendingActivityType: activityType,
    usedActivityIds: [...session.usedActivityIds, activityType],
    phase: 'activity',
  }
}

export function resolveKeepsakeDecision(session, shouldBuy) {
  const keepsake = session.pendingKeepsake
  if (!keepsake) {
    return session
  }

  let nextSession = {
    ...session,
    pendingKeepsake: null,
  }

  if (shouldBuy && session.hearts >= keepsake.cost) {
    nextSession = {
      ...nextSession,
      actionText: `You grabbed ${keepsake.label}.`,
      hearts: session.hearts - keepsake.cost,
      keepsakes: [...session.keepsakes, keepsake],
    }
  } else {
    nextSession = {
      ...nextSession,
      actionText: 'You saved your hearts for later.',
    }
  }

  return completeTurn(nextSession)
}

export function resolveActivityCompletion(session, result) {
  return completeTurn({
    ...session,
    actionText: `${result.label} complete. ${result.heartBonus} hearts added to the stash.`,
    hearts: session.hearts + result.heartBonus,
    pendingActivityId: null,
    pendingActivityType: null,
  })
}

export function resolveSkippedActivity(session, label) {
  return completeTurn({
    ...session,
    actionText: `${label} skipped. Moving on.`,
    pendingActivityId: null,
    pendingActivityType: null,
  })
}

export function beginRoundDuel(session, duelId) {
  return {
    ...session,
    actionText: 'Duel live. Best finish takes the shared heart bonus.',
    currentDuel: {
      attempt: 1,
      heartBonus: BASE_DUEL_HEART_BONUS + session.roundDuelBonus,
      id: duelId,
    },
    duelResults: {},
    usedDuelIds: [...session.usedDuelIds, duelId],
    phase: 'duel',
  }
}

export function evaluateDuelRound(session, duelRegistry) {
  const playerOne = session.players[0]
  const playerTwo = session.players[1]
  const resultOne = session.duelResults[playerOne.uid]
  const resultTwo = session.duelResults[playerTwo.uid]

  if (!resultOne || !resultTwo) {
    return { status: 'pending' }
  }

  const duel = duelRegistry[session.currentDuel.id]
  const tieResolution = duel.resolveTie(resultOne, resultTwo)

  if (tieResolution.retry) {
    return { status: 'retry' }
  }

  if (tieResolution.shared) {
    return { status: 'shared' }
  }

  if (tieResolution.noContest) {
    return { status: 'noContest' }
  }

  return {
    status: 'resolved',
    winnerIndex: tieResolution.winnerIndex,
  }
}

export function advanceAfterDuel(session, outcome) {
  if (outcome.status === 'retry') {
    return {
      ...session,
      actionText: 'Too close. Replay the duel.',
      currentDuel: {
        ...session.currentDuel,
        attempt: session.currentDuel.attempt + 1,
      },
      duelResults: {},
      phase: 'duel',
    }
  }

  const nextHearts =
    outcome.status === 'noContest'
      ? session.hearts
      : session.hearts + session.currentDuel.heartBonus

  if (outcome.status === 'shared') {
    if (session.round >= session.totalRounds) {
      return {
        ...session,
        actionText: 'You both landed it together and closed the night with a shared glow.',
        currentDuel: null,
        duelResults: {},
        hearts: nextHearts,
        lastDuelOutcome: {
          heartBonus: session.currentDuel.heartBonus,
          shared: true,
        },
        phase: 'finale',
        roundDuelBonus: 0,
      }
    }

    const round = session.round + 1
    const startingPlayerIndex =
      (session.startingPlayerIndex + 1) % session.players.length

    return {
      ...session,
      actionText: `You both synced it. Round ${round} is ready.`,
      activePlayerIndex: startingPlayerIndex,
      currentDuel: null,
      duelResults: {},
      hearts: nextHearts,
      lastDuelOutcome: {
        heartBonus: session.currentDuel.heartBonus,
        shared: true,
      },
      phase: 'turn',
      round,
      roundDuelBonus: 0,
      startingPlayerIndex,
      turnsTakenThisRound: 0,
    }
  }

  if (outcome.status === 'noContest') {
    if (session.round >= session.totalRounds) {
      return {
        ...session,
        actionText: 'The last duel fizzled out, but the night still lands softly.',
        currentDuel: null,
        duelResults: {},
        hearts: nextHearts,
        lastDuelOutcome: {
          noContest: true,
        },
        phase: 'finale',
        roundDuelBonus: 0,
      }
    }

    const round = session.round + 1
    const startingPlayerIndex =
      (session.startingPlayerIndex + 1) % session.players.length

    return {
      ...session,
      actionText: `No bonus this time. Round ${round} is ready.`,
      activePlayerIndex: startingPlayerIndex,
      currentDuel: null,
      duelResults: {},
      hearts: nextHearts,
      lastDuelOutcome: {
        noContest: true,
      },
      phase: 'turn',
      round,
      roundDuelBonus: 0,
      startingPlayerIndex,
      turnsTakenThisRound: 0,
    }
  }

  const winningPlayer = session.players[outcome.winnerIndex]

  if (session.round >= session.totalRounds) {
    return {
      ...session,
      actionText: `${winningPlayer.displayName} closed the night with the last duel win.`,
      currentDuel: null,
      duelResults: {},
      hearts: nextHearts,
      lastDuelOutcome: {
        ...outcome,
        heartBonus: session.currentDuel.heartBonus,
        winnerIndex: outcome.winnerIndex,
      },
      phase: 'finale',
      roundDuelBonus: 0,
    }
  }

  const round = session.round + 1
  const startingPlayerIndex =
    (session.startingPlayerIndex + 1) % session.players.length

  return {
    ...session,
    actionText: `${winningPlayer.displayName} won the duel. Round ${round} is ready.`,
    activePlayerIndex: startingPlayerIndex,
    currentDuel: null,
    duelResults: {},
    hearts: nextHearts,
    lastDuelOutcome: {
      ...outcome,
      heartBonus: session.currentDuel.heartBonus,
      winnerIndex: outcome.winnerIndex,
    },
    phase: 'turn',
    round,
    roundDuelBonus: 0,
    startingPlayerIndex,
    turnsTakenThisRound: 0,
  }
}

function getDominantVibe(vibeWeights) {
  const dominant = Object.entries(vibeWeights || {}).sort((left, right) => right[1] - left[1])[0]?.[0]
  return dominant || 'tender'
}

function buildFinaleTone({ completedGoalCount, hearts, journalCount, keepsakeCount }) {
  if (completedGoalCount >= 2 || keepsakeCount >= 3 || journalCount >= 7 || hearts >= 12) {
    return {
      coda: 'The drawer should open like proof that tonight really happened, not just a score recap.',
      headline: 'A whole night worth pinning up.',
      tierLabel: 'Scrapbook headliner',
      vibes: 'Certified sparks-all-night energy.',
    }
  }

  if (completedGoalCount >= 1 || keepsakeCount >= 2 || journalCount >= 5 || hearts >= 9) {
    return {
      coda: 'Enough little wins stacked up to feel like a proper finale instead of a fade-out.',
      headline: 'A night with some weight to it.',
      tierLabel: 'Shelf-worthy run',
      vibes: 'A very solid little legend.',
    }
  }

  return {
    coda: 'Even the quieter runs leave behind something you will actually want to reopen later.',
    headline: 'Still worth keeping close.',
    tierLabel: 'Soft landing',
    vibes: 'Short and sweet, but still worth keeping.',
  }
}

function buildDuelOutcomeLabel(session) {
  if (session.lastDuelOutcome?.shared) {
    return 'Shared finish'
  }

  if (session.lastDuelOutcome?.noContest) {
    return 'Soft landing'
  }

  if (typeof session.lastDuelOutcome?.winnerIndex === 'number') {
    return `${session.players[session.lastDuelOutcome.winnerIndex]?.displayName || 'Someone'} closed the last duel`
  }

  return 'Night sealed'
}

export function buildFinalSummary(session, journalEntries = []) {
  const journalCount = Array.isArray(journalEntries)
    ? journalEntries.filter((entry) => entry.type !== 'finale').length
    : journalEntries
  const hearts = session.hearts
  const keepsakeCount = session.keepsakes.length
  const preset = getSessionPreset(session.preset)
  const dominantVibe = getDominantVibe(session.vibeWeights)
  const goals = summarizeSessionGoals(session, Array.isArray(journalEntries) ? journalEntries : [])
  const completedGoals = goals.filter((goal) => goal.completed)
  const finaleTone = buildFinaleTone({
    completedGoalCount: completedGoals.length,
    hearts,
    journalCount,
    keepsakeCount,
  })

  return {
    coda: finaleTone.coda,
    completedGoalCount: completedGoals.length,
    dominantVibe,
    duelOutcomeLabel: buildDuelOutcomeLabel(session),
    goalBadges: completedGoals.map((goal) => goal.badge),
    goalCount: goals.length,
    goals,
    headline: finaleTone.headline,
    hearts,
    journalCount,
    keepsakeCount,
    keepsakeLabels: session.keepsakes.map((keepsake) => keepsake.label),
    preset: preset.id,
    presetLabel: preset.label,
    tierLabel: finaleTone.tierLabel,
    totalRounds: session.totalRounds || preset.totalRounds,
    vibes: finaleTone.vibes,
  }
}
