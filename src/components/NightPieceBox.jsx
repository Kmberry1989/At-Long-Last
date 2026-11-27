import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { DRACOLoader, DRACO_GLTF_CONFIG } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { resolvePlayerAvatar } from '../features/couple/playerAvatar.js'
import './night-piece-box.css'

const PIECE_FINISHES = {
  porcelain: { metalness: 0.12, roughness: 0.2, clearcoat: 0.9, clearcoatRoughness: 0.16 },
  satin: { metalness: 0.28, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.3 },
  gold: { metalness: 0.82, roughness: 0.24, clearcoat: 0.48, clearcoatRoughness: 0.22 },
  velvet: { metalness: 0.03, roughness: 0.88, clearcoat: 0.04, clearcoatRoughness: 0.8 },
}

function createPieceBumpMap(textureId = 'smooth') {
  if (!['silk', 'brocade', 'starlight'].includes(textureId)) return null
  const size = 64
  const pixels = new Uint8Array(size * size * 3)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 3
      const diagonal = (x + y) / size
      const wave = Math.sin(x * 0.78) * Math.sin(y * 0.78)
      const hash = Math.abs(Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1
      let value = 128
      if (textureId === 'silk') value += Math.sin(diagonal * Math.PI * 18) * 19 + wave * 4
      if (textureId === 'brocade') value += (Math.sin(x * Math.PI / 8) * Math.sin(y * Math.PI / 8) + wave * 0.42) * 22
      if (textureId === 'starlight') value += hash > 0.975 ? 70 : Math.sin(diagonal * Math.PI * 12) * 3
      pixels[index] = pixels[index + 1] = pixels[index + 2] = Math.max(0, Math.min(255, Math.round(value)))
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBFormat)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true
  return texture
}

function disposeModel(root) {
  const geometries = new Set()
  const materials = new Set()
  const textures = new Set()
  root.traverse(object => {
    if (object.geometry) geometries.add(object.geometry)
    const list = Array.isArray(object.material) ? object.material : [object.material]
    list.forEach(material => {
      if (!material) return
      materials.add(material)
      Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value) })
    })
  })
  textures.forEach(texture => texture.dispose())
  materials.forEach(material => material.dispose())
  geometries.forEach(geometry => geometry.dispose())
}

function fitPlayerModel(model) {
  model.updateMatrixWorld(true)
  const bounds = new THREE.Box3().setFromObject(model)
  const size = bounds.getSize(new THREE.Vector3())
  const longest = Math.max(size.x, size.y, size.z)
  if (longest > 0) model.scale.multiplyScalar(0.92 / longest)
  model.updateMatrixWorld(true)
  const fitted = new THREE.Box3().setFromObject(model)
  const center = fitted.getCenter(new THREE.Vector3())
  model.position.set(-center.x, -fitted.min.y, -center.z)
  model.traverse(object => {
    if (!object.isMesh) return
    object.castShadow = true
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    const tinted = materials.map(material => {
      const cloned = material.clone()
      const next = cloned.isMeshStandardMaterial && !cloned.isMeshPhysicalMaterial
        ? new THREE.MeshPhysicalMaterial().copy(cloned)
        : cloned
      if (next !== cloned) cloned.dispose()
      next.color?.lerp(new THREE.Color(model.userData.playerColor || '#ffffff'), 0.72)
      const finish = PIECE_FINISHES[model.userData.playerMaterial] || PIECE_FINISHES.porcelain
      if (model.userData.playerTextureMap) {
        next.bumpMap = model.userData.playerTextureMap
        next.bumpScale = model.userData.playerMaterial === 'velvet' ? 0.04 : 0.075
      }
      if ('metalness' in next) next.metalness = finish.metalness
      if ('roughness' in next) next.roughness = finish.roughness
      if ('clearcoat' in next) next.clearcoat = finish.clearcoat
      if ('clearcoatRoughness' in next) next.clearcoatRoughness = finish.clearcoatRoughness
      return next
    })
    object.material = Array.isArray(object.material) ? tinted : tinted[0]
  })
}

