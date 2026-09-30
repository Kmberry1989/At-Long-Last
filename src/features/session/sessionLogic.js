import {
  BASE_DUEL_HEART_BONUS,
  BOARD_SPACES,
  KEEPSAKES,
  getBoardSpace,
} from './boardConfig.js'
import { getPresetGoals, getSessionPreset, summarizeSessionGoals } from './sessionPresets.js'
import { DEFAULT_VIBE_WEIGHTS } from './sessionWiring.js'

const MOMENTUM_UNLOCK_THRESHOLD = 2

const ACT_LABELS = {
  finale: 'Finale',
  spark: 'Spark',
  warmup: 'Warmup',
}

const MOMENTUM_LABELS = {
  playful: 'Double pick armed',
  spicy: 'Heat boost armed',
  tender: 'Soft landing armed',
}

function capitalize(value = '') {
  if (!value) {
    return ''
  }

  return value[0].toUpperCase() + value.slice(1)
}

export function createMomentumState() {
  return {
    consumed: {
      playful: false,
      spicy: false,
      tender: false,
    },
    playful: 0,
    spicy: 0,
    tender: 0,
    unlocked: {
      playful: false,
      spicy: false,
      tender: false,
    },
  }
}

export function getDominantVibe(vibeWeights) {
  const dominant = Object.entries(vibeWeights || {}).sort((left, right) => right[1] - left[1])[0]?.[0]
  return dominant || 'tender'
}

export function getSessionAct(round = 1, totalRounds = 6) {
  if (round >= totalRounds) {
    return 'finale'
  }

  if (round <= 2) {
    return 'warmup'
  }

  return 'spark'
}

export function buildSpotlight(act, vibeWeights = DEFAULT_VIBE_WEIGHTS) {
  if (act === 'spark') {
    const vibe = getDominantVibe(vibeWeights)
    return {
      act,
      completed: false,
      description: `Land one ${vibe} activity or duel while ${capitalize(vibe)} leads tonight.`,
      id: `spark-${vibe}`,
      label: `${capitalize(vibe)} Spark`,
      rewarded: false,
    }
  }

  if (act === 'finale') {
    return {
      act,
      completed: false,
      description: 'Finish the last duel cleanly. No skip, no no-contest fade-out.',
      id: 'finale-close-clean',
      label: 'Close It Out',
      rewarded: false,
    }
  }

  return {
    act: 'warmup',
    completed: false,
    description: 'Save one journal-worthy activity before the night settles in.',
    id: 'warmup-journal-save',
    label: 'Save The First Page',
    rewarded: false,
  }
}

export function ensureSessionArcState(session) {
  if (!session) {
    return session
  }

  const act = getSessionAct(session.round || 1, session.totalRounds || 6)
  const momentum = {
    ...createMomentumState(),
    ...session.momentum,
    consumed: {
      ...createMomentumState().consumed,
      ...session.momentum?.consumed,
    },
    unlocked: {
      ...createMomentumState().unlocked,
      ...session.momentum?.unlocked,
    },
  }
  const spotlight =
    session.spotlight?.act === act
      ? {
          ...buildSpotlight(act, session.vibeWeights),
          ...session.spotlight,
        }
      : buildSpotlight(act, session.vibeWeights)

  return {
    ...session,
    completedSpotlightActs: session.completedSpotlightActs || [],
    keepsakePerks: session.keepsakePerks || [],
    momentum,
    pendingActivityOptions: session.pendingActivityOptions || null,
    spotlight,
    usedKeepsakePerks: session.usedKeepsakePerks || [],
  }
}

function appendUnique(items = [], value) {
  return items.includes(value) ? items : [...items, value]
}

function hasKeepsakePerk(session, perkId) {
  return session.keepsakePerks.includes(perkId)
}

function hasUnusedKeepsakePerk(session, perkId) {
  return hasKeepsakePerk(session, perkId) && !session.usedKeepsakePerks.includes(perkId)
}

function consumeKeepsakePerk(session, perkId) {
  if (!hasUnusedKeepsakePerk(session, perkId)) {
    return session
  }

  return {
    ...session,
    usedKeepsakePerks: [...session.usedKeepsakePerks, perkId],
  }
}

function hasArmedMomentumBonus(session, vibe) {
  return Boolean(session.momentum?.unlocked?.[vibe] && !session.momentum?.consumed?.[vibe])
}

