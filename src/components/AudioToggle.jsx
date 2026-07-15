import { useAudio } from '../audio/AudioProvider.jsx'

export function AudioToggle() {
  const { muted, toggleMuted, unlocked } = useAudio()

  return (
    <button
      className="audio-toggle"
      onClick={toggleMuted}
      type="button"
    >
      <span aria-hidden="true">{muted ? '◌' : '◉'}</span>
      {unlocked ? (muted ? 'Muted' : 'Sound On') : 'Tap For Sound'}
    </button>
  )
}
