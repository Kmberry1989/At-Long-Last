import { describe, expect, it } from 'vitest'
import { advanceLoginStreak } from './loginStreak.js'

describe('login streaks', () => {
  it('counts one visit per calendar day and preserves the best', () => {
    const first = advanceLoginStreak({}, '2026-10-28')
    expect(first.dayCount).toBe(1)
    expect(advanceLoginStreak(first, '2026-10-28')).toBe(first)
    const second = advanceLoginStreak(first, '2026-10-29')
    expect(second.dayCount).toBe(2)
    expect(advanceLoginStreak(second, '2026-11-01')).toMatchObject({ dayCount: 1, bestDayCount: 2 })
    expect(advanceLoginStreak(second, '2026-10-27')).toBe(second)
  })
  it('counts Monday weeks once across year boundaries and resets after a missed week', () => {
    const first = advanceLoginStreak({}, '2026-12-27')
    const second = advanceLoginStreak(first, '2026-12-28')
    expect(second.weekCount).toBe(2)
    const sameWeek = advanceLoginStreak(second, '2027-01-03')
    expect(sameWeek.weekCount).toBe(2)
    expect(advanceLoginStreak(sameWeek, '2027-01-04').weekCount).toBe(3)
    expect(advanceLoginStreak(sameWeek, '2027-01-18').weekCount).toBe(1)
  })
})
