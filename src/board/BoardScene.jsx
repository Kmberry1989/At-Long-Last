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
export const DICE_HOME_BASE_RADIUS = 2.18
export const DICE_HOME_BASE_INNER_RADIUS = 2.06
export const DICE_HOME_BASE_HEIGHT = 0.58
export const DICE_HOME_BASE_FLOOR_THICKNESS = 0.16
export const DICE_HOME_BASE_FLOAT_HEIGHT = 0.72
export const DICE_ROLL_DURATION_SECONDS = 2.05
export const BOARD_SKIN_SURFACE_Y = 0.126
export const BOARD_CARD_PILE_LABEL_Y = BOARD_SKIN_SURFACE_Y + 0.018
export const BOARD_CARD_PILE_RADIUS = 2.05
export const BOARD_CARD_PILE_WIDTH = 3.35
export const BOARD_CARD_PILE_DEPTH = 2.9
export const BOARD_CARD_PILE_DOT_COUNT = 64
export const BOARD_CARD_PILE_DOT_SIZE = 0.24
export const BOARD_CARD_PILE_POSITIONS = {
  trash: [-4.15, -3.55],
  treasure: [4.15, -3.55],
  discard: [0, 4.25],
}
export const BOARD_MOMENT_COIN_POSITION = [0.25, -0.8]

const LANDING_EFFECTS_BY_SPACE = {
  heart: ['heart-glow', 'rose-petals', 'music-notes'],
  oops: ['rose-petals', 'leaf-fireflies'],
  connection: ['ribbon-wisp', 'leaf-fireflies'],
  duel: ['music-notes', 'ribbon-wisp'],
  keepsake: ['keepsake-light', 'warm-cup'],
}

export function getLandingEffectForSpaceType(type, stepIndex = 0) {
  const choices = LANDING_EFFECTS_BY_SPACE[type] || LANDING_EFFECTS_BY_SPACE.heart
  return choices[Math.abs(stepIndex) % choices.length]
}

const PLAYER_PBR_FINISHES = {
  porcelain: { metalness: 0.12, roughness: 0.2, clearcoat: 0.9, clearcoatRoughness: 0.16 },
  satin: { metalness: 0.28, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.3 },
  gold: { metalness: 0.82, roughness: 0.24, clearcoat: 0.48, clearcoatRoughness: 0.22 },
  velvet: { metalness: 0.03, roughness: 0.88, clearcoat: 0.04, clearcoatRoughness: 0.8 },
}

export function getPlayerPbrFinish(id = 'porcelain') {
  return PLAYER_PBR_FINISHES[id] || PLAYER_PBR_FINISHES.porcelain
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
  const label = kind === 'discard' ? 'DISCARD' : 'DRAW'
  context.fillText(label, 256, 64)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function makeCardBackTexture(category = null) {
  const source = category
    ? `/assets/game-ui/${category}-moment-card-back.webp`
    : '/assets/game-ui/moment-card-back.png'
  const texture = new THREE.TextureLoader().load(source)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function makeMomentCoinFace(category) {
  const texture = new THREE.TextureLoader().load(`/assets/board/coins/${category}-face.png`)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function createMomentCoin(theme, position) {
  const root = new THREE.Group()
  root.name = 'trash-treasure-coin'
  const restHeight = BOARD_SKIN_SURFACE_Y + 0.075
  root.position.set(position[0], restHeight, position[1])
  const pedestal = new THREE.Group()
  pedestal.name = 'trash-treasure-coin-pedestal'
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.92, 1.02, 0.18, 64),
    new THREE.MeshStandardMaterial({ color: theme.diceSkin.alternate, metalness: 0.62, roughness: 0.34 }),
  )
  base.position.y = -0.16
  base.castShadow = true
  base.receiveShadow = true
  pedestal.add(base)
  const inset = new THREE.Mesh(
    new THREE.CylinderGeometry(0.76, 0.82, 0.12, 64),
    new THREE.MeshStandardMaterial({ color: theme.diceSkin.fabric || theme.surfaces.inset.color, metalness: 0.08, roughness: 0.8 }),
  )
  inset.position.y = -0.035
  inset.receiveShadow = true
  pedestal.add(inset)
  const piping = new THREE.Mesh(
    new THREE.TorusGeometry(0.89, 0.045, 8, 64),
    new THREE.MeshStandardMaterial({ color: theme.diceSkin.edge, metalness: 0.78, roughness: 0.28 }),
  )
  piping.rotation.x = Math.PI / 2
  piping.position.y = -0.055
  pedestal.add(piping)
  root.add(pedestal)
  const side = new THREE.MeshStandardMaterial({ color: theme.diceSkin.edge, metalness: 0.9, roughness: 0.22 })
  const treasure = new THREE.MeshStandardMaterial({ map: makeMomentCoinFace('treasure'), metalness: 0.42, roughness: 0.32 })
  const trash = new THREE.MeshStandardMaterial({ map: makeMomentCoinFace('trash'), metalness: 0.42, roughness: 0.32 })
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.76, 0.15, 64, 1, false), [side, treasure, trash])
  coin.name = 'trash-treasure-coin-face'
  coin.castShadow = true
  coin.receiveShadow = true
  root.add(coin)
  const hitTarget = new THREE.Mesh(
    new THREE.SphereGeometry(0.94, 24, 24),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, colorWrite: false, depthWrite: false }),
  )
  hitTarget.name = 'trash-treasure-coin-touch-area'
  root.add(hitTarget)
  root.userData.disc = coin
  root.userData.baseHeight = restHeight
  return root
}

