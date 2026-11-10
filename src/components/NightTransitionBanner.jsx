import { useEffect, useState } from 'react'
import { BrandIcon } from './BrandIcon.jsx'
import './night-transition-banner.css'

const phaseContent = {
  turn: { title: 'Your move', icon: 'dice', cue: 'turn' },
  activity: { title: 'A moment together', icon: 'heart', cue: 'activity' },
  activityChoice: { title: 'Choose your moment', icon: 'sparkle', cue: 'activityChoice' },
  keepsake: { title: 'A keepsake', icon: 'seal', cue: 'keepsake' },
  duel: { title: 'Play together', icon: 'duel', cue: 'duel' },
  duelWheel: { title: 'Play together', icon: 'duel', cue: 'duel' },
  finale: { title: 'Tonight, remembered', icon: 'book', cue: 'finale' },
}

export function NightTransitionBanner({ phase, transitionKey, playPhase }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const content = phaseContent[phase]
    if (!content || !transitionKey) {
      setVisible(false)
      return undefined
    }
    setVisible(true)
    playPhase?.(content.cue)
    const timeout = window.setTimeout(() => setVisible(false), 2450)
    return () => window.clearTimeout(timeout)
  }, [phase, transitionKey, playPhase])

  const content = phaseContent[phase]
  // Keepsake cards already introduce this phase visually on the board. The
  // extra banner repeats their category and competes with the card reveal.
  if (!content || !visible || phase === 'keepsake') return null

  return (
    <div className="night-transition-banner" role="status" aria-live="polite" key={transitionKey}>
      <span className="night-transition-banner-mark"><BrandIcon name={content.icon} /></span>
      <span className="night-transition-banner-title">{content.title}</span>
      <span className="night-transition-banner-glint" aria-hidden="true" />
    </div>
  )
}
