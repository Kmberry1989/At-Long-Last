import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { BrandIcon } from './BrandIcon.jsx'
import { PortraitFrames } from './PortraitFrames.jsx'
import './profile-sheet.css'

export function ProfileSheet({ streak, onClose }) {
  const closeRef = useRef(null)
  const streakDays = streak?.dayCount || 0

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return createPortal(<div className="profile-sheet-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <section aria-labelledby="profile-sheet-title" aria-modal="true" className="profile-sheet" role="dialog">
      <header className="profile-sheet-header">
        <h2 id="profile-sheet-title">Frames</h2>
        <span aria-label={`${streakDays} day streak`} className="profile-streak-badge"><BrandIcon name="flame" />{streakDays}</span>
        <button ref={closeRef} aria-label="Close profile" className="profile-sheet-close" onClick={onClose} type="button"><BrandIcon name="close" /></button>
      </header>
      <PortraitFrames />
    </section>
  </div>, document.body)
}
