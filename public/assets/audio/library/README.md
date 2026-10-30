# At Long Last music library

These are original synthesized arrangements and saved listening previews. Keep the sources and recordings when changing the default soundtrack.

| Version | Source / recording | Where it plays |
| --- | --- | --- |
| First ambient theme | `src/audio/firstAmbientSoundtrack.js`, preserved from the repository's original audio engine | Selectable from the ♫ music library |
| Original glow, with bent notes | `src/audio/keepsakeSoundtrack.js`, captured intact before the slower arrangement | Selectable anywhere; automatic scrapbook/Keepsake theme |
| Original glow audition | `original-glow-browser-recording.webm` and `original-glow-preview.mp3` | Saved 24-second browser capture from the earlier conversation |
| Slow continuous theme | `src/audio/AudioProvider.jsx` and `src/audio/ambientScore.js` | Default menu/game theme; identical foundation with accompaniment added during play |
| Held upright-bass experiment | `slow-bass-held.wav` | 42-second rendered preview; current bass default |
| Very slow walking-bass experiment | `slow-bass-walking.wav` | 42-second rendered preview; selectable in the in-game bass options |

The newer chord progression repeats after 32 steps (76.8 seconds), while alternating single/double heartbeat accents complete their cycle after 64 steps. The renderer never restarts at either boundary. Notes, strings, delay feedback, and room tails continue through them. Menu-to-game changes retain the same score position and fade in the accompaniment bus. The saved WAV comparisons have short fades at the edges for listening; they are excerpts, not runtime loop files.

Sound settings live under the ♫ button next to Sound, and theme/bass choices are remembered on this browser. Opening the scrapbook temporarily uses Original glow; closing it returns to the selected theme. All tracks respect the same mute control. Original glow has its own frozen pattern data so edits to the new theme do not change it. Recordings and source snapshots are project assets, not temporary QA files.
