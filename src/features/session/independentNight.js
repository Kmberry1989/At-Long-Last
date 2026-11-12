import { activityRegistry } from './activityRegistry.jsx'
import { duelRegistry } from './duelRegistry.jsx'
import { getBoardSpace, pickKeepsakeId } from './boardConfig.js'
import { advanceAfterDuel, applyRollToSession, beginRoundDuel, createTradeOffer, dismissTradeOffer, evaluateDuelRound, resolveActivityCompletion, resolveTradeOffer } from './sessionLogic.js'
import { pickWeightedActivityId, pickWeightedDuelId } from './sessionWiring.js'
import { isWavelengthCommit } from './wavelengthDuelData.js'
import { verifyChoice } from './choiceCommitment.js'
import { buildActivityJournalEntry, buildDuelJournalEntry, buildFinaleJournalEntry } from './journalHelpers.js'
import { drawMomentCard, flipMomentCoin } from './momentCards.js'
import { hasThreeLetters } from './responseValidation.js'
import { getPortraitPanicStage, isValidPortraitGuide } from './portraitPanic.js'

const INDEPENDENT_ACTIVITIES = new Set([
  'mind-meld', 'prediction-box', 'same-wavelength', 'the-vault', 'vibe-check',
  'tempo-tap', 'word-weaver', 'blind-canvas', 'harmonic-lock', 'mutual-yes',
])

export function stepIds(rounds) {
  return Array.from({ length: rounds }, (_, index) => [
    `roll-${index + 1}-0`, `roll-${index + 1}-1`, `duel-${index + 1}`,
  ]).flat()
}

/** Keep a briefly stale Firestore snapshot from undoing a locally confirmed
 * card/effect while the listener catches up with its transaction write. */
export function mergeNightSteps(previousSteps, incomingSteps) {
  const previousById = new Map(previousSteps.map(step => [step.id, step]))
  return incomingSteps.map(incoming => {
    const previous = previousById.get(incoming.id)
    if (!previous) return incoming
    const oldState = previous.state || {}
    const nextState = incoming.state || {}
    const state = { ...nextState }
    if (oldState.momentPending === false && nextState.momentPending === true) state.momentPending = false
    for (const key of ['momentCard', 'momentResolution', 'momentMove']) {
      if (oldState[key] && !nextState[key]) state[key] = oldState[key]
    }
    if (oldState.race && nextState.race && (oldState.race.progress || 0) > (nextState.race.progress || 0)) state.race = oldState.race
    return {
      ...incoming,
      ready: Boolean(previous.ready || incoming.ready),
      completed: Boolean(previous.completed || incoming.completed),
      skipped: Boolean(previous.skipped || incoming.skipped),
      state,
    }
  })
}

export function isIndependentActivity(type) {
  return activityRegistry[type]?.supportsPrivateFlow || INDEPENDENT_ACTIVITIES.has(type)
}

export function hasSubmitted(step, playerIndex) {
  if (step.kind === 'duel') return Boolean(step.state.results?.[String(playerIndex)])
  if (step.kind !== 'activity') return step.ownerIndex !== playerIndex || step.ready
  const state = step.state
  if (state.commitments) return Boolean(state.commitments[String(playerIndex)])
  return Boolean(
    state.entries?.some(entry => entry.playerIndex === playerIndex) ||
    state.halves?.some(entry => entry.playerIndex === playerIndex) ||
    ['answers', 'values', 'results', 'submissions', 'captions', 'sealed']
      .some(key => state[key] && Object.hasOwn(state[key], String(playerIndex))),
  )
}

export function needsRevealInteraction(step) {
  if (step.completed || step.skipped) return false
  if (step.kind === 'duel') return step.state.retry || Object.values(step.state.results || {}).some(isWavelengthCommit)
  if (step.kind !== 'activity' || step.completed || step.skipped) return false
  return Boolean(step.state.commitments || step.type === 'same-wavelength' || step.type === 'mutual-yes')
}

