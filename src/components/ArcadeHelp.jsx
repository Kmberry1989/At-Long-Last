import { useEffect } from 'react'
import './arcade-help.css'

export const ARCADE_HELP_COPY = {
  'my-one-and-only': 'Play a card that matches the pile by color or number. Draw when you need a card, and be the first to empty your hand.',
  'say-it-without-saying': 'Act out the prompt in a short clip while your person guesses. Then switch roles and try the next prompt.',
  'catch-my-heart': 'Ask your person for a rank you hold. Collect all four cards of a rank to make a book; the player with more books wins.',
  'radar-love': 'Place your ships, then take turns scanning the hidden board. Find every ship in your person’s fleet to win.',
  'four-ever': 'Take turns dropping pieces into the board. Connect four of your pieces in a row—across, down, or diagonally—to win.',
  'our-little-pieces': 'Work together to rebuild the picture. Swap pieces and rotate them until every piece is in its matching space and upright.',
  'shared-coloring-book': 'Choose a color and tap a detail to fill it. Your brushstrokes appear for both of you, and each finished page is saved together.',
}

export function ArcadeHelpDialog({ gameId, gameName, onClose }) {
  const description = ARCADE_HELP_COPY[gameId]
  useEffect(() => {
    if (!description) return undefined
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [description, onClose])

  if (!description) return null
  return <div className="arcade-help-overlay" onClick={onClose} role="presentation">
    <section aria-labelledby="arcade-help-title" aria-modal="true" className="arcade-help-card" onClick={event => event.stopPropagation()} role="dialog">
      <button aria-label="Close game help" autoFocus className="arcade-help-close" onClick={onClose} type="button">×</button>
      <span className="arcade-help-kicker">HOW TO PLAY</span>
      <h3 id="arcade-help-title">{gameName}</h3>
      <p>{description}</p>
    </section>
  </div>
}

export function ArcadeHelpButton({ gameName, onClick, className = '' }) {
  return <button aria-label={`How to play ${gameName}`} className={`arcade-help-trigger ${className}`} onClick={onClick} type="button">?</button>
}
