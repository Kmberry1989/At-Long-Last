import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BrandIcon } from './BrandIcon.jsx'
import { PairingStory } from './Milestones.jsx'
import { JournalTimeline } from './JournalTimeline.jsx'
import { MilestonesHub } from './MilestonesHub.jsx'
import { ProgressHub } from './ProgressHub.jsx'
import './our-story-screens.css'

const DESTINATIONS = [
  { id: 'scrapbook', label: 'Scrapbook', icon: 'book' },
  { id: 'vault', label: 'Vault', icon: 'lock' },
  { id: 'collection', label: 'Collection', icon: 'bloom' },
]

export function OurStoryScreens({ initialScreen = 'chooser', entries = [], onClose }) {
  const [screen, setScreen] = useState(initialScreen)
  const closeRef = useRef(null)
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (screen !== 'chooser') setScreen('chooser')
        else onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, screen])

  if (screen === 'vault') {
    return createPortal(<MilestonesHub initialTab="constellation" onClose={() => setScreen('chooser')} />, document.body)
  }

  return createPortal(<main aria-label="Our Story" className="our-story-screen">
    <header className="our-story-header">
      <button ref={closeRef} aria-label={screen === 'chooser' ? 'Close Our Story' : 'Back to Our Story'} className="our-story-back" onClick={() => screen === 'chooser' ? onClose() : setScreen('chooser')} type="button">
        <BrandIcon name={screen === 'chooser' ? 'close' : 'back'} />
      </button>
      <h1>{screen === 'chooser' ? 'Our Story' : DESTINATIONS.find((item) => item.id === screen)?.label}</h1>
      <span aria-hidden="true" className="our-story-spacer" />
    </header>
    {screen === 'chooser' ? <nav aria-label="Our Story sections" className="our-story-choices">
      {DESTINATIONS.map((item) => <button className="our-story-choice" key={item.id} onClick={() => setScreen(item.id)} type="button">
        <BrandIcon name={item.icon} /><span>{item.label}</span><BrandIcon className="our-story-choice-arrow" name="chevron" />
      </button>)}
    </nav> : screen === 'scrapbook' ? <div className="our-story-content scrapbook-screen-content">
      <PairingStory />
      <JournalTimeline entries={entries} />
    </div> : <div className="our-story-content"><ProgressHub /></div>}
  </main>, document.body)
}
