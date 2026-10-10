import { describe, expect, it, vi } from 'vitest'

const firestoreStore = vi.hoisted(() => new Map())
const mockQueryDocs = vi.hoisted(() => ({ docs: [] }))

vi.mock('firebase/firestore', () => {
  function refFor(arg1, arg2, arg3) {
    if (arg1 && typeof arg1 === 'object' && '_coll' in arg1) {
      return { _coll: arg1._coll, _id: arg2, _path: `${arg1._coll}/${arg2}` }
    }
    return { _coll: arg2, _id: arg3, _path: `${arg2}/${arg3}` }
  }

  function applyWrite(ref, data) {
    const next = { ...firestoreStore.get(ref._path) }
    for (const [key, value] of Object.entries(data)) {
      if (value && value._deleteField) {
        delete next[key]
      } else {
        next[key] = value
      }
    }
    firestoreStore.set(ref._path, next)
  }

  return {
    collection: (_db, name) => ({ _coll: name }),
    deleteField: () => ({ _deleteField: true }),
    doc: (...args) => refFor(...args),
    getDoc: async () => {
      throw new Error('not used in these tests')
    },
    getDocs: async () => ({ docs: mockQueryDocs.docs }),
    limit: (n) => ({ _limit: n }),
    onSnapshot: () => () => {},
    query: (...args) => ({ _query: args }),
    runTransaction: async (_db, fn) =>
      fn({
        get: async (ref) => ({
          exists: () => firestoreStore.has(ref._path),
          id: ref._id,
          data: () => firestoreStore.get(ref._path),
        }),
        set: (ref, data) => {
          applyWrite(ref, data)
        },
        update: (ref, data) => {
          if (!firestoreStore.has(ref._path)) {
            throw new Error('document does not exist')
          }
          applyWrite(ref, data)
        },
      }),
    serverTimestamp: () => ({ _serverTimestamp: true }),
    setDoc: async () => {},
    where: (field, op, value) => ({ _where: [field, op, value] }),
  }
})

import {
  applyNightComplete,
  buildDefaultProgress,
  clearNudge,
  companionStageForHearts,
  fetchCoupleJournalExport,
  grantKoupon,
  localDateStr,
  nextAnniversaryCountdown,
  pickKouponForGrant,
  previousDateStr,
  recordNightComplete,
  selectTheme,
  sendNudge,
  spendableHearts,
} from './progressService.js'

function progressFixture(overrides = {}) {
  return {
    ...buildDefaultProgress('couple-1'),
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  }
}

