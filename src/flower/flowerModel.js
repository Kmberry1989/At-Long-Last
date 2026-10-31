import * as THREE from 'three'
import { getFlowerSpecies } from './flowerSpecies.js'

function material(color, extras = {}) {
  return new THREE.MeshStandardMaterial({ color, metalness: 0, roughness: 0.7, ...extras })
}

function addMesh(group, name, geometry, surface, position, scale, rotation) {
  const object = new THREE.Mesh(geometry, surface)
  object.name = name
  if (position) object.position.set(...position)
  if (scale) object.scale.set(...scale)
  if (rotation) object.rotation.set(...rotation)
  object.castShadow = true
  object.receiveShadow = true
  group.add(object)
  return object
}

function addLeaf(group, side, height, size, leafSurface, species) {
  const width = size * species.leafWidth
  const length = size * species.leafLength
  const leaf = addMesh(
    group,
    'leaf',
    new THREE.SphereGeometry(1, 22, 14),
    leafSurface,
    [side * length * 0.68, height, 0],
    [width * 0.65, length * 0.11, size * 0.25],
    [0, side * 0.15, side * 0.52],
  )
  leaf.rotation.z = side * 0.5
  const vein = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, height, 0.02),
    new THREE.Vector3(side * length * 0.45, height + length * 0.13, 0.07),
    new THREE.Vector3(side * length * 1.08, height + length * 0.28, 0.02),
  ])
  addMesh(group, 'leaf-vein', new THREE.TubeGeometry(vein, 10, 0.012, 5, false), material('#acd095'))
}

function addRayBloom(group, species, headY) {
  const head = new THREE.Group()
  head.name = 'bloom'
  head.position.set(0, headY, 0.07)
  group.add(head)
  const petalSurface = material(species.petalColor, { side: THREE.DoubleSide, roughness: 0.62 })
  const shadeSurface = material(species.petalShade, { side: THREE.DoubleSide })
  const sunflower = species.id === 'sunflower'
  const length = sunflower ? 0.58 : species.id === 'cosmos' ? 0.55 : 0.45
  const width = sunflower ? 0.17 : species.id === 'cosmos' ? 0.26 : 0.17
  for (let index = 0; index < species.petals; index += 1) {
    const angle = (index / species.petals) * Math.PI * 2
    const distance = sunflower ? 0.46 : 0.34
    addMesh(
      head,
      'petal',
      new THREE.SphereGeometry(1, 18, 10),
      index % 3 === 0 ? shadeSurface : petalSurface,
      [Math.sin(angle) * distance, Math.cos(angle) * distance, 0.02 + (index % 2) * 0.025],
      [width, length, 0.075],
      [0.08, 0, -angle],
    )
  }
  addMesh(head, 'flower-center', new THREE.SphereGeometry(1, 26, 16), material(species.centerColor, { roughness: sunflower ? 0.95 : 0.65 }), [0, 0, 0.13], sunflower ? [0.41, 0.41, 0.12] : [0.25, 0.25, 0.14])
  if (sunflower) {
    const seedSurface = material('#c49455', { roughness: 1 })
    for (let index = 0; index < 28; index += 1) {
      const radius = 0.07 + 0.026 * Math.sqrt(index)
      const angle = index * 2.39996
      addMesh(head, 'seed-detail', new THREE.SphereGeometry(0.018, 6, 4), seedSurface, [Math.cos(angle) * radius, Math.sin(angle) * radius, 0.25])
    }
  }
  return head
}

function addCupBloom(group, species, headY) {
  const head = new THREE.Group()
  head.name = 'bloom'
  head.position.y = headY
  group.add(head)
  const outer = material(species.petalColor, { side: THREE.DoubleSide, roughness: 0.58 })
  const inner = material(species.petalShade, { side: THREE.DoubleSide, roughness: 0.62 })
  const isRose = species.kind === 'rose'
  const rings = isRose ? [
    { count: 8, radius: 0.31, height: 0.08, size: [0.25, 0.41, 0.1], tilt: 0.28 },
    { count: 6, radius: 0.18, height: 0.15, size: [0.19, 0.34, 0.09], tilt: 0.05 },
  ] : [
    { count: 6, radius: 0.31, height: 0.04, size: [0.27, 0.51, 0.1], tilt: 0.2 },
  ]
  rings.forEach((ring, ringIndex) => {
    for (let index = 0; index < ring.count; index += 1) {
      const angle = (index / ring.count) * Math.PI * 2 + ringIndex * 0.22
      const petal = addMesh(
        head,
        'petal',
        new THREE.SphereGeometry(1, 20, 14),
        index % 3 === 0 ? inner : outer,
        [Math.sin(angle) * ring.radius, ring.height, Math.cos(angle) * ring.radius],
        ring.size,
      )
      petal.rotation.y = angle
      petal.rotation.x = Math.sin(angle) * ring.tilt
      petal.rotation.z = -Math.cos(angle) * ring.tilt
    }
  })
  addMesh(head, 'flower-center', new THREE.SphereGeometry(isRose ? 0.2 : 0.18, 20, 14), material(species.centerColor), [0, isRose ? 0.18 : 0.05, 0])
  return head
}

