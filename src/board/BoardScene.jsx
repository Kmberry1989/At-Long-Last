import { drawBrandIcon } from '../components/brandIcons.js'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  DRACOLoader,
  DRACO_GLTF_CONFIG,
} from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { resolvePlayerAvatar } from '../features/couple/playerAvatar.js'
import { BOARD_SPACES } from '../features/session/boardConfig.js'
import { getBoardCardPilePalette, getBoardThemeById, getBoardThemeForRound } from './boardThemes.js'
import { createBoardEnvironment } from './boardEnvironment.js'

export const BOARD_INSET_RADIUS = 8.5
export const BOARD_PATH_RADIUS = 11.8
export const BOARD_IDLE_ORBIT_SPEED = 0.2
export const DICE_HOME_BASE_RADIUS = 1.94
export const DICE_HOME_BASE_INNER_RADIUS = 1.82
export const DICE_HOME_BASE_HEIGHT = 0.58
export const DICE_HOME_BASE_FLOOR_THICKNESS = 0.16
export const DICE_HOME_BASE_FLOAT_HEIGHT = 0.72
export const DICE_ROLL_DURATION_SECONDS = 2.05
export const BOARD_SKIN_SURFACE_Y = 0.126
export const BOARD_CARD_PILE_LABEL_Y = BOARD_SKIN_SURFACE_Y + 0.018
export const BOARD_CARD_PILE_RADIUS = 2.5
export const BOARD_CARD_PILE_DOT_COUNT = 64
export const BOARD_CARD_PILE_DOT_SIZE = 0.18
export const BOARD_CARD_PILE_POSITIONS = {
  draw: [1.05, -3.45],
  discard: [1.05, 3.45],
}

export function getDiceHomeBaseMotion(elapsed, reducedMotion = false) {
  const bob = reducedMotion ? 0 : Math.sin(elapsed * 0.92 + 0.7)
  return {
    lift: DICE_HOME_BASE_FLOAT_HEIGHT + bob * 0.09,
    shadowOpacity: 0.32 - bob * 0.035,
    shadowScale: 1 + bob * 0.045,
  }
}

const TILE_STYLES = {
  connection: {
    texture: 'rose',
    tint: '#eadde8',
  },
  duel: {
    texture: 'wine',
    tint: '#cdd5ee',
  },
  heart: {
    texture: 'rose',
    tint: '#ffe6e9',
  },
  keepsake: {
    texture: 'wine',
    tint: '#ead9ef',
  },
  oops: {
    texture: 'wine',
    tint: '#f1d5dc',
  },
}

export function getCircularBoardPosition(index, count = BOARD_SPACES.length, radius = BOARD_PATH_RADIUS) {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2
  return new THREE.Vector3(Math.cos(angle) * radius, 0.35, Math.sin(angle) * radius)
}

export function getBoardSpaceMotion(elapsed, index, { occupied = false, reducedMotion = false } = {}) {
  const phase = index * 2.399963229728653
  const pulse = reducedMotion ? 0.5 : (Math.sin(elapsed * 1.05 + phase) + 1) / 2
  return {
    bob: reducedMotion ? 0 : Math.sin(elapsed * (1.1 + (index % 5) * 0.075) + phase) * 0.075,
    sinkTarget: occupied ? 0.2 : 0,
    glowOpacity: occupied ? 0.72 + pulse * 0.27 : 0.34 + pulse * 0.42,
    glowIntensity: occupied ? 0.95 + pulse * 2 : 0.15 + pulse * 2.2,
  }
}

function buildBoardPath() {
  return BOARD_SPACES.map((space, index) => ({
    ...space,
    position: getCircularBoardPosition(index),
  }))
}

export function getBoardPathSegments(boardPath) {
  return boardPath.map((space, index) => {
    const nextIndex = (index + 1) % boardPath.length
    const next = boardPath[nextIndex]
    const delta = next.position.clone().sub(space.position)
    return {
      fromIndex: index,
      toIndex: nextIndex,
      center: space.position.clone().add(next.position).multiplyScalar(0.5),
      length: delta.length(),
      angle: Math.atan2(delta.x, delta.z),
    }
  })
}

export function getTokenTargetPosition(boardPath, positionIndices, playerIndex) {
  const rawSpaceIndex = Number(positionIndices?.[playerIndex]) || 0
  const spaceIndex =
    ((Math.round(rawSpaceIndex) % boardPath.length) + boardPath.length) %
    boardPath.length
  const basePosition = boardPath[spaceIndex].position.clone()
  const colocatedPlayerIndices = (positionIndices || [])
    .map((positionIndex, index) => ({
      index,
      positionIndex: Number(positionIndex) || 0,
    }))
    .filter(({ positionIndex }) => positionIndex === rawSpaceIndex)
    .map(({ index }) => index)

  if (colocatedPlayerIndices.length < 2) {
    return basePosition
  }

  const previousPosition =
    boardPath[(spaceIndex - 1 + boardPath.length) % boardPath.length].position
  const nextPosition =
    boardPath[(spaceIndex + 1) % boardPath.length].position
  const tangent = nextPosition
    .clone()
    .sub(previousPosition)
    .setY(0)

  if (tangent.lengthSq() === 0) {
    tangent.set(-basePosition.z, 0, basePosition.x)
  }
  tangent.normalize()

  const colocatedRank = colocatedPlayerIndices.indexOf(playerIndex)
  const centeredRank =
    colocatedRank - (colocatedPlayerIndices.length - 1) / 2
  return basePosition.addScaledVector(tangent, centeredRank * 1.28)
}

function makeTileMarkTexture(label, type) {
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 320
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = 'rgba(54, 20, 40, 0.72)'
  ctx.lineWidth = 10
  ctx.fillStyle = '#f1cf91'
  ctx.font = "900 88px 'Avenir Next', sans-serif"
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const icon = { heart: 'heart', oops: 'trade', duel: 'duel', keepsake: 'gift', connection: 'promise' }[type] || 'sparkle'
  ctx.strokeStyle = '#f1cf91'
  drawBrandIcon(ctx, icon, canvas.width / 2, 105, 108)

  ctx.strokeStyle = 'rgba(54, 20, 40, 0.78)'
  ctx.lineWidth = 7
  ctx.fillStyle = '#fff5df'
  ctx.font = "800 34px 'Avenir Next', sans-serif"

  const words = label.split(' ')
  words.forEach((word, index) => {
    const y = 192 + index * 42
    ctx.strokeText(word, canvas.width / 2, y)
    ctx.fillText(word, canvas.width / 2, y)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function makeSpaceGlowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')
  const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255,255,255,0.18)')
  gradient.addColorStop(0.55, 'rgba(255,255,255,0.48)')
  gradient.addColorStop(0.82, 'rgba(255,255,255,0.7)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 128, 128)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function configureVelvetTexture(texture, repeatX, repeatY) {
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  texture.anisotropy = 8
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function makePileLabelTexture(kind, theme) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const context = canvas.getContext('2d')
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = theme.cardSkin.ink
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.shadowColor = 'rgba(255, 244, 220, 0.62)'
  context.shadowBlur = 7
  context.font = "900 82px 'Avenir Next', sans-serif"
  context.fillText(kind === 'draw' ? 'DRAW' : 'DISCARD', 256, 64)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function makeCardBackTexture() {
  const texture = new THREE.TextureLoader().load('/assets/game-ui/moment-card-back.png')
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function createBoardCardPileMarker(theme, kind, color) {
  const group = new THREE.Group()
  const isDrawPile = kind === 'draw'
  const [x, z] = BOARD_CARD_PILE_POSITIONS[kind]
  group.name = `board-card-${kind}-pile-marker`
  group.position.set(x, 0, z)
  group.userData.cardKind = isDrawPile ? 'Trash or Treasure' : 'resolved cards'

  const dotPositions = []
  const dotCount = BOARD_CARD_PILE_DOT_COUNT
  for (let index = 0; index < dotCount; index += 1) {
    const angle = (index / dotCount) * Math.PI * 2
    dotPositions.push(
      Math.cos(angle) * BOARD_CARD_PILE_RADIUS,
      BOARD_CARD_PILE_LABEL_Y + 0.006,
      Math.sin(angle) * BOARD_CARD_PILE_RADIUS,
    )
  }
  const dottedLine = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(dotPositions, 3)),
    new THREE.PointsMaterial({ color, size: BOARD_CARD_PILE_DOT_SIZE, sizeAttenuation: true, transparent: true, opacity: 1, depthWrite: false }),
  )
  dottedLine.name = `${kind}-pile-dotted-outline`
  dottedLine.renderOrder = 4
  group.add(dottedLine)

  const cardCount = isDrawPile ? 3 : 1
  const cardTexture = makeCardBackTexture()
  for (let index = 0; index < cardCount; index += 1) {
    const card = new THREE.Group()
    card.name = `${kind}-pile-card-${index + 1}`
    card.position.set(isDrawPile ? (index - 1) * 0.045 : 0, 0.225 + index * 0.125, isDrawPile ? (1 - index) * 0.045 : 0)
    card.rotation.y = isDrawPile ? -0.16 : 0.12
    const body = new THREE.Mesh(
      new RoundedBoxGeometry(2, 0.16, 2.24, 0.08, 4),
      new THREE.MeshStandardMaterial({
        color: theme.cardSkin.bottom,
        emissive: isDrawPile ? color : theme.cardSkin.accent,
        emissiveIntensity: isDrawPile ? 0.035 : 0.06,
        metalness: 0.12,
        roughness: 0.72,
      }),
    )
    card.castShadow = true
    card.receiveShadow = true
    body.castShadow = true
    body.receiveShadow = true
    card.add(body)
    const graphic = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 2.02),
      new THREE.MeshBasicMaterial({ map: cardTexture, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -1 }),
    )
    graphic.name = isDrawPile
      ? `${kind}-pile-card-${index + 1}-trash-treasure-crest`
      : `${kind}-pile-card-${index + 1}-resolved-face`
    graphic.rotation.x = -Math.PI / 2
    graphic.position.y = 0.068
    card.add(graphic)
    group.add(card)
  }

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 0.62),
    new THREE.MeshBasicMaterial({ map: makePileLabelTexture(kind, theme), transparent: true, opacity: 0.88, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2 }),
  )
  label.name = `${kind}-pile-label`
  label.rotation.x = -Math.PI / 2
    label.position.set(0, BOARD_CARD_PILE_LABEL_Y, 1.72)
  label.renderOrder = 5
  group.add(label)

  return group
}

