export const PORTRAIT_GUIDE_CUES = [
  { id: 'left', label: 'Face left' },
  { id: 'right', label: 'Face right' },
  { id: 'larger', label: 'Draw larger' },
  { id: 'smaller', label: 'Draw smaller' },
  { id: 'closer', label: 'Move closer' },
  { id: 'one-detail', label: 'Add one detail' },
  { id: 'simple', label: 'Keep it simple' },
  { id: 'smile', label: 'Add a smile' },
]

const cueIds = new Set(PORTRAIT_GUIDE_CUES.map(({ id }) => id))

export function isValidPortraitGuide(cues) {
  return Array.isArray(cues) && cues.length === 3 && new Set(cues).size === 3 && cues.every((cue) => cueIds.has(cue))
}

export function getPortraitPanicStage(state = {}, playerIndex = 0) {
  const own = String(playerIndex)
  const partner = String(1 - playerIndex)
  if (state.results?.[own]) return 'complete'
  if (!state.guides?.[own]) return 'guide'
  if (!state.guides?.[partner]) return 'waiting'
  return 'draw'
}
