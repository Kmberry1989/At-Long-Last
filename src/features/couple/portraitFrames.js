export const PORTRAIT_FRAMES = [
  { id: 'ribbon', label: 'Our Ribbon', cost: 0, description: 'Two fine gold loops, tied together.' },
  { id: 'ivory', label: 'Ivory Cameo', cost: 0, description: 'A pearl edge for your everyday portrait.' },
  { id: 'midnight', label: 'Midnight', cost: 0, description: 'Quiet teal with an engraved gold edge.' },
  { id: 'starlight', label: 'Starlit Promise', cost: 24, description: 'A little constellation around your person.' },
  { id: 'rose', label: 'Rose Gilt', cost: 48, description: 'Petal scrolls in warm rose gold.' },
  { id: 'laurel', label: 'Evergreen Vow', cost: 80, description: 'A gilded botanical wreath, made to keep.' },
]
export const FREE_FRAME_IDS = PORTRAIT_FRAMES.filter(frame => frame.cost === 0).map(frame => frame.id)
export function getPortraitFrame(id) { return PORTRAIT_FRAMES.find(frame => frame.id === id) || PORTRAIT_FRAMES[0] }
export function googlePhotoURL(value) {
  if (typeof value !== 'string' || value.length > 1800) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && /^(?:[a-z0-9-]+\.)?googleusercontent\.com$/i.test(url.hostname) && !url.username && !url.password ? url.href : null
  } catch { return null }
}
export function framePurchase(current, frameId, balance) {
  const frame = PORTRAIT_FRAMES.find(item => item.id === frameId)
  if (!frame) throw new Error('That frame is unavailable.')
  const ownedFrames = [...new Set([...FREE_FRAME_IDS, ...(current?.ownedFrames || [])])]
  const cost = ownedFrames.includes(frameId) ? 0 : frame.cost
  if (balance < cost) throw new Error(`This frame needs ${cost} shared hearts.`)
  return { cost, portrait: { photoURL: current?.photoURL || null, ownedFrames: [...new Set([...ownedFrames, frameId])], selectedFrame: frameId } }
}
