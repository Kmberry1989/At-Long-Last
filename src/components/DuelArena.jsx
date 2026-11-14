import './duel-arena.css'

const DUEL_ART = {
  'wavelength-duel': '/assets/mini-games/wavelength.webp',
  'kiss-courier': '/assets/mini-games/kiss-courier.webp',
  'doodle-duel-memory': '/assets/mini-games/keepsake-sketch.webp',
  'portrait-panic-directed': '/assets/mini-games/portrait-panic.webp',
  'letterpress-one-word': '/assets/mini-games/letterpress.webp',
  'gratitude-duel': '/assets/mini-games/gratitude.webp',
  'constellation-home': '/assets/mini-games/star-map.webp',
  'sync-breath': '/assets/mini-games/quiet-moment.webp',
  'love-in-the-blanks': '/assets/mini-games/love-in-the-blanks.webp',
  'our-next-line': '/assets/mini-games/our-next-line.webp',
}

export function DuelArena({
  duel,
  session,
  playerIndex = 0,
  players = [],
  myDuelResult = null,
  onComplete,
  disabled = false,
  wavelengthPrompts = null,
  duelState = {},
  DuelComponent = null,
}) {
  return (
    <div className="duel-arena-overlay" role="dialog" aria-label={`${duel?.label || 'Duel'} Arena`}>
      <div className="duel-arena-content">
        {DUEL_ART[duel?.id] && <img alt="" aria-hidden="true" className="duel-arena-art" src={DUEL_ART[duel.id]} />}
        {DuelComponent && <DuelComponent
          disabled={disabled || Boolean(myDuelResult)}
          prompts={wavelengthPrompts}
          duelState={duelState}
          drawingStorageKey={`${session?.id || 'night'}:${duel?.id || 'duel'}:${session?.round || 0}:${players[playerIndex]?.uid || playerIndex}`}
          round={session?.round || 0}
          onComplete={onComplete}
          playerIndex={playerIndex}
          players={players}
          promptSeed={session?.id || ''}
        />}
      </div>
    </div>
  )
}
