import { useMemo, useState } from 'react'
import {
  getPlayerPiece,
  PLAYER_PIECE_CATEGORIES,
  PLAYER_PIECES,
} from '../features/couple/playerAvatar.js'

export function PlayerPiecePicker({
  disabled = false,
  onChange,
  value,
}) {
  const selectedPiece = getPlayerPiece(value)
  const [activeCategory, setActiveCategory] = useState(
    selectedPiece?.category || PLAYER_PIECE_CATEGORIES[0].id,
  )
  const visiblePieces = useMemo(
    () => PLAYER_PIECES.filter((playerPiece) => (
      playerPiece.category === activeCategory
    )),
    [activeCategory],
  )

  return (
    <section className="piece-picker" aria-labelledby="piece-picker-heading">
      <div className="piece-picker-heading">
        <div>
          <p className="eyebrow">Your Player Piece</p>
          <h3 id="piece-picker-heading">Pick something that feels like you.</h3>
        </div>
        <div className="piece-picker-current">
          <img alt="" src={selectedPiece.thumbnail} />
          <span>{selectedPiece.label}</span>
        </div>
      </div>

      <div className="piece-category-tabs" aria-label="Player piece categories">
        {PLAYER_PIECE_CATEGORIES.map((category) => (
          <button
            aria-pressed={activeCategory === category.id}
            className={`piece-category${activeCategory === category.id ? ' active' : ''}`}
            disabled={disabled}
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>

      <div
        aria-label={`${PLAYER_PIECE_CATEGORIES.find((category) => category.id === activeCategory)?.label} player pieces`}
        className="piece-grid"
        role="radiogroup"
      >
        {visiblePieces.map((playerPiece) => {
          const selected = playerPiece.avatar === selectedPiece.avatar
          return (
            <button
              aria-checked={selected}
              aria-label={`Choose ${playerPiece.label}`}
              className={`piece-option${selected ? ' active' : ''}`}
              disabled={disabled}
              key={playerPiece.id}
              onClick={() => onChange(playerPiece.avatar)}
              role="radio"
              type="button"
            >
              <img alt="" loading="lazy" src={playerPiece.thumbnail} />
              <span>{playerPiece.label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