function consumeMomentumBonus(session, vibe) {
  if (!hasArmedMomentumBonus(session, vibe)) {
    return session
  }

  return {
    ...session,
    momentum: {
      ...session.momentum,
      consumed: {
        ...session.momentum.consumed,
        [vibe]: true,
      },
    },
  }
}

function addSpotlightReward(session, successCopy) {
  if (session.spotlight.completed && session.spotlight.rewarded) {
    return session
  }

  return {
    ...session,
    actionText: `${successCopy} Spotlight cleared for +2 hearts.`,
    completedSpotlightActs: appendUnique(session.completedSpotlightActs, session.spotlight.act),
    hearts: session.hearts + 2,
    spotlight: {
      ...session.spotlight,
      completed: true,
      rewarded: true,
    },
  }
}

function maybeCompleteSpotlight(session, event) {
  if (!session?.spotlight || session.spotlight.completed) {
    return session
  }

  if (
    session.spotlight.act === 'warmup' &&
    event.type === 'activity' &&
    event.result?.savesToJournal
  ) {
    return addSpotlightReward(session, 'First page saved.')
  }

  if (
    session.spotlight.act === 'spark' &&
    (event.type === 'activity' || event.type === 'duel') &&
    event.vibe === getDominantVibe(session.vibeWeights)
  ) {
    return addSpotlightReward(session, `${capitalize(event.vibe)} momentum landed.`)
  }

  if (
    session.spotlight.act === 'finale' &&
    event.type === 'duel' &&
    (event.outcome?.status === 'shared' || event.outcome?.status === 'resolved')
  ) {
    return addSpotlightReward(session, 'Finale landed clean.')
  }

  return session
}

function syncSpotlightToRound(session, round = session.round) {
  const nextAct = getSessionAct(round, session.totalRounds || 6)
  if (session.spotlight?.act === nextAct) {
    return session
  }

  return {
    ...session,
    spotlight: buildSpotlight(nextAct, session.vibeWeights),
  }
}

function buildMomentumUnlockCopy(vibe) {
  if (vibe === 'playful') {
    return 'Playful momentum armed a double pick.'
  }

  if (vibe === 'spicy') {
    return 'Spicy momentum armed a heat boost.'
  }

  return 'Tender momentum armed a soft landing.'
}

function addMomentum(session, vibe) {
  if (!vibe) {
    return session
  }

  const nextValue = (session.momentum?.[vibe] || 0) + 1
  const unlockedBefore = Boolean(session.momentum?.unlocked?.[vibe])
  const nextSession = {
    ...session,
    momentum: {
      ...session.momentum,
      [vibe]: nextValue,
      unlocked: {
        ...session.momentum.unlocked,
        [vibe]: unlockedBefore || nextValue >= MOMENTUM_UNLOCK_THRESHOLD,
      },
    },
  }

  if (!unlockedBefore && nextValue >= MOMENTUM_UNLOCK_THRESHOLD) {
    return {
      ...nextSession,
      actionText: buildMomentumUnlockCopy(vibe),
    }
  }

  return nextSession
}

export function buildInitialSession(couple) {
  const preset = getSessionPreset(couple.sessionPreset)

  return ensureSessionArcState({
    actionText: 'Set the vibe together before the first roll.',
    activePlayerIndex: 0,
    completedSpotlightActs: [],
    coupleId: couple.id,
    currentDuel: null,
    duelResults: {},
    goals: getPresetGoals(preset.id),
    hearts: 6,
    hostId: couple.players[0]?.uid || null,
    keepsakePerks: [],
    keepsakes: [],
    lastDuelOutcome: null,
    lastMove: null,
    lastRoll: null,
    momentum: createMomentumState(),
    moodVotes: {},
    mutualYesMatches: 0,
    pendingActivityId: null,
    pendingActivityOptions: null,
    pendingActivityType: null,
    pendingKeepsake: null,
    phase: 'vibeSetup',
    players: couple.players,
    positions: [0, 0],
    preset: preset.id,
    progressRecorded: false,
    round: 1,
    roundDuelBonus: 0,
    sealedMatches: 0,
    sharedDuelWins: 0,
    startingPlayerIndex: 0,
    totalRounds: preset.totalRounds,
    turnsTakenThisRound: 0,
    usedActivityIds: [],
    usedDuelIds: [],
    usedKeepsakePerks: [],
    vibeVotes: {},
    vibeWeights: null,
  })
}

