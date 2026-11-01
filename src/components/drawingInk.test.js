import { describe, expect, it } from 'vitest'
import { inkWidth } from './drawingInk.js'

describe('touch ink', () => {
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