describe('progressService progression math', () => {
  it('builds a sane default progress doc', () => {
    const progress = buildDefaultProgress('couple-1')

    expect(progress.coupleId).toBe('couple-1')
    expect(progress.lifetimeHearts).toBe(0)
    expect(progress.freezeTokens).toBe(1)
    // No theme pinned: the board auto-rotates each round.
    expect(progress.selectedTheme).toBeUndefined()
    expect(progress.companion.name).toBe('Ember')
    expect(spendableHearts(progress)).toBe(0)
  })

  it('computes spendable hearts', () => {
    expect(spendableHearts(progressFixture({ heartsSpent: 60, lifetimeHearts: 100 }))).toBe(40)
    expect(spendableHearts(progressFixture({ heartsSpent: 200, lifetimeHearts: 100 }))).toBe(0)
  })

  it('steps the companion through stages', () => {
    expect(companionStageForHearts(0)).toBe(0)
    expect(companionStageForHearts(49)).toBe(0)
    expect(companionStageForHearts(50)).toBe(1)
    expect(companionStageForHearts(150)).toBe(2)
    expect(companionStageForHearts(300)).toBe(3)
    expect(companionStageForHearts(9999)).toBe(3)
  })

  it('computes calendar neighbors', () => {
    expect(previousDateStr('2026-09-30')).toBe('2026-09-29')
    expect(previousDateStr('2026-01-01')).toBe('2025-12-31')
    expect(localDateStr(new Date(2026, 8, 30))).toBe('2026-09-30')
  })

  it('starts a streak on the first night and banks hearts', () => {
    const { events, progress } = applyNightComplete(progressFixture(), {
      dateStr: '2026-09-30',
      heartsEarned: 24,
      stats: {},
    })

    expect(progress.lifetimeNights).toBe(1)
    expect(progress.lifetimeHearts).toBe(24)
    expect(progress.streakCount).toBe(1)
    expect(progress.streakLastDate).toBe('2026-09-30')
    expect(progress.companion.heartsFed).toBe(24)
    expect(events).toContainEqual({ nights: 1, type: 'milestone' })
    expect(events).toContainEqual({ trophyId: 'first-night', type: 'trophy' })
  })

  it('extends the streak on consecutive days', () => {
    const { progress } = applyNightComplete(
      progressFixture({ streakCount: 3, streakLastDate: '2026-09-29' }),
      { dateStr: '2026-09-30', heartsEarned: 10, stats: {} },
    )

    expect(progress.streakCount).toBe(4)
    expect(progress.freezeTokens).toBe(1)
  })

  it('burns a freeze token instead of resetting after a missed day', () => {
    const { events, progress } = applyNightComplete(
      progressFixture({ freezeTokens: 1, streakCount: 5, streakLastDate: '2026-09-28' }),
      { dateStr: '2026-09-30', heartsEarned: 10, stats: {} },
    )

    expect(progress.streakCount).toBe(6)
    expect(progress.freezeTokens).toBe(0)
    expect(events).toContainEqual({ streakCount: 6, type: 'freeze-used' })
  })

  it('resets the streak with no freeze tokens left', () => {
    const { progress } = applyNightComplete(
      progressFixture({ freezeTokens: 0, streakCount: 5, streakLastDate: '2026-09-20' }),
      { dateStr: '2026-09-30', heartsEarned: 10, stats: {} },
    )

    expect(progress.streakCount).toBe(1)
  })

  it('does not double-count the same day', () => {
    const { events, progress } = applyNightComplete(
      progressFixture({ lifetimeNights: 4, streakCount: 4, streakLastDate: '2026-09-30' }),
      { dateStr: '2026-09-30', heartsEarned: 10, stats: {} },
    )

    expect(progress.streakCount).toBe(4)
    expect(progress.lifetimeNights).toBe(5)
    expect(events.some((event) => event.type === 'freeze-used')).toBe(false)
  })

  it('earns a freeze token every seventh streak night', () => {
    const { events, progress } = applyNightComplete(
      progressFixture({ freezeTokens: 1, streakCount: 6, streakLastDate: '2026-09-29' }),
      { dateStr: '2026-09-30', heartsEarned: 10, stats: {} },
    )

    expect(progress.streakCount).toBe(7)
    expect(progress.freezeTokens).toBe(2)
    expect(events).toContainEqual({ type: 'freeze-earned' })
    expect(events).toContainEqual({ trophyId: 'streak-7', type: 'trophy' })
  })

  it('awards stat-driven trophies once', () => {
    const first = applyNightComplete(progressFixture(), {
      dateStr: '2026-09-30',
      heartsEarned: 10,
      stats: { keepsakes: 3, mutualYesMatches: 1, preset: 'long', sealedMatches: 2, sharedDuelWins: 1 },
    })

    expect(first.events).toContainEqual({ trophyId: 'duel-champions', type: 'trophy' })
    expect(first.events).toContainEqual({ trophyId: 'mind-reader', type: 'trophy' })
    expect(first.events).toContainEqual({ trophyId: 'keepsake-keeper', type: 'trophy' })
    expect(first.events).toContainEqual({ trophyId: 'marathon', type: 'trophy' })
    expect(first.events).toContainEqual({ trophyId: 'mutual-yes', type: 'trophy' })

    const second = applyNightComplete(first.progress, {
      dateStr: '2026-10-01',
      heartsEarned: 10,
      stats: { keepsakes: 3, mutualYesMatches: 1, preset: 'long', sealedMatches: 2, sharedDuelWins: 1 },
    })

    expect(second.events.filter((event) => event.type === 'trophy')).toEqual([])
  })

  it('fires milestone nights at the right counts', () => {
    const ninth = applyNightComplete(progressFixture({ lifetimeNights: 9 }), {
      dateStr: '2026-09-30',
      heartsEarned: 5,
      stats: {},
    })

    expect(ninth.events).toContainEqual({ nights: 10, type: 'milestone' })
    expect(ninth.events).toContainEqual({ trophyId: 'ten-nights', type: 'trophy' })
  })

  it('picks koupons without repeating active ones', () => {
    const progress = progressFixture({
      koupons: [{ id: 'k1', label: 'Breakfast in bed', status: 'active' }],
    })

    for (let i = 0; i < 20; i += 1) {
      expect(pickKouponForGrant(progress)).not.toMatchObject({ label: 'Breakfast in bed' })
    }
  })

  it('counts down to the next anniversary', () => {
    const countdown = nextAnniversaryCountdown('2020-10-15', new Date(2026, 8, 30))

    expect(countdown.days).toBe(15)
    expect(nextAnniversaryCountdown(null)).toBeNull()
  })
})