export function canAnswerStep(step, playerIndex, revealing = false) {
  if (step.skipped) return false
  const pendingMoment = (step.state.momentPending || step.state.momentCard && !step.state.momentResolution || step.state.penaltyCard && !step.state.penaltyResolution)
  if (step.completed && !(step.ownerIndex === playerIndex && pendingMoment)) return false
  if (step.ownerIndex === playerIndex && pendingMoment) return true
  if (revealing && step.ready && needsRevealInteraction(step)) {
    const state = step.state
    if (step.kind === 'duel') return state.retry ? !state.replayed?.[String(playerIndex)] : isWavelengthCommit(state.results?.[String(playerIndex)])
    if (state.commitments && state.phase === 'opening') return !state.answers?.[String(playerIndex)]
    if (state.revealAcks?.includes(playerIndex)) return false
    return true // Each player acknowledges the end-of-night reveal at their pace.
  }
  if (step.ready || hasSubmitted(step, playerIndex)) return false
  if (step.kind === 'duel') {
    if (step.type !== 'portrait-panic-directed') return true
    const stage = getPortraitPanicStage(step.state, playerIndex)
    return stage === 'guide' || stage === 'draw'
  }
  if (step.kind === 'keepsake') return step.ownerIndex === playerIndex
  if (step.type === 'mutual-yes' && step.state.salts?.[String(playerIndex)] && !step.state.salts?.[String(1 - playerIndex)]) return false
  return isIndependentActivity(step.type) || step.state.turnIndex === playerIndex
}

function getActiveTurnPlayer(session, steps) {
  const startingPlayer = session.startingPlayerIndex || 0
  for (let round = 1; round <= session.totalRounds; round += 1) {
    const firstPlayer = startingPlayer
    for (const playerIndex of [firstPlayer, (firstPlayer + 1) % session.players.length]) {
      const step = steps.find(item => item.id === `roll-${round}-${playerIndex}`)
      if (!step) return playerIndex
      const explicitlyEnded = step.state.turnEnded === true
      // Read existing in-progress nights safely: completed old-style landings
      // predate the explicit pass-switch state, so treat them as already passed.
      const legacyEnded = step.state.turnEnded === undefined && step.ready && step.completed
      if (!explicitlyEnded && !legacyEnded) return playerIndex
    }
  }
  return null
}

export function getNightProgress(session, steps, playerIndex) {
  const rolls = steps.filter(step => step.id.startsWith('roll-') && step.ownerIndex === playerIndex)
  const activeTurnPlayer = getActiveTurnPlayer(session, steps)
  const activeTurnStep = activeTurnPlayer === null ? null : steps.find(step =>
    step.id.startsWith('roll-') && step.ownerIndex === activeTurnPlayer && !step.state.turnEnded,
  )
  const pendingTurnStep = activeTurnPlayer === playerIndex && activeTurnStep &&
    !activeTurnStep.state.turnEndRequested && !canAnswerStep(activeTurnStep, playerIndex)
    ? activeTurnStep
    : null
  const unresolvedSharedActivity = steps.find(step =>
    step.kind === 'activity' && !step.ready && !step.completed && canAnswerStep(step, playerIndex),
  )
  const pendingLanding = rolls.find(step => !step.state.turnEnded && canAnswerStep(step, playerIndex)) || unresolvedSharedActivity
  const allRolled = [0, 1].every(index =>
    steps.filter(step => step.id.startsWith('roll-') && step.ownerIndex === index).length === session.totalRounds)
  const allDuels = steps.filter(step => step.kind === 'duel').length === session.totalRounds
  const readyToReveal = allRolled && allDuels && steps.every(step => step.ready && !step.state.momentPending && (!step.state.momentCard || step.state.momentResolution))
  return {
    canRoll: session.phase === 'turn' && activeTurnPlayer === playerIndex && rolls.length < session.totalRounds && !pendingLanding && !pendingTurnStep,
    nextRound: rolls.length + 1,
    ownRolls: rolls.length,
    readyToReveal,
    readyToFinish: readyToReveal && steps.every(step => !needsRevealInteraction(step)),
    // Keep comparisons out of the board tray while either player still has
    // turns to take. They are collected and answered together at night's end.
    available: steps.filter(step => (step.kind !== 'duel' || allRolled) && canAnswerStep(step, playerIndex, readyToReveal)),
    pendingTurnStep,
    activeTurnPlayer,
    comparisons: steps.filter(step => step.kind === 'activity' || step.kind === 'duel').length,
  }
}

