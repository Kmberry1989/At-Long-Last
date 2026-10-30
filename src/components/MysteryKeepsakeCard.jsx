import { useEffect, useRef, useState } from 'react'
import './mystery-keepsake-card.css'

const CARD_MARKS = {
  'sparkler-photo': '✦',
  'midnight-snack': '☾',
  'love-note': '♡',
  'dance-ticket': '♫',
}

function CardFrame() {
  return (
    <svg aria-hidden="true" className="keepsake-card-frame" viewBox="0 0 300 420" preserveAspectRatio="none">
      <rect x="10" y="10" width="280" height="400" rx="21" />
      <rect x="18" y="18" width="264" height="384" rx="16" />
      <path d="M31 77 Q31 31 77 31 M223 31 Q269 31 269 77 M269 343 Q269 389 223 389 M77 389 Q31 389 31 343" />
      <path d="M49 65 Q49 49 65 49 M235 49 Q251 49 251 65 M251 355 Q251 371 235 371 M65 371 Q49 371 49 355" />
      <path d="M150 23 l7 8 -7 8 -7 -8 Z M150 381 l7 8 -7 8 -7 -8 Z M23 210 l8 -7 8 7 -8 7 Z M261 210 l8 -7 8 7 -8 7 Z" />
      <circle cx="31" cy="31" r="3" /><circle cx="269" cy="31" r="3" />
      <circle cx="31" cy="389" r="3" /><circle cx="269" cy="389" r="3" />
    </svg>
  )
}

export function KeepsakeCard({ item, revealed = true, compact = false, className = '' }) {
  return (
    <div className={`keepsake-card${revealed ? ' is-revealed' : ''}${compact ? ' is-compact' : ''} ${className}`}>
      <div aria-hidden={revealed} className="keepsake-card-face keepsake-card-back">
        <CardFrame />
        <span aria-hidden="true" className="keepsake-back-star">✧</span>
        <span className="keepsake-back-brand">AT LONG LAST</span>
        <span aria-hidden="true" className="keepsake-back-seal">A <span>✦</span> L</span>
        <span className="keepsake-back-caption">A little piece of tonight</span>
      </div>
      <div aria-hidden={!revealed} className="keepsake-card-face keepsake-card-front">
        <CardFrame />
        <span className="keepsake-front-brand">AT LONG LAST</span>
        <span aria-hidden="true" className="keepsake-front-mark">{CARD_MARKS[item?.id] || '✧'}</span>
        <span className="keepsake-front-kind">KEEPSAKE</span>
        <strong className="keepsake-front-title">{item?.label || 'A surprise'}</strong>
        <span className="keepsake-front-blurb">{item?.blurb || ''}</span>
        <span className="keepsake-front-perk">{item?.perkLabel || ''}</span>
      </div>
    </div>
  )
}

export function MysteryKeepsakeCard({ item, onCollect, onReveal }) {
  const [revealed, setRevealed] = useState(false)
  const [collecting, setCollecting] = useState(false)
  const collectTimerRef = useRef(null)
  const onRevealRef = useRef(onReveal)

  useEffect(() => { onRevealRef.current = onReveal }, [onReveal])

  useEffect(() => {
    const revealTimer = window.setTimeout(() => {
      setRevealed(true)
      onRevealRef.current?.()
    }, 620)
    return () => window.clearTimeout(revealTimer)
  }, [item?.id])

  useEffect(() => () => {
    if (collectTimerRef.current) window.clearTimeout(collectTimerRef.current)
  }, [])

  function collect() {
    if (!revealed || collecting) return
    setCollecting(true)
    collectTimerRef.current = window.setTimeout(() => onCollect?.(), 480)
  }

  return (
    <div className={`mystery-card-stage${collecting ? ' is-collecting' : ''}`}>
      <div aria-hidden="true" className="mystery-card-ground-shadow" />
      <div aria-hidden="true" className="mystery-card-deck mystery-card-deck-one" />
      <div aria-hidden="true" className="mystery-card-deck mystery-card-deck-two" />
      <div className="mystery-card-float">
        <button
          aria-label={revealed ? `Collect ${item.label}` : 'Mystery keepsake revealing'}
          className="mystery-card-button"
          disabled={!revealed || collecting}
          onClick={collect}
          type="button"
        >
          <KeepsakeCard item={item} revealed={revealed} />
        </button>
      </div>
      <span aria-live="polite" className="sr-only">
        {revealed ? `${item.label} revealed. Tap the card to collect it.` : 'Drawing a mystery keepsake.'}
      </span>
    </div>
  )
}
