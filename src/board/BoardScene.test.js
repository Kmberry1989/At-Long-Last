import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import {
  calculateStepPath,
  getBoardPathSegments,
  getTokenTargetPosition,
  resolveDiceValues,
} from './BoardScene.jsx'

const boardPath = [
  { position: new THREE.Vector3(0, 0.35, -4) },
  { position: new THREE.Vector3(4, 0.35, 0) },
  { position: new THREE.Vector3(0, 0.35, 4) },
  { position: new THREE.Vector3(-4, 0.35, 0) },
]

describe('getTokenTargetPosition', () => {
  it('separates player pieces symmetrically when both occupy one tile', () => {
    const first = getTokenTargetPosition(boardPath, [0, 0], 0)
    const second = getTokenTargetPosition(boardPath, [0, 0], 1)

    expect(first.distanceTo(second)).toBeCloseTo(1.28)
    expect(first.clone().add(second).multiplyScalar(0.5).toArray()).toEqual([
      0,
      0.35,
      -4,
    ])
  })

  it('keeps a lone player piece centered on its tile', () => {
    const first = getTokenTargetPosition(boardPath, [0, 1], 0)
    const second = getTokenTargetPosition(boardPath, [0, 1], 1)

    expect(first.toArray()).toEqual([0, 0.35, -4])
    expect(second.toArray()).toEqual([4, 0.35, 0])
  })
})

describe('getBoardPathSegments', () => {
  it('connects every tile to the next and closes the visible route', () => {
    const segments = getBoardPathSegments(boardPath)

    expect(segments).toHaveLength(boardPath.length)
    expect(segments.map(({ fromIndex, toIndex }) => [fromIndex, toIndex])).toEqual([
      [0, 1], [1, 2], [2, 3], [3, 0],
    ])
    expect(segments.every(({ length }) => length > 0)).toBe(true)
  })
})

describe('resolveDiceValues', () => {
  it('splits roll totals into two valid 1-6 dice', () => {
    expect(resolveDiceValues(2)).toEqual([1, 1])
    expect(resolveDiceValues(7)).toEqual([3, 4])
    expect(resolveDiceValues(12)).toEqual([6, 6])
  })

  it('preserves explicit dice pair if supplied', () => {
    expect(resolveDiceValues(7, [2, 5])).toEqual([2, 5])
    expect(resolveDiceValues(10, [4, 6])).toEqual([4, 6])
  })
})

describe('calculateStepPath', () => {
  it('generates the clockwise ring sequence from current tile to destination', () => {
    const path = calculateStepPath(18, 4, 20)
    expect(path).toEqual([18, 19, 0, 1, 2])
  })
})

