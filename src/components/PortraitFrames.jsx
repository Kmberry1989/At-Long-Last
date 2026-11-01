import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { FREE_FRAME_IDS, PORTRAIT_FRAMES } from '../features/couple/portraitFrames.js'
import { spendableHearts } from '../features/couple/progressService.js'
import { BrandIcon } from './BrandIcon.jsx'
import { PlayerPortrait, usePortraits } from './PlayerPortrait.jsx'

export function PortraitFrames() {
  const { couple, progress } = useCouple()
  const { portraits, userId, selectFrame, working, error } = usePortraits()
  const player = couple?.players?.find(item => item.uid === userId)
  const saved = portraits[userId]
  const owned = saved?.ownedFrames || FREE_FRAME_IDS
  const balance = spendableHearts(progress)
  return <section className="portrait-frames" aria-label="Portrait frames">
    <span aria-label={`${balance} shared hearts available`} className="portrait-heart-balance"><BrandIcon name="heart" />{balance}</span>
    <div className="portrait-frame-grid">{PORTRAIT_FRAMES.map(frame => {
      const selected = (saved?.selectedFrame || 'ribbon') === frame.id
      const unlocked = owned.includes(frame.id)
      const accessibleStatus = selected ? 'selected' : !frame.cost ? 'free' : unlocked ? 'owned' : `${frame.cost} hearts`
      return <button type="button" key={frame.id} aria-pressed={selected} disabled={working || !selectFrame || !saved || (!unlocked && balance < frame.cost)} onClick={() => selectFrame(frame.id)} aria-label={`${frame.label}, ${accessibleStatus}`}>
        <PlayerPortrait player={player} frameId={frame.id} />
        <strong>{frame.label}</strong>
        <span className="portrait-frame-price">{selected ? <BrandIcon name="check" /> : !frame.cost ? 'Free' : unlocked ? 'Owned' : <><BrandIcon name="heart" />{frame.cost}</>}</span>
      </button>
    })}</div>
    {error && <p className="error-copy" role="alert">{error}</p>}
  </section>
}
