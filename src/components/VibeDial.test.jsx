import { describe, expect, it } from 'vitest'
import {
  clampPointToTriangle,
  getInsetTriangle,
  positionToWeights,
  weightsToPosition,
} from './VibeDial.jsx'

describe('VibeDial triangle geometry', () => {
  it('projects every out-of-bounds pointer onto a valid triangle edge', () => {
    const triangle = getInsetTriangle(260, 239.2, 15)
    const outsidePoints = [
      { x: -80, y: -40 },
      { x: 340, y: -20 },
      { x: -60, y: 220 },
      { x: 330, y: 260 },
      { x: 130, y: 360 },
    ]

    outsidePoints.forEach((point) => {
      const clamped = clampPointToTriangle(point, triangle)
      const weights = positionToWeights(clamped.x, clamped.y, triangle)

      expect(weights.tender).toBeGreaterThanOrEqual(0)
      expect(weights.playful).toBeGreaterThanOrEqual(0)
      expect(weights.spicy).toBeGreaterThanOrEqual(0)
      expect(weights.tender + weights.playful + weights.spicy).toBeCloseTo(1, 8)
    })
  })

  it('round-trips a tone mix through barycentric triangle coordinates', () => {
    const triangle = getInsetTriangle(260, 239.2, 15)
    const original = {
      playful: 0.23,
      spicy: 0.31,
      tender: 0.46,
    }
    const position = weightsToPosition(original, triangle)
    const restored = positionToWeights(position.x, position.y, triangle)

    expect(restored.tender).toBeCloseTo(original.tender, 8)
    expect(restored.playful).toBeCloseTo(original.playful, 8)
    expect(restored.spicy).toBeCloseTo(original.spicy, 8)
  })

  it('keeps the draggable center inset far enough for its full handle to remain visible', () => {
    const triangle = getInsetTriangle(260, 239.2, 15)

    expect(triangle.tender.y).toBeGreaterThanOrEqual(15)
    expect(triangle.playful.x).toBeGreaterThanOrEqual(15)
    expect(triangle.spicy.x).toBeLessThanOrEqual(245)
    expect(triangle.playful.y).toBeLessThanOrEqual(224.2)
    expect(triangle.spicy.y).toBeLessThanOrEqual(224.2)
  })
})
