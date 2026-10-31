import { describe, expect, it } from 'vitest'
import { createFlowerModel } from './flowerModel.js'
import { FLOWER_SPECIES } from './flowerSpecies.js'

function namesIn(model) {
  const names = []
  model.traverse((object) => { if (object.isMesh) names.push(object.name) })
  return names
}

describe('procedural collection flowers', () => {
  it('creates a seed, sprout, bud, and distinct bloom for every real species', () => {
    expect(new Set(FLOWER_SPECIES.map((entry) => entry.id)).size).toBe(FLOWER_SPECIES.length)
    for (const species of FLOWER_SPECIES) {
      const seed = namesIn(createFlowerModel({ speciesId: species.id, stage: 0 }))
      const sprout = namesIn(createFlowerModel({ speciesId: species.id, stage: 1 }))
      const bud = namesIn(createFlowerModel({ speciesId: species.id, stage: 2 }))
      const bloom = namesIn(createFlowerModel({ speciesId: species.id, stage: 3 }))
      expect(seed).toContain('seed')
      expect(seed).not.toContain('stem')
      expect(sprout).toContain('stem')
      expect(sprout).toContain('leaf')
      expect(bud).toContain('bud')
      expect(bloom).not.toContain('bud')
      expect(bloom.filter((name) => name === 'petal')).toHaveLength(species.petals)
    }
  })

  it('shows one water drop per partner who watered today', () => {
    const one = namesIn(createFlowerModel({ wateredCount: 1 }))
    const two = namesIn(createFlowerModel({ wateredCount: 2 }))
    expect(one.filter((name) => name === 'water-drop')).toHaveLength(1)
    expect(two.filter((name) => name === 'water-drop')).toHaveLength(2)
  })
})
