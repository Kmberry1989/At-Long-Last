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
import { getBoardThemeById, getBoardThemeForRound } from './boardThemes.js'
import { createBoardEnvironment } from './boardEnvironment.js'

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

function buildBoardPath() {
  return BOARD_SPACES.map((space, index) => {
    const angle = (index / BOARD_SPACES.length) * Math.PI * 2 - Math.PI / 2
    const radiusX = 11
    const radiusZ = 8.2
    return {
      ...space,
      position: new THREE.Vector3(
        Math.cos(angle) * radiusX,
        0.35,
        Math.sin(angle) * radiusZ,
      ),
    }
  })
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
  const symbol =
    type === 'heart'
      ? '♥'
      : type === 'oops'
        ? '!'
        : type === 'duel'
          ? '✦'
          : type === 'keepsake'
          ? '?'
            : '∞'
  ctx.strokeText(symbol, canvas.width / 2, 105)
  ctx.fillText(symbol, canvas.width / 2, 105)

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

function configureVelvetTexture(texture, repeatX, repeatY) {
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  texture.anisotropy = 8
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
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

export function calculateStepPath(from, steps, boardSize = 20) {
  const path = []
  const start = ((from % boardSize) + boardSize) % boardSize
  const count = Math.max(0, steps)
  for (let i = 0; i <= count; i += 1) {
    path.push((start + i) % boardSize)
  }
  return path
}

function createSingleDie(value, velvetTexture, isDie2 = false) {
  const die = new THREE.Group()
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(0.96, 0.96, 0.96, 5, 0.16),
    new THREE.MeshStandardMaterial({
      color: isDie2 ? '#16141a' : '#1e1c22',
      map: velvetTexture,
      metalness: 0.16,
      roughness: 0.82,
    }),
  )
  body.castShadow = true
  body.receiveShadow = true
  die.add(body)

  const pipLayouts = {
    1: [[0, 0]],
    2: [[-0.21, -0.21], [0.21, 0.21]],
    3: [[-0.23, -0.23], [0, 0], [0.23, 0.23]],
    4: [[-0.21, -0.21], [0.21, -0.21], [-0.21, 0.21], [0.21, 0.21]],
    5: [[-0.23, -0.23], [0.23, -0.23], [0, 0], [-0.23, 0.23], [0.23, 0.23]],
    6: [[-0.23, -0.26], [-0.23, 0], [-0.23, 0.26], [0.23, -0.26], [0.23, 0], [0.23, 0.26]],
  }
  const pipMaterial = new THREE.MeshStandardMaterial({
    color: '#f5c768',
    metalness: 0.84,
    roughness: 0.22,
  })
  const pipGeometry = new THREE.SphereGeometry(0.07, 14, 10)

  const pipGroups = {}
  Object.entries(pipLayouts).forEach(([faceValue, layout]) => {
    const group = new THREE.Group()
    layout.forEach(([x, z]) => {
      const pip = new THREE.Mesh(pipGeometry, pipMaterial)
      pip.position.set(x, 0.485, z)
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
  Object.entries(die.userData.pipGroups || {}).forEach(([faceValue, group]) => {
    group.visible = Number(faceValue) === resolvedValue
  })
  die.userData.value = resolvedValue
}

function createPrimitiveDicePair(initialValues = [1, 1], velvetTexture) {
  const dicePair = new THREE.Group()
  const die1 = createSingleDie(initialValues[0], velvetTexture, false)
  const die2 = createSingleDie(initialValues[1], velvetTexture, true)

  die1.position.set(-2.0, 0.62, 0.45)
  die1.rotation.set(-0.04, 0.32, -0.06)

  die2.position.set(-3.25, 0.62, 0.82)
  die2.rotation.set(0.08, -0.26, 0.12)

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
  die1.rotation.set(-0.04, 0.32, -0.06)
  die1.scale.setScalar(1)

  die2.position.set(-3.25, 0.62, 0.82)
  die2.rotation.set(0.08, -0.26, 0.12)
  die2.scale.setScalar(1)
}

export function createPrimitiveDie(value, velvetTexture) {
  return createPrimitiveDicePair(resolveDiceValues(value), velvetTexture)
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
  lastRoll,
  onPieceStep = null,
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
  const resetViewRef = useRef(null)
  const lastRollRef = useRef(lastRoll)
  const dicePropRef = useRef(dice)
  const onPieceStepRef = useRef(onPieceStep)
  const phaseRef = useRef(phase)
  const boardPath = useMemo(() => buildBoardPath(), [])
  const boardTheme = useMemo(
    () => getBoardThemeById(themeId) || getBoardThemeForRound(round),
    [themeId, round],
  )
  const targetIndicesRef = useRef(positions)
  const activePlayerIndexRef = useRef(activePlayerIndex)

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
    dicePropRef.current = dice
  }, [dice])

  useEffect(() => {
    onPieceStepRef.current = onPieceStep
  }, [onPieceStep])

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
  }, [lastRoll, rolling])

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
    controls.screenSpacePanning = true
    controls.target.set(0, 0, 0)
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE
    controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY
    controls.mouseButtons.RIGHT = THREE.MOUSE.PAN
    controls.touches.ONE = THREE.TOUCH.ROTATE
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN
    controls.addEventListener('start', () => {
      manualView = true
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
      new THREE.CylinderGeometry(8.5, 8.5, 0.2, 64),
      new THREE.MeshStandardMaterial({
        map: insetVelvet,
        color: boardTheme.surfaces.inset.color,
        metalness: 0.02,
        roughness: 0.9,
      }),
    )
    velvetInset.position.y = 0.02
    velvetInset.scale.z = 0.72
    velvetInset.receiveShadow = true
    scene.add(velvetInset)

    const insetPiping = new THREE.Mesh(
      new THREE.TorusGeometry(8.52, 0.08, 12, 96),
      new THREE.MeshStandardMaterial({
        color: '#d8aa61',
        metalness: 0.68,
        roughness: 0.32,
      }),
    )
    insetPiping.rotation.x = Math.PI / 2
    insetPiping.scale.y = 0.72
    insetPiping.position.y = 0.14
    insetPiping.castShadow = true
    scene.add(insetPiping)

    const dice = createPrimitiveDicePair(
      resolveDiceValues(lastRollRef.current || 2, dicePropRef.current),
      insetVelvet,
    )
    let dieRoll = null
    dice.userData.startRoll = (value, explicitDice) => {
      const resolved = resolveDiceValues(value, explicitDice)
      dieRoll = {
        finalValues: resolved,
        finalValue: resolved[0] + resolved[1],
        startedAt: latestSceneTime,
      }
    }
    dice.userData.finishRoll = (value, explicitDice) => {
      dieRoll = null
      settlePrimitiveDice(dice, resolveDiceValues(value, explicitDice))
    }
    dieRef.current = dice
    scene.add(dice)

    const boardGroup = new THREE.Group()
    scene.add(boardGroup)

    const routeMaterial = new THREE.MeshStandardMaterial({
      color: '#583747',
      metalness: 0.18,
      roughness: 0.67,
    })
    const routeInlayMaterial = new THREE.MeshStandardMaterial({
      color: '#d8b67d',
      metalness: 0.65,
      roughness: 0.36,
    })
    getBoardPathSegments(boardPath).forEach((segment) => {
      const route = new THREE.Mesh(
        new RoundedBoxGeometry(0.96, 0.13, segment.length, 4, 0.09),
        routeMaterial,
      )
      route.position.set(segment.center.x, 0.17, segment.center.z)
      route.rotation.y = segment.angle
      route.castShadow = true
      route.receiveShadow = true
      boardGroup.add(route)

      const inlay = new THREE.Mesh(
        new RoundedBoxGeometry(0.08, 0.035, segment.length, 3, 0.018),
        routeInlayMaterial,
      )
      inlay.position.set(segment.center.x, 0.255, segment.center.z)
      inlay.rotation.y = segment.angle
      inlay.castShadow = true
      boardGroup.add(inlay)
    })

    const tileMarks = new Map()
    boardPath.forEach((space) => {
      tileMarks.set(space.id, makeTileMarkTexture(space.label, space.type))
    })

    boardPath.forEach((space) => {
      const tile = new THREE.Group()
      const style = TILE_STYLES[space.type]
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
      const base = new THREE.Mesh(
        new RoundedBoxGeometry(2.2, 0.4, 2.2, 4, 0.15),
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
        new RoundedBoxGeometry(1.92, 0.09, 1.92, 4, 0.14),
        new THREE.MeshStandardMaterial({
          color: style.tint,
          map: style.texture === 'rose' ? insetVelvet : tabletopVelvet,
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

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath(DRACO_GLTF_CONFIG)
    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)
    const loadedDecorations = new Set()
    const failedDecorations = new Set()
    const loadedPlayerAvatars = new Set()
    const animatedDecorations = []
    const propGlows = []

    boardTheme.decorations.forEach((decoration) => {
      loader.load(
        decoration.model,
        (gltf) => {
          if (disposed) {
            disposeObject3D(gltf.scene)
            return
          }

          const model = gltf.scene
          fitModel(model, decoration.size)
          model.rotation.y = decoration.rotation
          model.position.add(new THREE.Vector3(...decoration.position))
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
            }
          })
          model.userData.decorationId = decoration.id
          scene.add(model)
          loadedDecorations.add(decoration.id)
          if (decoration.motion) {
            animatedDecorations.push({
              model,
              motion: decoration.motion,
              baseY: model.position.y,
              baseRotation: model.rotation.y,
            })
          }
          if (decoration.glow) {
            const propLight = new THREE.PointLight(
              decoration.glow.color,
              decoration.glow.intensity,
              decoration.glow.distance,
            )
            propLight.position.set(decoration.position[0], 1.35, decoration.position[2])
            scene.add(propLight)
            propGlows.push({ light: propLight, intensity: decoration.glow.intensity })
          }
        },
        undefined,
        () => {
          failedDecorations.add(decoration.id)
        },
      )
    })

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
      const elapsed = (latestSceneTime - startedAt) / 1000
      environment.update(elapsed, reducedMotion)
      animatedDecorations.forEach(({ model, motion, baseY, baseRotation }, index) => {
        if (reducedMotion) return
        if (motion === 'flutter') model.position.y = baseY + Math.sin(elapsed * 2.4 + index) * 0.22
        if (motion === 'perch') model.rotation.y = baseRotation + Math.sin(elapsed * 0.7) * 0.09
      })
      propGlows.forEach(({ light, intensity }, index) => {
        light.intensity = reducedMotion ? intensity : intensity * (0.91 + Math.sin(elapsed * 2.2 + index) * 0.09)
      })

      const activePos = boardPath[targetIndicesRef.current[activePlayerIndexRef.current]].position
      const otherIndex = (activePlayerIndexRef.current + 1) % 2
      const otherPos = boardPath[targetIndicesRef.current[otherIndex]]?.position || activePos
      const midpoint = new THREE.Vector3().addVectors(activePos, otherPos).multiplyScalar(0.5)

      if (!manualView) {
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

      if (dieRoll) {
        const duration = 1.35
        const progress = Math.min(1, (latestSceneTime - dieRoll.startedAt) / 1000 / duration)
        const eased = 1 - (1 - progress) ** 3
        const lift1 = Math.sin(progress * Math.PI)
        const tumbleFace1 = 1 + ((Math.floor(progress * 18) + dieRoll.finalValues[0]) % 6)

        const die1 = dice.userData.die1
        const die2 = dice.userData.die2

        setPrimitiveDieValue(die1, progress >= 1 ? dieRoll.finalValues[0] : tumbleFace1)
        die1.position.x = -2.0 + lift1 * 2.2 + Math.sin(progress * Math.PI * 2) * 0.25
        die1.position.y = 0.62 + lift1 * 2.3
        die1.position.z = 0.45 + lift1 * 0.55
        die1.rotation.x = -0.04 + eased * (Math.PI * 4 + dieRoll.finalValues[0] * 0.18)
        die1.rotation.y = 0.32 + eased * (Math.PI * 5 + dieRoll.finalValues[0] * 0.22)
        die1.rotation.z = -0.06 + eased * Math.PI * 3
        die1.scale.setScalar(1 + lift1 * 1.05)

        const prog2 = Math.min(1, Math.max(0, (progress - 0.04) / 0.96))
        const eased2 = 1 - (1 - prog2) ** 3
        const lift2 = Math.sin(prog2 * Math.PI)
        const tumbleFace2 = 1 + ((Math.floor(prog2 * 20) + dieRoll.finalValues[1]) % 6)
        setPrimitiveDieValue(die2, prog2 >= 1 ? dieRoll.finalValues[1] : tumbleFace2)
        die2.position.x = -3.25 + lift2 * 2.5 - Math.sin(prog2 * Math.PI * 2) * 0.28
        die2.position.y = 0.62 + lift2 * 2.5
        die2.position.z = 0.82 + lift2 * 0.35
        die2.rotation.x = 0.08 + eased2 * (Math.PI * 5 + dieRoll.finalValues[1] * 0.16)
        die2.rotation.y = -0.26 + eased2 * (Math.PI * 4 + dieRoll.finalValues[1] * 0.24)
        die2.rotation.z = 0.12 - eased2 * Math.PI * 3.2
        die2.scale.setScalar(1 + lift2 * 1.05)

        if (progress >= 1) {
          const finalValues = dieRoll.finalValues
          dieRoll = null
          settlePrimitiveDice(dice, finalValues)
        }
      }

      tokenGroups.forEach((token, index) => {
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

      controls.update()
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
          mode: manualView ? 'gesture' : 'follow',
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
          round,
          environment: boardTheme.environment.mode,
        },
        decorations: boardTheme.decorations.map((decoration) => ({
          id: decoration.id,
          label: decoration.label,
          failed: failedDecorations.has(decoration.id),
          loaded: loadedDecorations.has(decoration.id),
        })),
        dice: {
          construction: 'rounded-box-and-sphere primitives with ebony and gold finish',
          rolling: Boolean(dieRoll),
          sum: dice.userData.values[0] + dice.userData.values[1],
          values: dice.userData.values,
        },
        die: {
          construction: 'rounded-box-and-sphere primitives with ebony and gold finish',
          rolling: Boolean(dieRoll),
          value: dice.userData.value,
        },
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
          boardInset: boardTheme.surfaces.inset.texture,
          tabletop: boardTheme.surfaces.tabletop.texture,
          tiles: 'raised velvet tiles with connected inlaid route',
        },
        path: {
          branchCount: 0,
          segments: boardPath.length,
          visible: true,
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
    resetViewRef.current = () => {
      const focus = boardPath[targetIndicesRef.current[activePlayerIndexRef.current]].position
      manualView = false
      controls.enableDamping = false
      controls.reset()
      camera.position.set(focus.x * 0.22, 16, 18 + focus.z * 0.2)
      controls.target.set(focus.x * 0.2, 0, focus.z * 0.38)
      controls.update()
      controls.enableDamping = true

    }

    animate()

    return () => {
      disposed = true
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }

      resizeObserver.disconnect()
      controls.dispose()
      if (window.render_game_to_text === renderGameToText) {
        delete window.render_game_to_text
      }
      if (window.advanceTime === advanceTime) {
        delete window.advanceTime
      }
      dracoLoader.dispose()
      if (dieRef.current === die) {
        dieRef.current = null
      }
      resetViewRef.current = null
      disposeObject3D(scene)
      renderer.renderLists.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [boardPath, boardStateKey, boardTheme, players, round])

  return (
    <>
      <div className="board-canvas" ref={mountRef} />
      <div
        aria-label="Board view controls. Drag to look around, pinch to zoom, and use two fingers to move the board."
        className="board-view-controls"
      >
        <span aria-hidden="true">↻</span>
        <button
          aria-label="Center the board on the current player"
          onClick={() => resetViewRef.current?.()}
          type="button"
        >
          Center
        </button>
      </div>
    </>
  )
}
