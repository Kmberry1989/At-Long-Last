import { describe, expect, it } from 'vitest'
import { getDoodlePrompt, DOODLE_PROMPTS, SLOW_DRAW_PROMPTS, inkWidth } from './drawingInk.js'

describe('touch ink', () => {
  it('offers a broad prompt bank that stays in sync by session, game, and round', () => {
    expect(DOODLE_PROMPTS.length).toBeGreaterThanOrEqual(50)
    expect(SLOW_DRAW_PROMPTS.length).toBeGreaterThanOrEqual(15)
    expect(new Set(DOODLE_PROMPTS).size).toBe(DOODLE_PROMPTS.length)
    expect(getDoodlePrompt('doodle-duel-memory', 2, 'night-1')).toBe(getDoodlePrompt('doodle-duel-memory', 2, 'night-1'))
    expect(getDoodlePrompt('doodle-duel-memory', 2, 'night-1')).not.toBe(getDoodlePrompt('doodle-duel-memory', 2, 'night-2'))
    expect(getDoodlePrompt('doodle-duel-memory', 2, 'night-1')).not.toBe(getDoodlePrompt('doodle-duel-memory', 3, 'night-1'))
  })
  it('uses real stylus pressure for thicker ink', () => {
    expect(inkWidth({ pointerType: 'pen', pressure: .9 })).toBeGreaterThan(inkWidth({ pointerType: 'pen', pressure: .1 }))
  })
  it('uses finger speed when pressure is unavailable or is the constant default', () => {
    for (const pressure of [0, .5]) expect(inkWidth({ pointerType: 'touch', pressure, speed: .1 })).toBeGreaterThan(inkWidth({ pointerType: 'touch', pressure, speed: 4 }))
  })
  it('varies the calligraphy nib by stroke direction while the fine liner stays steady', () => {
    expect(inkWidth({ angle: 0 })).not.toBe(inkWidth({ angle: Math.PI / 4 }))
    expect(inkWidth({ brush: 'fine', pressure: .9, speed: 4 })).toBe(inkWidth({ brush: 'fine', pressure: .1, speed: .1 }))
  })
  it('smooths width transitions and scales brush size', () => {
    const raw = inkWidth({ pointerType: 'pen', pressure: 1 })
    const smoothed = inkWidth({ pointerType: 'pen', pressure: 1, previousWidth: 1 })
    expect(smoothed).toBeGreaterThan(1)
    expect(smoothed).toBeLessThan(raw)
    expect(inkWidth({ brush: 'fine', size: 2 })).toBe(inkWidth({ brush: 'fine', size: 1 }) * 2)
  })
})
