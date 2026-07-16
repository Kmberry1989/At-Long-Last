import {
  BASE_DUEL_HEART_BONUS,
  BOARD_SPACES,
  KEEPSAKES,
  TOTAL_ROUNDS,
  getBoardSpace,
} from './boardConfig.js'
import { DEFAULT_VIBE_WEIGHTS } from './sessionWiring.js'

export function buildInitialSession(couple) {
  return {
    actionText: 'Set the vibe together before the first roll.',
    activePlayerIndex: 0,
    coupleId: couple.id,
    currentDuel: null,
    duelResults: {},
    hearts: 6,
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
    round: 1,
    roundDuelBonus: 0,
    startingPlayerIndex: 0,
    totalRounds: TOTAL_ROUNDS,
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
    actionText: `${session.players[0].displayName} rolls first.`,
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

export function buildFinalSummary(session, journalCount) {
  const vibes =
    session.keepsakes.length >= 3
      ? 'Certified sparks-all-night energy.'
      : session.keepsakes.length >= 2
        ? 'A very solid little legend.'
        : 'Short and sweet, but still worth keeping.'

  return {
    hearts: session.hearts,
    journalCount,
    keepsakeCount: session.keepsakes.length,
    vibes,
  }
}
