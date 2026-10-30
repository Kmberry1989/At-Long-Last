// A short original chamber cue: piano, celeste and soft string harmonics.
export function playMomentScore(context, kind = 'committed', initiallyMuted = false) {
  const output = context.createGain()
  output.gain.value = initiallyMuted ? 0 : 0.45
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'; filter.frequency.value = 5200
  const delay = context.createDelay(1)
  delay.delayTime.value = 0.32
  const echo = context.createGain(); echo.gain.value = 0.18
  filter.connect(output); filter.connect(delay); delay.connect(echo); echo.connect(output); output.connect(context.destination)
  const notes = []
  const now = context.currentTime + 0.08
  const chords = kind === 'connected'
    ? [[261.63, 329.63, 392], [220, 261.63, 349.23], [196, 293.66, 392], [261.63, 329.63, 523.25]]
    : kind === 'milestone' ? [[293.66, 392, 493.88], [261.63, 392, 523.25], [246.94, 369.99, 493.88], [293.66, 440, 587.33]]
    : kind === 'night'
      ? [[293.66, 369.99, 440], [246.94, 369.99, 493.88], [220, 329.63, 440], [293.66, 369.99, 587.33]]
      : [[261.63, 329.63, 392], [220, 329.63, 440], [174.61, 261.63, 349.23], [261.63, 392, 523.25]]
  function note(frequency, when, duration, volume, type = 'sine') {
    const oscillator = context.createOscillator(); const gain = context.createGain()
    oscillator.type = type; oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, when)
    gain.gain.exponentialRampToValueAtTime(volume, when + (type === 'triangle' ? 0.8 : 0.025))
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)
    oscillator.connect(gain); gain.connect(filter)
    oscillator.start(when); oscillator.stop(when + duration + 0.05)
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect() }
    notes.push(oscillator)
  }
  chords.forEach((chord, bar) => {
    const start = now + bar * 2.8
    chord.forEach((pitch, index) => {
      note(pitch, start + index * 0.18, 4.1, 0.10)
      note(pitch / 2, start, 4.7, 0.035, 'triangle')
    })
    ;[0, 1, 2, 1].forEach((index, beat) => note(chord[index] * 2, start + beat * 0.55, 2.8, 0.065))
    if (bar >= 2) note(chord[2] * 4, start + 1.65, 3.2, 0.026)
  })
  let stopped = false
  return {
    duration: 14,
    setMuted(muted) { if (!stopped) output.gain.setTargetAtTime(muted ? 0 : 0.45, context.currentTime, 0.12) },
    stop() {
      if (stopped) return
      stopped = true
      output.gain.setTargetAtTime(0, context.currentTime, 0.10)
      notes.forEach((oscillator) => { try { oscillator.stop(context.currentTime + 0.5) } catch { /* A completed note has already stopped. */ } })
      setTimeout(() => { filter.disconnect(); delay.disconnect(); echo.disconnect(); output.disconnect() }, 650)
    },
  }
}
