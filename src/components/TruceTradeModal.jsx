import { BrandIcon } from './BrandIcon.jsx'
import { useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { KeepsakeCard } from './MysteryKeepsakeCard.jsx'
import './truce-trade-modal.css'

export function TruceTradeModal({
  isOpen,
  onClose,
  session,
  playerIndex = 0,
  onSendOffer,
  onRespondOffer,
  onDismissOffer,
}) {
  const audio = useAudio() || {}
  const [selectedOfferedId, setSelectedOfferedId] = useState(null)
  if (!isOpen) return null

  const offer = session?.lastMove?.tradeOffer
  const pendingOffer = offer?.status === 'pending' ? offer : null
  const isIncoming = pendingOffer && pendingOffer.fromPlayerIndex !== playerIndex
  const isOutgoing = pendingOffer && !isIncoming
  const keepsakes = (session?.keepsakes || []).filter(card => card.ownerIndex === playerIndex)
  const offeredCard = (session?.keepsakes || []).find(card => card.instanceId === pendingOffer?.offeredInstanceId)

  function selectCard(instanceId) {
    audio.playChoiceTap?.()
    setSelectedOfferedId(current => current === instanceId ? null : instanceId)
  }

  function sendOffer() {
    if (!selectedOfferedId) return
    audio.playSuccess?.()
    onSendOffer?.({ offeredInstanceId: selectedOfferedId, requestedInstanceId: null, note: '' })
    setSelectedOfferedId(null)
    onClose?.()
  }

  function respond(accept) {
    if (accept) audio.playSuccess?.()
    else audio.playCardSlide?.()
    onRespondOffer?.(accept)
    onClose?.()
  }

  return (
    <div className="truce-trade-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="trade-title">
      <section className="truce-trade-sheet truce-trade-compact" onClick={event => event.stopPropagation()}>
        <header className="truce-trade-header truce-trade-compact-header">
          <div className="truce-sheet-handle" />
          <h2 className="truce-trade-title" id="trade-title">Trade</h2>
          <button type="button" className="truce-close-btn" onClick={onClose} aria-label="Close trade">
            <BrandIcon name="close" />
          </button>
        </header>

        <div className="truce-trade-body truce-trade-compact-body">
          {isIncoming && offeredCard && (
            <div className="truce-trade-offered-card" aria-label="Keepsake offered to you">
                <div className="truce-slot-card-preview"><KeepsakeCard item={offeredCard} revealed compact /></div>
            </div>
          )}

          {isOutgoing && offeredCard && (
            <>
              <div className="truce-trade-state">Waiting</div>
              <div className="truce-trade-offered-card" aria-label="Your keepsake offer">
                <div className="truce-slot-card-preview"><KeepsakeCard item={offeredCard} revealed compact /></div>
              </div>
            </>
          )}

          {!pendingOffer && keepsakes.length > 0 && (
            <div className="truce-tray-card-rack truce-trade-own-rack" role="group" aria-label="Your keepsakes">
              {keepsakes.map(card => (
                <button
                  key={card.instanceId}
                  type="button"
                  className={`truce-tray-card-item ${selectedOfferedId === card.instanceId ? 'is-selected' : ''}`}
                  onClick={() => selectCard(card.instanceId)}
                  aria-pressed={selectedOfferedId === card.instanceId}
                >
                  <span className="truce-tray-card-title">{card.label}</span>
                </button>
              ))}
            </div>
          )}

          {!pendingOffer && !keepsakes.length && <div className="truce-trade-state">No keepsakes</div>}
        </div>

        <footer className="truce-trade-footer truce-trade-compact-footer">
          {isIncoming ? (
            <>
              <button type="button" className="truce-action-btn truce-secondary-btn" onClick={() => respond(false)}>Pass</button>
              <button type="button" className="truce-action-btn truce-primary-btn" onClick={() => respond(true)}>Accept</button>
            </>
          ) : isOutgoing ? (
            <button type="button" className="truce-action-btn truce-secondary-btn" onClick={() => { onDismissOffer?.(); onClose?.() }}>Cancel offer</button>
          ) : (
            <button type="button" className="truce-action-btn truce-primary-btn" disabled={!selectedOfferedId} onClick={sendOffer}>Offer</button>
          )}
        </footer>
      </section>
    </div>
  )
}
