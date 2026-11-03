import { BrandIcon } from './BrandIcon.jsx'
import './moment-card.css'

export function MomentCard({ card, onResolve, disabled = false }) {
  if (!card) return null
  const movementLabel = `${card.movement < 0 ? 'Back' : 'Ahead'} ${Math.abs(card.movement)} ${Math.abs(card.movement) === 1 ? 'space' : 'spaces'}`
  return (
    <article className={`moment-card moment-card-${card.category}`} aria-labelledby="moment-card-title">
      <div className="moment-card-mark" aria-hidden="true"><BrandIcon name={card.category === 'trash' ? 'trash' : 'treasure'} /></div>
      {card.image && <img className="moment-card-art" src={card.image} alt="" />}
      <span className="moment-card-kind">{card.category}</span>
      <h1 id="moment-card-title">{card.title}</h1>
      <p>{card.scene}</p>
      <div className="moment-card-effect"><span>{card.effect}</span><strong><BrandIcon name={card.movement < 0 ? 'back' : 'arrow'} />{movementLabel}</strong></div>
      <button className="primary-btn moment-card-resolve" type="button" disabled={disabled} onClick={onResolve}>Move piece</button>
    </article>
  )
}
