import { useMemo, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { getPlayerPiece } from '../features/couple/playerAvatar.js'
import { KeepsakeCard } from './MysteryKeepsakeCard.jsx'
import './truce-trade-modal.css'

const QUICK_TAGS = [
  'Breakfast in bed ♡',
  'Redeemable anytime!',
  'Can\'t wait for this one ✨',
  'A sweet truce gift 🕊️',
]

export function TruceTradeModal({
  isOpen,
  onClose,
  session,
  playerIndex = 0,
  onSendOffer,
  onRespondOffer,
  _onDismissOffer,
}) {
  const audio = useAudio() || {}
  const { playCardSlide, playChoiceTap, playSuccess } = audio

  const [selectedOfferedId, setSelectedOfferedId] = useState(null)
  const [selectedRequestedId, setSelectedRequestedId] = useState(null)
  const [note, setNote] = useState('')

  const myPlayer = session?.players?.[playerIndex]
  const partnerIndex = playerIndex === 0 ? 1 : 0
  const partnerPlayer = session?.players?.[partnerIndex]

  const myPiece = myPlayer?.avatar ? getPlayerPiece(myPlayer.avatar) : null
  const partnerPiece = partnerPlayer?.avatar ? getPlayerPiece(partnerPlayer.avatar) : null

  const myKeepsakes = useMemo(
    () => (session?.keepsakes || []).filter((k) => k.ownerIndex === playerIndex),
    [session?.keepsakes, playerIndex],
  )

  const partnerKeepsakes = useMemo(
    () => (session?.keepsakes || []).filter((k) => k.ownerIndex === partnerIndex),
    [session?.keepsakes, partnerIndex],
  )

  // Incoming pending offer check
  const pendingOffer = session?.lastMove?.tradeOffer?.status === 'pending'
    ? session.lastMove.tradeOffer
    : null
  const isIncomingOffer = pendingOffer && pendingOffer.fromPlayerIndex !== playerIndex

  // Cards for review mode
  const incomingOfferedCard = useMemo(
    () => (session?.keepsakes || []).find((k) => k.instanceId === pendingOffer?.offeredInstanceId),
    [session?.keepsakes, pendingOffer?.offeredInstanceId],
  )
  const incomingRequestedCard = useMemo(
    () => (session?.keepsakes || []).find((k) => k.instanceId === pendingOffer?.requestedInstanceId),
    [session?.keepsakes, pendingOffer?.requestedInstanceId],
  )

  // Cards for create mode
  const activeOfferedCard = useMemo(
    () => myKeepsakes.find((k) => k.instanceId === selectedOfferedId),
    [myKeepsakes, selectedOfferedId],
  )
  const activeRequestedCard = useMemo(
    () => partnerKeepsakes.find((k) => k.instanceId === selectedRequestedId),
    [partnerKeepsakes, selectedRequestedId],
  )

  if (!isOpen) {
    return null
  }

  function handleSelectOffered(instanceId) {
    playCardSlide?.()
    setSelectedOfferedId((curr) => (curr === instanceId ? null : instanceId))
  }

  function handleSelectRequested(instanceId) {
    playCardSlide?.()
    setSelectedRequestedId((curr) => (curr === instanceId ? null : instanceId))
  }

  function handleTagClick(tag) {
    playChoiceTap?.()
    setNote((prev) => (prev ? `${prev} ${tag}` : tag))
  }

  function handleSend() {
    if (!selectedOfferedId) return
    playSuccess?.()
    onSendOffer?.({
      offeredInstanceId: selectedOfferedId,
      requestedInstanceId: selectedRequestedId,
      note,
    })
    setSelectedOfferedId(null)
    setSelectedRequestedId(null)
    setNote('')
    onClose?.()
  }

  function handleAcceptIncoming() {
    playSuccess?.()
    onRespondOffer?.(true)
    onClose?.()
  }

  function handleDeclineIncoming() {
    playCardSlide?.()
    onRespondOffer?.(false)
    onClose?.()
  }

  return (
    <div className="truce-trade-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="truce-trade-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="truce-trade-header">
          <div className="truce-sheet-handle" />
          <span className="truce-header-badge">
            {isIncomingOffer ? '✦ Trade Offer Received ✦' : '🕊️ Sweet Truce & Trade'}
          </span>
          <h2 className="truce-trade-title">
            {isIncomingOffer
              ? `${partnerPlayer?.displayName || 'Partner'} wants to connect`
              : 'Keepsake Negotiation Coaster'}
          </h2>
          <p className="truce-trade-subtitle">
            {isIncomingOffer
              ? 'Review your partner\'s sweet proposal at your own pace.'
              : 'Slide a keepsake to trade privileges, or surprise them with a generous gift.'}
          </p>
          <button
            type="button"
            className="truce-close-btn"
            onClick={onClose}
            aria-label="Close trade sheet"
          >
            ✕
          </button>
        </div>

        <div className="truce-trade-body">
          {/* REVIEW MODE FOR INCOMING OFFER */}
          {isIncomingOffer ? (
            <div className="truce-review-incoming-box">
              <div className="truce-velvet-coaster">
                <div className="truce-coaster-label">
                  <span>From {partnerPlayer?.displayName || 'Partner'}</span>
                  <span>{incomingRequestedCard ? '⇄ Trade Proposal' : '💛 Pure Gift (+2 Hearts)'}</span>
                </div>
                <div className="truce-coaster-slots">
                  <div className="truce-coaster-slot is-filled">
                    <div className="truce-slot-card-preview">
                      <KeepsakeCard item={incomingOfferedCard} revealed compact />
                    </div>
                  </div>

                  <div className="truce-coaster-connector">
                    <span className={`truce-connector-badge ${incomingRequestedCard ? '' : 'truce-gift-highlight'}`}>
                      {incomingRequestedCard ? '⇄ For' : '💛 Gift For You'}
                    </span>
                  </div>

                  <div className="truce-coaster-slot is-filled">
                    {incomingRequestedCard ? (
                      <div className="truce-slot-card-preview">
                        <KeepsakeCard item={incomingRequestedCard} revealed compact />
                      </div>
                    ) : (
                      <div className="truce-slot-prompt">
                        <span className="truce-slot-prompt-icon">💛</span>
                        <span>No return requested</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {pendingOffer?.note && (
                <div className="truce-review-note-bubble">
                  "{pendingOffer.note}"
                </div>
              )}
            </div>
          ) : (
            /* CREATE / NEGOTIATE MODE */
            <>
              {/* Central Velvet Coaster */}
              <div className="truce-velvet-coaster">
                <div className="truce-coaster-label">
                  <span>Your Offer</span>
                  <span>{activeRequestedCard ? '⇄ Exchange' : '💛 Gift (+2 Hearts)'}</span>
                  <span>Partner Request</span>
                </div>

                <div className="truce-coaster-slots">
                  {/* Left Slot: Your Offered Card */}
                  <div className={`truce-coaster-slot ${activeOfferedCard ? 'is-filled' : ''}`}>
                    {activeOfferedCard ? (
                      <div className="truce-slot-card-preview">
                        <KeepsakeCard item={activeOfferedCard} revealed compact />
                        <button
                          type="button"
                          className="truce-slot-remove-btn"
                          onClick={() => setSelectedOfferedId(null)}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="truce-slot-prompt">
                        <span className="truce-slot-prompt-icon">☝️</span>
                        <span>Pick from your tray</span>
                      </div>
                    )}
                  </div>

                  {/* Middle Connector */}
                  <div className="truce-coaster-connector">
                    <span className={`truce-connector-badge ${activeRequestedCard ? '' : 'truce-gift-highlight'}`}>
                      {activeRequestedCard ? '⇄ Trade' : '💛 Gift'}
                    </span>
                  </div>

                  {/* Right Slot: Requested Card from Partner */}
                  <div className={`truce-coaster-slot ${activeRequestedCard ? 'is-filled' : ''}`}>
                    {activeRequestedCard ? (
                      <div className="truce-slot-card-preview">
                        <KeepsakeCard item={activeRequestedCard} revealed compact />
                        <button
                          type="button"
                          className="truce-slot-remove-btn"
                          onClick={() => setSelectedRequestedId(null)}
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <div className="truce-slot-prompt">
                        <span className="truce-slot-prompt-icon">🎁</span>
                        <span>Leave blank to Gift</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tray 1: Your Keepsakes */}
              <div className="truce-felt-tray">
                <div className="truce-tray-header">
                  <div className="truce-tray-player-chip">
                    {myPiece?.thumbnail && (
                      <img src={myPiece.thumbnail} alt="" className="truce-tray-avatar-thumb" />
                    )}
                    <span className="truce-tray-player-name">Your Keepsakes ({myPlayer?.displayName || 'You'})</span>
                  </div>
                  <span className="truce-tray-count">{myKeepsakes.length} available</span>
                </div>

                {myKeepsakes.length > 0 ? (
                  <div className="truce-tray-card-rack" role="list">
                    {myKeepsakes.map((card) => {
                      const isSelected = selectedOfferedId === card.instanceId
                      return (
                        <div
                          key={card.instanceId}
                          role="listitem"
                          tabIndex={0}
                          className={`truce-tray-card-item ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => handleSelectOffered(card.instanceId)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleSelectOffered(card.instanceId)
                            }
                          }}
                          aria-label={`Select ${card.label} to offer`}
                        >
                          {isSelected && <span className="truce-tray-selected-badge">✓</span>}
                          <span className="truce-tray-card-mark">✦</span>
                          <span className="truce-tray-card-title">{card.label}</span>
                          <span className="truce-tray-card-perk">{card.perkLabel || 'Privilege'}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="truce-tray-empty-hint">
                    No keepsakes in hand yet! Land on Keepsake tiles (✧) to collect privileges, or send an offer once you have one.
                  </p>
                )}
              </div>

              {/* Tray 2: Partner's Keepsakes */}
              <div className="truce-felt-tray">
                <div className="truce-tray-header">
                  <div className="truce-tray-player-chip">
                    {partnerPiece?.thumbnail && (
                      <img src={partnerPiece.thumbnail} alt="" className="truce-tray-avatar-thumb" />
                    )}
                    <span className="truce-tray-player-name">{partnerPlayer?.displayName || 'Partner'}'s Keepsakes</span>
                  </div>
                  <span className="truce-tray-count">{partnerKeepsakes.length} available</span>
                </div>

                {partnerKeepsakes.length > 0 ? (
                  <div className="truce-tray-card-rack" role="list">
                    {partnerKeepsakes.map((card) => {
                      const isSelected = selectedRequestedId === card.instanceId
                      return (
                        <div
                          key={card.instanceId}
                          role="listitem"
                          tabIndex={0}
                          className={`truce-tray-card-item ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => handleSelectRequested(card.instanceId)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleSelectRequested(card.instanceId)
                            }
                          }}
                          aria-label={`Select ${card.label} from ${partnerPlayer?.displayName || 'partner'}`}
                        >
                          {isSelected && <span className="truce-tray-selected-badge">✓</span>}
                          <span className="truce-tray-card-mark">✦</span>
                          <span className="truce-tray-card-title">{card.label}</span>
                          <span className="truce-tray-card-perk">{card.perkLabel || 'Privilege'}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="truce-tray-empty-hint">
                    {partnerPlayer?.displayName || 'Partner'} hasn't drawn any keepsakes yet. You can still surprise them with a gift!
                  </p>
                )}
              </div>

              {/* Sweet Note Section */}
              <div className="truce-note-section">
                <label htmlFor="truce-note-field" className="truce-note-label">
                  Add a Sweet Note (Optional)
                </label>
                <div className="truce-quick-tags">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`truce-tag-pill ${note.includes(tag) ? 'is-active' : ''}`}
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <textarea
                  id="truce-note-field"
                  className="truce-note-input"
                  rows={2}
                  placeholder="e.g., Redeemable anytime you need a smile..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="truce-trade-footer">
          {isIncomingOffer ? (
            <>
              <button
                type="button"
                className="truce-action-btn truce-secondary-btn"
                onClick={handleDeclineIncoming}
              >
                Politely Pass 🕊️
              </button>
              <button
                type="button"
                className="truce-action-btn truce-primary-btn"
                onClick={handleAcceptIncoming}
              >
                {incomingRequestedCard ? 'Accept Trade ✨' : 'Accept Gift 💛'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="truce-action-btn truce-secondary-btn"
                onClick={onClose}
              >
                Keep Browsing
              </button>
              <button
                type="button"
                className="truce-action-btn truce-primary-btn"
                disabled={!selectedOfferedId}
                onClick={handleSend}
              >
                {activeRequestedCard
                  ? 'Send Trade Offer 🕊️'
                  : `Gift to ${partnerPlayer?.displayName || 'Partner'} 💛 (+2 Hearts)`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
