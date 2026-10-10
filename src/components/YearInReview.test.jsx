import { describe, expect, it, vi } from 'vitest'

vi.mock('../features/couple/CoupleProvider.jsx', () => ({
  useCouple: () => ({ couple: null, progress: null }),
}))

vi.mock('../features/couple/FirebaseAppContext.jsx', () => ({
  useFirebaseApp: () => ({ db: null }),
}))

vi.mock('../features/couple/progressService.js', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual }
})

import { buildYearRecap } from './YearInReview.jsx'

const thisYear = new Date().getFullYear()

function entry(overrides = {}) {
  return {
    createdAt: `${thisYear}-06-15T20:00:00.000Z`,
    id: 'e1',
    payload: {},
    sessionId: 's1',
    type: 'journal',
    vibe: 'playful',
    ...overrides,
  }
}

describe('buildYearRecap', () => {
  it('aggregates nights, hearts, streaks, and progression', () => {
    const entries = [
      entry({ id: 'e1', sessionId: 's1', type: 'duel', payload: { wavelength: { matches: 8, total: 10 } } }),
      entry({ id: 'e2', sessionId: 's1', type: 'duel', payload: { wavelength: { matches: 4, total: 10 } }, vibe: 'tender' }),
      entry({ id: 'e3', sessionId: 's2', vibe: 'playful' }),
    ]
    const progress = {
      companion: { heartsFed: 60, name: 'Ember', stage: 1 },
      koupons: [
        { id: 'k1', status: 'fulfilled' },
        { id: 'k2', status: 'active' },
      ],
      lifetimeHearts: 148,
      lifetimeNights: 12,
      streakCount: 6,
      trophies: ['first-night', 'streak-7'],
      unlockedThemes: ['starlit-rooftop'],
    }

    const recap = buildYearRecap(entries, progress)

    expect(recap.nights).toBe(12)
    expect(recap.hearts).toBe(148)
    expect(recap.streak).toBe(6)
    expect(recap.duelsPlayed).toBe(2)
    expect(recap.bestWavelength).toBe(8)
    expect(recap.promisesFulfilled).toBe(1)
    expect(recap.trophies).toBe(2)
    expect(recap.themesUnlocked).toBe(1)
    expect(recap.topVibe).toBe('playful')
    expect(recap.nightsThisYear).toBe(2)
    expect(recap.companionStageLabel).toBe('Hatchling')
  })

  it('handles an empty story gracefully', () => {
    const recap = buildYearRecap([], {})

    expect(recap.nights).toBe(0)
    expect(recap.bestWavelength).toBeNull()
    expect(recap.topVibe).toBeNull()
    expect(recap.companionStageLabel).toBe('A quiet egg')
  })

  it('ignores entries from prior years for the this-year count', () => {
    const entries = [
      entry({ id: 'e1', createdAt: `${thisYear - 1}-12-20T20:00:00.000Z`, sessionId: 'old' }),
      entry({ id: 'e2', sessionId: 'new' }),
    ]

    const recap = buildYearRecap(entries, {})

    expect(recap.nightsThisYear).toBe(1)
  })
})