export function resolveDiceValues(roll, dice) {
  if (Array.isArray(dice) && dice.length === 2 && dice[0] && dice[1]) {
    return [
      Math.min(6, Math.max(1, Math.round(Number(dice[0])) || 1)),
      Math.min(6, Math.max(1, Math.round(Number(dice[1])) || 1)),
    ]
  }

  const numericRoll = Math.min(12, Math.max(2, Math.round(Number(roll)) || 2))
  const first = Math.min(6, Math.max(1, Math.floor(numericRoll / 2)))
  const second = Math.min(6, Math.max(1, numericRoll - first))
  return [first, second]
}

export function makeDiceRollGesture(deltaX, deltaY, durationMs = 1) {
  const distance = Math.hypot(deltaX, deltaY)
  return {
    direction: { x: Math.max(-1, Math.min(1, deltaX / 100)), y: deltaY === 0 ? 0 : Math.max(-1, Math.min(1, -deltaY / 100)) },
    power: Math.max(0.18, Math.min(1, 0.18 + distance / 120)),
    durationMs: Math.max(1, durationMs),
    source: 'touch',
  }
}

export function calculateStepPath(from, steps, boardSize = 20) {
  const path = []
  const start = ((from % boardSize) + boardSize) % boardSize
  const count = Math.abs(Math.trunc(Number(steps) || 0))
  const direction = Math.sign(Number(steps) || 1)
  for (let i = 0; i <= count; i += 1) {
    path.push((start + direction * i + boardSize) % boardSize)
  }
  return path
}

export function createPieceMovePlan(lastMove, boardSize = 20) {
  const from = Number(lastMove?.from)
  const signedSteps = Math.trunc(Number(lastMove?.steps) || 0)
  const steps = Math.abs(signedSteps)
  const direction = Math.sign(signedSteps) || 1
  const playerIndex = Number(lastMove?.playerIndex)
  if (!Number.isInteger(from) || !Number.isInteger(playerIndex) || steps < 1) return null
  return {
    key: [playerIndex, from, lastMove?.to, direction, steps].join(':'),
    playerIndex,
    steps,
    direction,
    dice: lastMove?.dice || null,
    path: calculateStepPath(from, direction * steps, boardSize),
  }
}

export function getSpokeFacingAngle(position) {
  return Math.atan2(position?.x || 0, position?.z || 0)
}

export function shouldOrbitBoard({
  phase,
  rolling = false,
  movingPiece = false,
  queuedMoves = 0,
  interacting = false,
  reducedMotion = false,
  idleMs = 0,
}) {
  return phase === 'turn' && !rolling && !movingPiece && queuedMoves === 0 &&
    !interacting && !reducedMotion && idleMs >= 2800
}

function createSingleDie(value, skin, isDie2 = false) {
  const die = new THREE.Group()
  const bodyGeometry = new RoundedBoxGeometry(0.96, 0.96, 0.96, 5, 0.16)
  const body = new THREE.Mesh(
    bodyGeometry,
    new THREE.MeshStandardMaterial({
      color: isDie2 ? skin.alternate : skin.face,
      emissive: isDie2 ? skin.alternate : skin.face,
      emissiveIntensity: 0.12,
      metalness: 0.22,
      roughness: 0.48,
    }),
  )
  body.castShadow = true
  body.receiveShadow = true
  die.add(body)
  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(bodyGeometry, 34),
    new THREE.LineBasicMaterial({ color: skin.edge, transparent: true, opacity: 0.72 }),
  )
  edge.scale.setScalar(1.002)
  die.add(edge)

  const pipLayouts = {
    1: [[0, 0]],
    2: [[-0.21, -0.21], [0.21, 0.21]],
    3: [[-0.23, -0.23], [0, 0], [0.23, 0.23]],
    4: [[-0.21, -0.21], [0.21, -0.21], [-0.21, 0.21], [0.21, 0.21]],
    5: [[-0.23, -0.23], [0.23, -0.23], [0, 0], [-0.23, 0.23], [0.23, 0.23]],
    6: [[-0.23, -0.26], [-0.23, 0], [-0.23, 0.26], [0.23, -0.26], [0.23, 0], [0.23, 0.26]],
  }
  const pipMaterial = new THREE.MeshStandardMaterial({ color: skin.pip, emissive: skin.pip, emissiveIntensity: 0.22, metalness: 0.42, roughness: 0.28 })
  const pipGeometry = new THREE.SphereGeometry(0.07, 14, 10)

  // A die is marked on every face. Opposites sum to seven, and the resting
  // rotation below turns the rolled value toward the camera-facing top.
  const faces = [
    { value: 1, axis: 'y', sign: 1 }, { value: 6, axis: 'y', sign: -1 },
    { value: 2, axis: 'x', sign: 1 }, { value: 5, axis: 'x', sign: -1 },
    { value: 3, axis: 'z', sign: 1 }, { value: 4, axis: 'z', sign: -1 },
  ]
  const pipGroups = {}
  faces.forEach(({ value: faceValue, axis, sign }) => {
    const group = new THREE.Group()
    pipLayouts[faceValue].forEach(([a, b]) => {
      const pip = new THREE.Mesh(pipGeometry, pipMaterial)
      if (axis === 'y') pip.position.set(a, sign * 0.485, b)
      else if (axis === 'x') pip.position.set(sign * 0.485, a, b)
      else pip.position.set(a, b, sign * 0.485)
      pip.castShadow = true
      group.add(pip)
    })
    pipGroups[faceValue] = group
    die.add(group)
  })
  die.userData.pipGroups = pipGroups
  setPrimitiveDieValue(die, value)
  return die
}

function setPrimitiveDieValue(die, value) {
  if (!die) {
    return
  }

  const resolvedValue = Math.min(6, Math.max(1, Number(value) || 1))
  // +Y starts as one. Rotate the corresponding physical face upward so the
  // result remains readable while the dice rest inside the raised bowl.
  const topOrientations = {
    1: [0, 0, 0], 2: [0, 0, Math.PI / 2], 3: [-Math.PI / 2, 0, 0],
    4: [Math.PI / 2, 0, 0], 5: [0, 0, -Math.PI / 2], 6: [Math.PI, 0, 0],
  }
  Object.values(die.userData.pipGroups || {}).forEach(group => { group.visible = true })
  const [x, y, z] = topOrientations[resolvedValue]
  const topFace = new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z))
  const displayYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), die.userData.displayYaw || 0)
  die.quaternion.copy(displayYaw).multiply(topFace)
  die.userData.value = resolvedValue
}

