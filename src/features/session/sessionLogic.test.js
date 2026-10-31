import { describe, expect, it } from 'vitest'
import { duelRegistry } from './duelRegistry.jsx'
import {
  advanceAfterDuel,
  applyRollToSession,
  beginRoundDuel,
  buildFinalSummary,
  buildInitialSession,
  choosePendingActivity,
  createTradeOffer,
  dismissTradeOffer,
  ensureSessionArcState,
  evaluateNightChecklist,
  finalizeVibeSetup,
  getSessionAct,
  isValidMood,
  nightChecklistProgress,
  applyMoodSeedToWeights,
  resolveActivityCompletion,
  resolveCombinedMood,
  resolveKeepsakeDecision,
  resolveSkippedActivity,
  resolveTradeOffer,
  skipOpeningSetup,
} from './sessionLogic.js'

function buildCouple(sessionPreset = 'standard') {
  return {
    id: 'couple-1',
    players: [
      { uid: 'u1', displayName: 'Kyle', color: '#f00' },
      { uid: 'u2', displayName: 'Elaine', color: '#0af' },
    ],
    sessionPreset,
  }
}

function buildReadySession(overrides = {}) {
  const vibeWeights = overrides.vibeWeights || {
    tender: 0.5,
    playful: 0.3,
    spicy: 0.2,
  }
  const base = finalizeVibeSetup(
    buildInitialSession(buildCouple(overrides.preset || 'standard')),
    vibeWeights,
  )

  return ensureSessionArcState({
    ...base,
    ...overrides,
    vibeWeights,
  })
}