function createBoardCardPileMarker(theme, kind, color) {
  const group = new THREE.Group()
  const isDrawPile = kind === 'trash' || kind === 'treasure'
  const [x, z] = BOARD_CARD_PILE_POSITIONS[kind]
  group.name = `board-card-${kind}-pile-marker`
  group.position.set(x, 0, z)
  group.userData.cardKind = isDrawPile ? `${kind} moments` : 'resolved cards'

  const dotPositions = []
  const dotCount = BOARD_CARD_PILE_DOT_COUNT
  for (let index = 0; index < dotCount; index += 1) {
    const perimeter = (index / dotCount) * 2 * (BOARD_CARD_PILE_WIDTH + BOARD_CARD_PILE_DEPTH)
    let x = 0, z = 0
    if (perimeter < BOARD_CARD_PILE_WIDTH) { x = -BOARD_CARD_PILE_WIDTH / 2 + perimeter; z = -BOARD_CARD_PILE_DEPTH / 2 }
    else if (perimeter < BOARD_CARD_PILE_WIDTH + BOARD_CARD_PILE_DEPTH) { x = BOARD_CARD_PILE_WIDTH / 2; z = -BOARD_CARD_PILE_DEPTH / 2 + perimeter - BOARD_CARD_PILE_WIDTH }
    else if (perimeter < 2 * BOARD_CARD_PILE_WIDTH + BOARD_CARD_PILE_DEPTH) { x = BOARD_CARD_PILE_WIDTH / 2 - (perimeter - BOARD_CARD_PILE_WIDTH - BOARD_CARD_PILE_DEPTH); z = BOARD_CARD_PILE_DEPTH / 2 }
    else { x = -BOARD_CARD_PILE_WIDTH / 2; z = BOARD_CARD_PILE_DEPTH / 2 - (perimeter - 2 * BOARD_CARD_PILE_WIDTH - BOARD_CARD_PILE_DEPTH) }
    dotPositions.push(
      x,
      BOARD_CARD_PILE_LABEL_Y + 0.006,
      z,
    )
  }
  const dottedLine = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(dotPositions, 3)),
    new THREE.PointsMaterial({ color: '#f5d39a', size: BOARD_CARD_PILE_DOT_SIZE, sizeAttenuation: true, transparent: true, opacity: 1, depthTest: true, depthWrite: false }),
  )
  dottedLine.name = `${kind}-pile-dotted-outline`
  dottedLine.renderOrder = 30
  group.add(dottedLine)

  const categories = isDrawPile ? [kind] : [null]
  for (const category of categories) {
    const cardTexture = makeCardBackTexture(category)
    const cardCount = isDrawPile ? 3 : 1
    for (let index = 0; index < cardCount; index += 1) {
      const card = new THREE.Group()
      card.name = `${kind}-pile-${category || 'resolved'}-card-${index + 1}`
      card.position.set(isDrawPile ? (index - 1) * 0.035 : 0, 0.225 + index * 0.125, isDrawPile ? (1 - index) * 0.045 : 0)
      card.rotation.y = isDrawPile ? -0.08 : 0.12
      const body = new THREE.Mesh(
        new RoundedBoxGeometry(2.55, 0.16, 2.85, 0.08, 4),
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
        new THREE.PlaneGeometry(2.3, 2.58),
        new THREE.MeshBasicMaterial({ map: cardTexture, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -1 }),
      )
      graphic.name = isDrawPile
        ? `${kind}-pile-${category}-card-${index + 1}-crest`
        : `${kind}-pile-card-${index + 1}-resolved-face`
      graphic.rotation.x = -Math.PI / 2
      graphic.position.y = 0.068
      card.add(graphic)
      group.add(card)
    }
  }

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 0.62),
    new THREE.MeshBasicMaterial({ map: makePileLabelTexture(kind, theme), transparent: true, opacity: 0.88, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2 }),
  )
  label.name = `${kind}-pile-label`
  label.rotation.x = -Math.PI / 2
  label.position.set(0, BOARD_CARD_PILE_LABEL_Y, 1.55)
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
    key: lastMove?.id || [playerIndex, from, lastMove?.to, direction, steps].join(':'),
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

export function getBoardCameraShotPose(kind, focus, elapsedSeconds = 0, shotProgress = 0) {
  const target = focus?.isVector3
    ? focus.clone()
    : new THREE.Vector3(focus?.x || 0, focus?.y || 0, focus?.z || 0)
  let position
  if (kind === 'dice') {
    position = target.clone().add(new THREE.Vector3(0, 7.2, 7.8))
  } else if (kind === 'dice-ready') {
    // Keep the whole circular tray and both dice comfortably inside a phone
    // viewport, even after a player has orbited or zoomed the board.
    position = target.clone().add(new THREE.Vector3(0, 10.8, 13.6))
  } else if (kind === 'coin') {
    const progress = THREE.MathUtils.clamp(shotProgress, 0, 1)
    // Move in toward the airborne coin early, then hold the close framing all
    // the way through its landing and suspenseful final wobble.
    const zoom = THREE.MathUtils.smoothstep(progress, 0, 0.24)
    const cameraHeight = THREE.MathUtils.lerp(4.4, 2.35, zoom)
    const cameraDepth = THREE.MathUtils.lerp(4.8, 3.1, zoom)
    const orbit = progress > 0 ? Math.sin(elapsedSeconds * 1.2) * 0.38 : 0
    position = target.clone().add(new THREE.Vector3(orbit, cameraHeight, cameraDepth))
  } else {
    const radial = new THREE.Vector3(target.x, 0, target.z)
    if (radial.lengthSq() < 0.001) radial.set(0, 0, 1)
    radial.normalize()
    const angle = Math.sin(elapsedSeconds * 0.55) * 0.12
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    const orbit = new THREE.Vector3(radial.x * c - radial.z * s, 0, radial.x * s + radial.z * c)
    position = target.clone().addScaledVector(orbit, 3.6).add(new THREE.Vector3(0, 8.3, 0))
  }
  return { position, target }
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
  // Dark inset wells and a thin bevel make the pips read as cut into the die,
  // rather than gold studs attached to its faces.
  const pipMaterial = new THREE.MeshStandardMaterial({ color: '#100d13', roughness: 1, metalness: 0 })
  const pipGeometry = new THREE.CircleGeometry(0.092, 24)
  const pipBevelGeometry = new THREE.TorusGeometry(0.091, 0.006, 5, 24)
  const pipBevelMaterial = new THREE.MeshStandardMaterial({ color: '#4b3d49', roughness: 0.9, metalness: 0 })

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
      const normal = axis === 'y'
        ? new THREE.Vector3(0, sign, 0)
        : axis === 'x'
          ? new THREE.Vector3(sign, 0, 0)
          : new THREE.Vector3(0, 0, sign)
      const pip = new THREE.Group()
      // RoundedBoxGeometry's flat faces sit at +/-0.48. Put the inset a hair
      // above that surface so it cannot disappear inside the die body; the
      // dark well and subdued lip read as carved pips rather than gold studs.
      if (axis === 'y') pip.position.set(a, sign * 0.489, b)
      else if (axis === 'x') pip.position.set(sign * 0.489, a, b)
      else pip.position.set(a, b, sign * 0.489)
      pip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
      const well = new THREE.Mesh(pipGeometry, pipMaterial)
      well.position.z = 0.001
      const bevel = new THREE.Mesh(pipBevelGeometry, pipBevelMaterial)
      bevel.position.z = -0.004
      pip.add(well, bevel)
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

  die1.position.set(-2.55, 0.62, 0.7)
  die1.userData.displayYaw = 0.32
  die1.rotation.set(0, 0, 0)
  setPrimitiveDieValue(die1, initialValues[0])

  die2.position.set(-3.8, 0.62, 1.05)
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
  die1.position.set(-0.35, 0.62, -0.25)
  die1.userData.displayYaw = 0.32
  setPrimitiveDieValue(die1, values[0])
  die1.scale.setScalar(1)

  die2.position.set(0.72, 0.62, 0.35)
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

function createFallbackPawn(color, finish = 'porcelain') {
  const pbr = getPlayerPbrFinish(finish)
  const group = new THREE.Group()
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.28, 18),
    new THREE.MeshPhysicalMaterial({ color: '#ffffff', ...pbr }),
  )
  base.position.y = 0.14
  base.castShadow = true
  group.add(base)

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.36, 0.8, 8, 16),
    new THREE.MeshPhysicalMaterial({ color, ...pbr }),
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

