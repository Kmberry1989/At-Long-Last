import { activityRegistry } from './activityRegistry.jsx'
import { duelRegistry } from './duelRegistry.jsx'
import { getBoardSpace, pickKeepsakeId } from './boardConfig.js'
import { advanceAfterDuel, applyRollToSession, beginRoundDuel, createTradeOffer, dismissTradeOffer, evaluateDuelRound, resolveActivityCompletion, resolveTradeOffer } from './sessionLogic.js'
import { pickWeightedActivityId, pickWeightedDuelId } from './sessionWiring.js'
import { isWavelengthCommit } from './wavelengthDuelData.js'
import { verifyChoice } from './choiceCommitment.js'
import { buildActivityJournalEntry, buildDuelJournalEntry, buildFinaleJournalEntry } from './journalHelpers.js'

const INDEPENDENT_ACTIVITIES = new Set([
  'mind-meld', 'prediction-box', 'same-wavelength', 'the-vault', 'vibe-check',
  'tempo-tap', 'word-weaver', 'blind-canvas', 'harmonic-lock', 'mutual-yes',
])

export function stepIds(rounds) {
  return Array.from({ length: rounds }, (_, index) => [
    `roll-${index + 1}-0`, `roll-${index + 1}-1`, `duel-${index + 1}`,
  ]).flat()
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
  if (step.completed || step.skipped) return false
  if (revealing && step.ready && needsRevealInteraction(step)) {
    const state = step.state
    if (step.kind === 'duel') return state.retry ? !state.replayed?.[String(playerIndex)] : isWavelengthCommit(state.results?.[String(playerIndex)])
    if (state.commitments && state.phase === 'opening') return !state.answers?.[String(playerIndex)]
    if (state.revealAcks?.includes(playerIndex)) return false
    return true // Each player acknowledges the end-of-night reveal at their pace.
  }
  if (step.ready || hasSubmitted(step, playerIndex)) return false
  if (step.kind === 'duel') return true
  if (step.kind === 'keepsake') return step.ownerIndex === playerIndex
  if (step.type === 'mutual-yes' && step.state.salts?.[String(playerIndex)] && !step.state.salts?.[String(1 - playerIndex)]) return false
  return isIndependentActivity(step.type) || step.state.turnIndex === playerIndex
}

export function getNightProgress(session, steps, playerIndex) {
  const rolls = steps.filter(step => step.id.startsWith('roll-') && step.ownerIndex === playerIndex)
  // Only a locally actionable unfinished landing holds up this player's next roll.
  const pendingLanding = rolls.find(step => canAnswerStep(step, playerIndex))
  const allRolled = [0, 1].every(index =>
    steps.filter(step => step.id.startsWith('roll-') && step.ownerIndex === index).length === session.totalRounds)
  const allDuels = steps.filter(step => step.kind === 'duel').length === session.totalRounds
  const readyToReveal = allRolled && allDuels && steps.every(step => step.ready)
  return {
    canRoll: session.phase !== 'finale' && rolls.length < session.totalRounds && !pendingLanding,
    nextRound: rolls.length + 1,
    ownRolls: rolls.length,
    readyToReveal,
    readyToFinish: readyToReveal && steps.every(step => !needsRevealInteraction(step)),
    available: steps.filter(step => canAnswerStep(step, playerIndex, readyToReveal)),
    comparisons: steps.filter(step => step.kind === 'activity' || step.kind === 'duel').length,
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
  const kind = space.type === 'keepsake' ? 'keepsake' : landed.phase === 'activity' ? 'activity' : 'board'
  const step = {
    id: `roll-${round}-${playerIndex}`, kind, round, ownerIndex: playerIndex,
    type: kind === 'activity' ? activityType : space.type,
    state: kind === 'activity'
      ? activityRegistry[activityType].createInitialState(session.players, { activePlayerIndex: playerIndex, history, random })
      : kind === 'keepsake' ? { keepsake: landed.pendingKeepsake } : {},
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
      actionText: 'Continue at your pace. Comparisons open at the end of the night.',
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
  if (step.kind === 'keepsake') {
    const item = step.state.keepsake
    const card = { ...item, instanceId: step.id, ownerIndex: playerIndex }
    return {
      session: { ...session, keepsakes: [...session.keepsakes, card], keepsakePerks: [...new Set([...session.keepsakePerks, item.perkId])] },
      step: { ...step, ready: true, completed: true },
    }
  }
  if (step.kind === 'duel') {
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
    if (step.skipped || step.kind === 'board') continue
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
      const duelResults = Object.fromEntries(session.players.map((player, index) => [player.uid, step.state.results[String(index)]]))
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
  next = { ...next, phase: 'finale', status: 'completed', round: session.totalRounds, currentDuel: null, actionText: 'Your night is ready to unfold.' }
  entries.push(buildFinaleJournalEntry({ coupleId: session.coupleId, sessionId: session.id, session: next, journalEntries: entries }))
  return { session: next, entries }
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
