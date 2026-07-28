import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  DRACOLoader,
  DRACO_GLTF_CONFIG,
} from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { resolvePlayerAvatar } from '../features/couple/playerAvatar.js'
import { BOARD_SPACES } from '../features/session/boardConfig.js'

const BOARD_DECORATIONS = [
  {
    id: 'trinket-box',
    model: '/assets/board/deco-box_of_trinkets.glb',
    position: [-6.4, -0.02, -3.8],
    rotation: -0.38,
    size: 2.1,
  },
  {
    id: 'pressed-flower',
    model: '/assets/board/deco-flower.glb',
    position: [6.4, -0.02, -3.6],
    rotation: 0.48,
    size: 2,
  },
  {
    id: 'keepsake-candle',
    model: '/assets/board/deco-candle.glb',
    position: [-5.1, -0.02, 3.2],
    rotation: 0.24,
    size: 1.6,
  },
  {
    id: 'date-night-candle',
    model: '/assets/board/deco-candle2.glb',
    position: [5.2, -0.02, 3.4],
    rotation: -0.2,
    size: 1.5,
  },
  {
    id: 'little-photo',
    model: '/assets/board/deco-photo.glb',
    position: [3, 0.06, 0.7],
    rotation: 0.16,
    size: 2.2,
  },
]

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
            ? '◆'
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

