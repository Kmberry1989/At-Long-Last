import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import {
  BOARD_INSET_RADIUS,
  BOARD_IDLE_ORBIT_SPEED,
  BOARD_PATH_RADIUS,
  BOARD_CARD_PILE_RADIUS,
  BOARD_CARD_PILE_DOT_COUNT,
  BOARD_CARD_PILE_DOT_SIZE,
  BOARD_CARD_PILE_POSITIONS,
  BOARD_MOMENT_COIN_POSITION,
  BOARD_CARD_PILE_LABEL_Y,
  BOARD_SKIN_SURFACE_Y,
  createPrimitiveDie,
  DICE_HOME_BASE_HEIGHT,
  DICE_HOME_BASE_FLOOR_THICKNESS,
  DICE_HOME_BASE_INNER_RADIUS,
  DICE_HOME_BASE_RADIUS,
  DICE_HOME_BASE_FLOAT_HEIGHT,
  DICE_ROLL_DURATION_SECONDS,
  calculateStepPath,
  createPieceMovePlan,
  getBoardSpaceMotion,
  getBoardCameraShotPose,
  getLandingEffectForSpaceType,
  getDiceHomeBaseMotion,
  getPlayerPbrFinish,
  getSpokeFacingAngle,
  shouldOrbitBoard,
  getBoardPathSegments,
  getCircularBoardPosition,
  getTokenTargetPosition,
  makeDiceRollGesture,
  resolveDiceValues,
} from './BoardScene.jsx'

const boardPath = [
  { position: new THREE.Vector3(0, 0.35, -4) },
  { position: new THREE.Vector3(4, 0.35, 0) },
  { position: new THREE.Vector3(0, 0.35, 4) },
  { position: new THREE.Vector3(-4, 0.35, 0) },
]

describe('board inset proportions', () => {
  it('keeps the fabric field circular and safely inside the round rim', () => {
    expect(BOARD_INSET_RADIUS).toBe(8.5)
    expect(BOARD_INSET_RADIUS).toBeLessThan(15.78)
  })
})

describe('board card pile markers', () => {
  it('uses a bold, minimal pile label and a strong dotted outline', () => {
    expect(BOARD_CARD_PILE_DOT_COUNT).toBeGreaterThanOrEqual(64)
    expect(BOARD_CARD_PILE_DOT_SIZE).toBeGreaterThanOrEqual(0.18)
  })
  it('keeps separate Trash, Treasure, and discard zones within the circular inset and clear of the coin and dice base', () => {
    const centers = Object.values(BOARD_CARD_PILE_POSITIONS)
    expect(centers).toHaveLength(3)
    for (const [x, z] of centers) {
      expect(Math.hypot(x, z) + BOARD_CARD_PILE_RADIUS).toBeLessThan(BOARD_INSET_RADIUS)
    }
    for (let first = 0; first < centers.length; first += 1) {
      for (let second = first + 1; second < centers.length; second += 1) {
        expect(Math.hypot(centers[first][0] - centers[second][0], centers[first][1] - centers[second][1]))
          .toBeGreaterThan(BOARD_CARD_PILE_RADIUS * 2)
      }
      expect(Math.hypot(centers[first][0] + 2.62, centers[first][1] - 0.64))
        .toBeGreaterThan(BOARD_CARD_PILE_RADIUS + DICE_HOME_BASE_RADIUS)
      expect(Math.hypot(centers[first][0] - BOARD_MOMENT_COIN_POSITION[0], centers[first][1] - BOARD_MOMENT_COIN_POSITION[1]))
        .toBeGreaterThan(BOARD_CARD_PILE_RADIUS + 0.76)
    }
    expect(Math.hypot(BOARD_MOMENT_COIN_POSITION[0] + 2.62, BOARD_MOMENT_COIN_POSITION[1] - 0.64))
      .toBeGreaterThan(DICE_HOME_BASE_RADIUS + 0.76)
  })

  it('keeps pile names printed on the board surface rather than camera-facing labels', () => {
    expect(BOARD_CARD_PILE_LABEL_Y - BOARD_SKIN_SURFACE_Y).toBeLessThan(0.025)
    expect(BOARD_CARD_PILE_LABEL_Y).toBeGreaterThan(BOARD_SKIN_SURFACE_Y)
  })
})

describe('dice home base proportions', () => {
  it('shows an extended tumble before resting on the final face', () => {
    expect(DICE_ROLL_DURATION_SECONDS).toBeGreaterThanOrEqual(2)
  })
  it('keeps an open circular box with room inside for both dice', () => {
    expect(DICE_HOME_BASE_RADIUS).toBeGreaterThan(DICE_HOME_BASE_INNER_RADIUS)
    expect(DICE_HOME_BASE_HEIGHT).toBeGreaterThan(0)
    expect(DICE_HOME_BASE_FLOOR_THICKNESS).toBeGreaterThan(0)
    expect(DICE_HOME_BASE_RADIUS).toBe(2.18)
  })

  it('floats above the spaces and keeps a soft shadow visually anchored below', () => {
    const motion = getDiceHomeBaseMotion(1)
    const still = getDiceHomeBaseMotion(1, true)

    expect(DICE_HOME_BASE_FLOAT_HEIGHT).toBeGreaterThan(0.35)
    expect(motion.lift).toBeGreaterThan(0.35)
    expect(motion.shadowOpacity).toBeGreaterThan(0)
    expect(motion.shadowScale).toBeGreaterThan(0)
    expect(still.lift).toBe(DICE_HOME_BASE_FLOAT_HEIGHT)
  })
})

