import { BrandIcon } from './BrandIcon.jsx'
import { useEffect, useState } from 'react'
import './moment-card.css'

export function MomentCard({ card, onResolve, disabled = false }) {
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => setRevealed(true), 680)
    return () => window.clearTimeout(timer)
  }, [card?.id])
  if (!card) return null
  const movementLabel = `${card.movement < 0 ? 'Back' : 'Ahead'} ${Math.abs(card.movement)} ${Math.abs(card.movement) === 1 ? 'space' : 'spaces'}`
  return (
    <div className={`moment-card-draw ${revealed ? 'is-revealed' : ''}`}>
      {!revealed && <div aria-hidden="true" className="moment-card-back-art" style={{ backgroundImage: "url('/assets/game-ui/moment-card-back.png')" }} />}
      <article className={`moment-card moment-card-${card.category}`} aria-labelledby="moment-card-title" aria-hidden={!revealed}>
      {card.image && <img className="moment-card-art" src={card.image} alt="" />}
      <h1 id="moment-card-title">{card.title}</h1>
      </article>
      <div className="moment-card-effect"><span>{card.effect}</span><strong><BrandIcon name={card.movement < 0 ? 'back' : 'arrow'} />{movementLabel}</strong></div>
      <button className="primary-btn moment-card-resolve" type="button" disabled={disabled || !revealed} onClick={onResolve}>Continue</button>
    </div>
  )
}
