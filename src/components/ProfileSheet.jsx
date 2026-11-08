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

export function ProfileSheet({ streak, pieceStyle = { color: '#ff7a97', material: 'porcelain' }, onSavePieceStyle, onClose, selectedToken, partnerToken, lifetimeNights = 0, tokenLocked = false, onSelectToken, initialTab = 'frames' }) {
  const closeRef = useRef(null)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [savingToken, setSavingToken] = useState(false)
  const [tokenError, setTokenError] = useState('')
  const [pieceDraft, setPieceDraft] = useState(pieceStyle)
  const [savingPiece, setSavingPiece] = useState(false)
  const [pieceError, setPieceError] = useState('')
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

  async function savePiece() {
    if (savingPiece || !onSavePieceStyle) return
    setSavingPiece(true)
    setPieceError('')
    try { await onSavePieceStyle(pieceDraft) }
    catch (error) { setPieceError(error.message || 'Could not save the piece style.') }
    finally { setSavingPiece(false) }
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
        <button type="button" aria-pressed={activeTab === 'piece'} onClick={() => setActiveTab('piece')}>Piece</button>
      </nav>
      {activeTab === 'frames' ? <PortraitFrames /> : activeTab === 'piece' ? <section className="piece-style-settings" aria-label="Board piece style">
        <h3>Piece style</h3>
        <label className="piece-color-picker">Color <input aria-label="Piece color" type="color" value={pieceDraft.color} onChange={event => setPieceDraft(current => ({ ...current, color: event.target.value }))} /></label>
        <div className="piece-material-options" role="radiogroup" aria-label="PBR finish">
          {[['porcelain', 'Porcelain'], ['satin', 'Satin'], ['gold', 'Gold'], ['velvet', 'Velvet']].map(([id, label]) => <button key={id} type="button" role="radio" aria-checked={pieceDraft.material === id} className={`piece-material-choice finish-${id}${pieceDraft.material === id ? ' is-selected' : ''}`} onClick={() => setPieceDraft(current => ({ ...current, material: id }))}>{label}</button>)}
        </div>
        <button className="piece-style-save" type="button" disabled={savingPiece} onClick={savePiece}>{savingPiece ? 'Saving…' : 'Save piece style'}</button>
        {pieceError && <p className="error-copy" role="alert">{pieceError}</p>}
      </section> : <section className="connect-four-profile-settings" aria-label="Four Ever token">
        <h3>Four Ever token</h3>
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