describe('readable dice faces', () => {
  it('marks every side and settles the rolled face upward', () => {
    const sideNormals = { 1: [0, 1, 0], 2: [1, 0, 0], 3: [0, 0, 1], 4: [0, 0, -1], 5: [-1, 0, 0], 6: [0, -1, 0] }
    for (let value = 1; value <= 6; value += 1) {
      const pair = createPrimitiveDie([value, 1])
      const die = pair.userData.die1
      expect(Object.values(die.userData.pipGroups).every(group => group.visible)).toBe(true)
      expect(Object.values(die.userData.pipGroups).reduce((total, group) => total + group.children.length, 0)).toBe(21)
      expect(Object.values(die.userData.pipGroups).flatMap(group => group.children).every(pip => Math.max(Math.abs(pip.position.x), Math.abs(pip.position.y), Math.abs(pip.position.z)) > 0.48)).toBe(true)
      const top = new THREE.Vector3(...sideNormals[value]).applyQuaternion(die.quaternion)
      expect(top.y).toBeCloseTo(1)
    }
  })
})

describe('circular board spaces', () => {
  it('places all 20 spaces on one circle with even angular spacing', () => {
    const points = Array.from({ length: 20 }, (_, index) => getCircularBoardPosition(index))
    const radii = points.map(point => Math.hypot(point.x, point.z))
    expect(radii.every(radius => Math.abs(radius - BOARD_PATH_RADIUS) < 1e-9)).toBe(true)
    expect(points[0].x).toBeCloseTo(0)
    expect(points[0].z).toBeCloseTo(-BOARD_PATH_RADIUS)
    expect(points[5].x).toBeCloseTo(BOARD_PATH_RADIUS)
    expect(points[10].z).toBeCloseTo(BOARD_PATH_RADIUS)
    expect(points[15].x).toBeCloseTo(-BOARD_PATH_RADIUS)
  })

  it('floats spaces out of sync and adds a weighted dip with brighter underglow', () => {
    const first = getBoardSpaceMotion(1, 0)
    const second = getBoardSpaceMotion(1, 1)
    const occupied = getBoardSpaceMotion(1, 0, { occupied: true })

    expect(first.bob).not.toBe(second.bob)
    expect(occupied.sinkTarget).toBeGreaterThan(first.sinkTarget)
    expect(occupied.glowOpacity).toBeGreaterThan(first.glowOpacity)
    expect(getBoardSpaceMotion(1, 0, { reducedMotion: true }).bob).toBe(0)
  })
})

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

describe('createPieceMovePlan', () => {
  it('uses a stable event id so independent move events do not collide', () => {
    expect(createPieceMovePlan({ id: 'roll-2-1', playerIndex: 1, from: 0, to: 3, steps: 3 }, 20)?.key).toBe('roll-2-1')
  })

  it('retains every intermediate landing across the board edge', () => {
    expect(createPieceMovePlan({ playerIndex: 1, from: 18, to: 2, steps: 4, dice: [2, 2] }, 20)).toEqual({
      key: '1:18:2:1:4',
      playerIndex: 1,
      steps: 4,
      direction: 1,
      dice: [2, 2],
      path: [18, 19, 0, 1, 2],
    })
  })

  it('ignores incomplete or non-moving records', () => {
    expect(createPieceMovePlan({ playerIndex: 0, from: 4, steps: 0 })).toBeNull()
    expect(createPieceMovePlan({ from: 4, steps: 2 })).toBeNull()
  })

  it('moves backward for a Trash moment effect', () => {
    expect(createPieceMovePlan({ playerIndex: 0, from: 2, to: 19, steps: -3, cardEffect: true }, 20)).toMatchObject({
      direction: -1,
      steps: 3,
      path: [2, 1, 0, 19],
    })
  })
})

describe('getSpokeFacingAngle', () => {
  it('turns each space label toward the center of the circular board', () => {
    expect(getSpokeFacingAngle(new THREE.Vector3(0, 0, -5))).toBeCloseTo(Math.PI)
    expect(getSpokeFacingAngle(new THREE.Vector3(5, 0, 0))).toBeCloseTo(Math.PI / 2)
    expect(getSpokeFacingAngle(new THREE.Vector3(0, 0, 5))).toBeCloseTo(0)
  })
})

