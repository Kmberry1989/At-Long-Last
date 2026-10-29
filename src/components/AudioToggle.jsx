import { useAudio } from '../audio/AudioProvider.jsx'

export function AudioToggle() {
  const { muted, toggleMuted, unlocked, musicTheme, setMusicTheme, bassStyle, setBassStyle } = useAudio()

  return (
    <div className="audio-controls">
    <button
      className="audio-toggle"
      aria-label={unlocked ? (muted ? 'Unmute sound' : 'Mute sound') : 'Enable sound'}
      aria-pressed={unlocked && !muted}
      onClick={toggleMuted}
      type="button"
    >
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        {!unlocked || muted ? (
          <path d="m16 9 5 6m0-6-5 6" />
        ) : (
          <path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
        )}
      </svg>
    </button>
    <details className="music-options">
      <summary aria-label="Music">♫</summary>
      <div className="music-options-panel">
        <fieldset>
          <legend>Music</legend>
          {[
            ['continuous', 'Continuous'],
            ['original', 'Original'],
            ['first', 'Ambient'],
          ].map(([id, label]) => (
            <label key={id}><input type="radio" name="music-theme" checked={musicTheme === id} onChange={() => setMusicTheme(id)} />{label}</label>
          ))}
        </fieldset>
        {musicTheme === 'continuous' && <fieldset>
          <legend>Bass</legend>
          <label><input type="radio" name="bass-style" checked={bassStyle === 'held'} onChange={() => setBassStyle('held')} />Held</label>
          <label><input type="radio" name="bass-style" checked={bassStyle === 'walking'} onChange={() => setBassStyle('walking')} />Walking</label>
        </fieldset>}
      </div>
    </details>
    </div>
  )
}