describe('recordNightComplete transaction', () => {
  const db = {}

  function callRecordNight(sessionId, hearts = 10) {
    return recordNightComplete(db, 'couple-1', {
      buildEntries: (events) =>
        events.map((event) => ({
          coupleId: 'couple-1',
          payload: {},
          summary: event.type,
          text: event.type,
          title: event.type,
          type: event.type === 'trophy' ? 'trophy' : 'milestone',
          vibe: 'tender',
        })),
      dateStr: '2026-09-30',
      heartsEarned: hearts,
      sessionId,
      stats: {},
    })
  }

  it('banks a night once and ignores a retried finale for the same session', async () => {
    firestoreStore.clear()

    const first = await callRecordNight('sess-1')
    expect(first.alreadyRecorded).toBe(false)
    expect(first.progress.lifetimeNights).toBe(1)
    expect(first.progress.lifetimeHearts).toBe(10)
    expect(first.progress.lastBankedSessionId).toBe('sess-1')
    expect(first.events).toContainEqual({ trophyId: 'first-night', type: 'trophy' })

    const journalKeys = [...firestoreStore.keys()].filter((key) =>
      key.startsWith('journalEntries/sess-1-progress-'),
    )
    expect(journalKeys).toHaveLength(2)

    const retry = await callRecordNight('sess-1')
    expect(retry.alreadyRecorded).toBe(true)
    expect(retry.events).toEqual([])

    const stored = firestoreStore.get('coupleProgress/couple-1')
    expect(stored.lifetimeNights).toBe(1)
    expect(stored.lifetimeHearts).toBe(10)

    const journalKeysAfter = [...firestoreStore.keys()].filter((key) =>
      key.startsWith('journalEntries/sess-1-progress-'),
    )
    expect(journalKeysAfter).toHaveLength(2)
  })

  it('banks a new session after a previous one was recorded', async () => {
    firestoreStore.clear()

    await callRecordNight('sess-1')
    const second = await callRecordNight('sess-2', 5)

    expect(second.alreadyRecorded).toBe(false)
    expect(second.progress.lifetimeNights).toBe(2)
    expect(second.progress.lifetimeHearts).toBe(15)
    expect(second.progress.lastBankedSessionId).toBe('sess-2')
  })
})

describe('theme selection', () => {
  const db = {}

  it('pins a base theme for the whole night', async () => {
    firestoreStore.clear()

    await selectTheme(db, 'couple-1', 'garden')

    expect(firestoreStore.get('coupleProgress/couple-1').selectedTheme).toBe('garden')
  })

  it('deletes the theme field for auto-rotate instead of nulling it', async () => {
    firestoreStore.clear()

    await selectTheme(db, 'couple-1', 'garden')
    await selectTheme(db, 'couple-1', null)

    expect('selectedTheme' in firestoreStore.get('coupleProgress/couple-1')).toBe(false)
  })

  it('rejects unknown themes', async () => {
    firestoreStore.clear()

    await expect(selectTheme(db, 'couple-1', 'nope')).rejects.toThrow('Unknown theme.')
  })
})

describe('nudge cooldown', () => {
  const db = {}

  function seedProgress(overrides = {}) {
    firestoreStore.clear()
    firestoreStore.set('coupleProgress/couple-1', {
      ...buildDefaultProgress('couple-1'),
      ...overrides,
    })
  }

  it('sends the first nudge', async () => {
    seedProgress()

    const result = await sendNudge(db, 'couple-1', { byName: 'Alex', byUid: 'u1' })

    expect(result.sent).toBe(true)
    expect(firestoreStore.get('coupleProgress/couple-1').nudge.byName).toBe('Alex')
  })

  it('blocks a second nudge inside the cooldown window', async () => {
    seedProgress({
      nudge: {
        at: { toDate: () => new Date() },
        byName: 'Alex',
        byUid: 'u1',
      },
    })

    const result = await sendNudge(db, 'couple-1', { byName: 'Alex', byUid: 'u1' })

    expect(result.sent).toBe(false)
    expect(result.retryAfterMs).toBeGreaterThan(0)
  })

  it('clears an incoming nudge on dismiss', async () => {
    seedProgress({
      nudge: {
        at: { toDate: () => new Date() },
        byName: 'Alex',
        byUid: 'u1',
      },
    })

    await clearNudge(db, 'couple-1')

    expect(firestoreStore.get('coupleProgress/couple-1').nudge).toBeNull()
  })
})

describe('promise grants', () => {
  const db = {}

  it('returns the granted promise record', async () => {
    firestoreStore.clear()

    const { granted, progress } = await grantKoupon(db, 'couple-1')

    expect(granted).not.toBeNull()
    expect(granted.label).toBeTruthy()
    expect(progress.koupons).toHaveLength(1)
  })
})

describe('journal export', () => {
  const db = {}

  it('sanitizes and sorts entries newest-first', async () => {
    mockQueryDocs.docs = [
      {
        id: 'e1',
        data: () => ({
          coupleId: 'couple-1',
          createdAt: { toDate: () => new Date('2026-01-01T00:00:00Z') },
          payload: { nights: 1 },
          sessionId: 's1',
          summary: 's',
          text: 't',
          title: 'Old',
          type: 'milestone',
          vibe: 'tender',
        }),
      },
      {
        id: 'e2',
        data: () => ({
          coupleId: 'couple-1',
          createdAt: { toDate: () => new Date('2026-02-01T00:00:00Z') },
          payload: {},
          sessionId: 's2',
          summary: 's',
          text: 't',
          title: 'New',
          type: 'journal',
          vibe: 'playful',
        }),
      },
    ]

    const entries = await fetchCoupleJournalExport(db, 'couple-1')

    expect(entries).toHaveLength(2)
    expect(entries[0].id).toBe('e2')
    expect(entries[0].createdAt).toBe('2026-02-01T00:00:00.000Z')
    expect(entries[1].createdAt).toBe('2026-01-01T00:00:00.000Z')

    mockQueryDocs.docs = []
  })
})