describe('sessionLogic', () => {
  it('builds the initial session with spotlight, perks, and momentum state', () => {
    const session = buildInitialSession(buildCouple())

    expect(session.phase).toBe('turn')
    expect(session.vibeWeights).toEqual({ playful: 0.3, spicy: 0.2, tender: 0.5 })
    expect(session.moodVotes).toEqual({})
    expect(session.spotlight.act).toBe('warmup')
    expect(session.momentum.playful).toBe(0)
    expect(session.keepsakePerks).toEqual([])
  })

  it('moves an in-progress opening setup directly to the first turn', () => {
    const legacySession = {
      ...buildInitialSession(buildCouple()),
      phase: 'vibeSetup',
      moodVotes: { u1: 'cozy' },
      vibeVotes: { u1: { tender: 1, playful: 0, spicy: 0 } },
      vibeWeights: null,
    }

    const next = skipOpeningSetup(legacySession)
    expect(next.phase).toBe('turn')
    expect(next.vibeWeights).toEqual({ playful: 0.3, spicy: 0.2, tender: 0.5 })
    expect(next.moodVotes).toEqual({})
    expect(next.vibeVotes).toEqual({})
    expect(skipOpeningSetup(next)).toBe(next)
  })

  it('calculates act transitions across presets', () => {
    expect(getSessionAct(1, 4)).toBe('warmup')
    expect(getSessionAct(3, 4)).toBe('spark')
    expect(getSessionAct(4, 4)).toBe('finale')
    expect(getSessionAct(5, 8)).toBe('spark')
    expect(getSessionAct(8, 8)).toBe('finale')
  })

  it('applies a two-dice roll (2-12) and records dice values in lastMove', () => {
    let session = buildReadySession()
    session = applyRollToSession(session, {
      activityType: 'comfort-menu',
      dice: [3, 4],
      keepsakeId: 'love-note',
      roll: 7,
    })

    expect(session.lastRoll).toBe(7)
    expect(session.lastMove.steps).toBe(7)
    expect(session.lastMove.dice).toEqual([3, 4])
    expect(session.positions[0]).toBe(7)
  })

  it('clears the warmup spotlight after a journal-saving activity', () => {
    let session = buildReadySession()
    session = applyRollToSession(session, {
      activityType: 'comfort-menu',
      keepsakeId: 'love-note',
      roll: 2,
    })

    const next = resolveActivityCompletion(session, {
      heartBonus: 3,
      label: 'Comfort Menu',
      savesToJournal: true,
      vibe: 'tender',
    })

    expect(next.hearts).toBe(11)
    expect(next.spotlight.completed).toBe(true)
    expect(next.completedSpotlightActs).toContain('warmup')
    expect(next.momentum.tender).toBe(1)
  })

  it('adds the sparkler-photo perk bonus to the next saved activity', () => {
    const session = buildReadySession({
      keepsakePerks: ['sparkler-photo'],
    })

    const next = resolveActivityCompletion(session, {
      heartBonus: 2,
      label: 'Small Mercies',
      savesToJournal: true,
      vibe: 'tender',
    })

    expect(next.hearts).toBe(11)
    expect(next.usedKeepsakePerks).toContain('sparkler-photo')
  })

  it('uses midnight snack before spending hearts on an oops space', () => {
    const session = buildReadySession({
      keepsakePerks: ['midnight-snack'],
    })

    const next = applyRollToSession(session, {
      activityType: 'comfort-menu',
      keepsakeId: 'love-note',
      roll: 1,
    })

    expect(next.hearts).toBe(6)
    expect(next.usedKeepsakePerks).toContain('midnight-snack')
  })

  it('records the love-note perk as consumed on the first skipped activity', () => {
    const session = buildReadySession({
      keepsakePerks: ['pocket-love-note'],
      pendingActivityType: 'comfort-menu',
      phase: 'activity',
    })

    const next = resolveSkippedActivity(session, 'Comfort Menu')
    expect(next.usedKeepsakePerks).toContain('pocket-love-note')
  })

  it('stacks final duel boosts from spicy momentum and last dance ticket', () => {
    const session = buildReadySession({
      keepsakePerks: ['last-dance-ticket'],
      momentum: {
        playful: 0,
        spicy: 2,
        tender: 0,
        consumed: {
          playful: false,
          spicy: false,
          tender: false,
        },
        unlocked: {
          playful: false,
          spicy: true,
          tender: false,
        },
      },
      round: 6,
      totalRounds: 6,
    })

    const next = beginRoundDuel(session, 'reaction-heart')

    expect(next.currentDuel.heartBonus).toBe(6)
    expect(next.momentum.consumed.spicy).toBe(true)
    expect(next.usedKeepsakePerks).toContain('last-dance-ticket')
  })

  it('opens a playful double-pick choice and locks the selected activity', () => {
    let session = buildReadySession({
      momentum: {
        playful: 2,
        spicy: 0,
        tender: 0,
        consumed: {
          playful: false,
          spicy: false,
          tender: false,
        },
        unlocked: {
          playful: true,
          spicy: false,
          tender: false,
        },
      },
    })

    session = applyRollToSession(session, {
      activityOptions: ['comfort-menu', 'small-mercies'],
      activityType: 'comfort-menu',
      keepsakeId: 'love-note',
      roll: 2,
    })

    expect(session.phase).toBe('activityChoice')
    expect(session.pendingActivityOptions).toEqual(['comfort-menu', 'small-mercies'])
    expect(session.momentum.consumed.playful).toBe(true)

    const next = choosePendingActivity(session, 'small-mercies')
    expect(next.phase).toBe('activity')
    expect(next.pendingActivityType).toBe('small-mercies')
    expect(next.usedActivityIds).toContain('small-mercies')
  })

  it('advances spotlight and momentum from a dominant-vibe duel in the spark act', () => {
    const session = buildReadySession({
      currentDuel: {
        attempt: 1,
        heartBonus: 4,
        id: 'reaction-heart',
      },
      duelResults: {
        u1: { time: 0.8, won: true },
        u2: { time: 1.2, won: true },
      },
      phase: 'duel',
      round: 3,
      totalRounds: 6,
      turnsTakenThisRound: 2,
      vibeWeights: {
        tender: 0.2,
        playful: 0.6,
        spicy: 0.2,
      },
    })

    const outcome = { status: 'resolved', winnerIndex: 0 }
    const next = advanceAfterDuel(session, outcome, {
      id: 'reaction-heart',
      label: 'Reaction Heart',
      vibe: 'playful',
    })

    expect(next.hearts).toBe(12)
    expect(next.completedSpotlightActs).toContain('spark')
    expect(next.momentum.playful).toBe(1)
    expect(next.round).toBe(4)
  })

  it('replaces the warmup spotlight with the finale spotlight when the last round begins', () => {
    const session = buildReadySession({
      currentDuel: {
        attempt: 1,
        heartBonus: 3,
        id: 'reaction-heart',
      },
      phase: 'duel',
      round: 3,
      totalRounds: 4,
      turnsTakenThisRound: 2,
    })

    const next = advanceAfterDuel(session, { status: 'noContest' }, duelRegistry['reaction-heart'])
    expect(next.round).toBe(4)
    expect(next.spotlight.act).toBe('finale')
  })

  it('resets the reveal gate when a duel goes to a retry attempt', () => {
    const session = buildReadySession({
      currentDuel: {
        attempt: 1,
        heartBonus: 3,
        id: 'reaction-heart',
        revealAcks: { u1: true, u2: true },
        revealForce: true,
      },
      phase: 'duel',
    })

    const next = advanceAfterDuel(session, { status: 'retry' }, duelRegistry['reaction-heart'])

    expect(next.phase).toBe('duel')
    expect(next.currentDuel.attempt).toBe(2)
    expect(next.currentDuel.revealAcks).toEqual({})
    expect(next.currentDuel.revealForce).toBe(false)
  })

  it('adds a free keepsake and its perk without spending hearts', () => {
    let session = buildReadySession()
    session = applyRollToSession(session, {
      activityType: 'comfort-menu',
      keepsakeId: 'love-note',
      roll: 4,
    })
    session.hearts = 0

    const next = resolveKeepsakeDecision(session, true)

    expect(next.keepsakePerks).toContain('pocket-love-note')
    expect(next.keepsakes).toHaveLength(1)
    expect(next.keepsakes[0].ownerIndex).toBe(0)
    expect(next.hearts).toBe(0)
  })

  it('builds the finale summary with spotlight and momentum totals', () => {
    const summary = buildFinalSummary(
      {
        completedSpotlightActs: ['warmup', 'spark'],
        hearts: 10,
        keepsakes: [{ id: 'a', label: 'Pocket Love Note' }, { id: 'b', label: 'Sparkler Photo' }],
        lastDuelOutcome: {
          shared: true,
        },
        momentum: {
          playful: 2,
          spicy: 0,
          tender: 2,
          consumed: {
            playful: true,
            spicy: false,
            tender: false,
          },
          unlocked: {
            playful: true,
            spicy: false,
            tender: true,
          },
        },
        players: buildCouple().players,
        preset: 'standard',
        totalRounds: 6,
        vibeWeights: {
          tender: 0.2,
          playful: 0.55,
          spicy: 0.25,
        },
      },
      [
        { id: '1', type: 'prompt', vibe: 'tender' },
        { id: '2', type: 'ritual', vibe: 'playful' },
        { id: '3', type: 'journal', vibe: 'spicy' },
        { id: '4', type: 'duel', vibe: 'playful' },
        { id: '5', type: 'keepsake', vibe: 'tender' },
      ],
    )

    expect(summary.headline).toBe('A night with some weight to it.')
    expect(summary.duelOutcomeLabel).toBe('Shared finish')
    expect(summary.completedSpotlightCount).toBe(2)
    expect(summary.momentumLabels).toContain('Double pick armed')
    expect(summary.momentumLabels).toContain('Soft landing armed')
  })
  it('keeps previous nights out of the current finale count and vibe goals', () => {
    const session = { ...buildReadySession({ preset: 'quick' }), id: 'new-night' }
    const summary = buildFinalSummary(session, [
      { type: 'journal', sessionId: 'new-night', vibe: 'tender' },
      { type: 'journal', sessionId: 'old-night', vibe: 'playful' },
      { type: 'journal', sessionId: 'old-night', vibe: 'spicy' },
      { type: 'finale', sessionId: 'old-night' },
    ])
    expect(summary.journalCount).toBe(1)
    expect(summary.goals.find(goal => goal.id === 'vibeSampler')).toMatchObject({ completed: false })
  })
})