function createPrimitiveDicePair(initialValues = [1, 1], diceSkin = getBoardThemeById('cozy').diceSkin) {
  const dicePair = new THREE.Group()
  const die1 = createSingleDie(initialValues[0], diceSkin, false)
  const die2 = createSingleDie(initialValues[1], diceSkin, true)

  die1.position.set(-2.0, 0.62, 0.45)
  die1.userData.displayYaw = 0.32
  die1.rotation.set(0, 0, 0)
  setPrimitiveDieValue(die1, initialValues[0])

  die2.position.set(-3.25, 0.62, 0.82)
  die2.userData.displayYaw = -0.26
  die2.rotation.set(0, 0, 0)
  setPrimitiveDieValue(die2, initialValues[1])

  dicePair.add(die1)
  dicePair.add(die2)

  dicePair.userData.die1 = die1
  dicePair.userData.die2 = die2
  dicePair.userData.values = [initialValues[0], initialValues[1]]
  dicePair.userData.value = initialValues[0] + initialValues[1]

  return dicePair
}

function setPrimitiveDiceValues(dicePair, values) {
  if (!dicePair?.userData?.die1 || !dicePair?.userData?.die2) return
  const [val1, val2] = values
  setPrimitiveDieValue(dicePair.userData.die1, val1)
  setPrimitiveDieValue(dicePair.userData.die2, val2)
  dicePair.userData.values = [val1, val2]
  dicePair.userData.value = val1 + val2
}

function settlePrimitiveDice(dicePair, values) {
  setPrimitiveDiceValues(dicePair, values)
  const { die1, die2 } = dicePair.userData
  die1.position.set(-2.0, 0.62, 0.45)
  die1.userData.displayYaw = 0.32
  setPrimitiveDieValue(die1, values[0])
  die1.scale.setScalar(1)

  die2.position.set(-3.25, 0.62, 0.82)
  die2.userData.displayYaw = -0.26
  setPrimitiveDieValue(die2, values[1])
  die2.scale.setScalar(1)
}

export function createPrimitiveDie(value, diceSkin) {
  return createPrimitiveDicePair(resolveDiceValues(value, Array.isArray(value) ? value : undefined), diceSkin)
}

export function settlePrimitiveDie(die, value) {
  if (die?.userData?.die1) {
    settlePrimitiveDice(die, resolveDiceValues(value))
  } else {
    setPrimitiveDieValue(die, value)
  }
}

function createFallbackPawn(color) {
  const group = new THREE.Group()
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.28, 18),
    new THREE.MeshStandardMaterial({ color: '#ffffff' }),
  )
  base.position.y = 0.14
  base.castShadow = true
  group.add(base)

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.36, 0.8, 8, 16),
    new THREE.MeshStandardMaterial({ color }),
  )
  body.position.y = 0.96
  body.castShadow = true
  group.add(body)

  return group
}

function createPlayerPositionRing(color) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.075, 10, 28),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.34,
      metalness: 0.18,
      roughness: 0.3,
    }),
  )
  ring.position.y = 0.04
  ring.rotation.x = Math.PI / 2
  ring.castShadow = true
  return ring
}

function disposeObject3D(root) {
  const geometries = new Set()
  const materials = new Set()
  const textures = new Set()

  root.traverse((object) => {
    if (object.geometry) {
      geometries.add(object.geometry)
    }

    const objectMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material]
    objectMaterials.forEach((material) => {
      if (!material) {
        return
      }
      materials.add(material)
      Object.values(material).forEach((value) => {
        if (value?.isTexture) {
          textures.add(value)
        }
      })
    })
  })

  textures.forEach((texture) => texture.dispose())
  materials.forEach((material) => material.dispose())
  geometries.forEach((geometry) => geometry.dispose())
}

function tintModel(model, color) {
  const playerColor = new THREE.Color(color)
  model.traverse((child) => {
    if (!child.isMesh) {
      return
    }

    child.castShadow = true
    child.receiveShadow = true
    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material]
    const tintedMaterials = materials.map((material) => {
      const tinted = material.clone()
      tinted.color?.lerp(playerColor, 0.32)
      return tinted
    })
    child.material = Array.isArray(child.material)
      ? tintedMaterials
      : tintedMaterials[0]
  })
}

function fitModel(model, targetSize) {
  model.updateMatrixWorld(true)
  const initialBox = new THREE.Box3().setFromObject(model)
  const initialSize = initialBox.getSize(new THREE.Vector3())
  const longestSide = Math.max(initialSize.x, initialSize.y, initialSize.z)
  if (longestSide > 0) {
    model.scale.multiplyScalar(targetSize / longestSide)
  }

  model.updateMatrixWorld(true)
  const fittedBox = new THREE.Box3().setFromObject(model)
  const center = fittedBox.getCenter(new THREE.Vector3())
  model.position.x -= center.x
  model.position.y -= fittedBox.min.y
  model.position.z -= center.z
}

