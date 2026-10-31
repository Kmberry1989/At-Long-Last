// Recognizable garden flowers, grown one at a time in Our Bloom.
// The species stays private in the UI until the finished bloom is picked.
export const FLOWER_SPECIES = [
  { id: 'daisy', name: 'Daisy', kind: 'ray', petals: 12, petalColor: '#fff9ea', petalShade: '#e8d9d4', centerColor: '#e4a936', leafColor: '#4e9a5c', leafWidth: 0.9, leafLength: 0.9, stemHeight: 1 },
  { id: 'tulip', name: 'Tulip', kind: 'cup', petals: 6, petalColor: '#e86971', petalShade: '#b93b59', centerColor: '#f0c75e', leafColor: '#4a956b', leafWidth: 0.68, leafLength: 1.4, stemHeight: 0.92 },
  { id: 'sunflower', name: 'Sunflower', kind: 'ray', petals: 18, petalColor: '#efb83e', petalShade: '#d77c2f', centerColor: '#684335', leafColor: '#5d8e47', leafWidth: 1.3, leafLength: 1.06, stemHeight: 1.16 },
  { id: 'rose', name: 'Rose', kind: 'rose', petals: 14, petalColor: '#df688b', petalShade: '#a63d66', centerColor: '#e7a2a2', leafColor: '#467e58', leafWidth: 1.1, leafLength: 0.78, stemHeight: 0.94 },
  { id: 'cosmos', name: 'Cosmos', kind: 'ray', petals: 8, petalColor: '#eaa4c1', petalShade: '#ca719b', centerColor: '#efba52', leafColor: '#5b9d62', leafWidth: 0.46, leafLength: 1.12, stemHeight: 1.08 },
]

export const FLOWER_DAYS_TO_BLOOM = 6

export function getFlowerSpecies(id) {
  return FLOWER_SPECIES.find((species) => species.id === id) || FLOWER_SPECIES[0]
}
