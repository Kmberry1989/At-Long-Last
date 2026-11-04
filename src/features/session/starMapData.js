export const STAR_MAP_VALUES = [
  { id: 'h', label: 'Home' },
  { id: 't', label: 'Trust' },
  { id: 'l', label: 'Laughter' },
  { id: 'b', label: 'Belonging' },
  { id: 'p', label: 'Patience' },
  { id: 'a', label: 'Adventure' },
  { id: 'k', label: 'Tenderness' },
  { id: 'g', label: 'Growth' },
  { id: 'f', label: 'Family' },
  { id: 's', label: 'Safety' },
  { id: 'w', label: 'Wonder' },
  { id: 'v', label: 'Forgiveness' },
]

const valueById = new Map(STAR_MAP_VALUES.map((value) => [value.id, value]))

export function encodeStarMapRanking(ranking) {
  if (!Array.isArray(ranking) || ranking.length !== 5) return ''
  if (new Set(ranking).size !== 5 || ranking.some((id) => !valueById.has(id))) return ''
  return ranking.join('')
}

export function decodeStarMapRanking(encoded) {
  if (typeof encoded !== 'string' || encoded.length !== 5) return []
  const ranking = [...encoded].map((id) => valueById.get(id))
  return ranking.every(Boolean) && new Set(encoded).size === 5 ? ranking : []
}

export function compareStarMapRankings(rankingOne, rankingTwo) {
  if (rankingOne.length !== 5 || rankingTwo.length !== 5) return 0
  return rankingOne.reduce((matches, value, index) => matches + Number(value.id === rankingTwo[index]?.id), 0)
}