describe('night checklist and moods', () => {
  it('validates mood ids against the known options', () => {
    expect(isValidMood('cozy')).toBe(true)
    expect(isValidMood('wild')).toBe(true)
    expect(isValidMood('sleepy')).toBe(false)
    expect(isValidMood(null)).toBe(false)
  })

  it('starts every checklist item unchecked', () => {
    const items = evaluateNightChecklist(buildInitialSession(buildCouple()))

    expect(items).toHaveLength(3)
    expect(items.every((item) => item.done === false)).toBe(true)
  })

  it('checks items off as the night fills in', () => {
    const session = {
      ...buildInitialSession(buildCouple()),
      keepsakes: [{ id: 'k1' }],
      lastDuelOutcome: { shared: true },
      lastRoll: 4,
    }

    const { done, items, total } = nightChecklistProgress(session)

    expect(total).toBe(3)
    expect(done).toBe(3)
    expect(items.map((item) => item.id)).toEqual([
      'first-roll',
      'duel-night',
      'keepsake',
    ])
  })

  it('does not require mood votes for checklist progress', () => {
    const session = {
      ...buildInitialSession(buildCouple()),
      moodVotes: { u1: 'cozy' },
    }

    const items = evaluateNightChecklist(session)
    expect(items).toHaveLength(3)
    expect(items.every((item) => item.done === false)).toBe(true)
  })

  it('resolves the combined mood from both votes', () => {
    const combined = resolveCombinedMood({ u1: 'cozy', u2: 'dreamy' })

    expect(combined.vibe).toBe('tender')
    expect(combined.label).toBe('Cozy + Dreamy')
    expect(combined.weights.tender).toBeGreaterThan(0.6)
  })

  it('blends clashing moods instead of picking a winner', () => {
    const combined = resolveCombinedMood({ u1: 'wild', u2: 'cozy' })

    expect(combined.weights.spicy).toBeGreaterThan(0.2)
    expect(combined.weights.tender).toBeGreaterThan(0.2)
  })

  it('returns null when nobody has voted a mood', () => {
    expect(resolveCombinedMood({})).toBeNull()
    expect(resolveCombinedMood({ u1: 'sleepy' })).toBeNull()
  })

  it('seeds the first-roll weights toward the combined mood', () => {
    const seeded = applyMoodSeedToWeights(
      { playful: 0.34, spicy: 0.33, tender: 0.33 },
      { u1: 'cozy', u2: 'cozy' },
    )

    expect(seeded.tender).toBeGreaterThan(0.5)
    const total = seeded.playful + seeded.spicy + seeded.tender
    expect(total).toBeCloseTo(1, 5)
  })

  it('leaves weights untouched when no mood is set', () => {
    const weights = { playful: 0.5, spicy: 0.2, tender: 0.3 }
    expect(applyMoodSeedToWeights(weights, {})).toEqual(weights)
  })

  it('counts shared duel wins across the night', () => {
    const ready = buildReadySession({ totalRounds: 1 })
    const withDuel = beginRoundDuel(ready, 'emoji-court')
    const duel = duelRegistry['emoji-court']
    const next = advanceAfterDuel(
      { ...withDuel, round: 1, totalRounds: 1 },
      { status: 'shared' },
      duel,
    )

    expect(next.sharedDuelWins).toBe(1)
    expect(next.phase).toBe('finale')
  })

  it('creates, accepts, and resolves a keepsake trade offer', () => {
    const session = buildReadySession({
      keepsakes: [
        { id: 'k1', instanceId: 'inst-1', label: 'Morning Coffee Pass', ownerIndex: 0 },
        { id: 'k2', instanceId: 'inst-2', label: 'Late Night Massage', ownerIndex: 1 },
      ],
      hearts: 5,
    })

    const offered = createTradeOffer(session, {
      fromPlayerIndex: 0,
      offeredInstanceId: 'inst-1',
      requestedInstanceId: 'inst-2',
      note: 'Trade coffee for a massage? ♡',
    })

    expect(offered.lastMove.tradeOffer).toBeDefined()
    expect(offered.lastMove.tradeOffer.status).toBe('pending')
    expect(offered.lastMove.tradeOffer.note).toBe('Trade coffee for a massage? ♡')
    expect(offered.actionText).toContain('Kyle offered to trade Morning Coffee Pass.')

    const accepted = resolveTradeOffer(offered, { accept: true })
    expect(accepted.lastMove.tradeOffer.status).toBe('accepted')
    expect(accepted.hearts).toBe(7) // +2 hearts for couple
    expect(accepted.keepsakes.find((k) => k.instanceId === 'inst-1').ownerIndex).toBe(1)
    expect(accepted.keepsakes.find((k) => k.instanceId === 'inst-2').ownerIndex).toBe(0)
    expect(accepted.actionText).toContain('traded Morning Coffee Pass for Late Night Massage!')

    const dismissed = dismissTradeOffer(accepted)
    expect(dismissed.lastMove.tradeOffer).toBeUndefined()
  })

  it('supports gifting a keepsake without requesting one in return', () => {
    const session = buildReadySession({
      keepsakes: [
        { id: 'k1', instanceId: 'inst-1', label: 'Morning Coffee Pass', ownerIndex: 0 },
      ],
      hearts: 3,
    })

    const offered = createTradeOffer(session, {
      fromPlayerIndex: 0,
      offeredInstanceId: 'inst-1',
      requestedInstanceId: null,
      note: 'A surprise gift for you!',
    })

    const accepted = resolveTradeOffer(offered, { accept: true })
    expect(accepted.keepsakes.find((k) => k.instanceId === 'inst-1').ownerIndex).toBe(1)
    expect(accepted.hearts).toBe(5)
    expect(accepted.actionText).toContain('Kyle gifted Morning Coffee Pass to Elaine! 💛')
  })

  it('handles declining a trade offer gracefully', () => {
    const session = buildReadySession({
      keepsakes: [
        { id: 'k1', instanceId: 'inst-1', label: 'Morning Coffee Pass', ownerIndex: 0 },
      ],
    })

    const offered = createTradeOffer(session, {
      fromPlayerIndex: 0,
      offeredInstanceId: 'inst-1',
    })

    const declined = resolveTradeOffer(offered, { accept: false })
    expect(declined.lastMove.tradeOffer.status).toBe('declined')
    expect(declined.keepsakes.find((k) => k.instanceId === 'inst-1').ownerIndex).toBe(0)
    expect(declined.actionText).toContain('Elaine gently passed on the trade offer.')
  })
})
