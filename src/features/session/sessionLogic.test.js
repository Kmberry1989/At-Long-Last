import { describe, expect, it } from 'vitest'
import { duelRegistry } from './duelRegistry.jsx'
import {
  advanceAfterDuel,
  applyRollToSession,
  beginRoundDuel,
  buildFinalSummary,
  buildInitialSession,
  evaluateDuelRound,
  resolveActivityCompletion,
  resolveKeepsakeDecision,
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
  it('builds the initial session', () => {
    const session = buildInitialSession(buildCouple())
    expect(session.round).toBe(1)
    expect(session.positions).toEqual([0, 0])
    expect(session.phase).toBe('turn')
  })

  it('advances after a simple heart roll', () => {
    const session = buildInitialSession(buildCouple())
    const next = applyRollToSession(session, {
      activityType: 'spark-checkin',
      keepsakeId: 'love-note',
      roll: 5,
    })

    expect(next.hearts).toBe(8)
    expect(next.activePlayerIndex).toBe(1)
    expect(next.phase).toBe('turn')
  })

  it('opens a keepsake choice and can buy it', () => {
    let session = buildInitialSession(buildCouple())
    session = applyRollToSession(session, {
      activityType: 'spark-checkin',
      keepsakeId: 'love-note',
      roll: 4,
    })

    expect(session.phase).toBe('keepsake')
    session.hearts = 12
    session = resolveKeepsakeDecision(session, true)
    expect(session.keepsakes).toHaveLength(1)
    expect(session.activePlayerIndex).toBe(1)
  })

  it('awards hearts and clears activity state after completion', () => {
    let session = buildInitialSession(buildCouple())
    session = applyRollToSession(session, {
      activityType: 'spark-checkin',
      keepsakeId: 'love-note',
      roll: 2,
    })

    const next = resolveActivityCompletion(session, {
      heartBonus: 3,
      label: 'Spark Check-In',
    })

    expect(next.hearts).toBe(9)
    expect(next.pendingActivityType).toBe(null)
    expect(next.activePlayerIndex).toBe(1)
  })

  it('resolves a duel and starts the next round', () => {
    let session = buildInitialSession(buildCouple())
    session.turnsTakenThisRound = 2
    session.phase = 'duelWheel'
    session = beginRoundDuel(session, 'quick-flip')
    session.duelResults = {
      u1: { won: true, time: 0.8 },
      u2: { won: true, time: 1.2 },
    }

    const outcome = evaluateDuelRound(session, duelRegistry)
    const next = advanceAfterDuel(session, outcome)

    expect(outcome.status).toBe('resolved')
    expect(next.round).toBe(2)
    expect(next.phase).toBe('turn')
    expect(next.hearts).toBe(9)
  })

  it('builds the finale summary', () => {
    const summary = buildFinalSummary(
      {
        hearts: 10,
        keepsakes: [{ id: 'a' }, { id: 'b' }],
      },
      5,
    )

    expect(summary.journalCount).toBe(5)
    expect(summary.keepsakeCount).toBe(2)
  })
})