function addBoxMesh(THREE, parent, size, position, material) {
  const geometry = new THREE.BoxGeometry(...size)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(...position)
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

export function NightPieceBox({ players = [], mode = 'release', onComplete, audio }) {
  const mountRef = useRef(null)
  const onCompleteRef = useRef(onComplete)
  const [unsupported, setUnsupported] = useState(false)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined
    let disposed = false
    let renderer
    let frame = 0
    let resizeObserver
    const geometries = []
    const materials = []
    const modelRoots = []
    const tokenGroups = []

    try {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40)
      camera.position.set(3.9, 4.1, 5.8)
      camera.lookAt(0, 0.62, 0)
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.08
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFShadowMap
      renderer.domElement.setAttribute('aria-hidden', 'true')
      mount.appendChild(renderer.domElement)

      scene.add(new THREE.HemisphereLight('#fff0d7', '#493045', 2.2))
      const key = new THREE.DirectionalLight('#ffe4b3', 3.1)
      key.position.set(-3, 7, 4)
      key.castShadow = true
      key.shadow.mapSize.set(512, 512)
      scene.add(key)
      const rim = new THREE.PointLight('#db91ad', 22, 12, 2)
      rim.position.set(2, 3, -3)
      scene.add(rim)

      const floorGeometry = new THREE.PlaneGeometry(12, 10)
      const floorMaterial = new THREE.MeshStandardMaterial({ color: '#533a47', roughness: 0.78, transparent: true, opacity: 0.72 })
      geometries.push(floorGeometry)
      materials.push(floorMaterial)
      const floor = new THREE.Mesh(floorGeometry, floorMaterial)
      floor.rotation.x = -Math.PI / 2
      floor.position.y = -0.025
      floor.receiveShadow = true
      scene.add(floor)

      const chest = new THREE.Group()
      chest.position.y = 0.02
      scene.add(chest)
      const wood = new THREE.MeshStandardMaterial({ color: '#79464b', roughness: 0.32, metalness: 0.24 })
      const gold = new THREE.MeshStandardMaterial({ color: '#e0b975', roughness: 0.24, metalness: 0.78 })
      const velvet = new THREE.MeshStandardMaterial({ color: '#37263b', roughness: 0.94 })
      const rosewood = new THREE.MeshStandardMaterial({ color: '#9b6060', roughness: 0.38, metalness: 0.12 })
      materials.push(wood, gold, velvet, rosewood)
      addBoxMesh(THREE, chest, [2.42, 0.16, 1.82], [0, 0.35, 0], wood)
      addBoxMesh(THREE, chest, [2.22, 0.025, 1.62], [0, 0.445, 0], velvet)
      addBoxMesh(THREE, chest, [2.42, 0.52, 0.11], [0, 0.61, -0.86], wood)
      addBoxMesh(THREE, chest, [2.42, 0.52, 0.11], [0, 0.61, 0.86], wood)
      addBoxMesh(THREE, chest, [0.11, 0.52, 1.62], [-1.155, 0.61, 0], wood)
      addBoxMesh(THREE, chest, [0.11, 0.52, 1.62], [1.155, 0.61, 0], wood)
      for (const x of [-1.04, 1.04]) addBoxMesh(THREE, chest, [0.07, 0.36, 0.045], [x, 0.61, 0.925], gold)
      addBoxMesh(THREE, chest, [2.46, 0.035, 0.035], [0, 0.88, 0.87], gold)
      addBoxMesh(THREE, chest, [2.46, 0.035, 0.035], [0, 0.88, -0.87], gold)

      const lid = new THREE.Group()
      lid.position.set(0, 0.88, -0.86)
      chest.add(lid)
      addBoxMesh(THREE, lid, [2.5, 0.16, 1.82], [0, 0.04, 0.91], wood)
      addBoxMesh(THREE, lid, [2.54, 0.035, 1.86], [0, 0.13, 0.91], gold)
      addBoxMesh(THREE, lid, [0.72, 0.035, 0.06], [0, 0.16, 1.84], rosewood)

      const shadowGeometry = new THREE.CircleGeometry(1.45, 48)
      const shadowMaterial = new THREE.MeshBasicMaterial({ color: '#100d16', transparent: true, opacity: 0.24, depthWrite: false })
      geometries.push(shadowGeometry)
      materials.push(shadowMaterial)
      const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial)
      shadow.rotation.x = -Math.PI / 2
      shadow.position.set(0.2, 0.006, 0.25)
      shadow.scale.set(1.5, 0.9, 1)
      scene.add(shadow)

      players.slice(0, 2).forEach((player, index) => {
        const color = player.pieceColor || player.color || (index ? '#59b5ff' : '#ff7a97')
        const finishId = player.pieceMaterial || 'porcelain'
        const finish = PIECE_FINISHES[finishId] || PIECE_FINISHES.porcelain
        const bumpMap = createPieceBumpMap(player.pieceTexture)
        const fallbackMaterial = new THREE.MeshPhysicalMaterial({ color, ...finish, bumpMap, bumpScale: finishId === 'velvet' ? 0.04 : 0.075 })
        materials.push(fallbackMaterial)
        const group = new THREE.Group()
        const ringGeometry = new THREE.TorusGeometry(0.48, 0.065, 10, 28)
        const ringMaterial = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3, metalness: 0.2, roughness: 0.3 })
        geometries.push(ringGeometry)
        materials.push(ringMaterial)
        const ring = new THREE.Mesh(ringGeometry, ringMaterial)
        ring.rotation.x = Math.PI / 2
        ring.position.y = 0.04
        group.add(ring)
        const fallbackBaseGeometry = new THREE.CylinderGeometry(0.34, 0.38, 0.18, 18)
        const fallbackTopGeometry = new THREE.SphereGeometry(0.31, 18, 12)
        geometries.push(fallbackBaseGeometry, fallbackTopGeometry)
        const fallback = new THREE.Group()
        const base = new THREE.Mesh(fallbackBaseGeometry, fallbackMaterial)
        base.position.y = 0.11
        const top = new THREE.Mesh(fallbackTopGeometry, fallbackMaterial)
        top.position.y = 0.42
        fallback.add(base, top)
        group.add(fallback)
        group.userData.fallback = fallback
        group.userData.color = color
        group.userData.material = finishId
        group.userData.textureMap = bumpMap
        group.userData.startX = index === 0 ? -0.55 : 0.55
        group.userData.outsideX = index === 0 ? -1.48 : 1.48
        group.position.set(mode === 'release' ? group.userData.startX : group.userData.outsideX, mode === 'release' ? 0.57 : 0.04, 0.25)
        scene.add(group)
        tokenGroups.push(group)
      })

      const draco = new DRACOLoader()
      draco.setDecoderPath(DRACO_GLTF_CONFIG)
      const loader = new GLTFLoader()
      loader.setDRACOLoader(draco)
      tokenGroups.forEach((group, index) => {
        const player = players[index]
        if (!player?.avatar) return
        loader.load(resolvePlayerAvatar(player.avatar), gltf => {
          const model = gltf.scene
          if (disposed) { disposeModel(model); return }
          model.userData.playerColor = group.userData.color
          model.userData.playerMaterial = group.userData.material
          model.userData.playerTextureMap = group.userData.textureMap
          fitPlayerModel(model)
          model.scale.multiplyScalar(0.78)
          group.remove(group.userData.fallback)
          group.add(model)
          group.userData.model = model
          modelRoots.push(model)
        }, undefined, () => {})
      })

      const startedAt = performance.now()
      let lastAt = startedAt
      let playedCue = false
      function resize() {
        if (disposed) return
        const width = Math.max(1, mount.clientWidth)
        const height = Math.max(1, mount.clientHeight)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
      }
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(mount)
      resize()

      function animate(now) {
        if (disposed) return
        frame = requestAnimationFrame(animate)
        const seconds = Math.min(0.035, Math.max(0.001, (now - lastAt) / 1000))
        lastAt = now
        const elapsed = Math.max(0, (now - startedAt) / 1000)
        const ease = value => 1 - (1 - THREE.MathUtils.clamp(value, 0, 1)) ** 3
        const open = ease(elapsed / 0.72)
        const close = ease((elapsed - 1.45) / 0.68)
        lid.rotation.x = mode === 'release' ? -1.82 * open : -1.82 * (1 - close)
        lid.position.y = 0.88 + Math.sin(open * Math.PI) * 0.08
        if (!playedCue && elapsed > 0.68) {
          playedCue = true
          audio?.playCardSlide?.()
        }
        tokenGroups.forEach((group, index) => {
          const startX = mode === 'release' ? group.userData.startX : group.userData.outsideX
          const endX = mode === 'release' ? group.userData.outsideX : group.userData.startX
          const progress = mode === 'release' ? ease((elapsed - 0.5) / 1.45) : ease((elapsed - 0.25) / 1.62)
          group.position.x = THREE.MathUtils.lerp(startX, endX, progress)
          group.position.z = 0.25 + Math.sin(progress * Math.PI) * (index === 0 ? 0.34 : -0.34)
          group.position.y = mode === 'release'
            ? THREE.MathUtils.lerp(0.57, 0.04, progress) + Math.sin(progress * Math.PI) * 0.68
            : THREE.MathUtils.lerp(0.04, 0.57, progress) + Math.sin(progress * Math.PI) * 0.42
          group.rotation.y += seconds * (index ? -0.4 : 0.4)
          const scale = mode === 'release' ? 0.76 + Math.sin(progress * Math.PI) * 0.1 : 0.86 - progress * 0.1
          group.scale.setScalar(scale)
        })
        camera.position.lerp(new THREE.Vector3(3.6, 3.25, 5.25), 1 - Math.exp(-seconds * 2))
        camera.lookAt(0, 0.55, 0)
        renderer.render(scene, camera)
      }
      frame = requestAnimationFrame(animate)
      return () => {
        disposed = true
        cancelAnimationFrame(frame)
        resizeObserver?.disconnect()
        draco.dispose()
        modelRoots.forEach(disposeModel)
        geometries.forEach(geometry => geometry.dispose())
        materials.forEach(material => material.dispose())
        renderer.dispose()
        renderer.domElement.remove()
      }
    } catch {
      setUnsupported(true)
      return () => {
        disposed = true
        cancelAnimationFrame(frame)
        resizeObserver?.disconnect()
        renderer?.dispose()
        renderer?.domElement.remove()
      }
    }
  }, [audio, mode, players])

  useEffect(() => {
    const duration = mode === 'release' ? 2850 : 2900
    const timer = window.setTimeout(() => onCompleteRef.current?.(), duration)
    return () => window.clearTimeout(timer)
  }, [mode])

  const isRelease = mode === 'release'
  return <div aria-label={isRelease ? 'Opening the night and releasing your game pieces' : 'Collecting your game pieces to close the night'} aria-modal="true" className={`night-piece-box-overlay${unsupported ? ' is-unsupported' : ''}`} role="dialog">
    <h2>{isRelease ? 'The night begins' : 'Gathering tonight’s pieces'}</h2>
    <div className="night-piece-box-stage" ref={mountRef} />
    <p>{isRelease ? 'Your pieces are ready to play.' : 'Your pieces are safely tucked away.'}</p>
    <button className="night-piece-box-skip" onClick={() => onCompleteRef.current?.()} type="button">{isRelease ? 'Begin the night' : 'Continue'}</button>
  </div>
}
