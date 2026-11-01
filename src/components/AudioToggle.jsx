import { BrandIcon, BrandText } from './BrandIcon.jsx'
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
      <BrandIcon name={!unlocked || muted ? 'muted' : 'sound'} />
    </button>
    <details className="music-options">
      <summary aria-label="Music"><BrandText text={"♫"} /></summary>
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
