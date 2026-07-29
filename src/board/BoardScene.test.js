import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { getTokenTargetPosition } from './BoardScene.jsx'

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