export function finalizeVibeSetup(session, vibeWeights = DEFAULT_VIBE_WEIGHTS) {
  const nextSession = ensureSessionArcState({
    ...session,
    actionText: `${session.players[session.startingPlayerIndex]?.displayName || session.players[0].displayName} rolls first.`,
    phase: 'turn',
    vibeVotes: {},
    vibeWeights,
  })

  return syncSpotlightToRound(nextSession)
}

export const MOOD_OPTIONS = [
  { emoji: '🛋️', id: 'cozy', label: 'Cozy' },
  { emoji: '🎉', id: 'playful', label: 'Playful' },
  { emoji: '💋', id: 'flirty', label: 'Flirty' },
  { emoji: '🌙', id: 'dreamy', label: 'Dreamy' },
  { emoji: '🔥', id: 'wild', label: 'Wild' },
]

export function isValidMood(mood) {
  return MOOD_OPTIONS.some((option) => option.id === mood)
}

export function buildNightChecklist() {
  return [
    { done: false, id: 'set-mood', label: 'Share your mood' },
    { done: false, id: 'set-vibe', label: "Set the night's vibe" },
    { done: false, id: 'first-roll', label: 'Take the first roll' },
    { done: false, id: 'duel-night', label: 'Face a duel together' },
    { done: false, id: 'keepsake', label: 'Pocket a keepsake' },
  ]
}

/**
 * The night checklist completes itself from live session state — both
 * players voting their mood, the vibe locking in, the first roll, a duel
 * result, and a pocketed keepsake.
 */
export function evaluateNightChecklist(session) {
  if (!session) {
    return buildNightChecklist()
  }

  const players = session.players || []
  const moodVotes = session.moodVotes || {}
  const moodDone = players.length > 0 && players.every((player) => moodVotes[player.uid])

  return buildNightChecklist().map((item) => {
    switch (item.id) {
      case 'set-mood':
        return { ...item, done: moodDone }
      case 'set-vibe':
        return { ...item, done: Boolean(session.vibeWeights) }
      case 'first-roll':
        return { ...item, done: session.lastRoll != null }
      case 'duel-night':
        return { ...item, done: Boolean(session.lastDuelOutcome) }
      case 'keepsake':
        return { ...item, done: (session.keepsakes || []).length > 0 }
      default:
        return item
    }
  })
}

export function nightChecklistProgress(session) {
  const items = evaluateNightChecklist(session)
  const done = items.filter((item) => item.done).length

  return { done, items, total: items.length }
}

export function getTurnPlayerIndex(startingPlayerIndex, turnsTaken, count = 2) {
  return (startingPlayerIndex + turnsTaken) % count
}

export function completeTurn(session) {
  const nextSession = ensureSessionArcState(session)
  const turnsTakenThisRound = nextSession.turnsTakenThisRound + 1

  if (turnsTakenThisRound >= nextSession.players.length) {
    return {
      ...nextSession,
      actionText: 'Round duel time. Spin the wheel together.',
      phase: 'duelWheel',
      turnsTakenThisRound,
    }
  }

  const activePlayerIndex = getTurnPlayerIndex(
    nextSession.startingPlayerIndex,
    turnsTakenThisRound,
    nextSession.players.length,
  )
  const nextPlayer = nextSession.players[activePlayerIndex]

  return {
    ...nextSession,
    actionText: `${nextPlayer.displayName}, your turn.`,
    activePlayerIndex,
    phase: 'turn',
    turnsTakenThisRound,
  }
}

export function choosePendingActivity(session, activityType) {
  const nextSession = ensureSessionArcState(session)
  if (!nextSession.pendingActivityOptions?.includes(activityType)) {
    return nextSession
  }

  return {
    ...nextSession,
    actionText: 'Connection picked. Open it together.',
    pendingActivityOptions: null,
    pendingActivityType: activityType,
    phase: 'activity',
    usedActivityIds: [...nextSession.usedActivityIds, activityType],
  }
}

