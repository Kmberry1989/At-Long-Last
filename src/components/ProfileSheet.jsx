import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CONNECT_FOUR_TOKENS, getUnlockedConnectFourTokens } from '../features/session/connectFour.js'
import { BrandIcon } from './BrandIcon.jsx'
import { PortraitFrames } from './PortraitFrames.jsx'
import './profile-sheet.css'

const TOKEN_SHEETS = ['/assets/connect-four/token-atlas.webp', '/assets/connect-four/token-atlas-2.webp', '/assets/connect-four/token-atlas-3.webp']

function tokenStyle(token) {
  const [x, y] = token.sprite
  return { backgroundImage: `url(${TOKEN_SHEETS[token.atlas]})`, backgroundPosition: `${x * 50}% ${y * 50}%` }
}

export function ProfileSheet({ streak, onClose, selectedToken, partnerToken, lifetimeNights = 0, tokenLocked = false, onSelectToken, initialTab = 'frames' }) {
  const closeRef = useRef(null)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [savingToken, setSavingToken] = useState(false)
  const [tokenError, setTokenError] = useState('')
  const streakDays = streak?.dayCount || 0
  const unlockedTokens = getUnlockedConnectFourTokens(lifetimeNights)

  async function selectToken(tokenId) {
    if (savingToken || tokenId === selectedToken || tokenLocked || !onSelectToken) return
    setSavingToken(true)
    setTokenError('')
    try { await onSelectToken(tokenId) }
    catch (error) { setTokenError(error.message || 'Could not update your token.') }
    finally { setSavingToken(false) }
  }

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
        <h2 id="profile-sheet-title">Profile</h2>
        <span aria-label={`${streakDays} day streak`} className="profile-streak-badge"><BrandIcon name="flame" />{streakDays}</span>
        <button ref={closeRef} aria-label="Close profile" className="profile-sheet-close" onClick={onClose} type="button"><BrandIcon name="close" /></button>
      </header>
      <nav className="profile-sheet-tabs" aria-label="Profile settings">
        <button type="button" aria-pressed={activeTab === 'frames'} onClick={() => setActiveTab('frames')}>Portrait</button>
        <button type="button" aria-pressed={activeTab === 'token'} onClick={() => setActiveTab('token')}>Game token</button>
      </nav>
      {activeTab === 'frames' ? <PortraitFrames /> : <section className="connect-four-profile-settings" aria-label="Connect Four token">
        <h3>Connect Four token</h3>
        <p>{tokenLocked ? 'Finish this match before changing your token.' : 'Choose the one you’ll use in every match.'}</p>
        <div className="connect-four-profile-token-grid">
          {CONNECT_FOUR_TOKENS.map((token) => {
            const unlocked = unlockedTokens.some((item) => item.id === token.id)
            const partnerChoice = partnerToken === token.id
            const selected = selectedToken === token.id
            const disabled = savingToken || tokenLocked || !unlocked || partnerChoice || selected
            const label = selected ? 'selected' : partnerChoice ? 'your person chose this' : unlocked ? 'available' : `unlocks after ${token.unlockAt} shared nights`
            return <button type="button" key={token.id} className={`connect-four-profile-token${selected ? ' is-selected' : ''}${!unlocked || partnerChoice ? ' is-unavailable' : ''}`} style={tokenStyle(token)} aria-label={`${token.name}, ${label}`} aria-pressed={selected} title={`${token.name}${partnerChoice ? ' · chosen by your person' : !unlocked ? ` · unlocks at ${token.unlockAt} nights` : ''}`} disabled={disabled} onClick={() => selectToken(token.id)}>
              {(selected || partnerChoice) && <span aria-hidden="true">{selected ? '✓' : '•'}</span>}
              {!unlocked && <i aria-hidden="true">{token.unlockAt}</i>}
            </button>
          })}
        </div>
        <p className="connect-four-profile-selected">Selected: {CONNECT_FOUR_TOKENS.find((token) => token.id === selectedToken)?.name || 'Garnet heart'}</p>
        {tokenError && <p role="alert" className="error-copy">{tokenError}</p>}
      </section>}
    </section>
  </div>, document.body)
}