describe('shouldOrbitBoard', () => {
  const idleTurn = { phase: 'turn', idleMs: 2800 }

  it('orbits when a turn is idle or waiting for the other player', () => {
    expect(shouldOrbitBoard(idleTurn)).toBe(true)
  })

  it('holds the view during input, motion, non-turn screens, or reduced motion', () => {
    expect(shouldOrbitBoard({ ...idleTurn, interacting: true })).toBe(false)
    expect(shouldOrbitBoard({ ...idleTurn, movingPiece: true })).toBe(false)
    expect(shouldOrbitBoard({ ...idleTurn, queuedMoves: 1 })).toBe(false)
    expect(shouldOrbitBoard({ ...idleTurn, rolling: true })).toBe(false)
    expect(shouldOrbitBoard({ ...idleTurn, phase: 'activity' })).toBe(false)
    expect(shouldOrbitBoard({ ...idleTurn, reducedMotion: true })).toBe(false)
    expect(shouldOrbitBoard({ phase: 'turn', idleMs: 2799 })).toBe(false)
  })
})

describe('cinematic board camera shots', () => {
  it('frames the dice and coin closely enough to read the interaction', () => {
    const focus = new THREE.Vector3(-2, 1, 0.5)
    const dice = getBoardCameraShotPose('dice', focus)
    const ready = getBoardCameraShotPose('dice-ready', focus)
    const coin = getBoardCameraShotPose('coin', focus)
    expect(dice.target.toArray()).toEqual(focus.toArray())
    expect(dice.position.distanceTo(dice.target)).toBeGreaterThan(9)
    expect(ready.target.toArray()).toEqual(focus.toArray())
    expect(ready.position.distanceTo(ready.target)).toBeGreaterThan(dice.position.distanceTo(dice.target))
    expect(coin.position.distanceTo(coin.target)).toBeLessThan(7)
    const close = getBoardCameraShotPose('coin', focus, 1, 0.58)
    expect(close.position.distanceTo(close.target)).toBeLessThan(coin.position.distanceTo(coin.target))
  })

  it('keeps the piece camera inside the board wall while orbiting the moving token', () => {
    const focus = new THREE.Vector3(0, 0.7, -BOARD_PATH_RADIUS)
    const pose = getBoardCameraShotPose('piece', focus, 2)
    const phonePose = getBoardCameraShotPose('piece', focus, 2, 0, true)
    expect(pose.target.toArray()).toEqual(focus.toArray())
    expect(Math.hypot(pose.position.x, pose.position.z)).toBeLessThan(15.48)
    expect(pose.position.distanceTo(pose.target)).toBeGreaterThan(9)
    expect(Math.hypot(phonePose.position.x, phonePose.position.z)).toBeLessThan(15.48)
    expect(phonePose.position.distanceTo(phonePose.target)).toBeGreaterThan(pose.position.distanceTo(pose.target) * 1.35)
  })
})

describe('landing art and player finishes', () => {
  it('maps each board space to a themed transparent cutout', () => {
    expect(getLandingEffectForSpaceType('heart')).toBe('heart-glow')
    expect(getLandingEffectForSpaceType('oops')).toBe('rose-petals')
    expect(getLandingEffectForSpaceType('connection')).toBe('ribbon-wisp')
    expect(getLandingEffectForSpaceType('duel')).toBe('music-notes')
    expect(getLandingEffectForSpaceType('keepsake')).toBe('keepsake-light')
  })

  it('provides visibly distinct physically based material finishes', () => {
    expect(getPlayerPbrFinish('gold').metalness).toBeGreaterThan(getPlayerPbrFinish('porcelain').metalness)
    expect(getPlayerPbrFinish('velvet').roughness).toBeGreaterThan(getPlayerPbrFinish('satin').roughness)
    expect(getPlayerPbrFinish('unknown')).toEqual(getPlayerPbrFinish('porcelain'))
  })
})

describe('board ambient motion', () => {
  it('keeps the idle orbit slower and lets each space glow breathe', () => {
    expect(BOARD_IDLE_ORBIT_SPEED).toBeLessThan(0.62)
    const dim = getBoardSpaceMotion(0, 0)
    const bright = getBoardSpaceMotion(Math.PI / 2.1, 0)
    expect(bright.glowOpacity).toBeGreaterThan(dim.glowOpacity)
    expect(bright.glowIntensity).toBeGreaterThan(dim.glowIntensity)
    expect(bright.glowIntensity - dim.glowIntensity).toBeGreaterThan(1)
  })
})

describe('makeDiceRollGesture', () => {
  it('turns a swipe on the board dice into direction and throw strength', () => {
    expect(makeDiceRollGesture(40, -30, 80)).toEqual({
      direction: { x: 0.4, y: 0.3 },
      power: 0.5966666666666667,
      durationMs: 80,
      source: 'touch',
    })
  })

  it('gives a direct tap a gentle default throw', () => {
    expect(makeDiceRollGesture(0, 0)).toMatchObject({ direction: { x: 0, y: 0 }, power: 0.18, source: 'touch' })
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

  it('generates a backward ring sequence for Trash effects', () => {
    expect(calculateStepPath(1, -3, 20)).toEqual([1, 0, 19, 18])
  })
})

