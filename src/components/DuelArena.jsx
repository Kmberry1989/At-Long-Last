import './duel-arena.css'

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