function addRoseBloom(group, species, headY) {
  const head = new THREE.Group()
  head.name = 'bloom'
  head.position.set(0, headY, 0.08)
  group.add(head)
  const outer = material(species.petalColor, { side: THREE.DoubleSide, roughness: 0.68 })
  const shadow = material(species.petalShade, { side: THREE.DoubleSide, roughness: 0.72 })
  const rings = [
    { count: 7, radius: 0.3, depth: 0.02, width: 0.25, height: 0.31 },
    { count: 5, radius: 0.16, depth: 0.16, width: 0.2, height: 0.25 },
    { count: 2, radius: 0.055, depth: 0.28, width: 0.13, height: 0.18 },
  ]
  rings.forEach((ring, ringIndex) => {
    for (let index = 0; index < ring.count; index += 1) {
      const angle = (index / ring.count) * Math.PI * 2 + ringIndex * 0.45
      addMesh(
        head,
        'petal',
        new THREE.SphereGeometry(1, 20, 12),
        (index + ringIndex) % 4 === 0 ? shadow : outer,
        [Math.sin(angle) * ring.radius, Math.cos(angle) * ring.radius, ring.depth],
        [ring.width, ring.height, 0.08],
        [0, 0, -angle],
      )
    }
  })
  addMesh(head, 'flower-center', new THREE.SphereGeometry(0.075, 12, 8), shadow, [0, 0, 0.36])
  return head
}

/** Geometry is fully generated in code; no image, emoji, or model file is used. */
export function createFlowerModel({ speciesId = 'daisy', stage = 0, wateredCount = 0 } = {}) {
  const species = getFlowerSpecies(speciesId)
  const resolvedStage = Math.min(3, Math.max(0, Math.round(Number(stage) || 0)))
  const group = new THREE.Group()
  group.name = `flower-${species.id}`
  group.userData = { speciesId: species.id, stage: resolvedStage }

  const potSurface = material('#a66766', { roughness: 0.88 })
  const rimSurface = material('#d2907c', { roughness: 0.78 })
  addMesh(group, 'pot', new THREE.CylinderGeometry(0.47, 0.34, 0.55, 32), potSurface, [0, 0.28, 0])
  addMesh(group, 'pot-rim', new THREE.CylinderGeometry(0.5, 0.46, 0.1, 32), rimSurface, [0, 0.53, 0])
  addMesh(group, 'soil', new THREE.CylinderGeometry(0.44, 0.44, 0.035, 32), material('#61453b', { roughness: 1 }), [0, 0.59, 0])
  addMesh(group, 'pot-highlight', new THREE.TorusGeometry(0.38, 0.015, 6, 32), material('#f0bfa2'), [0, 0.18, 0], undefined, [Math.PI / 2, 0, 0])

  const dewSurface = material('#97d6e5', { metalness: 0.12, roughness: 0.15, transparent: true, opacity: 0.94 })
  for (let index = 0; index < Math.min(2, Math.max(0, wateredCount)); index += 1) {
    addMesh(group, 'water-drop', new THREE.SphereGeometry(0.075, 12, 8), dewSurface, [index === 0 ? -0.26 : 0.26, 0.64, 0.2], [0.8, 1.25, 0.8])
  }

  if (resolvedStage === 0) {
    const seedShape = species.id === 'sunflower' ? [0.12, 0.22, 0.1]
      : species.id === 'tulip' ? [0.2, 0.2, 0.17]
        : [0.18, 0.12, 0.13]
    addMesh(group, 'seed', new THREE.SphereGeometry(1, 20, 12), material('#a87d54', { roughness: 0.95 }), [0, 0.65, 0], seedShape, [0, 0, -0.25])
    return group
  }

  const headY = (resolvedStage === 1 ? 1.26 : resolvedStage === 2 ? 1.72 : 1.88) * species.stemHeight
  const stem = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.59, 0),
    new THREE.Vector3(-0.05, 0.93, 0),
    new THREE.Vector3(0.05, headY - 0.28, 0),
    new THREE.Vector3(0, headY, 0),
  ])
  addMesh(group, 'stem', new THREE.TubeGeometry(stem, 28, resolvedStage === 1 ? 0.047 : 0.065, 8, false), material('#5c9b55'))
  const leafSurface = material(species.leafColor, { side: THREE.DoubleSide, roughness: 0.76 })
  addLeaf(group, -1, 0.94, resolvedStage === 1 ? 0.34 : 0.55, leafSurface, species)
  addLeaf(group, 1, resolvedStage === 1 ? 0.87 : 1.18, resolvedStage === 1 ? 0.3 : 0.51, leafSurface, species)

  if (resolvedStage === 1) return group

  if (resolvedStage === 2) {
    const budShape = species.kind === 'cup' ? [0.25, 0.39, 0.24]
      : species.kind === 'rose' ? [0.26, 0.26, 0.25]
        : species.id === 'sunflower' ? [0.34, 0.22, 0.17]
          : [0.21, 0.26, 0.17]
    addMesh(group, 'bud', new THREE.SphereGeometry(1, 24, 16), material(species.petalShade), [0, headY + 0.12, 0], budShape)
    for (let index = 0; index < 3; index += 1) {
      const angle = (index / 3) * Math.PI * 2
      addMesh(group, 'sepal', new THREE.SphereGeometry(1, 14, 9), leafSurface, [Math.sin(angle) * 0.11, headY - 0.09, Math.cos(angle) * 0.11], [0.1, 0.22, 0.08])
    }
    return group
  }

  if (species.kind === 'ray') addRayBloom(group, species, headY)
  else if (species.kind === 'rose') addRoseBloom(group, species, headY)
  else addCupBloom(group, species, headY)
  return group
}
