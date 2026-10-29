import {
  getPlayerPiece,
  PLAYER_PIECES,
} from '../features/couple/playerAvatar.js'

export function PlayerPiecePicker({
  disabled = false,
  onChange,
  value,
}) {
  const selectedPiece = getPlayerPiece(value)
  return (
    <section className="piece-picker" aria-label="Your piece">
      <div className="piece-picker-heading">
        <div className="piece-picker-current">
          <img alt="" src={selectedPiece.thumbnail} />
          <span>{selectedPiece.label}</span>
        </div>
      </div>

      <div
        aria-label="Player pieces"
        className="piece-grid"
        role="radiogroup"
      >
        {PLAYER_PIECES.map((playerPiece) => {
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