export function updateNightTurn(session, steps, stepId, playerIndex, action) {
  const step = steps.find(item => item.id === stepId)
  if (!step || !step.id.startsWith('roll-') || step.ownerIndex !== playerIndex) throw new Error('That turn is not yours.')
  if (action === 'return-dice') {
    if (step.state.turnEnded || step.state.turnEndRequested || step.state.diceReturned) return null
    return { session, step: { ...step, state: { ...step.state, diceReturned: true } }, penalty: false }
  }
  if (action !== 'end-turn') throw new Error('Unknown turn action.')
  if (step.state.turnEnded || step.state.turnEndRequested) return null
  if (step.state.momentPending || step.state.momentCard && !step.state.momentResolution || step.state.penaltyCard && !step.state.penaltyResolution) {
    throw new Error('Finish the landing before ending your turn.')
  }
  if (step.state.diceReturned) {
    return { session, step: { ...step, state: { ...step.state, turnEnded: true } }, penalty: false }
  }
  const penaltyCard = drawMomentCard('trash', Math.random, [1, 1])
  penaltyCard.movement = -1
  penaltyCard.spaces = 1
  penaltyCard.lowerDie = 1
  penaltyCard.effect = 'Back one space and return the dice.'
  return {
    session,
    step: { ...step, state: { ...step.state, turnEndRequested: true, penaltyApplied: true, penaltyCard } },
    penalty: true,
  }
}

export function makeRollSteps(session, steps, playerIndex, dice, history = [], random = Math.random) {
  if (!Array.isArray(dice) || dice.length !== 2 || dice.some(value => !Number.isInteger(value) || value < 1 || value > 6)) {
    throw new Error('Roll two dice from 1 to 6.')
  }
  const progress = getNightProgress(session, steps, playerIndex)
  if (!progress.canRoll) throw new Error('Save your current landing before rolling again.')
  const round = progress.nextRound
  const usedActivityIds = steps.filter(step => step.kind === 'activity').map(step => step.type)
  const activityType = pickWeightedActivityId(session.vibeWeights, usedActivityIds, random, { preset: session.preset })
  // Reuse board effects and perk handling without advancing the shared round cursor.
  const landed = applyRollToSession({ ...session, round, activePlayerIndex: playerIndex, turnsTakenThisRound: 0 }, {
    activityType, dice, keepsakeId: pickKeepsakeId(session.keepsakes, random), roll: dice[0] + dice[1],
  })
  const space = getBoardSpace(landed.positions[playerIndex])
  // A turn should create a shared moment on nearly every landing. The board
  // space still applies its own heart/duel/oops effect above; only keepsake
  // spaces replace the conversation with a collectible.
  const kind = space.type === 'keepsake' ? 'keepsake' : 'activity'
  const previousRace = steps
    .filter(step => step.id.startsWith('roll-') && step.ownerIndex === playerIndex)
    .sort((a, b) => b.round - a.round)[0]?.state?.race || { progress: 0, laps: 0, crossedAt: null }
  const raceProgress = (previousRace.progress || 0) + dice[0] + dice[1]
  const raceLaps = Math.max(previousRace.laps || 0, Math.floor(Math.max(0, raceProgress) / 20))
  const crossedThisRoll = !previousRace.crossedAt && raceLaps > (previousRace.laps || 0)
  const step = {
    id: `roll-${round}-${playerIndex}`, kind, round, ownerIndex: playerIndex,
    type: kind === 'activity' ? activityType : space.type,
    state: {
      move: landed.lastMove ? { ...landed.lastMove, id: `roll-${round}-${playerIndex}` } : null,
      ...(kind === 'activity'
        ? { ...activityRegistry[activityType].createInitialState(session.players, { activePlayerIndex: playerIndex, history, random }), landingSpace: space.id }
        : kind === 'keepsake' ? { keepsake: landed.pendingKeepsake } : {}),
      momentPending: true,
      turnEnded: false,
      race: {
        progress: raceProgress,
        laps: raceLaps,
        crossedAt: previousRace.crossedAt || null,
        crossingRound: previousRace.crossingRound || (crossedThisRoll ? round : null),
        crossingPending: crossedThisRoll || Boolean(previousRace.crossingPending),
      },
    },
    ready: kind === 'board', completed: kind === 'board', skipped: false,
  }
  const created = [step]
  if (!steps.some(task => task.id === `duel-${round}`)) {
    const type = pickWeightedDuelId(session.vibeWeights, steps.filter(task => task.kind === 'duel').map(task => task.type), random, { preset: session.preset })
    created.push({ id: `duel-${round}`, kind: 'duel', type, round, ownerIndex: -1, state: { results: {} }, ready: false, completed: false, skipped: false })
  }
  return {
    session: {
      ...session, hearts: landed.hearts, positions: landed.positions, lastMove: { ...landed.lastMove, ...(session.lastMove?.tradeOffer ? { tradeOffer: session.lastMove.tradeOffer } : {}) },
      lastRoll: landed.lastRoll, usedKeepsakePerks: landed.usedKeepsakePerks,
      momentum: landed.momentum, round: Math.max(session.round, round),
      actionText: `${session.players[playerIndex]?.displayName || 'Your partner'} takes a turn.`,
    },
    created,
  }
}