export function BoardScene({
  activePlayerIndex,
  boardState,
  dice = null,
  lastMove = null,
  lastRoll,
  onPieceStep = null,
  onPieceMoveComplete = null,
  onDiceImpact = null,
  onDiceRattle = null,
  onDiceCast = null,
  onRoll = null,
  canRoll = false,
  onReady = null,
  rollGesture = null,
  pacingMode = 'freeFlow',
  phase = null,
  players,
  positions,
  round,
  rolling = false,
  themeId = null,
}) {
  const mountRef = useRef(null)
  const dieRef = useRef(null)
  const lastRollRef = useRef(lastRoll)
  const dicePropRef = useRef(dice)
  const onPieceStepRef = useRef(onPieceStep)
  const onPieceMoveCompleteRef = useRef(onPieceMoveComplete)
  const onDiceImpactRef = useRef(onDiceImpact)
  const onDiceRattleRef = useRef(onDiceRattle)
  const onDiceCastRef = useRef(onDiceCast)
  const onRollRef = useRef(onRoll)
  const canRollRef = useRef(canRoll)
  const onReadyRef = useRef(onReady)
  const rollGestureRef = useRef(rollGesture)
  const phaseRef = useRef(phase)
  const pieceMoveQueueRef = useRef([])
  const observedMoveKeyRef = useRef(createPieceMovePlan(lastMove, 20)?.key || null)
  const boardPath = useMemo(() => buildBoardPath(), [])
  const boardTheme = useMemo(
    () => getBoardThemeById(themeId) || getBoardThemeForRound(round),
    [themeId, round],
  )
  const targetIndicesRef = useRef(positions)
  const activePlayerIndexRef = useRef(activePlayerIndex)
  const rollingRef = useRef(rolling)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])
  const boardStateKey = useMemo(
    () =>
      JSON.stringify({
        playfulStickerIds: boardState?.playfulStickerIds || [],
        spicyGlowLevel: boardState?.spicyGlowLevel || 0,
        tenderStars: boardState?.tenderStars || 0,
      }),
    [boardState],
  )

  useEffect(() => {
    targetIndicesRef.current = positions
  }, [positions])

  useEffect(() => {
    activePlayerIndexRef.current = activePlayerIndex
  }, [activePlayerIndex])

  useEffect(() => {
    rollingRef.current = rolling
  }, [rolling])

  useEffect(() => {
    dicePropRef.current = dice
  }, [dice])

  useEffect(() => {
    const move = createPieceMovePlan(lastMove, boardPath.length)
    if (!move || move.key === observedMoveKeyRef.current) return
    observedMoveKeyRef.current = move.key
    pieceMoveQueueRef.current.push(move)
  }, [boardPath.length, lastMove])

  useEffect(() => {
    onPieceStepRef.current = onPieceStep
  }, [onPieceStep])

  useEffect(() => {
    onPieceMoveCompleteRef.current = onPieceMoveComplete
  }, [onPieceMoveComplete])

  useEffect(() => {
    onDiceImpactRef.current = onDiceImpact
    onDiceRattleRef.current = onDiceRattle
    onDiceCastRef.current = onDiceCast
    onRollRef.current = onRoll
    canRollRef.current = canRoll
    onReadyRef.current = onReady
    rollGestureRef.current = rollGesture
  }, [canRoll, onDiceCast, onDiceImpact, onDiceRattle, onReady, onRoll, rollGesture])

  useEffect(() => {
    const canvas = mountRef.current?.querySelector('canvas')
    if (!canvas) return
    canvas.setAttribute('role', canRoll ? 'button' : 'img')
    canvas.setAttribute('aria-label', canRoll ? 'Roll dice' : 'Game board dice')
    canvas.tabIndex = canRoll ? 0 : -1
    canvas.style.cursor = canRoll ? 'pointer' : 'grab'
  }, [canRoll])

  useEffect(() => {
    lastRollRef.current = lastRoll
    const die = dieRef.current
    if (!die) {
      return
    }

    if (rolling) {
      die.userData.startRoll?.(lastRoll || 2, dicePropRef.current)
    } else {
      die.userData.finishRoll?.(lastRoll || 2, dicePropRef.current)
    }
  }, [dice, lastMove, lastRoll, rolling])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) {
      return undefined
    }

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(boardTheme.environment.bottom, 0.027)
    const environment = createBoardEnvironment(boardTheme.environment)
    scene.add(environment.sky, environment.particles)

    const camera = new THREE.PerspectiveCamera(
      46,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    )
    camera.position.set(0, 16, 18)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)
    let disposed = false
    let animationFrameId = null
    let manualTimeOffset = 0
    let latestSceneTime = performance.now()
    let manualView = false
    let lastViewInputAt = latestSceneTime
    let userInteracting = false
    let previousFrameAt = latestSceneTime

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.075
    controls.enablePan = true
    controls.enableRotate = true
    controls.enableZoom = true
    controls.minDistance = 9
    controls.maxDistance = 34
    controls.minPolarAngle = 0.28
    controls.maxPolarAngle = 1.46
    controls.panSpeed = 0.72
    controls.rotateSpeed = 0.68
    controls.zoomSpeed = 0.82
    controls.autoRotateSpeed = BOARD_IDLE_ORBIT_SPEED
    controls.screenSpacePanning = true
    controls.target.set(0, 0, 0)
    const boardCenter = new THREE.Vector3(0, 0, 0)
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE
    controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY
    controls.mouseButtons.RIGHT = THREE.MOUSE.PAN
    controls.touches.ONE = THREE.TOUCH.ROTATE
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN
    controls.addEventListener('start', () => {
      manualView = true
      userInteracting = true
      lastViewInputAt = performance.now() + manualTimeOffset
    })
    controls.addEventListener('end', () => {
      userInteracting = false
      lastViewInputAt = performance.now() + manualTimeOffset
    })

    const ambient = new THREE.AmbientLight('#ffece2', 1.6)
    scene.add(ambient)

    const key = new THREE.DirectionalLight('#ffffff', 2)
    key.position.set(8, 14, 10)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.camera.left = -19
    key.shadow.camera.right = 19
    key.shadow.camera.top = 19
    key.shadow.camera.bottom = -19
    key.shadow.normalBias = 0.025
    key.shadow.radius = 3
    scene.add(key)

    const fill = new THREE.PointLight(boardTheme.environment.glow, 1.8, 40)
    fill.position.set(-10, 8, -2)
    scene.add(fill)

    const textureLoader = new THREE.TextureLoader()
    const tabletopVelvet = configureVelvetTexture(
      textureLoader.load(boardTheme.surfaces.tabletop.texture),
      ...boardTheme.surfaces.tabletop.repeat,
    )
    const insetVelvet = configureVelvetTexture(
      textureLoader.load(boardTheme.surfaces.inset.texture),
      ...boardTheme.surfaces.inset.repeat,
    )
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(16, 16, 1.2, 40),
      new THREE.MeshStandardMaterial({
        map: tabletopVelvet,
        color: boardTheme.surfaces.tabletop.color,
        metalness: 0.02,
        roughness: 0.94,
      }),
    )
    floor.receiveShadow = true
    floor.position.y = -0.65
    scene.add(floor)

    const boardFoot = new THREE.Mesh(
      new THREE.CylinderGeometry(16.45, 16.65, 0.55, 64),
      new THREE.MeshStandardMaterial({
        color: '#4a273b',
        metalness: 0.16,
        roughness: 0.52,
      }),
    )
    boardFoot.position.y = -1.42
    boardFoot.receiveShadow = true
    scene.add(boardFoot)

    const outerRim = new THREE.Mesh(
      new THREE.TorusGeometry(15.78, 0.16, 14, 96),
      new THREE.MeshStandardMaterial({
        color: '#d6ae72',
        metalness: 0.68,
        roughness: 0.3,
      }),
    )
    outerRim.rotation.x = Math.PI / 2
    outerRim.position.y = 0.04
    outerRim.castShadow = true
    scene.add(outerRim)

    const velvetInset = new THREE.Mesh(
      new THREE.CylinderGeometry(BOARD_INSET_RADIUS, BOARD_INSET_RADIUS, 0.2, 96),
      new THREE.MeshStandardMaterial({
        map: insetVelvet,
        color: boardTheme.surfaces.inset.color,
        metalness: 0.02,
        roughness: 0.9,
      }),
    )
    velvetInset.position.y = 0.02
    velvetInset.receiveShadow = true
    scene.add(velvetInset)

    const insetPiping = new THREE.Mesh(
      new THREE.TorusGeometry(BOARD_INSET_RADIUS + 0.02, 0.08, 12, 128),
      new THREE.MeshStandardMaterial({
        color: '#d8aa61',
        metalness: 0.68,
        roughness: 0.32,
      }),
    )
    insetPiping.rotation.x = Math.PI / 2
    insetPiping.position.y = 0.14
    insetPiping.castShadow = true
    scene.add(insetPiping)

    // A round open box with a velvet floor gives the dice a clear home base.
    const diceBox = new THREE.Group()
    diceBox.name = 'themed-dice-home-base'
    diceBox.position.set(-2.62, DICE_HOME_BASE_FLOAT_HEIGHT, 0.64)
    const boxSide = new THREE.Mesh(
      new THREE.CylinderGeometry(
        DICE_HOME_BASE_RADIUS,
        DICE_HOME_BASE_RADIUS,
        DICE_HOME_BASE_HEIGHT,
        96,
        1,
        true,
      ),
      new THREE.MeshStandardMaterial({
        color: boardTheme.diceSkin.alternate,
        metalness: 0.32,
        roughness: 0.48,
        side: THREE.DoubleSide,
      }),
    )
    boxSide.position.y = 0.36
    boxSide.castShadow = true
    boxSide.receiveShadow = true
    diceBox.add(boxSide)
    const boxBottom = new THREE.Mesh(
      new THREE.CylinderGeometry(
        DICE_HOME_BASE_RADIUS,
        DICE_HOME_BASE_RADIUS,
        DICE_HOME_BASE_FLOOR_THICKNESS,
        96,
      ),
      new THREE.MeshStandardMaterial({
        color: boardTheme.diceSkin.alternate,
        metalness: 0.24,
        roughness: 0.62,
      }),
    )
    boxBottom.name = 'themed-dice-home-base-bottom'
    boxBottom.position.y = 0.08
    boxBottom.castShadow = true
    boxBottom.receiveShadow = true
    diceBox.add(boxBottom)
    const boxFabric = new THREE.Mesh(
      new THREE.CircleGeometry(DICE_HOME_BASE_INNER_RADIUS, 96),
      new THREE.MeshStandardMaterial({
        map: insetVelvet,
        color: boardTheme.diceSkin.fabric || boardTheme.surfaces.inset.color,
        metalness: 0.01,
        roughness: 0.94,
      }),
    )
    boxFabric.rotation.x = -Math.PI / 2
    boxFabric.position.y = 0.17
    boxFabric.receiveShadow = true
    diceBox.add(boxFabric)
    const boxRim = new THREE.Mesh(
      new THREE.TorusGeometry(DICE_HOME_BASE_RADIUS, 0.075, 10, 96),
      new THREE.MeshStandardMaterial({
        color: boardTheme.diceSkin.edge,
        emissive: boardTheme.diceSkin.edge,
        emissiveIntensity: 0.28,
        metalness: 0.76,
        roughness: 0.3,
      }),
    )
    boxRim.rotation.x = Math.PI / 2
    boxRim.position.y = DICE_HOME_BASE_HEIGHT + 0.07
    boxRim.castShadow = true
    diceBox.add(boxRim)
    const innerBoxStitch = new THREE.Mesh(
      new THREE.TorusGeometry(DICE_HOME_BASE_INNER_RADIUS, 0.018, 6, 96),
      new THREE.MeshBasicMaterial({ color: '#fff0cf', transparent: true, opacity: 0.58 }),
    )
    innerBoxStitch.rotation.x = Math.PI / 2
    innerBoxStitch.position.y = 0.185
    diceBox.add(innerBoxStitch)
    scene.add(diceBox)

    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = 128
    shadowCanvas.height = 128
    const shadowContext = shadowCanvas.getContext('2d')
    const shadowGradient = shadowContext.createRadialGradient(64, 64, 12, 64, 64, 62)
    shadowGradient.addColorStop(0, 'rgba(8, 5, 12, 0.52)')
    shadowGradient.addColorStop(0.48, 'rgba(8, 5, 12, 0.3)')
    shadowGradient.addColorStop(1, 'rgba(8, 5, 12, 0)')
    shadowContext.fillStyle = shadowGradient
    shadowContext.fillRect(0, 0, 128, 128)
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas)
    const diceShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(DICE_HOME_BASE_RADIUS * 3.15, DICE_HOME_BASE_RADIUS * 3.15),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: 0.32 }),
    )
    diceShadow.name = 'dice-home-base-soft-shadow'
    diceShadow.rotation.x = -Math.PI / 2
    diceShadow.position.set(-2.62, 0.18, 0.64)
    diceShadow.renderOrder = 1
    scene.add(diceShadow)

    const dice = createPrimitiveDicePair(resolveDiceValues(lastRollRef.current || 2, dicePropRef.current), boardTheme.diceSkin)
    let dieRoll = null
    dice.userData.startRoll = (value, explicitDice) => {
      const finalValues = Array.isArray(explicitDice) ? resolveDiceValues(value, explicitDice) : null
      if (dieRoll) {
        if (finalValues) dieRoll.finalValues = finalValues
        return
      }
      dieRoll = {
        finalValues,
        startedAt: latestSceneTime,
        gesture: rollGestureRef.current,
        lastImpactStep: -1,
      }
    }
    dice.userData.finishRoll = (value, explicitDice) => {
      dieRoll = null
      settlePrimitiveDice(dice, resolveDiceValues(value, explicitDice))
    }
    dieRef.current = dice
    scene.add(dice)

    const canvas = renderer.domElement
    const raycaster = new THREE.Raycaster()
    const pointerNdc = new THREE.Vector2()
    let activeDicePointer = null
    let lastRattleAt = 0
    const projectPointer = (event) => {
      const bounds = canvas.getBoundingClientRect()
      pointerNdc.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      )
      raycaster.setFromCamera(pointerNdc, camera)
    }
    const hitsDice = (event) => {
      projectPointer(event)
      return raycaster.intersectObject(dice, true).length > 0
    }
    if (import.meta.env.DEV) {
      window.__atLongLastHitDice = (x, y) => hitsDice({ clientX: x, clientY: y })
    }
    const consumePointer = (event) => {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation?.()
    }
    const vibrate = (duration = 12) => {
      try { navigator.vibrate?.(duration) } catch { /* Haptics are optional. */ }
    }
    const handleDicePointerDown = (event) => {
      const hit = hitsDice(event)
      if (!event.isPrimary || event.button !== 0 || activeDicePointer || !canRollRef.current || !hit) return
      consumePointer(event)
      activeDicePointer = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() }
      dice.userData.touch = { startedAt: activeDicePointer.time, x: 0, y: 0 }
      controls.enabled = false
      canvas.style.cursor = 'grabbing'
      try { canvas.setPointerCapture(event.pointerId) } catch { /* Pointer capture is not available everywhere. */ }
      onDiceRattleRef.current?.({ energy: 0.18 })
      lastRattleAt = performance.now()
      vibrate(12)
    }
    const handleDicePointerMove = (event) => {
      if (activeDicePointer?.id === event.pointerId) {
        consumePointer(event)
        const x = event.clientX - activeDicePointer.x
        const y = event.clientY - activeDicePointer.y
        dice.userData.touch = { ...dice.userData.touch, x, y }
        const now = performance.now()
        const distance = Math.hypot(x, y)
        if (distance > 6 && now - lastRattleAt > 75) {
          onDiceRattleRef.current?.({ energy: Math.min(1, distance / 100) })
          lastRattleAt = now
          vibrate(9)
        }
        return
      }
      if (canRollRef.current) canvas.style.cursor = hitsDice(event) ? 'pointer' : 'grab'
    }
    const handleDicePointerUp = (event) => {
      if (activeDicePointer?.id !== event.pointerId) return
      consumePointer(event)
      const start = activeDicePointer
      const deltaX = event.clientX - start.x
      const deltaY = event.clientY - start.y
      activeDicePointer = null
      dice.userData.touch = null
      controls.enabled = true
      canvas.style.cursor = canRollRef.current ? 'pointer' : 'grab'
      try { canvas.releasePointerCapture(event.pointerId) } catch { /* Already released by the browser. */ }
      if (!canRollRef.current) return
      const gesture = makeDiceRollGesture(deltaX, deltaY, performance.now() - start.time)
      onDiceCastRef.current?.()
      vibrate(28)
      onRollRef.current?.(gesture)
    }
    const handleDicePointerCancel = (event) => {
      if (activeDicePointer?.id !== event.pointerId) return
      consumePointer(event)
      activeDicePointer = null
      dice.userData.touch = null
      controls.enabled = true
      settlePrimitiveDice(dice, dice.userData.values)
    }
    const handleDiceKeyDown = (event) => {
      if (!canRollRef.current || (event.key !== ' ' && event.key !== 'Enter')) return
      event.preventDefault()
      event.stopPropagation()
      onDiceCastRef.current?.()
      onRollRef.current?.({ direction: { x: 0, y: -0.2 }, power: 0.42, source: 'keyboard' })
    }
    canvas.addEventListener('pointerdown', handleDicePointerDown, true)
    canvas.addEventListener('pointermove', handleDicePointerMove, true)
    canvas.addEventListener('pointerup', handleDicePointerUp, true)
    canvas.addEventListener('pointercancel', handleDicePointerCancel, true)
    canvas.addEventListener('keydown', handleDiceKeyDown)
    canvas.setAttribute('role', canRollRef.current ? 'button' : 'img')
    canvas.setAttribute('aria-label', canRollRef.current ? 'Roll dice' : 'Game board dice')
    canvas.tabIndex = canRollRef.current ? 0 : -1
    canvas.style.cursor = canRollRef.current ? 'pointer' : 'grab'

    const boardGroup = new THREE.Group()
    scene.add(boardGroup)

    const ringTexture = textureLoader.load(`/assets/board/rings/${boardTheme.id}.svg`)
    ringTexture.colorSpace = THREE.SRGBColorSpace
    ringTexture.wrapS = THREE.RepeatWrapping
    ringTexture.wrapT = THREE.ClampToEdgeWrapping
    ringTexture.repeat.set(18, 1)
    ringTexture.anisotropy = 8
    const ringRadius = 15.48
    const ringHeight = 1.44
    const ringCenterY = 0.84
    const ringMaterial = new THREE.MeshBasicMaterial({
      map: ringTexture,
      color: '#fff8ec',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      toneMapped: false,
    })
    const themeRing = new THREE.Mesh(
      new THREE.CylinderGeometry(ringRadius, ringRadius, ringHeight, 192, 1, true),
      ringMaterial,
    )
    themeRing.name = `theme-story-ring-${boardTheme.id}`
    themeRing.position.y = ringCenterY
    themeRing.renderOrder = 1
    boardGroup.add(themeRing)

    const ringTrimMaterial = new THREE.MeshStandardMaterial({
      color: boardTheme.diceSkin.edge,
      emissive: boardTheme.diceSkin.edge,
      emissiveIntensity: 0.24,
      metalness: 0.72,
      roughness: 0.32,
    })
    for (const y of [ringCenterY - ringHeight / 2, ringCenterY + ringHeight / 2]) {
      const trim = new THREE.Mesh(new THREE.TorusGeometry(ringRadius, 0.045, 8, 192), ringTrimMaterial)
      trim.rotation.x = Math.PI / 2
      trim.position.y = y
      trim.castShadow = true
      boardGroup.add(trim)
    }
    const ringPostMaterial = new THREE.MeshStandardMaterial({
      color: boardTheme.diceSkin.edge,
      emissive: boardTheme.diceSkin.edge,
      emissiveIntensity: 0.18,
      metalness: 0.68,
      roughness: 0.38,
    })
    for (let index = 0; index < boardPath.length; index += 1) {
      const angle = (index / boardPath.length) * Math.PI * 2 - Math.PI / 2
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.075, ringHeight, 8),
        ringPostMaterial,
      )
      post.position.set(Math.cos(angle) * ringRadius, ringCenterY, Math.sin(angle) * ringRadius)
      post.castShadow = true
      boardGroup.add(post)
    }

    const tileMarks = new Map()
    const spaceGlowTexture = makeSpaceGlowTexture()
    const animatedSpaceTiles = []
    boardPath.forEach((space) => {
      tileMarks.set(space.id, makeTileMarkTexture(space.label, space.type))
    })

    boardPath.forEach((space, spaceIndex) => {
      const tile = new THREE.Group()
      const style = TILE_STYLES[space.type]
      const underglow = new THREE.Mesh(
        new THREE.CircleGeometry(2.08, 40),
        new THREE.MeshBasicMaterial({
          map: spaceGlowTexture,
          color: boardTheme.diceSkin.edge,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
          opacity: 0.2,
          toneMapped: false,
        }),
      )
      underglow.rotation.x = -Math.PI / 2
      underglow.position.y = -0.2
      tile.add(underglow)
      const lightRim = new THREE.Mesh(
        new THREE.TorusGeometry(1.66, 0.052, 8, 48),
        new THREE.MeshStandardMaterial({
          color: boardTheme.diceSkin.edge,
          emissive: boardTheme.diceSkin.edge,
          emissiveIntensity: 0.46,
          metalness: 0.42,
          roughness: 0.36,
        }),
      )
      lightRim.rotation.x = Math.PI / 2
      lightRim.position.y = -0.205
      tile.add(lightRim)
      const plinth = new THREE.Mesh(
        new THREE.CylinderGeometry(1.55, 1.64, 0.18, 24),
        new THREE.MeshStandardMaterial({
          color: '#b89065',
          metalness: 0.38,
          roughness: 0.5,
        }),
      )
      plinth.position.y = -0.14
      plinth.castShadow = true
      plinth.receiveShadow = true
      tile.add(plinth)
      const embroideredEdge = new THREE.Mesh(
        new THREE.TorusGeometry(1.53, 0.035, 7, 36),
        new THREE.MeshStandardMaterial({
          color: boardTheme.diceSkin.edge,
          emissive: boardTheme.diceSkin.edge,
          emissiveIntensity: 0.16,
          metalness: 0.62,
          roughness: 0.34,
          transparent: true,
          opacity: 0.82,
        }),
      )
      embroideredEdge.rotation.x = Math.PI / 2
      embroideredEdge.position.y = -0.035
      tile.add(embroideredEdge)
      const base = new THREE.Mesh(
        new RoundedBoxGeometry(3.1, 0.4, 3.1, 4, 0.21),
        new THREE.MeshStandardMaterial({
          color: '#fff7e9',
          metalness: 0.03,
          roughness: 0.68,
        }),
      )
      base.receiveShadow = true
      base.castShadow = true
      tile.add(base)

      const panel = new THREE.Mesh(
        new RoundedBoxGeometry(2.72, 0.09, 2.72, 4, 0.19),
        new THREE.MeshStandardMaterial({
          color: boardTheme.spaceColors[space.type] || style.tint,
          metalness: 0.02,
          roughness: 0.9,
        }),
      )
      panel.position.y = 0.24
      panel.receiveShadow = true
      panel.castShadow = true
      tile.add(panel)

      const mark = new THREE.Mesh(
        new THREE.PlaneGeometry(1.76, 1.76),
        new THREE.MeshBasicMaterial({
          alphaTest: 0.08,
          map: tileMarks.get(space.id),
          transparent: true,
        }),
      )
      mark.position.y = 0.291
      mark.rotation.x = -Math.PI / 2
      tile.add(mark)

      tile.position.copy(space.position)
      tile.rotation.y = getSpokeFacingAngle(space.position)
      tile.userData.floatRestY = tile.position.y
      tile.userData.floatPhase = spaceIndex * 2.399963229728653
      tile.userData.sink = 0
      tile.userData.underglow = underglow
      tile.userData.lightRim = lightRim
      animatedSpaceTiles.push({ index: spaceIndex, group: tile })
      boardGroup.add(tile)

    })

    const homeTile = boardPath[0]?.position || new THREE.Vector3(0, 0.35, 0)
    const parsedBoardState = boardState || {}

    const tenderStars = Math.min(parsedBoardState.tenderStars || 0, 10)
    for (let index = 0; index < tenderStars; index += 1) {
      const angle = (index / Math.max(tenderStars, 1)) * Math.PI * 2
      const star = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.18, 0),
        new THREE.MeshStandardMaterial({
          color: '#ffe4af',
          emissive: '#f4c16d',
          emissiveIntensity: 0.75,
        }),
      )
      star.position.set(
        Math.cos(angle) * 5.8,
        3.3 + (index % 3) * 0.28,
        Math.sin(angle) * 4.2,
      )
      scene.add(star)
    }

    parsedBoardState.playfulStickerIds?.slice(0, 8).forEach((stickerId, index) => {
      const angle = (index / 8) * Math.PI * 2
      const sticker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.56, 0.56, 0.12, 24),
        new THREE.MeshStandardMaterial({
          color: ['#f6c55f', '#ff91a3', '#8fc5ff', '#9ad89b'][index % 4],
          roughness: 0.4,
        }),
      )
      sticker.rotation.x = Math.PI / 2
      sticker.position.set(
        Math.cos(angle) * 13.4,
        0.2,
        Math.sin(angle) * 10.1,
      )
      sticker.userData.label = stickerId
      scene.add(sticker)
    })

    if ((parsedBoardState.spicyGlowLevel || 0) > 0) {
      const glow = new THREE.PointLight(
        '#ff9a6d',
        1.2 + parsedBoardState.spicyGlowLevel * 0.35,
        18,
      )
      glow.position.set(homeTile.x, 2.4, homeTile.z)
      scene.add(glow)

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.2 + parsedBoardState.spicyGlowLevel * 0.08, 0.1, 14, 32),
        new THREE.MeshStandardMaterial({
          color: '#ffb07c',
          emissive: '#ff865e',
          emissiveIntensity: 0.55 + parsedBoardState.spicyGlowLevel * 0.08,
        }),
      )
      ring.rotation.x = Math.PI / 2
      ring.position.set(homeTile.x, 0.44, homeTile.z)
      scene.add(ring)
    }

    const tokenGroups = players.map((player, index) => {
      const group = new THREE.Group()
      const positionRing = createPlayerPositionRing(player.color)
      const fallback = createFallbackPawn(player.color)
      group.add(positionRing)
      group.add(fallback)
      group.position.copy(
        getTokenTargetPosition(boardPath, targetIndicesRef.current, index),
      )
      group.position.y = 0.7
      group.userData.avatar = resolvePlayerAvatar(player.avatar)
      group.userData.fallback = fallback
      group.userData.positionRing = positionRing
      scene.add(group)
      return group
    })
    let activePieceMove = null
    let completedPieceSteps = 0

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath(DRACO_GLTF_CONFIG)
    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)
    const loadedPlayerAvatars = new Set()
    const overlayTexture = textureLoader.load(boardTheme.skinOverlay)
    overlayTexture.colorSpace = THREE.SRGBColorSpace
    overlayTexture.anisotropy = 8
    const boardSkin = new THREE.Mesh(
      new THREE.CircleGeometry(BOARD_INSET_RADIUS - 0.12, 96),
      new THREE.MeshBasicMaterial({ map: overlayTexture, transparent: true, opacity: 0.82, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -1 }),
    )
    boardSkin.name = `2d-theme-skin-${boardTheme.id}`
    boardSkin.rotation.x = -Math.PI / 2
    boardSkin.position.y = BOARD_SKIN_SURFACE_Y
    boardSkin.renderOrder = 2
    scene.add(boardSkin)

    const cardPilePalette = getBoardCardPilePalette(boardTheme)
    const drawPileMarker = createBoardCardPileMarker(boardTheme, 'draw', cardPilePalette.draw)
    const discardPileMarker = createBoardCardPileMarker(boardTheme, 'discard', cardPilePalette.discard)
    scene.add(drawPileMarker, discardPileMarker)

    players.forEach((player, index) => {
      const avatar = resolvePlayerAvatar(player.avatar)
      loader.load(
        avatar,
        (gltf) => {
          if (disposed) {
            disposeObject3D(gltf.scene)
            return
          }

          const model = gltf.scene
          fitModel(model, 1.22)
          tintModel(model, player.color)
          const fallback = tokenGroups[index].userData.fallback
          tokenGroups[index].remove(fallback)
          disposeObject3D(fallback)
          delete tokenGroups[index].userData.fallback
          tokenGroups[index].add(model)
          loadedPlayerAvatars.add(index)
        },
        undefined,
        () => undefined,
      )
    })

    const resizeObserver = new ResizeObserver(() => {
      if (disposed || !mount.clientWidth || !mount.clientHeight) {
        return
      }

      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    })
    resizeObserver.observe(mount)

    const startedAt = performance.now()
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    function renderFrame(now = performance.now()) {
      latestSceneTime = now + manualTimeOffset
      const frameDeltaSeconds = Math.min(0.05, Math.max(0, (latestSceneTime - previousFrameAt) / 1000))
      previousFrameAt = latestSceneTime
      const elapsed = (latestSceneTime - startedAt) / 1000
      environment.update(elapsed, reducedMotion)
      const diceHomeMotion = getDiceHomeBaseMotion(elapsed, reducedMotion)
      diceBox.position.y = diceHomeMotion.lift
      diceShadow.material.opacity = diceHomeMotion.shadowOpacity
      diceShadow.scale.setScalar(diceHomeMotion.shadowScale)
      const occupiedSpaceIndices = [...targetIndicesRef.current]
      const movingPlan = activePieceMove || pieceMoveQueueRef.current[0]
      if (movingPlan) {
        occupiedSpaceIndices[movingPlan.playerIndex] = movingPlan.path[movingPlan.stepIndex || 0]
      }
      animatedSpaceTiles.forEach(({ index, group }) => {
        const occupied = occupiedSpaceIndices.includes(index)
        const motion = getBoardSpaceMotion(elapsed, index, { occupied, reducedMotion })
        const sinkEase = 1 - Math.exp(-frameDeltaSeconds * 11)
        group.userData.sink = THREE.MathUtils.lerp(group.userData.sink, motion.sinkTarget, sinkEase)
        group.position.y = group.userData.floatRestY + motion.bob - group.userData.sink
        group.userData.underglow.material.opacity = motion.glowOpacity
        group.userData.lightRim.material.emissiveIntensity = motion.glowIntensity
      })
      const activePos = boardPath[targetIndicesRef.current[activePlayerIndexRef.current]].position
      const otherIndex = (activePlayerIndexRef.current + 1) % 2
      const otherPos = boardPath[targetIndicesRef.current[otherIndex]]?.position || activePos
      const midpoint = new THREE.Vector3().addVectors(activePos, otherPos).multiplyScalar(0.5)

      const idleOrbit = shouldOrbitBoard({
        phase: phaseRef.current,
        rolling: Boolean(rollingRef.current || dieRoll),
        movingPiece: Boolean(activePieceMove),
        queuedMoves: pieceMoveQueueRef.current.length,
        interacting: userInteracting,
        reducedMotion,
        idleMs: latestSceneTime - lastViewInputAt,
      })
      controls.autoRotate = idleOrbit
      if (idleOrbit) {
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 14.5, Math.min(1, frameDeltaSeconds * 0.55))
        controls.target.lerp(boardCenter, Math.min(1, frameDeltaSeconds * 0.55))
      } else if (!manualView) {
        const isKeepsakePhase = phaseRef.current === 'keepsake'
        const targetFocus = pacingMode === 'sharedSpotlight' || isKeepsakePhase ? activePos : midpoint
        const targetY = isKeepsakePhase ? 10.5 : 16
        const targetZ = isKeepsakePhase ? 12.5 + activePos.z * 0.15 : 18 + targetFocus.z * 0.2
        camera.position.x = THREE.MathUtils.lerp(
          camera.position.x,
          isKeepsakePhase ? activePos.x * 0.42 : targetFocus.x * 0.22,
          0.04,
        )
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.04)
        camera.position.z = THREE.MathUtils.lerp(
          camera.position.z,
          targetZ,
          0.04,
        )
        controls.target.x = THREE.MathUtils.lerp(controls.target.x, isKeepsakePhase ? activePos.x * 0.35 : targetFocus.x * 0.2, 0.04)
        controls.target.y = THREE.MathUtils.lerp(controls.target.y, 0, 0.04)
        controls.target.z = THREE.MathUtils.lerp(controls.target.z, isKeepsakePhase ? activePos.z * 0.35 : targetFocus.z * 0.38, 0.04)
      }

      if (!dieRoll && !activePieceMove && pieceMoveQueueRef.current.length) {
        activePieceMove = { ...pieceMoveQueueRef.current.shift(), travelStartedAt: null, stepIndex: 0 }
        dice.userData.startRoll?.(activePieceMove.steps, activePieceMove.dice)
      }

      if (dieRoll) {
        const duration = DICE_ROLL_DURATION_SECONDS
        const elapsed = (latestSceneTime - dieRoll.startedAt) / 1000
        const progress = dieRoll.finalValues
          ? Math.min(1, elapsed / duration)
          : Math.min(0.94, elapsed / duration)
        const eased = 1 - (1 - progress) ** 3
        const lift1 = Math.sin(progress * Math.PI)
        const tumbleFace1 = 1 + (Math.floor(elapsed * 14) % 6)

        const die1 = dice.userData.die1
        const die2 = dice.userData.die2

        setPrimitiveDieValue(die1, dieRoll.finalValues && progress >= 1 ? dieRoll.finalValues[0] : tumbleFace1)
        const gesture = dieRoll.gesture || {}
        const direction = gesture.direction || { x: 0.55, y: -0.3 }
        const throwPower = 0.78 + Math.max(0, Math.min(1, gesture.power || 0)) * 0.72
        die1.position.x = -2.0 + lift1 * (0.35 + direction.x * 0.42) + Math.sin(progress * Math.PI * 2.5) * 0.16
        die1.position.y = 0.62 + diceHomeMotion.lift + lift1 * 1.08 * throwPower
        die1.position.z = 0.45 + lift1 * (0.18 + direction.y * 0.38) + Math.cos(progress * Math.PI * 2) * 0.12 * lift1
        die1.rotation.x = -0.04 + eased * (Math.PI * (3.5 + throwPower) + (dieRoll.finalValues?.[0] || 0) * 0.18)
        die1.rotation.y = 0.32 + eased * (Math.PI * (4.2 + throwPower) + (dieRoll.finalValues?.[0] || 0) * 0.22 + direction.x)
        die1.rotation.z = -0.06 + eased * Math.PI * 3
        die1.scale.setScalar(1 + lift1 * 1.05)

        const prog2 = Math.min(1, Math.max(0, (progress - 0.04) / 0.96))
        const eased2 = 1 - (1 - prog2) ** 3
        const lift2 = Math.sin(prog2 * Math.PI)
        const tumbleFace2 = 1 + (Math.floor(elapsed * 17 + 2) % 6)
        setPrimitiveDieValue(die2, dieRoll.finalValues && prog2 >= 1 ? dieRoll.finalValues[1] : tumbleFace2)
        die2.position.x = -3.25 + lift2 * (0.42 - direction.x * 0.4) - Math.sin(prog2 * Math.PI * 2.4) * 0.15
        die2.position.y = 0.62 + diceHomeMotion.lift + lift2 * 1.16 * throwPower
        die2.position.z = 0.82 + lift2 * (0.14 - direction.y * 0.38) - Math.cos(prog2 * Math.PI * 2) * 0.1 * lift2
        die2.rotation.x = 0.08 + eased2 * (Math.PI * (4.4 + throwPower) + (dieRoll.finalValues?.[1] || 0) * 0.16)
        die2.rotation.y = -0.26 + eased2 * (Math.PI * (3.6 + throwPower) + (dieRoll.finalValues?.[1] || 0) * 0.24 - direction.x)
        die2.rotation.z = 0.12 - eased2 * Math.PI * 3.2
        die2.scale.setScalar(1 + lift2 * 1.05)

        const impactStep = Math.min(8, Math.floor(Math.min(1, elapsed / duration) * 9))
        if (impactStep > dieRoll.lastImpactStep) {
          dieRoll.lastImpactStep = impactStep
          onDiceImpactRef.current?.({ step: impactStep, energy: Math.max(0.24, 0.86 - impactStep * 0.07), side: impactStep % 2 })
        }

        if (progress >= 1 && dieRoll.finalValues) {
          const finalValues = dieRoll.finalValues
          dieRoll = null
          settlePrimitiveDice(dice, finalValues)
        }
      } else if (dice.userData.touch) {
        const touch = dice.userData.touch
        const die1 = dice.userData.die1
        const die2 = dice.userData.die2
        const press = Math.min(1, Math.hypot(touch.x, touch.y) / 44)
        const breathe = Math.sin((latestSceneTime - touch.startedAt) / 1000 * 18) * 0.025
        die1.position.set(-2 + touch.x * 0.004, 0.62 + diceHomeMotion.lift + breathe, 0.45 - touch.y * 0.004)
        die1.rotation.set(-0.04 - touch.y * 0.004, 0.32, -0.06 + touch.x * 0.005)
        die1.scale.setScalar(1 + press * 0.09)
        die2.position.set(-3.25 + touch.x * 0.004, 0.62 + diceHomeMotion.lift - breathe, 0.82 - touch.y * 0.004)
        die2.rotation.set(0.08 - touch.y * 0.004, -0.26, 0.12 + touch.x * 0.005)
        die2.scale.setScalar(1 + press * 0.09)
      }

      if (!dieRoll && !dice.userData.touch) {
        dice.userData.die1.position.y = 0.62 + diceHomeMotion.lift
        dice.userData.die2.position.y = 0.62 + diceHomeMotion.lift
      }

      tokenGroups.forEach((token, index) => {
        if (activePieceMove?.playerIndex === index && !dieRoll) {
          if (activePieceMove.travelStartedAt === null) activePieceMove.travelStartedAt = latestSceneTime
          const positionsAtStart = [...targetIndicesRef.current]
          const positionsAtEnd = [...targetIndicesRef.current]
          const startSpace = activePieceMove.path[activePieceMove.stepIndex]
          const endSpace = activePieceMove.path[activePieceMove.stepIndex + 1]
          positionsAtStart[index] = startSpace
          positionsAtEnd[index] = endSpace
          const start = getTokenTargetPosition(boardPath, positionsAtStart, index)
          const end = getTokenTargetPosition(boardPath, positionsAtEnd, index)
          const stepDuration = 235
          let progress = Math.min(1, Math.max(0, (latestSceneTime - activePieceMove.travelStartedAt) / stepDuration))
          while (progress >= 1 && activePieceMove.stepIndex < activePieceMove.steps) {
            token.position.copy(end)
            onPieceStepRef.current?.({
              playerIndex: index,
              spaceIndex: endSpace,
              stepIndex: activePieceMove.stepIndex + 1,
              steps: activePieceMove.steps,
            })
            completedPieceSteps += 1
            activePieceMove.stepIndex += 1
            activePieceMove.travelStartedAt += stepDuration
            if (activePieceMove.stepIndex >= activePieceMove.steps) {
              const completedMove = activePieceMove
              activePieceMove = null
              onPieceMoveCompleteRef.current?.({
                playerIndex: completedMove.playerIndex,
                steps: completedMove.steps,
              })
              break
            }
            const nextStart = [...targetIndicesRef.current]
            const nextEnd = [...targetIndicesRef.current]
            nextStart[index] = activePieceMove.path[activePieceMove.stepIndex]
            nextEnd[index] = activePieceMove.path[activePieceMove.stepIndex + 1]
            start.copy(getTokenTargetPosition(boardPath, nextStart, index))
            end.copy(getTokenTargetPosition(boardPath, nextEnd, index))
            progress = Math.min(1, Math.max(0, (latestSceneTime - activePieceMove.travelStartedAt) / stepDuration))
          }
          if (activePieceMove?.playerIndex === index) {
            const eased = progress * progress * (3 - 2 * progress)
            token.position.x = THREE.MathUtils.lerp(start.x, end.x, eased)
            token.position.z = THREE.MathUtils.lerp(start.z, end.z, eased)
            token.position.y = 0.7 + Math.sin(progress * Math.PI) * 0.58 + Math.sin(elapsed * 3 + index) * 0.04
          }
          token.rotation.y = elapsed * 0.35
          token.scale.setScalar(index === activePlayerIndexRef.current ? 1.04 : 0.96)
          return
        }
        const target = getTokenTargetPosition(
          boardPath,
          targetIndicesRef.current,
          index,
        )
        token.position.x = THREE.MathUtils.lerp(token.position.x, target.x, 0.12)
        token.position.z = THREE.MathUtils.lerp(token.position.z, target.z, 0.12)
        token.position.y = 0.7 + Math.sin(elapsed * 3 + index) * 0.06
        token.rotation.y = elapsed * 0.35
        token.scale.setScalar(index === activePlayerIndexRef.current ? 1.04 : 0.96)
      })

      controls.update(frameDeltaSeconds)
      renderer.render(scene, camera)
    }

    function animate(now) {
      if (disposed) {
        return
      }
      renderFrame(now)
      animationFrameId = requestAnimationFrame(animate)
    }

    const renderGameToText = () => {
      const gameplay = window.__atLongLastGameState
      const activityUi = window.__atLongLastActivityUiState
      return JSON.stringify({
        activePlayerIndex: activePlayerIndexRef.current,
        boardState: parsedBoardState,
        camera: {
          mode: controls.autoRotate ? 'idle-orbit' : manualView ? 'gesture' : 'follow',
          position: camera.position.toArray().map((value) => Number(value.toFixed(2))),
          target: controls.target.toArray().map((value) => Number(value.toFixed(2))),
          gestures: {
            pan: 'two-finger drag or right drag',
            rotate: 'one-finger drag or left drag',
            zoom: 'pinch or wheel',
          },
        },
        coordinateSystem: 'board-space index increases clockwise from top',
        theme: {
          id: boardTheme.id,
          label: boardTheme.label,
          cardPilePalette,
          ringTexture: `/assets/board/rings/${boardTheme.id}.svg`,
          round,
          environment: boardTheme.environment.mode,
          panorama: boardTheme.environment.panorama,
        },
        decorations: [],
        hiddenDecorations: boardTheme.decorations.map((decoration) => ({
          id: decoration.id,
          label: decoration.label,
        })),
        dice: {
          construction: 'rounded-box-and-sphere primitives with theme finish',
          rolling: Boolean(dieRoll),
          sum: dice.userData.values[0] + dice.userData.values[1],
          values: dice.userData.values,
          screenCenters: [dice.userData.die1, dice.userData.die2].map((die) => {
            const point = die.getWorldPosition(new THREE.Vector3()).project(camera)
            return {
              x: Number(((point.x + 1) * mount.clientWidth / 2).toFixed(1)),
              y: Number(((1 - point.y) * mount.clientHeight / 2).toFixed(1)),
            }
          }),
        },
        die: {
          construction: 'rounded-box-and-sphere primitives with theme finish',
          rolling: Boolean(dieRoll),
          value: dice.userData.value,
        },
        pieceMovement: activePieceMove
          ? {
              playerIndex: activePieceMove.playerIndex,
              stepsLanded: activePieceMove.stepIndex,
              totalSteps: activePieceMove.steps,
              nextSpace: activePieceMove.path[activePieceMove.stepIndex + 1] ?? null,
            }
          : null,
        pieceStepsLanded: completedPieceSteps,
        gameplay: gameplay
          ? {
              ...gameplay,
              activity: gameplay.activity
                ? {
                    ...gameplay.activity,
                    ui: activityUi || null,
                  }
                : null,
            }
          : null,
        mode: 'board',
        surfaces: {
          boardInset: { color: boardTheme.surfaces.inset.color, texture: boardTheme.surfaces.inset.texture, shape: 'circle', radius: BOARD_INSET_RADIUS },
          tabletop: boardTheme.surfaces.tabletop.texture,
          skinOverlay: boardTheme.skinOverlay,
          storyRing: { radius: ringRadius, height: ringHeight, hollow: true, texture: `/assets/board/rings/${boardTheme.id}.svg` },
          spaceColors: boardTheme.spaceColors,
          tiles: 'separate theme-colored raised spaces with pulsing underglow',
          connector: 'none',
        },
        cardPiles: {
          deck: 'mixed Trash moments and Treasure moments',
          cardBack: 'paired branded trash-paper and treasure-gem emblems',
          labels: 'etched into the board fabric',
          draw: { position: BOARD_CARD_PILE_POSITIONS.draw, outline: 'dotted', color: cardPilePalette.draw, cards: 3 },
          discard: { position: BOARD_CARD_PILE_POSITIONS.discard, outline: 'dotted', color: cardPilePalette.discard, cards: 1 },
        },
        path: {
          branchCount: 0,
          segments: boardPath.length,
          visible: true,
          shape: 'circle',
          radius: BOARD_PATH_RADIUS,
        },
        toneSelector: window.__atLongLastVibeDialState || null,
        players: players.map((player, index) => {
          const positionIndex = targetIndicesRef.current[index]
          const target = getTokenTargetPosition(
            boardPath,
            targetIndicesRef.current,
            index,
          )
          return {
            avatar: resolvePlayerAvatar(player.avatar),
            avatarLoaded: loadedPlayerAvatars.has(index),
            boardPosition: [target.x, target.z].map((value) =>
              Number(value.toFixed(2)),
            ),
            colocated:
              targetIndicesRef.current.filter(
                (candidate) => candidate === positionIndex,
              ).length > 1,
            color: player.color,
            displayName: player.displayName,
            positionIndex,
            positionMarker: 'player-colored illuminated ring',
          }
        }),
      })
    }
    const advanceTime = (milliseconds) => {
      if (disposed) {
        return
      }
      manualTimeOffset += Math.max(0, Number(milliseconds) || 0)
      renderFrame()
    }
    window.render_game_to_text = renderGameToText
    window.advanceTime = advanceTime
    animate()
    onReadyRef.current?.()

    return () => {
      disposed = true
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }

      resizeObserver.disconnect()
      canvas.removeEventListener('pointerdown', handleDicePointerDown, true)
      canvas.removeEventListener('pointermove', handleDicePointerMove, true)
      canvas.removeEventListener('pointerup', handleDicePointerUp, true)
      canvas.removeEventListener('pointercancel', handleDicePointerCancel, true)
      canvas.removeEventListener('keydown', handleDiceKeyDown)
      controls.dispose()
      if (window.render_game_to_text === renderGameToText) {
        delete window.render_game_to_text
      }
      if (window.advanceTime === advanceTime) {
        delete window.advanceTime
      }
      if (import.meta.env.DEV) delete window.__atLongLastHitDice
      dracoLoader.dispose()
      if (dieRef.current === dice) {
        dieRef.current = null
      }
      disposeObject3D(scene)
      renderer.renderLists.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [boardPath, boardStateKey, boardTheme, players])

  return (
    <div className="board-canvas" ref={mountRef} />
  )
}
