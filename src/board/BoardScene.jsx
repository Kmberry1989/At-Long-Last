import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { BOARD_SPACES } from '../features/session/boardConfig.js'

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
      group.position.y += 0.42
      group.userData.fallback = fallback
      scene.add(group)
      return group
    })

    const loader = new GLTFLoader()
    players.forEach((player, index) => {
      loader.load(
        player.avatar,
        (gltf) => {
          const model = gltf.scene
          model.scale.setScalar(0.66)
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
            }
          })
          tokenGroups[index].remove(tokenGroups[index].userData.fallback)
          model.position.y = 0.18
          tokenGroups[index].add(model)
        },
        undefined,
        () => undefined,
      )
    })

    const resizeObserver = new ResizeObserver(() => {
      if (!mount.clientWidth || !mount.clientHeight) {
        return
      }

      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    })
    resizeObserver.observe(mount)

    const startedAt = performance.now()

    function animate() {
      const elapsed = (performance.now() - startedAt) / 1000
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
        token.position.y = 0.42 + Math.sin(elapsed * 3 + index) * 0.06
        token.rotation.y = elapsed * 0.35
        token.scale.setScalar(index === activePlayerIndexRef.current ? 1.04 : 0.96)
      })

      floor.rotation.y = elapsed * 0.02
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      resizeObserver.disconnect()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
      scene.traverse((object) => {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material]
        materials.forEach((material) => {
          material?.map?.dispose?.()
          material?.dispose?.()
        })
        object.geometry?.dispose?.()
      })
    }
  }, [boardPath, boardStateKey, players])

  return <div className="board-canvas" ref={mountRef} />
}