export async function advanceNightStep(session, steps, stepId, playerIndex, input) {
  const step = steps.find(task => task.id === stepId)
  const progress = getNightProgress(session, steps, playerIndex)
  if (!step || !canAnswerStep(step, playerIndex, progress.readyToReveal)) return null
  if (input.skip) {
    // A pass closes only this card, never the partner's other work.
    return { session, step: { ...step, ready: true, completed: true, skipped: true } }
  }
  for (const key of ['text', 'answer', 'guess', 'caption', 'response', 'excerpt']) {
    const value = input[key]
    const optionalBlank = key === 'guess' && typeof value === 'string' && !value.trim()
    if (typeof value === 'string' && !optionalBlank && !(key === 'excerpt' && value.startsWith('h=')) && !hasThreeLetters(value)) {
      throw new Error('Add at least three letters before saving.')
    }
  }
  if (step.state.momentPending && input.flipMoment) {
    const coinResult = flipMomentCoin()
    const momentCard = drawMomentCard(coinResult, Math.random, step.state.move?.dice || [1, 1])
    return {
      session,
      step: { ...step, state: { ...step.state, momentPending: false, coinResult, momentCard } },
    }
  }
  if (step.state.penaltyCard && !step.state.penaltyResolution) {
    if (!input.resolvePenalty) throw new Error('Resolve the dice reminder first.')
    const card = step.state.penaltyCard
    const movement = -1
    const from = session.positions[playerIndex]
    const to = ((from + movement) % 20 + 20) % 20
    const previousProgress = step.state.race?.progress || 0
    const raceProgress = previousProgress + movement
    const raceLaps = Math.max(step.state.race?.laps || 0, Math.floor(Math.max(0, raceProgress) / 20))
    const momentMove = { id: `${step.id}:cup-penalty`, from, to, playerIndex, steps: movement, cardEffect: true, dice: null }
    const nextStep = { ...step, state: { ...step.state, race: { ...step.state.race, progress: raceProgress, laps: raceLaps }, penaltyResolution: { movement, effect: card.effect }, penaltyMove: momentMove, turnEnded: true } }
    return {
      session: { ...session, positions: session.positions.map((position, index) => index === playerIndex ? to : position), lastMove: { ...session.lastMove, cardEffect: true, from, playerIndex, steps: movement, to }, actionText: `${card.title}: back one space.` },
      step: nextStep,
    }
  }
  if (step.state.momentCard && !step.state.momentResolution) {
    if (!input.resolveMoment) throw new Error('Resolve the moment card first.')
    const card = step.state.momentCard
    const movement = card.movement
    const previousProgress = step.state.race?.progress || 0
    const raceProgress = previousProgress + movement
    const previousLaps = step.state.race?.laps || 0
    const raceLaps = Math.max(previousLaps, Math.floor(Math.max(0, raceProgress) / 20))
    const crossedThisEffect = !step.state.race?.crossedAt && raceLaps > previousLaps
    const race = {
      ...step.state.race,
      progress: raceProgress,
      laps: raceLaps,
      crossingRound: step.state.race?.crossingRound || (crossedThisEffect ? step.round : null),
      crossingPending: Boolean(step.state.race?.crossingPending || crossedThisEffect),
    }
    const from = session.positions[playerIndex]
    const to = ((from + movement) % 20 + 20) % 20
    const momentResolution = { movement, effect: card.effect, lowerDie: card.lowerDie }
    const momentMove = movement === 0 ? null : { id: `${step.id}:moment`, from, to, playerIndex, steps: movement, cardEffect: true, dice: null }
    const momentStep = { ...step, state: { ...step.state, race, momentResolution, momentMove } }
    return {
      session: {
        ...session,
        positions: session.positions.map((position, index) => index === playerIndex ? to : position),
        lastMove: { ...session.lastMove, cardEffect: true, from, playerIndex, steps: movement, to },
        actionText: `${card.title}: ${Math.abs(movement)} ${Math.abs(movement) === 1 ? 'space' : 'spaces'} ${movement < 0 ? 'back' : 'ahead'}.`,
      },
      step: momentStep,
    }
  }
  if (step.kind === 'keepsake') {
    const item = step.state.keepsake
    const card = { ...item, instanceId: step.id, ownerIndex: playerIndex }
    return {
      session: { ...session, keepsakes: [...session.keepsakes, card], keepsakePerks: [...new Set([...session.keepsakePerks, item.perkId])] },
      step: { ...step, ready: true, completed: true },
    }
  }
  if (step.kind === 'duel') {
    if (step.type === 'portrait-panic-directed') {
      const own = String(playerIndex)
      const partner = String(1 - playerIndex)
      if (Array.isArray(input.guideCues)) {
        if (step.state.guides?.[own]) return null
        if (!isValidPortraitGuide(input.guideCues)) throw new Error('Choose three drawing cues.')
        const guides = { ...step.state.guides, [own]: input.guideCues }
        return { session, step: { ...step, state: { ...step.state, guides }, ready: Object.keys(step.state.results || {}).length === 2 } }
      }
      if (!step.state.guides?.[own] || !step.state.guides?.[partner]) throw new Error('Send your cues and wait for your partner’s cues before drawing.')
    }
    if (!input.highlight || !Number.isFinite(input.time)) throw new Error('Finish your challenge first.')
    const previous = step.state.results?.[String(playerIndex)]
    if (previous && isWavelengthCommit(previous) && !await verifyChoice({ answerId: input.excerpt, nonce: input.nonce }, previous.excerpt.slice(2))) throw new Error('That sealed challenge could not be verified.')
    const { nonce: _nonce, ...result } = input
    const results = { ...step.state.results, [String(playerIndex)]: result }
    let state = { ...step.state, results }
    const ready = Object.keys(results).length === 2
    if (step.state.retry) state.replayed = { ...state.replayed, [String(playerIndex)]: true }
    if (ready && (!step.state.retry || Object.keys(state.replayed).length === 2) && !Object.values(results).some(isWavelengthCommit) && !Object.values(results).some(result => result.skipped)) {
      const duelResults = Object.fromEntries(session.players.map((player, index) => [player.uid, results[String(index)]]))
      state.retry = evaluateDuelRound({ ...session, currentDuel: { id: step.type }, duelResults }, duelRegistry).status === 'retry'
      if (state.retry) { state.replayed = {}; state.attempt = (state.attempt || 1) + 1 }
    }
    return { session, step: { ...step, state, ready } }
  }
  const entry = activityRegistry[step.type]
  if (entry.supportsPrivateFlow && !input.text?.trim()) return null
  if (step.state.phase === 'opening' && step.state.commitments &&
      !await verifyChoice(input, step.state.commitments[String(playerIndex)])) throw new Error('That sealed choice could not be verified.')
  const state = isIndependentActivity(step.type) ? { ...step.state, turnIndex: playerIndex } : step.state
  const advanced = entry.advance(state, { input, playerIndex, players: session.players })
  if (JSON.stringify(advanced.state) === JSON.stringify(state) && !advanced.completed) return null
  const next = { ...step, state: advanced.state, completed: advanced.completed }
  next.ready = advanced.completed || [0, 1].every(index => hasSubmitted(next, index))
  return { session, step: next }
}