function createPrimitiveDie(value, velvetTexture) {
  const die = new THREE.Group()
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(1.04, 1.04, 1.04, 5, 0.18),
    new THREE.MeshStandardMaterial({
      color: '#f7dce3',
      map: velvetTexture,
      metalness: 0.04,
      roughness: 0.86,
    }),
  )
  body.castShadow = true
  body.receiveShadow = true
  die.add(body)

  const pipLayouts = {
    1: [[0, 0]],
    2: [[-0.23, -0.23], [0.23, 0.23]],
    3: [[-0.25, -0.25], [0, 0], [0.25, 0.25]],
    4: [[-0.23, -0.23], [0.23, -0.23], [-0.23, 0.23], [0.23, 0.23]],
    5: [[-0.25, -0.25], [0.25, -0.25], [0, 0], [-0.25, 0.25], [0.25, 0.25]],
    6: [[-0.25, -0.28], [-0.25, 0], [-0.25, 0.28], [0.25, -0.28], [0.25, 0], [0.25, 0.28]],
  }
  const pipMaterial = new THREE.MeshStandardMaterial({
    color: '#f3ce83',
    metalness: 0.72,
    roughness: 0.28,
  })
  const pipGeometry = new THREE.SphereGeometry(0.075, 14, 10)

  const pipGroups = {}
  Object.entries(pipLayouts).forEach(([faceValue, layout]) => {
    const group = new THREE.Group()
    layout.forEach(([x, z]) => {
      const pip = new THREE.Mesh(pipGeometry, pipMaterial)
      pip.position.set(x, 0.515, z)
      pip.castShadow = true
      group.add(pip)
    })
    pipGroups[faceValue] = group
    die.add(group)
  })
  die.userData.pipGroups = pipGroups

  die.position.set(-2.8, 0.66, 0.5)
  die.rotation.set(-0.04, 0.3, -0.08)
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
  players,
  positions,
  activePlayerIndex,
  boardState,
  lastRoll,
}) {
  const mountRef = useRef(null)
  const dieRef = useRef(null)
  const lastRollRef = useRef(lastRoll)
  const boardPath = useMemo(() => buildBoardPath(), [])
  const targetIndicesRef = useRef(positions)
  const activePlayerIndexRef = useRef(activePlayerIndex)
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
    lastRollRef.current = lastRoll
    setPrimitiveDieValue(dieRef.current, lastRoll || 1)
  }, [lastRoll])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) {
      return undefined
    }

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2('#321725', 0.027)

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
    renderer.shadowMap.type = THREE.PCFShadowMap
    mount.appendChild(renderer.domElement)
    let disposed = false
    let animationFrameId = null
    let manualTimeOffset = 0

    const ambient = new THREE.AmbientLight('#ffece2', 1.6)
    scene.add(ambient)

    const key = new THREE.DirectionalLight('#ffffff', 2)
    key.position.set(8, 14, 10)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    scene.add(key)

    const fill = new THREE.PointLight('#ffc7a7', 1.8, 40)
    fill.position.set(-10, 8, -2)
    scene.add(fill)

    const textureLoader = new THREE.TextureLoader()
    const wineVelvet = configureVelvetTexture(
      textureLoader.load('/assets/board/wine-velvet-texture.jpg'),
      3.2,
      3.2,
    )
    const roseVelvet = configureVelvetTexture(
      textureLoader.load('/assets/board/rose-velvet-texture.jpg'),
      3,
      3,
    )

    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(16, 16, 1.2, 40),
      new THREE.MeshStandardMaterial({
        map: wineVelvet,
        color: '#fff2f4',
        metalness: 0.02,
        roughness: 0.94,
      }),
    )
    floor.receiveShadow = true
    floor.position.y = -0.65
    scene.add(floor)

    const velvetInset = new THREE.Mesh(
      new THREE.CylinderGeometry(8.5, 8.5, 0.2, 64),
      new THREE.MeshStandardMaterial({
        map: roseVelvet,
        color: '#f4d8dc',
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

    const die = createPrimitiveDie(lastRollRef.current || 1, roseVelvet)
    dieRef.current = die
    scene.add(die)

    const boardGroup = new THREE.Group()
    scene.add(boardGroup)

    const tileMarks = new Map()
    boardPath.forEach((space) => {
      tileMarks.set(space.id, makeTileMarkTexture(space.label, space.type))
    })

    boardPath.forEach((space) => {
      const tile = new THREE.Group()
      const style = TILE_STYLES[space.type]
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
          map: style.texture === 'rose' ? roseVelvet : wineVelvet,
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
      const fallback = createFallbackPawn(player.color)
      group.add(fallback)
      group.position.copy(boardPath[targetIndicesRef.current[index]].position)
      group.position.y = 0.7
      group.userData.fallback = fallback
      scene.add(group)
      return group
    })

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath(DRACO_GLTF_CONFIG)
    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)
    const loadedDecorations = new Set()
    const loadedPlayerAvatars = new Set()

    BOARD_DECORATIONS.forEach((decoration) => {
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
        },
        undefined,
        () => undefined,
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

    function renderFrame(now = performance.now()) {
      const elapsed = (now - startedAt + manualTimeOffset) / 1000
      const focus = boardPath[targetIndicesRef.current[activePlayerIndexRef.current]].position
      camera.position.x = THREE.MathUtils.lerp(
        camera.position.x,
        focus.x * 0.22,
        0.03,
      )
      camera.position.z = THREE.MathUtils.lerp(
        camera.position.z,
        18 + focus.z * 0.2,
        0.03,
      )
      camera.lookAt(focus.x * 0.2, 0, focus.z * 0.22)

      tokenGroups.forEach((token, index) => {
        const target = boardPath[targetIndicesRef.current[index]].position
        token.position.x = THREE.MathUtils.lerp(token.position.x, target.x, 0.12)
        token.position.z = THREE.MathUtils.lerp(token.position.z, target.z, 0.12)
        token.position.y = 0.7 + Math.sin(elapsed * 3 + index) * 0.06
        token.rotation.y = elapsed * 0.35
        token.scale.setScalar(index === activePlayerIndexRef.current ? 1.04 : 0.96)
      })

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
        coordinateSystem: 'board-space index increases clockwise from top',
        decorations: BOARD_DECORATIONS.map((decoration) => ({
          id: decoration.id,
          loaded: loadedDecorations.has(decoration.id),
        })),
        die: {
          construction: 'rounded-box-and-sphere primitives',
          value: die.userData.value,
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
          boardInset: 'rose velvet',
          tabletop: 'wine velvet',
          tiles: 'rounded primitive bases with velvet inset panels',
        },
        players: players.map((player, index) => ({
          avatar: resolvePlayerAvatar(player.avatar),
          avatarLoaded: loadedPlayerAvatars.has(index),
          color: player.color,
          displayName: player.displayName,
          positionIndex: targetIndicesRef.current[index],
        })),
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

    return () => {
      disposed = true
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
      resizeObserver.disconnect()
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
      disposeObject3D(scene)
      renderer.renderLists.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [boardPath, boardStateKey, players])

  return <div className="board-canvas" ref={mountRef} />
}
