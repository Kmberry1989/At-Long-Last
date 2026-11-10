import { BrandText } from './BrandIcon.jsx'
import { useEffect, useRef, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import './mystery-keepsake-card.css'

const CARD_ART = {
  'sparkler-photo': '/assets/keepsakes/sparkler-photo.webp',
  'midnight-snack': '/assets/keepsakes/midnight-snack.webp',
  'love-note': '/assets/keepsakes/pocket-love-note.webp',
  'dance-ticket': '/assets/keepsakes/last-dance-ticket.webp',
}

export function KeepsakeCard({ item, revealed = true, compact = false, className = '' }) {

  return (
    <div className={`keepsake-card${revealed ? ' is-revealed' : ''}${compact ? ' is-compact' : ''} ${className}`}>
      {/* Back of Card (Face Down in Deck) */}
      <div aria-hidden={revealed} className="keepsake-card-face keepsake-card-back">
        <span aria-hidden="true" className="keepsake-back-star"><BrandText text={"✧"} /></span>
        <span className="keepsake-back-brand">AT LONG LAST</span>
        <span className="keepsake-back-free-tag">MYSTERY KEEPSAKE</span>
        <span aria-hidden="true" className="keepsake-back-seal">A <span><BrandText text={"✦"} /></span> L</span>
        <span className="keepsake-back-caption">A little gift for tonight</span>
      </div>

      {/* Front of Card (Revealed) */}
      <div aria-hidden={!revealed} className="keepsake-card-face keepsake-card-front">
        <div className="keepsake-front-top"><span className="keepsake-front-brand">AT LONG LAST</span></div>

        {CARD_ART[item?.id] && <img aria-hidden="true" className="keepsake-front-art" src={CARD_ART[item.id]} alt="" />}
        <strong className="keepsake-front-title">{item?.label || 'A surprise'}</strong>
        <span className="keepsake-front-blurb">{item?.blurb || ''}</span>

        <div className="keepsake-perk-box">
          <span className="keepsake-perk-tag"><BrandText text={"✦ "} />{item?.perkLabel || 'Special Privilege'}<BrandText text={" ✦"} /></span>
          {item?.perkDescription && (
            <span className="keepsake-perk-desc">{item.perkDescription}</span>
          )}
        </div>

      </div>
    </div>
  )
}

export function MysteryKeepsakeCard({ item, onCollect, onReveal }) {
  const audio = useAudio() || {}
  const { playCardFlip, playSuccess } = audio

  const [revealed, setRevealed] = useState(false)
  const [collecting, setCollecting] = useState(false)
  const collectTimerRef = useRef(null)
  const onRevealRef = useRef(onReveal)

  useEffect(() => { onRevealRef.current = onReveal }, [onReveal])

  useEffect(() => {
    const revealTimer = window.setTimeout(() => {
      setRevealed(true)
      playCardFlip?.()
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([15, 25, 15])
      }
      onRevealRef.current?.()
    }, 620)
    return () => window.clearTimeout(revealTimer)
  }, [item?.id, playCardFlip])

  useEffect(() => () => {
    if (collectTimerRef.current) window.clearTimeout(collectTimerRef.current)
  }, [])

  function collect() {
    if (!revealed || collecting) return
    playSuccess?.()
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([25, 45, 30])
    }
    setCollecting(true)
    collectTimerRef.current = window.setTimeout(() => onCollect?.(), 480)
  }

  return (
    <div className={`mystery-card-stage${collecting ? ' is-collecting' : ''}`}>
      {/* Floating Card Deck on Board */}
      <div aria-hidden="true" className="mystery-card-ground-shadow" />
      <div aria-hidden="true" className="mystery-card-deck mystery-card-deck-one" />
      <div aria-hidden="true" className="mystery-card-deck mystery-card-deck-two" />
      <div aria-hidden="true" className="mystery-card-deck mystery-card-deck-three" />

      {/* Buoyant Hover Card Container */}
      <div className="mystery-card-float">
        <div className="mystery-card-button" aria-hidden="true"><KeepsakeCard item={item} revealed={revealed} /></div>
      </div>

      {/* Tactile Action Button */}
      <div className="mystery-card-action-bar">
        <button
          className="primary-btn mystery-collect-btn"
          disabled={!revealed || collecting}
          onClick={collect}
          type="button"
        >
          <BrandText text={collecting ? 'Collecting…' : 'Collect'} />
        </button>
      </div>

      <span aria-live="polite" className="sr-only">
        {revealed
          ? `${item?.label || 'Keepsake'} revealed. Tap the card to collect it.`
          : 'Drawing a mystery keepsake.'}
      </span>
    </div>
  )
}