export function finishIndependentNight(session, steps) {
  if (!getNightProgress(session, steps, 0).readyToFinish) throw new Error('There are still moments to finish together.')
  let next = { ...session }
  const entries = []
  for (const step of steps) {
    if (step.state.momentCard && step.state.momentResolution) {
      const { momentCard, momentResolution } = step.state
      const direction = momentResolution.movement < 0 ? 'back' : 'ahead'
      entries.push({ coupleId: session.coupleId, sessionId: session.id, type: `moment-${momentCard.category}`, title: momentCard.title, vibe: momentCard.category === 'treasure' ? 'tender' : 'playful', summary: `${momentCard.effect}: ${Math.abs(momentResolution.movement)} ${Math.abs(momentResolution.movement) === 1 ? 'space' : 'spaces'} ${direction}.`, text: `${momentCard.scene} ${momentCard.effect} moves ${direction} ${Math.abs(momentResolution.movement)} spaces.`, payload: { category: momentCard.category, cardId: momentCard.id, effect: momentCard.effect, movement: momentResolution.movement, lowerDie: momentResolution.lowerDie } })
    }
    if (step.state.penaltyCard && step.state.penaltyResolution) {
      const { penaltyCard, penaltyResolution } = step.state
      entries.push({ coupleId: session.coupleId, sessionId: session.id, type: 'moment-trash', title: penaltyCard.title, vibe: 'playful', summary: 'Dice left out: moved back one space.', text: `${penaltyCard.scene} ${penaltyResolution.effect}`, payload: { category: 'trash', cardId: penaltyCard.id, effect: penaltyResolution.effect, movement: -1 } })
    }
    if (step.skipped) continue
    if (step.kind === 'board') continue
    if (step.kind === 'keepsake') {
      entries.push({ coupleId: session.coupleId, sessionId: session.id, type: 'keepsake', title: step.state.keepsake.label, vibe: 'tender', summary: 'A mystery keepsake collected.', text: step.state.keepsake.label, payload: step.state.keepsake })
    } else if (step.kind === 'activity') {
      const result = activityRegistry[step.type].resolve(step.state, session.players)
      const rewarded = resolveActivityCompletion({ ...next, round: step.round }, result)
      // Keep the independent board cursors; reuse only rewards and arc updates.
      next = { ...next, hearts: rewarded.hearts, momentum: rewarded.momentum, spotlight: rewarded.spotlight, completedSpotlightActs: rewarded.completedSpotlightActs, usedKeepsakePerks: rewarded.usedKeepsakePerks, sealedMatches: rewarded.sealedMatches, mutualYesMatches: rewarded.mutualYesMatches }
      entries.push(buildActivityJournalEntry({ coupleId: session.coupleId, sessionId: session.id, result }))
    } else if (step.kind === 'duel') {
      const duel = duelRegistry[step.type]
      const duelResults = Object.fromEntries(session.players.map((player, index) => {
        const result = step.state.results[String(index)]
        if (step.type !== 'portrait-panic-directed' || !result) return [player.uid, result]
        return [player.uid, { ...result, guidedBy: step.state.guides?.[String(1 - index)] || [] }]
      }))
      const duelSession = { ...session, round: step.round, currentDuel: { id: step.type, attempt: 1 }, duelResults }
      const outcome = Object.values(duelResults).some(result => result.skipped) ? { status: 'noContest' } : evaluateDuelRound(duelSession, duelRegistry)
      const bonus = steps.filter(task => task.round === step.round && task.kind === 'board' && task.type === 'duel').length
      const prepared = beginRoundDuel({ ...next, round: step.round, roundDuelBonus: bonus }, step.type)
      const heartBonus = outcome.status === 'noContest' ? 0 : (duel.resolveHearts?.(...Object.values(duelResults)) ?? prepared.currentDuel.heartBonus)
      const rewarded = advanceAfterDuel({ ...prepared, currentDuel: { ...prepared.currentDuel, heartBonus } }, outcome, duel)
      next = { ...next, hearts: rewarded.hearts, momentum: rewarded.momentum, spotlight: rewarded.spotlight, completedSpotlightActs: rewarded.completedSpotlightActs, usedKeepsakePerks: rewarded.usedKeepsakePerks, sharedDuelWins: rewarded.sharedDuelWins, lastDuelOutcome: rewarded.lastDuelOutcome }
      entries.push(buildDuelJournalEntry({ coupleId: session.coupleId, sessionId: session.id, duel, duelResults, heartBonus, outcome, players: session.players, session: duelSession }))
    }
  }
  const prize = resolveNightPrize(session, steps)
  entries.push({ coupleId: session.coupleId, sessionId: session.id, type: 'trophy', title: "Tonight's Prize", vibe: 'tender', summary: `${session.players[prize.winnerIndex]?.displayName || 'Player'} earns the ${prize.prize}.`, text: prize.method === 'lap' ? `Reached the finish in ${prize.turnsToFinish} turns.` : 'Furthest along the board when the night closed.', payload: prize })
  next = { ...next, phase: 'finale', status: 'completed', round: session.totalRounds, currentDuel: null, actionText: 'Your night is ready to unfold.' }
  entries.push(buildFinaleJournalEntry({ coupleId: session.coupleId, sessionId: session.id, session: next, journalEntries: entries }))
  return { session: next, entries }
}

