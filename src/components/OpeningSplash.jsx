import { useEffect, useState } from 'react'
import './opening-splash.css'

export function OpeningSplash({ onComplete }) {
  const [leaving, setLeaving] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const leaveTimer = window.setTimeout(() => {
      setLeaving(true)
      // Unlock the app as the fade begins; the splash itself is now
      // pointer-transparent and can finish its visual transition overhead.
      onComplete?.()
    }, reduced ? 80 : 1350)
    const finishTimer = window.setTimeout(() => {
      setVisible(false)
    }, reduced ? 320 : 2050)
    return () => {
      window.clearTimeout(leaveTimer)
      window.clearTimeout(finishTimer)
    }
  }, [onComplete])

  if (!visible) return null
  return <div aria-hidden="true" className={`opening-splash${leaving ? ' is-leaving' : ''}`}>
    <img className="opening-splash-wordmark" src="/assets/ui/atlonglast-wordmark-lockup.png" alt="" />
  </div>
}
