import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  DRACOLoader,
  DRACO_GLTF_CONFIG,
} from 'three/examples/jsm/loaders/DRACOLoader.js'
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
    position: [0.2, -0.02, -0.1],
    rotation: 0.16,
    size: 2.2,
  },
]

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

function makeLabelTexture(label, type) {
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 320
  const ctx = canvas.getContext('2d')
  const backgrounds = {
    connection: '#fff4d8',
    duel: '#dff2ff',
    heart: '#ffe1e8',
    keepsake: '#f1e7ff',
    oops: '#ffeccc',
  }
  const accents = {
    connection: '#ff9d00',
    duel: '#2aa1ff',
    heart: '#ff5478',
    keepsake: '#7b4ef7',
    oops: '#d87831',
  }

  ctx.fillStyle = backgrounds[type]
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = 'rgba(18, 26, 56, 0.14)'
  ctx.lineWidth = 16
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32)
  ctx.fillStyle = accents[type]
  ctx.font = "900 72px 'Avenir Next', sans-serif"
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
            ? '♫'
            : '☏'
  ctx.fillText(symbol, canvas.width / 2, 104)

  ctx.fillStyle = '#1b1f35'
  ctx.font = "700 36px 'Avenir Next', sans-serif"

  const words = label.split(' ')
  words.forEach((word, index) => {
    ctx.fillText(word, canvas.width / 2, 184 + index * 42)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  return texture
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

export function BoardScene({ players, positions, activePlayerIndex, boardState }) {
  const mountRef = useRef(null)
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
    const mount = mountRef.current
    if (!mount) {
      return undefined
    }

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2('#dbe8ff', 0.03)

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

    const ambient = new THREE.AmbientLight('#fff8ed', 1.5)
    scene.add(ambient)

    const key = new THREE.DirectionalLight('#ffffff', 2)
    key.position.set(8, 14, 10)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    scene.add(key)

    const fill = new THREE.PointLight('#ffda78', 1.8, 40)
    fill.position.set(-10, 8, -2)
    scene.add(fill)

    const textureLoader = new THREE.TextureLoader()
    const grass = textureLoader.load('/assets/board/grass_texture.png')
    grass.wrapS = THREE.RepeatWrapping
    grass.wrapT = THREE.RepeatWrapping
    grass.repeat.set(3, 3)

    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(16, 16, 1.2, 40),
      new THREE.MeshStandardMaterial({
        map: grass,
        color: '#9bd77a',
        roughness: 0.92,
      }),
    )
    floor.receiveShadow = true
    floor.position.y = -0.65
    scene.add(floor)

    const boardGroup = new THREE.Group()
    scene.add(boardGroup)

    const tileTextures = new Map()
    boardPath.forEach((space) => {
      tileTextures.set(space.type, makeLabelTexture(space.label, space.type))
    })

    boardPath.forEach((space) => {
      const geometry = new THREE.BoxGeometry(2.2, 0.4, 2.2)
      const topTexture = tileTextures.get(space.type)
      const sideMaterial = new THREE.MeshStandardMaterial({
        color: '#fffaf2',
        roughness: 0.7,
      })
      const topMaterial = new THREE.MeshStandardMaterial({
        map: topTexture,
        roughness: 0.56,
      })
      const mesh = new THREE.Mesh(geometry, [
        sideMaterial,
        sideMaterial,
        topMaterial,
        sideMaterial,
        sideMaterial,
        sideMaterial,
      ])
      mesh.receiveShadow = true
      mesh.castShadow = true
      mesh.position.copy(space.position)
      boardGroup.add(mesh)
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
      group.position.y = 0.58
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
        token.position.y = 0.58 + Math.sin(elapsed * 3 + index) * 0.06
        token.rotation.y = elapsed * 0.35
        token.scale.setScalar(index === activePlayerIndexRef.current ? 1.04 : 0.96)
      })

      floor.rotation.y = elapsed * 0.02
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