export function resolveNightPrize(session, steps) {
  const racers = session.players.map((player, playerIndex) => {
    const ownSteps = steps.filter(step => step.id.startsWith('roll-') && step.ownerIndex === playerIndex)
    const latest = ownSteps.reduce((current, step) => !current || step.round > current.round ? step : current, null)
    const crossings = ownSteps.filter(step => step.state.race?.crossedAt || step.state.race?.crossingPending)
      .sort((a, b) => (a.state.race.crossingRound || a.round) - (b.state.race.crossingRound || b.round))
    return {
      playerIndex,
      uid: player.uid,
      progress: latest?.state.race?.progress || 0,
      laps: latest?.state.race?.laps || 0,
      crossedAt: crossings[0]?.state.race?.crossedAt || null,
      crossingRound: crossings[0]?.state.race?.crossingRound || crossings[0]?.round || Number.POSITIVE_INFINITY,
    }
  })
  const finishers = racers.filter(racer => racer.laps > 0).sort((a, b) =>
    a.crossingRound - b.crossingRound
    || ((a.playerIndex - session.startingPlayerIndex + racers.length) % racers.length)
      - ((b.playerIndex - session.startingPlayerIndex + racers.length) % racers.length),
  )
  const winner = finishers[0] || [...racers].sort((a, b) =>
    b.progress - a.progress
    || ((a.playerIndex - session.startingPlayerIndex + racers.length) % racers.length)
      - ((b.playerIndex - session.startingPlayerIndex + racers.length) % racers.length),
  )[0]
  return { winnerIndex: winner.playerIndex, winnerUid: winner.uid, loserUid: session.players[1 - winner.playerIndex]?.uid || null, prize: finishers.length ? 'First Lap Laurel' : 'Wayfinder Ribbon', method: finishers.length ? 'lap' : 'progress', progress: winner.progress, laps: winner.laps, turnsToFinish: finishers.length ? winner.crossingRound : null }
}


export function changeNightTrade(session, playerIndex, command) {
  const pending = session.lastMove?.tradeOffer
  if (command.kind === 'tradeOffer') {
    if (pending?.status === 'pending') throw new Error('Finish the existing offer first.')
    const offered = session.keepsakes.find(card => card.instanceId === command.offeredInstanceId)
    const requested = session.keepsakes.find(card => card.instanceId === command.requestedInstanceId)
    if (!offered || offered.ownerIndex !== playerIndex || (command.requestedInstanceId && (!requested || requested.ownerIndex === playerIndex))) throw new Error('Choose keepsakes from the correct hands.')
    return createTradeOffer(session, { ...command, fromPlayerIndex: playerIndex })
  }
  if (command.kind === 'tradeRespond') {
    if (!pending || pending.status !== 'pending') return session
    if (pending.fromPlayerIndex === playerIndex) throw new Error('Your partner responds to this offer.')
    return resolveTradeOffer(session, { accept: command.accept })
  }
  return dismissTradeOffer(session)
}