export function applyRollToSession(
  session,
  {
    activityOptions = [],
    activityType,
    keepsakeId,
    roll,
  },
) {
  const nextSession = ensureSessionArcState(session)
  const activePlayerIndex = nextSession.activePlayerIndex
  const nextPositions = [...nextSession.positions]
  const from = nextPositions[activePlayerIndex]
  const to = (from + roll) % BOARD_SPACES.length
  nextPositions[activePlayerIndex] = to
  const space = getBoardSpace(to)

  const base = {
    ...nextSession,
    actionText: `${nextSession.players[activePlayerIndex].displayName} landed on ${space.label}.`,
    lastMove: {
      from,
      playerIndex: activePlayerIndex,
      spaceId: space.id,
      steps: roll,
      to,
    },
    lastRoll: roll,
    pendingActivityOptions: null,
    positions: nextPositions,
  }

  if (space.type === 'heart') {
    return completeTurn({
      ...base,
      actionText: `${nextSession.players[activePlayerIndex].displayName} picked up 2 shared hearts.`,
      hearts: nextSession.hearts + 2,
    })
  }

  if (space.type === 'oops') {
    if (hasUnusedKeepsakePerk(base, 'midnight-snack')) {
      return completeTurn({
        ...consumeKeepsakePerk(base, 'midnight-snack'),
        actionText: 'Midnight Snack softened the snag. No hearts lost.',
      })
    }

    if (hasArmedMomentumBonus(base, 'tender')) {
      return completeTurn({
        ...consumeMomentumBonus(base, 'tender'),
        actionText: 'Tender momentum cushioned the snag. No hearts lost.',
      })
    }

    return completeTurn({
      ...base,
      actionText: `${nextSession.players[activePlayerIndex].displayName} hit a snag. Lose 2 hearts.`,
      hearts: Math.max(0, nextSession.hearts - 2),
    })
  }

  if (space.type === 'duel') {
    return completeTurn({
      ...base,
      actionText: 'Duel space. The round-end showdown is worth 1 extra heart.',
      hearts: nextSession.hearts + 1,
      roundDuelBonus: nextSession.roundDuelBonus + 1,
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

  if (hasArmedMomentumBonus(base, 'playful') && activityOptions.length >= 2) {
    return {
      ...consumeMomentumBonus(base, 'playful'),
      actionText: 'Playful momentum unlocked a double pick. Choose the next beat.',
      pendingActivityOptions: activityOptions,
      pendingActivityType: null,
      phase: 'activityChoice',
    }
  }

  return {
    ...base,
    actionText: 'Connection space. Time for a quick shared moment.',
    pendingActivityType: activityType,
    phase: 'activity',
    usedActivityIds: [...nextSession.usedActivityIds, activityType],
  }
}

export function resolveKeepsakeDecision(session, shouldBuy) {
  const nextSession = ensureSessionArcState(session)
  const keepsake = nextSession.pendingKeepsake
  if (!keepsake) {
    return nextSession
  }

  let resolved = {
    ...nextSession,
    pendingKeepsake: null,
  }

  if (shouldBuy && nextSession.hearts >= keepsake.cost) {
    resolved = {
      ...resolved,
      actionText: `You grabbed ${keepsake.label}. ${keepsake.perkLabel} is armed.`,
      hearts: nextSession.hearts - keepsake.cost,
      keepsakePerks: appendUnique(nextSession.keepsakePerks, keepsake.perkId),
      keepsakes: [...nextSession.keepsakes, keepsake],
    }
  } else {
    resolved = {
      ...resolved,
      actionText: 'You saved your hearts for later.',
    }
  }

  return completeTurn(syncSpotlightToRound(resolved))
}

export function resolveActivityCompletion(session, result) {
  const nextSession = ensureSessionArcState(session)
  let heartBonus = result.heartBonus
  let resolved = {
    ...nextSession,
    pendingActivityId: null,
    pendingActivityOptions: null,
    pendingActivityType: null,
  }

  if (result.savesToJournal && hasUnusedKeepsakePerk(resolved, 'sparkler-photo')) {
    resolved = consumeKeepsakePerk(resolved, 'sparkler-photo')
    heartBonus += 1
  }

  resolved = {
    ...resolved,
    actionText: `${result.label} complete. ${heartBonus} hearts added to the stash.`,
    hearts: resolved.hearts + heartBonus,
  }

  if (result.payload?.sealedMatch) {
    resolved = {
      ...resolved,
      sealedMatches: (resolved.sealedMatches || 0) + 1,
    }
  }

  if (result.payload?.mutualYes) {
    resolved = {
      ...resolved,
      mutualYesMatches: (resolved.mutualYesMatches || 0) + 1,
    }
  }

  resolved = addMomentum(resolved, result.vibe)
  resolved = maybeCompleteSpotlight(resolved, {
    result,
    type: 'activity',
    vibe: result.vibe,
  })

  return completeTurn(resolved)
}

export function resolveSkippedActivity(session, label) {
  const nextSession = ensureSessionArcState(session)
  const usedLoveNote = hasUnusedKeepsakePerk(nextSession, 'pocket-love-note')
  const resolved = usedLoveNote
    ? consumeKeepsakePerk(
        {
          ...nextSession,
          actionText: `${label} skipped, but Pocket Love Note still saved a page.`,
          pendingActivityId: null,
          pendingActivityOptions: null,
          pendingActivityType: null,
        },
        'pocket-love-note',
      )
    : {
        ...nextSession,
        actionText: `${label} skipped. Moving on.`,
        pendingActivityId: null,
        pendingActivityOptions: null,
        pendingActivityType: null,
      }

  return completeTurn(resolved)
}

export function beginRoundDuel(session, duelId) {
  let nextSession = ensureSessionArcState(session)
  let heartBonus = BASE_DUEL_HEART_BONUS + nextSession.roundDuelBonus

  if (hasArmedMomentumBonus(nextSession, 'spicy')) {
    nextSession = consumeMomentumBonus(nextSession, 'spicy')
    heartBonus += 1
  }

  if (
    nextSession.round >= nextSession.totalRounds &&
    hasUnusedKeepsakePerk(nextSession, 'last-dance-ticket')
  ) {
    nextSession = consumeKeepsakePerk(nextSession, 'last-dance-ticket')
    heartBonus += 2
  }

  return {
    ...nextSession,
    actionText: `Duel live. This showdown is worth ${heartBonus} shared hearts.`,
    currentDuel: {
      attempt: 1,
      heartBonus,
      id: duelId,
    },
    duelResults: {},
    phase: 'duel',
    usedDuelIds: [...nextSession.usedDuelIds, duelId],
  }
}

export function evaluateDuelRound(session, duelRegistry) {
  const nextSession = ensureSessionArcState(session)
  const playerOne = nextSession.players[0]
  const playerTwo = nextSession.players[1]
  const resultOne = nextSession.duelResults[playerOne.uid]
  const resultTwo = nextSession.duelResults[playerTwo.uid]

  if (!resultOne || !resultTwo) {
    return { status: 'pending' }
  }

  const duel = duelRegistry[nextSession.currentDuel.id]
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

export function advanceAfterDuel(session, outcome, duel) {
  const nextSession = ensureSessionArcState(session)
  if (outcome.status === 'retry') {
    return {
      ...nextSession,
      actionText: 'Too close. Replay the duel.',
      currentDuel: {
        ...nextSession.currentDuel,
        attempt: nextSession.currentDuel.attempt + 1,
      },
      duelResults: {},
      phase: 'duel',
    }
  }

  let resolved = nextSession

  if (outcome.status === 'shared' || outcome.status === 'resolved') {
    resolved = addMomentum(resolved, duel?.vibe)
    resolved = maybeCompleteSpotlight(resolved, {
      outcome,
      type: 'duel',
      vibe: duel?.vibe,
    })
  }

  const nextHearts =
    outcome.status === 'noContest'
      ? resolved.hearts
      : resolved.hearts + nextSession.currentDuel.heartBonus

  if (outcome.status === 'shared') {
    if (nextSession.round >= nextSession.totalRounds) {
      return {
        ...resolved,
        actionText: 'You both landed it together and closed the night with a shared glow.',
        currentDuel: null,
        duelResults: {},
        hearts: nextHearts,
        lastDuelOutcome: {
          heartBonus: nextSession.currentDuel.heartBonus,
          shared: true,
        },
        phase: 'finale',
        roundDuelBonus: 0,
        sharedDuelWins: (nextSession.sharedDuelWins || 0) + 1,
      }
    }

    const round = nextSession.round + 1
    const startingPlayerIndex =
      (nextSession.startingPlayerIndex + 1) % nextSession.players.length

    return syncSpotlightToRound({
      ...resolved,
      actionText: `You both synced it. Round ${round} is ready.`,
      activePlayerIndex: startingPlayerIndex,
      currentDuel: null,
      duelResults: {},
      hearts: nextHearts,
      lastDuelOutcome: {
        heartBonus: nextSession.currentDuel.heartBonus,
        shared: true,
      },
      phase: 'turn',
      round,
      roundDuelBonus: 0,
      sharedDuelWins: (nextSession.sharedDuelWins || 0) + 1,
      startingPlayerIndex,
      turnsTakenThisRound: 0,
    }, round)
  }

  if (outcome.status === 'noContest') {
    if (nextSession.round >= nextSession.totalRounds) {
      return {
        ...resolved,
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

    const round = nextSession.round + 1
    const startingPlayerIndex =
      (nextSession.startingPlayerIndex + 1) % nextSession.players.length

    return syncSpotlightToRound({
      ...resolved,
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
    }, round)
  }

  const winningPlayer = nextSession.players[outcome.winnerIndex]

  if (nextSession.round >= nextSession.totalRounds) {
    return {
      ...resolved,
      actionText: `${winningPlayer.displayName} closed the night with the last duel win.`,
      currentDuel: null,
      duelResults: {},
      hearts: nextHearts,
      lastDuelOutcome: {
        ...outcome,
        heartBonus: nextSession.currentDuel.heartBonus,
        winnerIndex: outcome.winnerIndex,
      },
      phase: 'finale',
      roundDuelBonus: 0,
    }
  }

  const round = nextSession.round + 1
  const startingPlayerIndex =
    (nextSession.startingPlayerIndex + 1) % nextSession.players.length

  return syncSpotlightToRound({
    ...resolved,
    actionText: `${winningPlayer.displayName} won the duel. Round ${round} is ready.`,
    activePlayerIndex: startingPlayerIndex,
    currentDuel: null,
    duelResults: {},
    hearts: nextHearts,
    lastDuelOutcome: {
      ...outcome,
      heartBonus: nextSession.currentDuel.heartBonus,
      winnerIndex: outcome.winnerIndex,
    },
    phase: 'turn',
    round,
    roundDuelBonus: 0,
    startingPlayerIndex,
    turnsTakenThisRound: 0,
  }, round)
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

export function getMomentumSummary(session) {
  const nextSession = ensureSessionArcState(session)
  return Object.entries(nextSession.momentum.unlocked)
    .filter(([, unlocked]) => unlocked)
    .map(([vibe]) => MOMENTUM_LABELS[vibe])
}

export function buildFinalSummary(session, journalEntries = []) {
  const nextSession = ensureSessionArcState(session)
  const journalCount = Array.isArray(journalEntries)
    ? journalEntries.filter((entry) => entry.type !== 'finale').length
    : journalEntries
  const hearts = nextSession.hearts
  const keepsakeCount = nextSession.keepsakes.length
  const preset = getSessionPreset(nextSession.preset)
  const dominantVibe = getDominantVibe(nextSession.vibeWeights)
  const goals = summarizeSessionGoals(nextSession, Array.isArray(journalEntries) ? journalEntries : [])
  const completedGoals = goals.filter((goal) => goal.completed)
  const finaleTone = buildFinaleTone({
    completedGoalCount: completedGoals.length,
    hearts,
    journalCount,
    keepsakeCount,
  })

  return {
    actLabel: ACT_LABELS[nextSession.spotlight?.act] || 'Warmup',
    coda: finaleTone.coda,
    completedGoalCount: completedGoals.length,
    completedSpotlightActs: nextSession.completedSpotlightActs,
    completedSpotlightCount: nextSession.completedSpotlightActs.length,
    dominantVibe,
    duelOutcomeLabel: buildDuelOutcomeLabel(nextSession),
    goalBadges: completedGoals.map((goal) => goal.badge),
    goalCount: goals.length,
    goals,
    headline: finaleTone.headline,
    hearts,
    journalCount,
    keepsakeCount,
    keepsakeLabels: nextSession.keepsakes.map((keepsake) => keepsake.label),
    momentumLabels: getMomentumSummary(nextSession),
    momentumUnlockedCount: getMomentumSummary(nextSession).length,
    preset: preset.id,
    presetLabel: preset.label,
    tierLabel: finaleTone.tierLabel,
    totalRounds: nextSession.totalRounds || preset.totalRounds,
    vibes: finaleTone.vibes,
  }
}
