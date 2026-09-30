import { describe, expect, it } from 'vitest'
import { duelRegistry } from './duelRegistry.jsx'
import {
  advanceAfterDuel,
  applyRollToSession,
  beginRoundDuel,
  buildFinalSummary,
  buildInitialSession,
  choosePendingActivity,
  ensureSessionArcState,
  evaluateNightChecklist,
  finalizeVibeSetup,
  getSessionAct,
  isValidMood,
  nightChecklistProgress,
  resolveActivityCompletion,
  resolveKeepsakeDecision,
  resolveSkippedActivity,
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

    expect(session.phase).toBe('vibeSetup')
    expect(session.spotlight.act).toBe('warmup')
    expect(session.momentum.playful).toBe(0)
    expect(session.keepsakePerks).toEqual([])
  })

  it('calculates act transitions across presets', () => {
    expect(getSessionAct(1, 4)).toBe('warmup')
    expect(getSessionAct(3, 4)).toBe('spark')
    expect(getSessionAct(4, 4)).toBe('finale')
    expect(getSessionAct(5, 8)).toBe('spark')
    expect(getSessionAct(8, 8)).toBe('finale')
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

  it('adds purchased perks when buying a keepsake', () => {
    let session = buildReadySession()
    session = applyRollToSession(session, {
      activityType: 'comfort-menu',
      keepsakeId: 'love-note',
      roll: 4,
    })
    session.hearts = 12

    const next = resolveKeepsakeDecision(session, true)

    expect(next.keepsakePerks).toContain('pocket-love-note')
    expect(next.keepsakes).toHaveLength(1)
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

    expect(items).toHaveLength(5)
    expect(items.every((item) => item.done === false)).toBe(true)
  })

  it('checks items off as the night fills in', () => {
    const session = {
      ...buildInitialSession(buildCouple()),
      keepsakes: [{ id: 'k1' }],
      lastDuelOutcome: { shared: true },
      lastRoll: 4,
      moodVotes: { u1: 'cozy', u2: 'playful' },
      vibeWeights: { playful: 0.5, spicy: 0.2, tender: 0.3 },
    }

    const { done, items, total } = nightChecklistProgress(session)

    expect(total).toBe(5)
    expect(done).toBe(5)
    expect(items.map((item) => item.id)).toEqual([
      'set-mood',
      'set-vibe',
      'first-roll',
      'duel-night',
      'keepsake',
    ])
  })

  it('requires both players to vote their mood', () => {
    const session = {
      ...buildInitialSession(buildCouple()),
      moodVotes: { u1: 'cozy' },
    }

    const items = evaluateNightChecklist(session)
    expect(items.find((item) => item.id === 'set-mood').done).toBe(false)
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
})
