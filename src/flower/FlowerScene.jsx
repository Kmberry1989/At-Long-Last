import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { createFlowerModel } from './flowerModel.js'
import { getFlowerSpecies } from './flowerSpecies.js'

function disposeScene(scene) {
  const geometries = new Set()
  const materials = new Set()
  scene.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry)
    if (object.material) {
      for (const surface of Array.isArray(object.material) ? object.material : [object.material]) {
        materials.add(surface)
      }
    }
  })
  geometries.forEach((geometry) => geometry.dispose())
  materials.forEach((surface) => surface.dispose())
}

export function FlowerScene({ speciesId = 'daisy', stage = 0, wateredCount = 0, compact = false, revealName = false, onPick }) {
  const mountRef = useRef(null)
  const turnRef = useRef(0)
  const onPickRef = useRef(onPick)
  onPickRef.current = onPick
  const [available, setAvailable] = useState(true)
  const species = getFlowerSpecies(speciesId)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined
    if (!window.WebGLRenderingContext) {
      setAvailable(false)
      return undefined
    }

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    } catch {
      setAvailable(false)
      return undefined
    }
    setAvailable(true)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.35
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2))
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20)
    camera.position.set(2.7, 2.35, compact ? 5.2 : 4.35)
    camera.lookAt(0, 1.04, 0)
    scene.add(new THREE.HemisphereLight('#fff6e7', '#9a677a', 2.2))
    const key = new THREE.DirectionalLight('#fff5df', 3.3)
    key.position.set(-2.3, 5.5, 4)
    key.castShadow = true
    key.shadow.mapSize.set(512, 512)
    key.shadow.camera.left = -3
    key.shadow.camera.right = 3
    key.shadow.camera.top = 3
    key.shadow.camera.bottom = -3
    key.shadow.normalBias = 0.015
    key.shadow.radius = 4
    scene.add(key)
    const glow = new THREE.PointLight('#ffc3d6', 1.8, 8)
    glow.position.set(2, 2, -1)
    scene.add(glow)

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(1.25, 40),
      new THREE.MeshStandardMaterial({ color: '#ecd3c5', roughness: 1, transparent: true, opacity: 0.3 }),
    )
    ground.name = 'flower-ground'
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.015
    ground.receiveShadow = true
    scene.add(ground)

    const model = createFlowerModel({ speciesId, stage, wateredCount })
    scene.add(model)
    const raycaster = new THREE.Raycaster()
    let frame = 0
    let disposed = false
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let entryTime = performance.now()

    const resize = () => {
      if (disposed) return
      const width = Math.max(1, mount.clientWidth)
      const height = Math.max(1, mount.clientHeight)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      renderer.render(scene, camera)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    resize()

    const render = (now) => {
      if (disposed) return
      if (!document.hidden) {
        const seconds = now / 1000
        model.rotation.y = turnRef.current + (reducedMotion ? 0 : Math.sin(seconds * 0.35) * 0.07)
        const bloom = model.getObjectByName('bloom')
        if (bloom) bloom.rotation.z = reducedMotion ? 0 : Math.sin(seconds * 1.2) * 0.035
        if (!reducedMotion) model.scale.setScalar(Math.min(1, 0.82 + (now - entryTime) / 800))
        renderer.render(scene, camera)
      }
      frame = requestAnimationFrame(render)
    }
    if (!compact) frame = requestAnimationFrame(render)

    let pointerX = null
    let pointerStart = null
    const onPointerDown = (event) => {
      if (compact) return
      pointerX = event.clientX
      pointerStart = [event.clientX, event.clientY]
      renderer.domElement.setPointerCapture?.(event.pointerId)
    }
    const onPointerMove = (event) => {
      if (pointerX === null) return
      turnRef.current += (event.clientX - pointerX) * 0.012
      pointerX = event.clientX
      entryTime = performance.now() - 800
    }
    const onPointerUp = (event) => {
      if (pointerStart && Math.hypot(event.clientX - pointerStart[0], event.clientY - pointerStart[1]) < 8 && onPickRef.current) {
        const bloom = model.getObjectByName('bloom')
        const rect = renderer.domElement.getBoundingClientRect()
        raycaster.setFromCamera(new THREE.Vector2(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1,
        ), camera)
        if (bloom && raycaster.intersectObject(bloom, true).length > 0) onPickRef.current()
      }
      pointerX = null
      pointerStart = null
    }
    const onPointerCancel = () => { pointerX = null; pointerStart = null }
    const canvas = renderer.domElement
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerCancel)

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerCancel)
      disposeScene(scene)
      renderer.renderLists.dispose()
      renderer.dispose()
      canvas.remove()
    }
  }, [speciesId, stage, wateredCount, compact])

  return (
    <div
      aria-label={compact ? undefined : `${onPick ? 'Pick' : 'Rotate'} ${revealName ? species.name : 'mystery flower'} in a pot, ${['seed', 'sprout', 'bud', 'in bloom'][stage] || 'seed'} stage`}
      aria-hidden={compact ? 'true' : undefined}
      className={`flower-scene${compact ? ' compact' : ''}`}
      data-species={species.id}
      data-stage={stage}
      onKeyDown={compact ? undefined : (event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          turnRef.current += event.key === 'ArrowLeft' ? -0.28 : 0.28
        }
        if ((event.key === 'Enter' || event.key === ' ') && onPick) {
          event.preventDefault()
          onPick()
        }
      }}
      ref={mountRef}
      role={compact ? 'img' : 'button'}
      tabIndex={compact ? undefined : 0}
    >
      {!available && <span className="flower-scene-fallback">{revealName ? species.name : 'Mystery flower'}</span>}
    </div>
  )
}
