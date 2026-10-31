import { useEffect, useRef, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { getPlayerPiece } from '../features/couple/playerAvatar.js'
import './mystery-keepsake-card.css'

const CARD_MARKS = {
  'sparkler-photo': '✦',
  'midnight-snack': '☾',
  'love-note': '♡',
  'dance-ticket': '♫',
  'breakfast-in-bed': '☕',
  'playful-veto': '⚖',
  'bloom-blessing': '🌸',
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

export function KeepsakeCard({ item, player = null, revealed = true, compact = false, className = '' }) {
  const playerPiece = player?.avatar ? getPlayerPiece(player.avatar) : null

  return (
    <div className={`keepsake-card${revealed ? ' is-revealed' : ''}${compact ? ' is-compact' : ''} ${className}`}>
      {/* Back of Card (Face Down in Deck) */}
      <div aria-hidden={revealed} className="keepsake-card-face keepsake-card-back">
        <CardFrame />
        <span aria-hidden="true" className="keepsake-back-star">✧</span>
        <span className="keepsake-back-brand">AT LONG LAST</span>
        <span className="keepsake-back-free-tag">MYSTERY KEEPSAKE</span>
        <span aria-hidden="true" className="keepsake-back-seal">A <span>✦</span> L</span>
        <span className="keepsake-back-caption">A little gift for tonight</span>
      </div>

      {/* Front of Card (Revealed) */}
      <div aria-hidden={!revealed} className="keepsake-card-face keepsake-card-front">
        <CardFrame />
        <div className="keepsake-front-top">
          <span className="keepsake-front-brand">AT LONG LAST</span>
          <span className="keepsake-free-draw-badge">✧ Free Privilege ✧</span>
        </div>

        <span aria-hidden="true" className="keepsake-front-mark">{CARD_MARKS[item?.id] || '✦'}</span>
        <span className="keepsake-front-kind">KEEPSAKE</span>
        <strong className="keepsake-front-title">{item?.label || 'A surprise'}</strong>
        <span className="keepsake-front-blurb">{item?.blurb || ''}</span>

        <div className="keepsake-perk-box">
          <span className="keepsake-perk-tag">✦ {item?.perkLabel || 'Special Privilege'} ✦</span>
          {item?.perkDescription && (
            <span className="keepsake-perk-desc">{item.perkDescription}</span>
          )}
        </div>

        {player && (
          <div className="keepsake-front-drawer">
            {playerPiece?.thumbnail && (
              <img src={playerPiece.thumbnail} alt="" className="drawer-thumb" />
            )}
            <span>Drawn by {player.displayName}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function MysteryKeepsakeCard({ item, onCollect, onReveal, player = null }) {
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
        <button
          aria-label={revealed ? `Collect ${item?.label || 'Keepsake'}` : 'Mystery keepsake revealing'}
          className="mystery-card-button"
          disabled={!revealed || collecting}
          onClick={collect}
          type="button"
        >
          <KeepsakeCard item={item} player={player} revealed={revealed} />
        </button>
      </div>

      {/* Tactile Action Button */}
      <div className="mystery-card-action-bar">
        <button
          className="primary-btn mystery-collect-btn"
          disabled={!revealed || collecting}
          onClick={collect}
          type="button"
        >
          {collecting ? 'Collecting to your hand… ✨' : 'Tap Card to Collect ✦'}
        </button>
        <span className="mystery-zero-friction-hint">
          🎁 Free gift for landing on this space — no hearts spent.
        </span>
      </div>

      <span aria-live="polite" className="sr-only">
        {revealed
          ? `${item?.label || 'Keepsake'} revealed. Tap the card to collect it.`
          : 'Drawing a mystery keepsake.'}
      </span>
    </div>
  )
}
