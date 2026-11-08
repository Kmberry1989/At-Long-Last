import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/** A short real-time 3D reveal: hinged keepsake box, artwork lid, and gravity-driven puzzle tiles. */
export function JigsawUnboxing({ image, title, audio }) {
  const mountRef = useRef(null)
  const audioRef = useRef(audio)
  const [unsupported, setUnsupported] = useState(false)
  audioRef.current = audio

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined
    let renderer
    let frame = 0
    let disposed = false
    const geometries = []
    const materials = []
    const textures = []
    try {
      const scene = new THREE.Scene()
      scene.background = new THREE.Color('#211a27')
      scene.fog = new THREE.Fog('#211a27', 10, 22)
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40)
      camera.position.set(3.9, 4.1, 5.8)
      camera.lookAt(0, 0.55, 0)
      renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true, powerPreference: 'low-power' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.08
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.domElement.setAttribute('aria-hidden', 'true')
      mount.appendChild(renderer.domElement)

      const ambient = new THREE.HemisphereLight('#fff0d7', '#493045', 2.1)
      scene.add(ambient)
      const keyLight = new THREE.DirectionalLight('#ffe4b3', 3.1)
      keyLight.position.set(-3, 7, 4)
      keyLight.castShadow = true
      keyLight.shadow.mapSize.set(512, 512)
      scene.add(keyLight)
      const rimLight = new THREE.PointLight('#db91ad', 24, 12, 2)
      rimLight.position.set(2, 3, -3)
      scene.add(rimLight)

      const tableGeometry = new THREE.PlaneGeometry(12, 10)
      geometries.push(tableGeometry)
      const tableMaterial = new THREE.MeshStandardMaterial({ color: '#533a47', roughness: 0.76, metalness: 0.04 })
      materials.push(tableMaterial)
      const table = new THREE.Mesh(tableGeometry, tableMaterial)
      table.rotation.x = -Math.PI / 2
      table.position.y = -0.025
      table.receiveShadow = true
      scene.add(table)

      const box = new THREE.Group()
      box.position.y = 0.04
      scene.add(box)
      const wood = new THREE.MeshStandardMaterial({ color: '#79464b', roughness: 0.3, metalness: 0.28 })
      const edge = new THREE.MeshStandardMaterial({ color: '#e0b975', roughness: 0.24, metalness: 0.78 })
      const velvet = new THREE.MeshStandardMaterial({ color: '#37263b', roughness: 0.94 })
      materials.push(wood, edge, velvet)
      function boxMesh(width, height, depth, material, parent, position) {
        const geometry = new THREE.BoxGeometry(width, height, depth)
        geometries.push(geometry)
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(...position)
        mesh.castShadow = true
        mesh.receiveShadow = true
        parent.add(mesh)
        return mesh
      }
      // Open tray: cloth-lined floor and four raised sides.
      boxMesh(2.42, 0.16, 1.82, wood, box, [0, 0.35, 0])
      boxMesh(2.22, 0.025, 1.62, velvet, box, [0, 0.445, 0])
      boxMesh(2.42, 0.52, 0.11, wood, box, [0, 0.61, -0.86])
      boxMesh(2.42, 0.52, 0.11, wood, box, [0, 0.61, 0.86])
      boxMesh(0.11, 0.52, 1.62, wood, box, [-1.155, 0.61, 0])
      boxMesh(0.11, 0.52, 1.62, wood, box, [1.155, 0.61, 0])
      boxMesh(2.46, 0.035, 0.035, edge, box, [0, 0.88, 0.87])
      boxMesh(2.46, 0.035, 0.035, edge, box, [0, 0.88, -0.87])

      const lid = new THREE.Group()
      lid.position.set(0, 0.88, -0.86)
      box.add(lid)
      boxMesh(2.5, 0.16, 1.82, wood, lid, [0, 0.04, 0.91])
      boxMesh(2.54, 0.035, 1.86, edge, lid, [0, 0.13, 0.91])
      const artworkTexture = new THREE.TextureLoader().load(image)
      artworkTexture.colorSpace = THREE.SRGBColorSpace
      artworkTexture.anisotropy = 4
      textures.push(artworkTexture)
      const artworkMaterial = new THREE.MeshBasicMaterial({ map: artworkTexture, side: THREE.DoubleSide })
      materials.push(artworkMaterial)
      const artworkGeometry = new THREE.PlaneGeometry(2.18, 1.46)
      geometries.push(artworkGeometry)
      const artwork = new THREE.Mesh(artworkGeometry, artworkMaterial)
      artwork.rotation.x = -Math.PI / 2
      artwork.position.set(0, 0.152, 0.91)
      lid.add(artwork)

      const pieces = []
      for (let index = 0; index < 9; index += 1) {
        const texture = artworkTexture.clone()
        texture.needsUpdate = true
        texture.repeat.set(1 / 3, 1 / 3)
        texture.offset.set((index % 3) / 3, 1 - (Math.floor(index / 3) + 1) / 3)
        textures.push(texture)
        const face = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.46, metalness: 0.02, side: THREE.DoubleSide })
        const sides = new THREE.MeshStandardMaterial({ color: '#f0d5bd', roughness: 0.55 })
        materials.push(face, sides)
        const geometry = new THREE.BoxGeometry(0.51, 0.11, 0.51)
        geometries.push(geometry)
        const mesh = new THREE.Mesh(geometry, [sides, sides, face, sides, sides, sides])
        mesh.castShadow = true
        mesh.receiveShadow = true
        mesh.position.set((Math.random() - 0.5) * 0.44, 0.62, (Math.random() - 0.5) * 0.38)
        mesh.rotation.set(Math.random() * 1.8, Math.random() * Math.PI * 2, Math.random() * 1.8)
        mesh.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 1.8, 3.6 + Math.random() * 1.7, (Math.random() - 0.5) * 1.8)
        mesh.userData.spin = new THREE.Vector3((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 9)
        mesh.userData.resting = false
        scene.add(mesh)
        pieces.push(mesh)
      }

      const shadowGeometry = new THREE.CircleGeometry(1.45, 48)
      geometries.push(shadowGeometry)
      const shadowMaterial = new THREE.MeshBasicMaterial({ color: '#100d16', transparent: true, opacity: 0.2, depthWrite: false })
      materials.push(shadowMaterial)
      const boxShadow = new THREE.Mesh(shadowGeometry, shadowMaterial)
      boxShadow.rotation.x = -Math.PI / 2
      boxShadow.position.set(0.35, 0.006, 0.3)
      boxShadow.scale.set(1.5, 0.9, 1)
      scene.add(boxShadow)

      const startedAt = performance.now()
      let lastAt = startedAt
      let launched = false
      let lastImpactAt = 0
      let impactCount = 0
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false
      if (reducedMotion) {
        lid.rotation.x = -1.92
        pieces.forEach((piece, index) => {
          piece.userData.resting = true
          piece.position.set(((index % 3) - 1) * 0.62, 0.035, (Math.floor(index / 3) - 1) * 0.62)
          piece.rotation.set(0, (index % 4) * Math.PI / 2, 0)
        })
        launched = true
      }
      let resizeObserver
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
        if (!reducedMotion) frame = requestAnimationFrame(animate)
        const seconds = Math.min(0.035, Math.max(0.001, (now - lastAt) / 1000))
        lastAt = now
        const elapsed = (now - startedAt) / 1000
        const openProgress = reducedMotion ? 1 : THREE.MathUtils.clamp(elapsed / 0.72, 0, 1)
        const openEase = 1 - (1 - openProgress) ** 3
        lid.rotation.x = -1.92 * openEase
        lid.position.y = 0.88 + Math.sin(openProgress * Math.PI) * 0.08
        if (!reducedMotion && elapsed > 0.54 && !launched) {
          launched = true
          audioRef.current?.playCardSlide?.()
        }
        if (launched) {
          for (const piece of pieces) {
            if (piece.userData.resting) continue
            const velocity = piece.userData.velocity
            velocity.y -= 9.8 * seconds
            piece.position.addScaledVector(velocity, seconds)
            piece.rotation.x += piece.userData.spin.x * seconds
            piece.rotation.y += piece.userData.spin.y * seconds
            piece.rotation.z += piece.userData.spin.z * seconds
            if (piece.position.y <= 0.035) {
              piece.position.y = 0.035
              if (Math.abs(velocity.y) > 0.65) {
                velocity.y = Math.abs(velocity.y) * 0.22
                velocity.x *= 0.68
                velocity.z *= 0.68
                if (Math.abs(velocity.y) > 1.25 && impactCount < 5 && now - lastImpactAt > 90) {
                  lastImpactAt = now
                  impactCount += 1
                  audioRef.current?.playDiceImpact?.({ energy: 0.2 + Math.random() * 0.12, side: Math.random() > 0.5 ? 1 : 0 })
                }
              } else {
                velocity.set(velocity.x * 0.78, 0, velocity.z * 0.78)
                piece.userData.spin.multiplyScalar(0.24)
                piece.userData.resting = true
              }
            }
            const edgeLimit = 3.6
            if (Math.abs(piece.position.x) > edgeLimit) { piece.position.x = Math.sign(piece.position.x) * edgeLimit; velocity.x *= -0.35 }
            if (Math.abs(piece.position.z) > edgeLimit) { piece.position.z = Math.sign(piece.position.z) * edgeLimit; velocity.z *= -0.35 }
          }
          // Gentle separation keeps the pieces from settling into the same spot.
          for (let i = 0; i < pieces.length; i += 1) for (let j = i + 1; j < pieces.length; j += 1) {
            const a = pieces[i], b = pieces[j]
            if (a.position.y > 0.48 || b.position.y > 0.48) continue
            const dx = b.position.x - a.position.x, dz = b.position.z - a.position.z
            const distance = Math.hypot(dx, dz)
            if (distance > 0.44 || distance < 0.001) continue
            const push = (0.44 - distance) * 0.5
            a.position.x -= dx / distance * push
            a.position.z -= dz / distance * push
            b.position.x += dx / distance * push
            b.position.z += dz / distance * push
          }
        }
        const focusY = launched ? 0.65 : 0.72
        camera.position.lerp(new THREE.Vector3(3.35, 3.25, 5.05), 1 - Math.exp(-seconds * 1.8))
        camera.lookAt(0, focusY, 0)
        renderer.render(scene, camera)
      }
      frame = requestAnimationFrame(animate)

      return () => {
        disposed = true
        cancelAnimationFrame(frame)
        resizeObserver?.disconnect()
        for (const geometry of geometries) geometry.dispose()
        for (const material of materials) material.dispose()
        for (const texture of textures) texture.dispose()
        renderer?.dispose()
        renderer?.domElement.remove()
      }
    } catch {
      setUnsupported(true)
      return () => {
        disposed = true
        cancelAnimationFrame(frame)
        renderer?.dispose()
        renderer?.domElement.remove()
      }
    }
  }, [image])

  return <div className={`jigsaw-unboxing${unsupported ? ' is-fallback' : ''}`} role="img" aria-label={`3D keepsake box opening to reveal ${title}, with puzzle pieces spilling onto the table`} style={{ '--jigsaw-art': `url("${image}")` }}>
    <div className="jigsaw-unboxing-mount" ref={mountRef} />
    <span className="jigsaw-unboxing-caption">{title}</span>
  </div>
}