function tintModel(model, color, finish = 'porcelain') {
  const playerColor = new THREE.Color(color)
  const pbr = getPlayerPbrFinish(finish)
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
      if ('metalness' in tinted) tinted.metalness = pbr.metalness
      if ('roughness' in tinted) tinted.roughness = pbr.roughness
      if ('clearcoat' in tinted) tinted.clearcoat = pbr.clearcoat
      if ('clearcoatRoughness' in tinted) tinted.clearcoatRoughness = pbr.clearcoatRoughness
      if (tinted.color) tinted.needsUpdate = true
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
  moveEvents = null,
  lastRoll,
  onPieceStep = null,
  onPieceMoveComplete = null,
  onDiceSettled = null,
  deferPieceMoveKey = null,
  activeMomentMoveKey = null,
  pausePieceMovement = false,
  cardDrawKey = null,
  onCardDrawComplete = null,
  momentCardCategory = null,
  canFlipCoin = false,
  coinFlipKey = null,
  coinOutcome = null,
  coinGesture = null,
  onCoinFlip = null,
  onCoinFlipComplete = null,
  onDiceImpact = null,
  onDiceRattle = null,
  onDiceCast = null,
  onRoll = null,
  canRoll = false,
  canReturnDice = false,
  diceReturnKey = null,
  onReturnDice = null,
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
  const onDiceSettledRef = useRef(onDiceSettled)
  const deferPieceMoveKeyRef = useRef(deferPieceMoveKey)
  const activeMomentMoveKeyRef = useRef(activeMomentMoveKey)
  const activePieceMoveKeyRef = useRef(null)
  const pausePieceMovementRef = useRef(pausePieceMovement)
  const cardDrawKeyRef = useRef(cardDrawKey)
  const onCardDrawCompleteRef = useRef(onCardDrawComplete)
  const momentCardCategoryRef = useRef(momentCardCategory)
  const canFlipCoinRef = useRef(canFlipCoin)
  const coinFlipKeyRef = useRef(coinFlipKey)
  const coinOutcomeRef = useRef(coinOutcome)
  const coinGestureRef = useRef(coinGesture)
  const onCoinFlipRef = useRef(onCoinFlip)
  const onCoinFlipCompleteRef = useRef(onCoinFlipComplete)
  const onDiceImpactRef = useRef(onDiceImpact)
  const onDiceRattleRef = useRef(onDiceRattle)
  const onDiceCastRef = useRef(onDiceCast)
  const onRollRef = useRef(onRoll)
  const canRollRef = useRef(canRoll)
  const canReturnDiceRef = useRef(canReturnDice)
  const onReturnDiceRef = useRef(onReturnDice)
  const previousDiceReturnKeyRef = useRef(null)
  const onReadyRef = useRef(onReady)
  const rollGestureRef = useRef(rollGesture)
  const phaseRef = useRef(phase)
  const pieceMoveQueueRef = useRef([])
  const activePieceMoveRef = useRef(null)
  const seenMoveKeysRef = useRef(new Set())
  const moveEventsInitializedRef = useRef(false)
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
    const incoming = Array.isArray(moveEvents) ? moveEvents : [lastMove]
    if (!moveEventsInitializedRef.current && incoming.some(Boolean)) {
      moveEventsInitializedRef.current = true
      incoming.forEach(event => {
        const move = createPieceMovePlan(event, boardPath.length)
        if (!move) return
        seenMoveKeysRef.current.add(move.key)
        if (move.key === deferPieceMoveKey || move.key === activeMomentMoveKey) pieceMoveQueueRef.current.push(move)
      })
      return
    }
    incoming.forEach(event => {
      const move = createPieceMovePlan(event, boardPath.length)
      if (!move) return
      if (seenMoveKeysRef.current.has(move.key)) {
        // BoardScene can mount after a card transaction has already saved its
        // movement. Initialization normally ignores historical events, but
        // this key is the one live card effect the caller is resolving now.
        const alreadyQueued = pieceMoveQueueRef.current.some(queued => queued.key === move.key)
        if (move.key === activeMomentMoveKey && !alreadyQueued && activePieceMoveKeyRef.current !== move.key) {
          pieceMoveQueueRef.current.push(move)
        }
        return
      }
      seenMoveKeysRef.current.add(move.key)
      observedMoveKeyRef.current = move.key
      pieceMoveQueueRef.current.push(move)
    })
  }, [activeMomentMoveKey, boardPath.length, deferPieceMoveKey, lastMove, moveEvents])

  useEffect(() => {
    onPieceStepRef.current = onPieceStep
  }, [onPieceStep])

  useEffect(() => {
    onPieceMoveCompleteRef.current = onPieceMoveComplete
  }, [onPieceMoveComplete])

  useEffect(() => {
    onDiceSettledRef.current = onDiceSettled
    deferPieceMoveKeyRef.current = deferPieceMoveKey
    activeMomentMoveKeyRef.current = activeMomentMoveKey
    pausePieceMovementRef.current = pausePieceMovement
    cardDrawKeyRef.current = cardDrawKey
    onCardDrawCompleteRef.current = onCardDrawComplete
    momentCardCategoryRef.current = momentCardCategory
    canFlipCoinRef.current = canFlipCoin
    coinFlipKeyRef.current = coinFlipKey
    coinOutcomeRef.current = coinOutcome
    coinGestureRef.current = coinGesture
    onCoinFlipRef.current = onCoinFlip
    onCoinFlipCompleteRef.current = onCoinFlipComplete
  }, [activeMomentMoveKey, canFlipCoin, cardDrawKey, coinFlipKey, coinOutcome, coinGesture, deferPieceMoveKey, momentCardCategory, onCardDrawComplete, onCoinFlip, onCoinFlipComplete, onDiceSettled, pausePieceMovement])

  useEffect(() => {
    onDiceImpactRef.current = onDiceImpact
    onDiceRattleRef.current = onDiceRattle
    onDiceCastRef.current = onDiceCast
    onRollRef.current = onRoll
    canRollRef.current = canRoll
    canReturnDiceRef.current = canReturnDice
    onReturnDiceRef.current = onReturnDice
    onReadyRef.current = onReady
    rollGestureRef.current = rollGesture
  }, [canReturnDice, canRoll, onDiceCast, onDiceImpact, onDiceRattle, onReady, onReturnDice, onRoll, rollGesture])

  useEffect(() => {
    if (!diceReturnKey || diceReturnKey === previousDiceReturnKeyRef.current) return
    previousDiceReturnKeyRef.current = diceReturnKey
    dieRef.current?.userData.returnToCup?.()
  }, [diceReturnKey])

  useEffect(() => {
    const canvas = mountRef.current?.querySelector('canvas')
    if (!canvas) return
    const interactive = canRoll || canFlipCoin || canReturnDice
    canvas.setAttribute('role', interactive ? 'button' : 'img')
    canvas.setAttribute('aria-label', canFlipCoin ? 'Flip the Trash or Treasure coin' : canReturnDice ? 'Tap dice to return them to the cup' : canRoll ? 'Roll dice' : 'Game board dice')
    canvas.tabIndex = interactive ? 0 : -1
    canvas.style.cursor = interactive ? 'pointer' : 'grab'
  }, [canFlipCoin, canReturnDice, canRoll])

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
    camera.position.set(0, 18, 24)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
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
    // Keep the orbit pitched toward the tabletop. Near-horizontal views make
    // the far edge of the patterned inset climb into the panorama.
    controls.maxPolarAngle = 1.2
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
    diceBox.position.set(-3.15, DICE_HOME_BASE_FLOAT_HEIGHT, 0.9)
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
    diceShadow.position.set(-3.15, 0.18, 0.9)
    diceShadow.renderOrder = 1
    scene.add(diceShadow)

    const dice = createPrimitiveDicePair(resolveDiceValues(lastRollRef.current || 2, dicePropRef.current), boardTheme.diceSkin)
    let dieRoll = null
    let diceReturnTween = null
    dice.userData.returnToCup = () => {
      if (dieRoll || diceReturnTween) return
      diceReturnTween = {
        startedAt: latestSceneTime,
        from: [dice.userData.die1.position.clone(), dice.userData.die2.position.clone()],
        rotations: [dice.userData.die1.rotation.clone(), dice.userData.die2.rotation.clone()],
      }
    }
    dice.userData.startRoll = (value, explicitDice) => {
      const finalValues = Array.isArray(explicitDice) ? resolveDiceValues(value, explicitDice) : null
      if (dieRoll) {
        if (finalValues) dieRoll.finalValues = finalValues
        return
      }
      const { die1, die2 } = dice.userData
      const homeLift = getDiceHomeBaseMotion((latestSceneTime - startedAt) / 1000, reducedMotion).lift
      die1.position.set(-2.55, 0.62 + homeLift, 0.7)
      die2.position.set(-3.8, 0.62 + homeLift, 1.05)
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
    let activeCoinPointer = null
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
    const hitsCoin = (event) => {
      projectPointer(event)
      return raycaster.intersectObject(momentCoin, true).length > 0
    }
    if (import.meta.env.DEV) {
      window.__atLongLastHitDice = (x, y) => hitsDice({ clientX: x, clientY: y })
      window.__atLongLastHitCoin = (x, y) => hitsCoin({ clientX: x, clientY: y })
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
      const hitCoin = canFlipCoinRef.current && hitsCoin(event)
      if (event.isPrimary && event.button === 0 && hitCoin && !activeCoinPointer && !activeDicePointer) {
        consumePointer(event)
        activeCoinPointer = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() }
        momentCoin.userData.touch = { startedAt: activeCoinPointer.time, x: 0, y: 0 }
        controls.enabled = false
        canvas.style.cursor = 'grabbing'
        try { canvas.setPointerCapture(event.pointerId) } catch { /* Pointer capture is optional. */ }
        onDiceRattleRef.current?.({ energy: 0.18 })
        lastRattleAt = performance.now()
        vibrate(12)
        return
      }
      const hit = hitsDice(event)
      if (!event.isPrimary || event.button !== 0 || activeDicePointer || activeCoinPointer || !hit || (!canRollRef.current && !canReturnDiceRef.current)) return
      consumePointer(event)
      activeDicePointer = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now(), returning: canReturnDiceRef.current }
      dice.userData.touch = { startedAt: activeDicePointer.time, x: 0, y: 0 }
      controls.enabled = false
      canvas.style.cursor = 'grabbing'
      try { canvas.setPointerCapture(event.pointerId) } catch { /* Pointer capture is not available everywhere. */ }
      onDiceRattleRef.current?.({ energy: 0.18 })
      lastRattleAt = performance.now()
      vibrate(12)
    }
    const handleDicePointerMove = (event) => {
      if (activeCoinPointer?.id === event.pointerId) {
        consumePointer(event)
        const x = event.clientX - activeCoinPointer.x
        const y = event.clientY - activeCoinPointer.y
        momentCoin.userData.touch = { ...momentCoin.userData.touch, x, y }
        const now = performance.now()
        const distance = Math.hypot(x, y)
        if (distance > 6 && now - lastRattleAt > 75) {
          onDiceRattleRef.current?.({ energy: Math.min(1, distance / 100) })
          lastRattleAt = now
          vibrate(9)
        }
        return
      }
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
      if (canFlipCoinRef.current && hitsCoin(event)) canvas.style.cursor = 'pointer'
      else if ((canRollRef.current || canReturnDiceRef.current) && hitsDice(event)) canvas.style.cursor = 'pointer'
      else canvas.style.cursor = 'grab'
    }
    const handleDicePointerUp = (event) => {
      if (activeCoinPointer?.id === event.pointerId) {
        consumePointer(event)
        const start = activeCoinPointer
        const deltaX = event.clientX - start.x
        const deltaY = event.clientY - start.y
        activeCoinPointer = null
        momentCoin.userData.touch = null
        controls.enabled = true
        canvas.style.cursor = canFlipCoinRef.current || canRollRef.current ? 'pointer' : 'grab'
        try { canvas.releasePointerCapture(event.pointerId) } catch { /* Already released by the browser. */ }
        if (!canFlipCoinRef.current) return
        const gesture = makeDiceRollGesture(deltaX, deltaY, performance.now() - start.time)
        onDiceCastRef.current?.()
        vibrate(28)
        onCoinFlipRef.current?.(gesture)
        return
      }
      if (activeDicePointer?.id !== event.pointerId) return
      consumePointer(event)
      const start = activeDicePointer
      const deltaX = event.clientX - start.x
      const deltaY = event.clientY - start.y
      activeDicePointer = null
      dice.userData.touch = null
      controls.enabled = true
      canvas.style.cursor = canRollRef.current || canReturnDiceRef.current ? 'pointer' : 'grab'
      try { canvas.releasePointerCapture(event.pointerId) } catch { /* Already released by the browser. */ }
      if (start.returning && canReturnDiceRef.current) {
        onReturnDiceRef.current?.()
        return
      }
      if (!canRollRef.current) return
      const gesture = makeDiceRollGesture(deltaX, deltaY, performance.now() - start.time)
      onDiceCastRef.current?.()
      vibrate(28)
      onRollRef.current?.(gesture)
    }
    const handleDicePointerCancel = (event) => {
      if (activeCoinPointer?.id === event.pointerId) {
        consumePointer(event)
        activeCoinPointer = null
        momentCoin.userData.touch = null
        controls.enabled = true
        return
      }
      if (activeDicePointer?.id !== event.pointerId) return
      consumePointer(event)
      activeDicePointer = null
      dice.userData.touch = null
      controls.enabled = true
      settlePrimitiveDice(dice, dice.userData.values)
    }
    const handleDiceKeyDown = (event) => {
      if (canFlipCoinRef.current && (event.key === ' ' || event.key === 'Enter')) {
        event.preventDefault()
        event.stopPropagation()
        onDiceCastRef.current?.()
        onCoinFlipRef.current?.({ direction: { x: 0.1, y: -0.6 }, power: 0.65, source: 'keyboard' })
        return
      }
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
    canvas.setAttribute('role', canRollRef.current || canFlipCoinRef.current ? 'button' : 'img')
    canvas.setAttribute('aria-label', canFlipCoinRef.current ? 'Flip the Trash or Treasure coin' : canRollRef.current ? 'Roll dice' : 'Game board dice')
    canvas.tabIndex = canRollRef.current || canFlipCoinRef.current ? 0 : -1
    canvas.style.cursor = canRollRef.current || canFlipCoinRef.current ? 'pointer' : 'grab'

    const boardGroup = new THREE.Group()
    scene.add(boardGroup)

    const ringTexture = textureLoader.load(`/assets/board/rings/${boardTheme.id}.png`)
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
      const pieceColor = player.pieceColor || player.color
      const positionRing = createPlayerPositionRing(pieceColor)
      const fallback = createFallbackPawn(player.pieceColor || player.color, player.pieceMaterial)
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
    // Keep an in-flight move if the scene is rebuilt (for example when player
    // cosmetics or board-state decorations refresh during a saved card effect).
    let activePieceMove = activePieceMoveRef.current
    let pieceSettleUntil = 0
    let pieceSettlePlayerIndex = null
    let cameraShotMode = 'board'
    let drawnCard = null
    const landingEffects = []
    const landingEffectTextures = Object.fromEntries([
        'heart-glow', 'keepsake-light', 'ribbon-wisp', 'music-notes',
        'rose-petals', 'warm-cup', 'leaf-fireflies',
      ].map(name => [name, textureLoader.load(`/assets/board/landing-effects/${name}.png`)]))
    const spawnLandingEffect = (spaceIndex, stepIndex) => {
      const space = BOARD_SPACES[spaceIndex]
      const texture = landingEffectTextures[getLandingEffectForSpaceType(space?.type, stepIndex)]
      const position = boardPath[spaceIndex]?.position
      if (!texture || !position) return
      texture.colorSpace = THREE.SRGBColorSpace
      const sprite = new THREE.Mesh(
        new THREE.PlaneGeometry(2.25, 2.25),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }),
      )
      sprite.position.set(position.x, position.y + 1.15, position.z)
      sprite.quaternion.copy(camera.quaternion)
      sprite.scale.setScalar(0.35)
      sprite.userData.startedAt = latestSceneTime
      sprite.userData.baseY = sprite.position.y
      scene.add(sprite)
      landingEffects.push(sprite)
    }
    let activeCardDrawKey = null
    let coinFlip = null
    let activeCoinFlipKey = null
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
    const trashPileMarker = createBoardCardPileMarker(boardTheme, 'trash', cardPilePalette.trash)
    const treasurePileMarker = createBoardCardPileMarker(boardTheme, 'treasure', cardPilePalette.treasure)
    const discardPileMarker = createBoardCardPileMarker(boardTheme, 'discard', cardPilePalette.discard)
    scene.add(trashPileMarker, treasurePileMarker, discardPileMarker)
    const momentCoin = createMomentCoin(boardTheme, BOARD_MOMENT_COIN_POSITION)
    scene.add(momentCoin)

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
          tintModel(model, player.pieceColor || player.color, player.pieceMaterial)
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
      boxRim.material.emissiveIntensity = canRollRef.current && !reducedMotion
        ? 0.22 + (0.12 + 0.1 * (0.5 + 0.5 * Math.sin(elapsed * 2.4)))
        : 0.28
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
      const activePos = tokenGroups[activePlayerIndexRef.current]?.position || boardPath[targetIndicesRef.current[activePlayerIndexRef.current]].position
      const otherIndex = (activePlayerIndexRef.current + 1) % 2
      const otherPos = tokenGroups[otherIndex]?.position || boardPath[targetIndicesRef.current[otherIndex]]?.position || activePos
      const midpoint = new THREE.Vector3().addVectors(activePos, otherPos).multiplyScalar(0.5)

      if (!dieRoll && !activePieceMove && !pausePieceMovementRef.current && pieceMoveQueueRef.current.length) {
        const availableMoveIndex = pieceMoveQueueRef.current.findIndex(move => move.key !== deferPieceMoveKeyRef.current)
        if (availableMoveIndex >= 0) {
          activePieceMove = { ...pieceMoveQueueRef.current.splice(availableMoveIndex, 1)[0], travelStartedAt: null, stepIndex: 0 }
          activePieceMoveRef.current = activePieceMove
          activePieceMoveKeyRef.current = activePieceMove.key
          pieceSettleUntil = 0
        }
      }

      const settlingPiece = !activePieceMove && latestSceneTime < pieceSettleUntil
        ? tokenGroups[pieceSettlePlayerIndex]?.position
        : null
      const movingPiecePosition = activePieceMove
        ? tokenGroups[activePieceMove.playerIndex]?.position
        : settlingPiece
      const coinInFocus = canFlipCoinRef.current || Boolean(coinFlip)
      const coinShotProgress = coinFlip
        ? Math.min(1, Math.max(0, (latestSceneTime - coinFlip.startedAt) / coinFlip.duration))
        : 0
      let shotFocus = null
      if (coinInFocus) {
        cameraShotMode = 'coin'
        shotFocus = momentCoin.position
      } else if (canRollRef.current && !userInteracting) {
        // A remembered manual orbit can otherwise leave the dice offscreen.
        // Reframe the tray as soon as this player can roll, then release the
        // focus to the piece when movement begins.
        cameraShotMode = 'dice-ready'
        shotFocus = diceBox.position.clone().add(new THREE.Vector3(0, 0.35, 0))
      } else if (rollingRef.current || dieRoll) {
        cameraShotMode = 'dice'
        shotFocus = new THREE.Vector3().addVectors(dice.userData.die1.position, dice.userData.die2.position).multiplyScalar(0.5)
      } else if (movingPiecePosition) {
        cameraShotMode = 'piece'
        shotFocus = movingPiecePosition
      } else {
        cameraShotMode = 'board'
      }

      const idleOrbit = shouldOrbitBoard({
        phase: phaseRef.current,
        rolling: Boolean(rollingRef.current || dieRoll || coinInFocus),
        movingPiece: Boolean(activePieceMove || settlingPiece),
        queuedMoves: pieceMoveQueueRef.current.length,
        interacting: userInteracting,
        reducedMotion,
        idleMs: latestSceneTime - lastViewInputAt,
      })
      controls.autoRotate = cameraShotMode === 'board' && idleOrbit
      if (cameraShotMode !== 'board') {
        const pose = getBoardCameraShotPose(cameraShotMode, shotFocus, elapsed, coinShotProgress)
        const cameraEase = 1 - Math.exp(-frameDeltaSeconds * (cameraShotMode === 'coin' ? 6.5 : 4.5))
        camera.position.lerp(pose.position, cameraEase)
        controls.target.lerp(pose.target, cameraEase)
        controls.enabled = false
      } else {
        controls.enabled = true
        if (idleOrbit) {
          camera.position.y = THREE.MathUtils.lerp(camera.position.y, 18.5, Math.min(1, frameDeltaSeconds * 0.55))
          controls.target.lerp(boardCenter, Math.min(1, frameDeltaSeconds * 0.55))
        } else if (!manualView) {
          const isKeepsakePhase = phaseRef.current === 'keepsake'
          const targetFocus = pacingMode === 'sharedSpotlight' || isKeepsakePhase ? activePos : midpoint
          const targetY = isKeepsakePhase ? 10.5 : activePieceMove ? 13.5 : 18
          const targetZ = isKeepsakePhase ? 12.5 + activePos.z * 0.15 : (activePieceMove ? 17 : 24) + targetFocus.z * 0.2
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
      }

      if (dieRoll) {
        const duration = DICE_ROLL_DURATION_SECONDS
        const elapsed = (latestSceneTime - dieRoll.startedAt) / 1000
        const progress = dieRoll.finalValues
          ? Math.min(1, elapsed / duration)
          : Math.min(0.94, elapsed / duration)
        const eased = 1 - (1 - progress) ** 3
        const lift1 = Math.sin(progress * Math.PI)
        const cameraLift = Math.max(0, 1 - elapsed / 0.24) * 0.72
        const tumbleFace1 = 1 + (Math.floor(elapsed * 14) % 6)

        const die1 = dice.userData.die1
        const die2 = dice.userData.die2

        setPrimitiveDieValue(die1, dieRoll.finalValues && progress >= 1 ? dieRoll.finalValues[0] : tumbleFace1)
        const gesture = dieRoll.gesture || {}
        const direction = gesture.direction || { x: 0.55, y: -0.3 }
        const throwPower = 0.78 + Math.max(0, Math.min(1, gesture.power || 0)) * 0.72
        die1.position.x = THREE.MathUtils.lerp(-2.55, -0.15, progress) + lift1 * (0.35 + direction.x * 0.42) + Math.sin(progress * Math.PI * 2.5) * 0.16
        die1.position.y = 0.62 + diceHomeMotion.lift + cameraLift + lift1 * 1.08 * throwPower
        die1.position.z = THREE.MathUtils.lerp(0.45, -0.3, progress) + lift1 * (0.18 + direction.y * 0.38) + Math.cos(progress * Math.PI * 2) * 0.12 * lift1
        die1.rotation.x = -0.04 + eased * (Math.PI * (3.5 + throwPower) + (dieRoll.finalValues?.[0] || 0) * 0.18)
        die1.rotation.y = 0.32 + eased * (Math.PI * (4.2 + throwPower) + (dieRoll.finalValues?.[0] || 0) * 0.22 + direction.x)
        die1.rotation.z = -0.06 + eased * Math.PI * 3
        die1.scale.setScalar(1 + lift1 * 0.25)

        const prog2 = Math.min(1, Math.max(0, (progress - 0.04) / 0.96))
        const eased2 = 1 - (1 - prog2) ** 3
        const lift2 = Math.sin(prog2 * Math.PI)
        const tumbleFace2 = 1 + (Math.floor(elapsed * 17 + 2) % 6)
        setPrimitiveDieValue(die2, dieRoll.finalValues && prog2 >= 1 ? dieRoll.finalValues[1] : tumbleFace2)
        die2.position.x = THREE.MathUtils.lerp(-3.8, 1.0, prog2) + lift2 * (0.42 - direction.x * 0.4) - Math.sin(prog2 * Math.PI * 2.4) * 0.15
        die2.position.y = 0.62 + diceHomeMotion.lift + cameraLift + lift2 * 1.16 * throwPower
        die2.position.z = THREE.MathUtils.lerp(0.82, 0.25, prog2) + lift2 * (0.14 - direction.y * 0.38) - Math.cos(prog2 * Math.PI * 2) * 0.1 * lift2
        die2.rotation.x = 0.08 + eased2 * (Math.PI * (4.4 + throwPower) + (dieRoll.finalValues?.[1] || 0) * 0.16)
        die2.rotation.y = -0.26 + eased2 * (Math.PI * (3.6 + throwPower) + (dieRoll.finalValues?.[1] || 0) * 0.24 - direction.x)
        die2.rotation.z = 0.12 - eased2 * Math.PI * 3.2
        die2.scale.setScalar(1 + lift2 * 0.25)

        const impactStep = Math.min(8, Math.floor(Math.min(1, elapsed / duration) * 9))
        if (impactStep > dieRoll.lastImpactStep) {
          dieRoll.lastImpactStep = impactStep
          onDiceImpactRef.current?.({ step: impactStep, energy: Math.max(0.24, 0.86 - impactStep * 0.07), side: impactStep % 2 })
        }

        if (progress >= 1 && dieRoll.finalValues) {
          const finalValues = dieRoll.finalValues
          const settledRoll = dieRoll
          dieRoll = null
          settlePrimitiveDice(dice, finalValues)
          if (!settledRoll.notified) {
            settledRoll.notified = true
            onDiceSettledRef.current?.({ dice: finalValues })
          }
        }
      } else if (diceReturnTween) {
        const amount = Math.min(1, Math.max(0, (latestSceneTime - diceReturnTween.startedAt) / 620))
        const eased = 1 - (1 - amount) ** 3
        const homeY = 0.62 + diceHomeMotion.lift
        const targets = [new THREE.Vector3(-2.55, homeY, 0.7), new THREE.Vector3(-3.8, homeY, 1.05)]
        const dieParts = [dice.userData.die1, dice.userData.die2]
        dieParts.forEach((die, index) => {
          die.position.lerpVectors(diceReturnTween.from[index], targets[index], eased)
          die.rotation.x = THREE.MathUtils.lerp(diceReturnTween.rotations[index].x, index ? 0.08 : -0.04, eased)
          die.rotation.y = THREE.MathUtils.lerp(diceReturnTween.rotations[index].y, index ? -0.26 : 0.32, eased)
          die.rotation.z = THREE.MathUtils.lerp(diceReturnTween.rotations[index].z, index ? 0.12 : -0.06, eased)
          die.scale.setScalar(1 + Math.sin(amount * Math.PI) * 0.08)
        })
        if (amount >= 1) diceReturnTween = null
      } else if (dice.userData.touch) {
        const touch = dice.userData.touch
        const die1 = dice.userData.die1
        const die2 = dice.userData.die2
        const press = Math.min(1, Math.hypot(touch.x, touch.y) / 44)
        const breathe = Math.sin((latestSceneTime - touch.startedAt) / 1000 * 18) * 0.025
        die1.position.set(-2.55 + touch.x * 0.004, 0.62 + diceHomeMotion.lift + breathe, 0.7 - touch.y * 0.004)
        die1.rotation.set(-0.04 - touch.y * 0.004, 0.32, -0.06 + touch.x * 0.005)
        die1.scale.setScalar(1 + press * 0.09)
        die2.position.set(-3.8 + touch.x * 0.004, 0.62 + diceHomeMotion.lift - breathe, 1.05 - touch.y * 0.004)
        die2.rotation.set(0.08 - touch.y * 0.004, -0.26, 0.12 + touch.x * 0.005)
        die2.scale.setScalar(1 + press * 0.09)
      }

      if (cardDrawKeyRef.current && cardDrawKeyRef.current !== activeCardDrawKey) {
        activeCardDrawKey = cardDrawKeyRef.current
        const pile = scene.getObjectByName(`board-card-${momentCardCategoryRef.current}-pile-marker`)
        if (pile) {
          const start = pile.getWorldPosition(new THREE.Vector3())
          start.y += 0.65
          const facing = new THREE.Vector3()
          camera.getWorldDirection(facing)
          const group = new THREE.Group()
          group.name = 'drawn-moment-card-flight'
          const texture = makeCardBackTexture(momentCardCategoryRef.current)
          const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, depthWrite: false })
          const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 2.5), material)
          mesh.rotation.x = -Math.PI / 2
          group.add(mesh)
          group.position.copy(start)
          group.scale.setScalar(0.16)
          group.userData.flight = { startedAt: latestSceneTime, start, direction: facing, key: activeCardDrawKey }
          scene.add(group)
          drawnCard = group
        }
      }

      const coinScaleTarget = cameraShotMode === 'coin' ? 1.2 : 1
      momentCoin.scale.lerp(new THREE.Vector3(coinScaleTarget, coinScaleTarget, coinScaleTarget), 1 - Math.exp(-frameDeltaSeconds * 5))
      if (coinFlipKeyRef.current && coinOutcomeRef.current && coinFlipKeyRef.current !== activeCoinFlipKey) {
        coinFlip = {
          key: coinFlipKeyRef.current,
          outcome: coinOutcomeRef.current,
          gesture: coinGestureRef.current,
          startedAt: latestSceneTime,
          duration: 2.8,
          lastImpact: -1,
          start: momentCoin.position.clone(),
        }
        activeCoinFlipKey = coinFlip.key
      }
      if (coinFlip) {
        const progress = Math.min(1, Math.max(0, (latestSceneTime - coinFlip.startedAt) / coinFlip.duration))
        // A pronounced slow-motion pocket around the apex, followed by a
        // slightly quicker descent into the suspenseful table landing.
        const motionProgress = THREE.MathUtils.clamp(progress - Math.sin(progress * Math.PI * 2) * 0.24 / (Math.PI * 2), 0, 1)
        const eased = 1 - (1 - motionProgress) ** 3
        const gesture = coinFlip.gesture || {}
        const turns = Math.round(3.5 + Math.min(2.5, Math.max(0, (gesture.power || 0.55) * 2.5)))
        const resultHalfTurn = coinFlip.outcome === 'trash' ? Math.PI : 0
        const landingWobble = progress > 0.84 ? Math.sin((progress - 0.84) / 0.16 * Math.PI * 4) * (1 - progress) * 1.1 : 0
        const arcHeight = 4.1 + Math.min(1.25, (gesture.power || 0.55) * 1.2)
        momentCoin.position.set(
          coinFlip.start.x + (gesture.direction?.x || 0) * 1.2 * Math.sin(motionProgress * Math.PI),
          coinFlip.start.y + 4 * arcHeight * motionProgress * (1 - motionProgress) + (progress > 0.93 ? 0.055 * Math.sin((progress - 0.93) / 0.07 * Math.PI) : 0),
          coinFlip.start.z + (gesture.direction?.y || 0) * 0.9 * Math.sin(motionProgress * Math.PI),
        )
        const disc = momentCoin.userData.disc
        disc.rotation.x = turns * Math.PI * 2 * eased + resultHalfTurn * eased + landingWobble
        disc.rotation.z = Math.sin(progress * Math.PI * 5) * (1 - progress) * 0.11
        const impact = Math.min(3, Math.floor(progress * 4))
        if (impact > coinFlip.lastImpact && impact < 3) {
          coinFlip.lastImpact = impact
          onDiceImpactRef.current?.({ step: impact, energy: 0.3 + Math.sin(impact * 1.7) * 0.1, side: impact % 2 })
        }
        if (progress >= 1) {
          momentCoin.position.set(coinFlip.start.x, coinFlip.start.y, coinFlip.start.z)
          disc.rotation.x = Math.round(turns) * Math.PI * 2 + resultHalfTurn
          disc.rotation.z = 0
          const completedKey = coinFlip.key
          coinFlip = null
          onCoinFlipCompleteRef.current?.(completedKey)
        }
      } else if (!momentCoin.userData.touch) {
        momentCoin.position.y = momentCoin.userData.baseHeight
      } else {
        const touch = momentCoin.userData.touch
        const press = Math.min(1, Math.hypot(touch.x, touch.y) / 44)
        momentCoin.position.y = momentCoin.userData.baseHeight - press * 0.025
      }
      for (let index = landingEffects.length - 1; index >= 0; index -= 1) {
        const effect = landingEffects[index]
        const age = (latestSceneTime - effect.userData.startedAt) / 1000
        const progress = Math.min(1, Math.max(0, age / 1.45))
        const fade = Math.min(1, progress * 7, (1 - progress) * 2.8)
        effect.material.opacity = Math.max(0, fade) * 0.86
        effect.position.y = effect.userData.baseY + progress * 0.62
        effect.scale.setScalar(0.35 + progress * 0.9)
        effect.quaternion.copy(camera.quaternion)
        if (progress >= 1) {
          scene.remove(effect)
          effect.geometry.dispose()
          effect.material.dispose()
          landingEffects.splice(index, 1)
        }
      }
      if (drawnCard?.userData.flight) {
        const flight = drawnCard.userData.flight
        const p = Math.min(1, (latestSceneTime - flight.startedAt) / 930)
        const eased = 1 - (1 - p) ** 3
        drawnCard.position.copy(flight.start).addScaledVector(flight.direction, -2.6 * eased)
        drawnCard.position.y += 2.5 * eased
        drawnCard.scale.setScalar(0.16 + 0.58 * eased)
        drawnCard.rotation.set(-Math.PI / 2 + eased * 0.12, eased * Math.PI * 2, 0)
        if (p >= 1) {
          scene.remove(drawnCard)
          drawnCard.traverse(object => {
            object.geometry?.dispose()
            if (object.material) { object.material.map?.dispose(); object.material.dispose() }
          })
          drawnCard = null
          onCardDrawCompleteRef.current?.(flight.key)
        }
      }

      if (!dieRoll && !dice.userData.touch) {
        dice.userData.die1.position.y = 0.62 + diceHomeMotion.lift
        dice.userData.die2.position.y = 0.62 + diceHomeMotion.lift
      }

      tokenGroups.forEach((token, index) => {
        if (activePieceMove?.playerIndex === index && !dieRoll && pausePieceMovementRef.current) {
          if (activePieceMove.travelStartedAt !== null) activePieceMove.travelStartedAt += frameDeltaSeconds * 1000
          return
        }
        if (activePieceMove?.playerIndex === index && !dieRoll && !pausePieceMovementRef.current) {
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
            spawnLandingEffect(endSpace, activePieceMove.stepIndex + completedPieceSteps)
            onPieceStepRef.current?.({
              playerIndex: index,
              spaceIndex: endSpace,
              stepIndex: activePieceMove.stepIndex + 1,
              steps: activePieceMove.steps,
            })
            completedPieceSteps += 1
            activePieceMove.stepIndex += 1
            activePieceMove.travelStartedAt += stepDuration
            activePieceMoveRef.current = activePieceMove
            if (activePieceMove.stepIndex >= activePieceMove.steps) {
              const completedMove = activePieceMove
              activePieceMove = null
              activePieceMoveRef.current = null
              activePieceMoveKeyRef.current = null
              pieceSettlePlayerIndex = completedMove.playerIndex
              pieceSettleUntil = latestSceneTime + 460
              onPieceMoveCompleteRef.current?.({
                playerIndex: completedMove.playerIndex,
                steps: completedMove.steps,
                moveId: completedMove.key,
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
          mode: cameraShotMode !== 'board' ? `${cameraShotMode}-closeup` : controls.autoRotate ? 'idle-orbit' : manualView ? 'gesture' : 'follow',
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
          ringTexture: `/assets/board/rings/${boardTheme.id}.png`,
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
        queuedPieceMoves: pieceMoveQueueRef.current.map(move => ({ key: move.key, playerIndex: move.playerIndex, steps: move.steps, direction: move.direction })),
        seenPieceMoveKeys: [...seenMoveKeysRef.current],
        deferredPieceMoveKey: deferPieceMoveKeyRef.current,
      activeMomentMoveKey: activeMomentMoveKeyRef.current,
      activePieceMoveKey: activePieceMoveKeyRef.current,
        pieceMovementPaused: pausePieceMovementRef.current,
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
          storyRing: { radius: ringRadius, height: ringHeight, hollow: true, texture: `/assets/board/rings/${boardTheme.id}.png` },
          spaceColors: boardTheme.spaceColors,
          tiles: 'separate theme-colored raised spaces with pulsing underglow',
          connector: 'none',
        },
        cardPiles: {
          deck: 'separate Trash and Treasure piles',
          cardBack: 'generated branded Trash and Treasure backs',
          labels: 'etched into the board fabric',
          trash: { position: BOARD_CARD_PILE_POSITIONS.trash, outline: 'dotted', color: cardPilePalette.trash, cards: 3 },
          treasure: { position: BOARD_CARD_PILE_POSITIONS.treasure, outline: 'dotted', color: cardPilePalette.treasure, cards: 3 },
          discard: { position: BOARD_CARD_PILE_POSITIONS.discard, outline: 'dotted', color: cardPilePalette.discard, cards: 1 },
          coin: { position: BOARD_MOMENT_COIN_POSITION, separateFromPiles: true },
        },
        path: {
          branchCount: 0,
          segments: boardPath.length,
          visible: true,
          shape: 'circle',
          radius: BOARD_PATH_RADIUS,
        },
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
            color: player.pieceColor || player.color,
            displayName: player.displayName,
            material: player.pieceMaterial || 'porcelain',
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
      if (import.meta.env.DEV) {
        delete window.__atLongLastHitDice
        delete window.__atLongLastHitCoin
      }
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
