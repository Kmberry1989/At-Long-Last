import { describe, expect, it } from 'vitest'
import { duelRegistry } from './duelRegistry.jsx'
import {
  advanceAfterDuel,
  applyRollToSession,
  beginRoundDuel,
  buildFinalSummary,
  buildInitialSession,
  evaluateDuelRound,
  finalizeVibeSetup,
  resolveActivityCompletion,
  resolveKeepsakeDecision,
  resolveSkippedActivity,
} from './sessionLogic.js'

function buildCouple() {
  return {
    id: 'couple-1',
    players: [
      { uid: 'u1', displayName: 'Kyle', color: '#f00' },
      { uid: 'u2', displayName: 'Elaine', color: '#0af' },
    ],
  }
}

describe('sessionLogic', () => {
  it('builds the initial session in vibe setup', () => {
    const session = buildInitialSession(buildCouple())
    expect(session.round).toBe(1)
    expect(session.positions).toEqual([0, 0])
    expect(session.phase).toBe('vibeSetup')
    expect(session.preset).toBe('standard')
    expect(session.vibeWeights).toBeNull()
  })

  it('moves from vibe setup into the normal turn phase', () => {
    const session = buildInitialSession(buildCouple())
    const next = finalizeVibeSetup(session, {
      tender: 0.5,
      playful: 0.3,
      spicy: 0.2,
    })

    expect(next.phase).toBe('turn')
    expect(next.vibeWeights.tender).toBe(0.5)
    expect(next.actionText).toContain('rolls first')
  })

  it('advances after a simple heart roll', () => {
    const session = finalizeVibeSetup(buildInitialSession(buildCouple()))
    const next = applyRollToSession(session, {
      activityType: 'comfort-menu',
      keepsakeId: 'love-note',
      roll: 5,
    })

    expect(next.hearts).toBe(8)
    expect(next.activePlayerIndex).toBe(1)
    expect(next.phase).toBe('turn')
  })

  it('opens a keepsake choice and can buy it', () => {
    let session = finalizeVibeSetup(buildInitialSession(buildCouple()))
    session = applyRollToSession(session, {
      activityType: 'comfort-menu',
      keepsakeId: 'love-note',
      roll: 4,
    })

    expect(session.phase).toBe('keepsake')
    session.hearts = 12
    session = resolveKeepsakeDecision(session, true)
    expect(session.keepsakes).toHaveLength(1)
    expect(session.activePlayerIndex).toBe(1)
  })

  it('awards hearts, records the activity id, and clears activity state after completion', () => {
    let session = finalizeVibeSetup(buildInitialSession(buildCouple()))
    session = applyRollToSession(session, {
      activityType: 'comfort-menu',
      keepsakeId: 'love-note',
      roll: 2,
    })

    const next = resolveActivityCompletion(session, {
      heartBonus: 3,
      label: 'Comfort Menu',
    })

    expect(session.usedActivityIds).toContain('comfort-menu')
    expect(next.hearts).toBe(9)
    expect(next.pendingActivityType).toBe(null)
    expect(next.activePlayerIndex).toBe(1)
  })

  it('can skip an activity without awarding hearts', () => {
    let session = finalizeVibeSetup(buildInitialSession(buildCouple()))
    session = applyRollToSession(session, {
      activityType: 'comfort-menu',
      keepsakeId: 'love-note',
      roll: 2,
    })

    const next = resolveSkippedActivity(session, 'Comfort Menu')
    expect(next.hearts).toBe(session.hearts)
    expect(next.phase).toBe('turn')
    expect(next.pendingActivityType).toBe(null)
  })

  it('resolves a duel and starts the next round', () => {
    let session = finalizeVibeSetup(buildInitialSession(buildCouple()))
    session.turnsTakenThisRound = 2
    session.phase = 'duelWheel'
    session = beginRoundDuel(session, 'reaction-heart')
    session.duelResults = {
      u1: { won: true, time: 0.8 },
      u2: { won: true, time: 1.2 },
    }

    const outcome = evaluateDuelRound(session, duelRegistry)
    const next = advanceAfterDuel(session, outcome)

    expect(session.usedDuelIds).toContain('reaction-heart')
    expect(outcome.status).toBe('resolved')
    expect(next.round).toBe(2)
    expect(next.phase).toBe('turn')
    expect(next.hearts).toBe(9)
  })

  it('ends a duel with no contest after both players skip the replacement', () => {
    let session = finalizeVibeSetup(buildInitialSession(buildCouple()))
    session.turnsTakenThisRound = 2
    session.phase = 'duelWheel'
    session = beginRoundDuel(session, 'reaction-heart')
    session.currentDuel.attempt = 2

    const next = advanceAfterDuel(session, { status: 'noContest' })
    expect(next.phase).toBe('turn')
    expect(next.hearts).toBe(6)
  })

  it('builds the finale summary', () => {
    const summary = buildFinalSummary(
      {
        hearts: 10,
        lastDuelOutcome: {
          shared: true,
        },
        keepsakes: [{ id: 'a' }, { id: 'b' }],
        players: buildCouple().players,
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
    expect(summary.journalCount).toBe(5)
    expect(summary.keepsakeCount).toBe(2)
    expect(summary.duelOutcomeLabel).toBe('Shared finish')
    expect(summary.dominantVibe).toBe('playful')
    expect(summary.presetLabel).toBe('Standard')
  })
})
