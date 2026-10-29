// Preserved 2026-10-29 arrangement: used when reading the shared scrapbook.
const MUSIC_PATTERNS = {
  menu: { piano: [2, -1, 1, -1, 3, -1, 2, -1, 0, -1, 1, -1, 2, -1, 0, -1], bell: [3, -1, 2, -1, 1, -1, 2, -1], pulse: 8, strings: 0.65 },
  board: { piano: [2, 3, -1, 1, 2, -1, 0, 1, 3, -1, 2, 1, -1, 0, 2, -1], bell: [3, 2, 1, 2, 3, 1, 2, 0], pulse: 4, strings: 0.8 },
  prediction: { piano: [0, 2, -1, -1, 1, 3, -1, -1, 2, 1, -1, -1, 3, 0, -1, -1], bell: [-1, -1, 3, 2, -1, -1, 2, 1], pulse: 4, strings: 0.75 },
  reflective: { piano: [0, -1, -1, 2, -1, -1, 1, -1, 2, -1, -1, 3, -1, -1, 0, -1], bell: [-1, 2, -1, -1, -1, 1, -1, -1], pulse: 0, strings: 1.2 },
  creative: { piano: [0, -1, 2, 1, -1, 3, -1, 2, 1, -1, 3, 2, -1, 1, -1, 0], bell: [2, -1, 3, -1, 1, -1, 2, -1], pulse: 4, strings: 0.85 },
  timed: { piano: [0, 1, 2, -1, 1, 2, 3, -1, 2, 1, 0, -1, 1, 2, 0, -1], bell: [3, -1, 2, -1, 3, -1, 1, -1], pulse: 2, strings: 0.65 },
  reveal: { piano: [0, 1, 2, 3, -1, -1, 2, -1, 3, 2, 1, 0, -1, -1, 0, -1], bell: [3, 2, 1, 0, -1, -1, 2, -1], pulse: 0, strings: 1 },
  finale: { piano: [0, 2, 3, -1, 2, 1, 0, -1, 1, 2, 3, -1, 2, 1, 0, -1], bell: [3, 2, 1, 0, 2, 1, 0, -1], pulse: 8, strings: 1.2 },
}

const CHORDS = {
  lobby: [
    [174.61, 220, 261.63, 329.63],
    [130.81, 196, 246.94, 293.66],
    [146.83, 174.61, 220, 261.63],
    [116.54, 174.61, 220, 261.63],
  ],
  game: [
    [174.61, 220, 261.63, 329.63],
    [146.83, 174.61, 220, 261.63],
    [116.54, 174.61, 220, 293.66],
    [130.81, 196, 246.94, 293.66],
  ],
}

export function createKeepsakeAudioEngine() {
  const Context = window.AudioContext || window.webkitAudioContext
  if (!Context) {
    return null
  }

  const context = new Context()
  const masterGain = context.createGain()
  masterGain.gain.value = 0
  masterGain.connect(context.destination)

  const lowpass = context.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 1600
  lowpass.Q.value = 0.8
  lowpass.connect(masterGain)
  const musicBoxBus = context.createGain()
  musicBoxBus.gain.value = 0.65
  musicBoxBus.connect(masterGain)
  const echo = context.createDelay(3)
  echo.delayTime.value = 0.6
  const echoReturn = context.createGain()
  echoReturn.gain.value = 0.18
  musicBoxBus.connect(echo)
  echo.connect(echoReturn)
  echoReturn.connect(masterGain)
  const echoFeedback = context.createGain()
  echoFeedback.gain.value = 0.22
  echoReturn.connect(echoFeedback)
  echoFeedback.connect(echo)
  const room = context.createConvolver()
  const impulse = context.createBuffer(2, Math.floor(context.sampleRate * 4.5), context.sampleRate)
  let noiseSeed = 127
  for (let channel = 0; channel < 2; channel += 1) {
    const data = impulse.getChannelData(channel)
    let smooth = 0
    for (let index = 0; index < data.length; index += 1) {
      noiseSeed = (Math.imul(noiseSeed, 1664525) + 1013904223) >>> 0
      smooth = smooth * 0.65 + (noiseSeed / 4294967296 * 2 - 1) * 0.35
      data[index] = smooth * Math.pow(1 - index / data.length, 3)
    }
  }
  room.buffer = impulse
  const roomReturn = context.createGain()
  roomReturn.gain.value = 0.22
  lowpass.connect(room)
  musicBoxBus.connect(room)
  echoReturn.connect(room)
  room.connect(roomReturn)
  roomReturn.connect(masterGain)
  const stringFilter = context.createBiquadFilter()
  stringFilter.type = 'lowpass'
  stringFilter.frequency.value = 850
  stringFilter.Q.value = 0.35
  stringFilter.connect(masterGain)
  stringFilter.connect(room)

  let unlocked = false
  let muted = false
  let stage = 'menu'
  let chordIndex = 0
  let chordTimer = null
  let sparkleTimer = null
  let melodyStep = 0
  const activeNotes = new Set()

  function pluck(frequency, when, level = 0.18) {
    // Soft electric-piano partials, with a slow attack and a natural tail.
    ;[1, 2, 3].forEach((partial, index) => {
      const oscillator = context.createOscillator()
      const envelope = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency * partial
      envelope.gain.setValueAtTime(0.0001, when)
      envelope.gain.exponentialRampToValueAtTime(level / (1 + index * 7), when + 0.025)
      envelope.gain.exponentialRampToValueAtTime(0.0001, when + 8)
      oscillator.connect(envelope)
      envelope.connect(lowpass)
      activeNotes.add(oscillator)
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); activeNotes.delete(oscillator) }
      oscillator.start(when)
      oscillator.stop(when + 8.05)
    })
  }

  function softNote(frequency, when, duration, level, destination, type = 'sine', bend = false) {
    const oscillator = context.createOscillator()
    const envelope = context.createGain()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, when)
    if (bend) {
      oscillator.detune.setValueAtTime(0, when + 0.6)
      ;[18, -16, 12, -9, 5, 0].forEach((cents, index) => {
        oscillator.detune.linearRampToValueAtTime(cents, when + 1 + index * 0.65)
      })
    }
    envelope.gain.setValueAtTime(0.0001, when)
    envelope.gain.exponentialRampToValueAtTime(level, when + 0.035)
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration)
    oscillator.connect(envelope)
    envelope.connect(destination)
    activeNotes.add(oscillator)
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); activeNotes.delete(oscillator) }
    oscillator.start(when)
    oscillator.stop(when + duration + 0.05)
  }

  function sustainStrings(chord, when) {
    chord.slice(0, 3).forEach((frequency) => {
      for (const detune of [-5, 5]) {
        const oscillator = context.createOscillator()
        const envelope = context.createGain()
        oscillator.type = 'triangle'
        oscillator.frequency.value = frequency
        oscillator.detune.value = detune
        envelope.gain.setValueAtTime(0.0001, when)
        envelope.gain.exponentialRampToValueAtTime(0.018 * MUSIC_PATTERNS[stage].strings, when + 2.5)
        envelope.gain.setTargetAtTime(0.0001, when + 7, 1.5)
        oscillator.connect(envelope)
        envelope.connect(stringFilter)
        activeNotes.add(oscillator)
        oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); activeNotes.delete(oscillator) }
        oscillator.start(when)
        oscillator.stop(when + 14)
      }
    })
  }

  function getOutputLevel() {
    if (!unlocked || muted) {
      return 0
    }

    return stage === 'menu' ? 0.06 : 0.075
  }

  function applyMasterLevel() {
    masterGain.gain.cancelScheduledValues(context.currentTime)
    masterGain.gain.setTargetAtTime(
      getOutputLevel(),
      context.currentTime,
      0.7,
    )
  }

  function retunePads() {
    const chords = CHORDS[stage === 'menu' ? 'lobby' : 'game']
    const chord = chords[chordIndex % chords.length]
    chordIndex += 1

    if (!muted && unlocked) {
      pluck(chord[0] / 2, context.currentTime, 0.28)
      chord.forEach((frequency, index) => pluck(frequency, context.currentTime + index * 0.16, 0.13))
      softNote(chord[0] / 4, context.currentTime, 7.5, 0.24, lowpass)
      sustainStrings(chord, context.currentTime)
    }
  }

  function scheduleSparkle() {
    if (!unlocked || muted) {
      return
    }

    const arrangement = MUSIC_PATTERNS[stage]
    const pattern = arrangement.piano
    const step = melodyStep++ % pattern.length
    const phraseRest = step % 8 >= 6
    const note = phraseRest ? -1 : pattern[step]
    const chords = CHORDS[stage === 'menu' ? 'lobby' : 'game']
    const chord = chords[(chordIndex + chords.length - 1) % chords.length]
    if (note >= 0) pluck(chord[note] * 2, context.currentTime, 0.11)
    // The upper voice answers the piano rather than leaving each phrase hanging.
    const answer = phraseRest ? -1 : step % 8 === 5 ? 0 : arrangement.bell[step % arrangement.bell.length]
    if (answer >= 0) {
      softNote(chord[answer] * 4, context.currentTime + 0.45, 7.2, 0.065, musicBoxBus, 'sine', step % 8 === 5)
      softNote(chord[answer] * 4 * 2.01, context.currentTime + 0.45, 1.4, 0.009, musicBoxBus)
    }
    // A low, barely audible chip pulse, with the sub carrying most of the weight.
    if (arrangement.pulse && step % arrangement.pulse === 0) {
      softNote(chord[0] / 4, context.currentTime, 0.48, 0.11, lowpass)
      softNote(chord[0] / 4, context.currentTime + 0.35, 0.6, 0.06, lowpass)
    }
    if (arrangement.pulse && step % 8 === 2) softNote(chord[0] / 2, context.currentTime, 0.1, 0.008, lowpass, 'square')
  }

  function clearAmbientTimers() {
    window.clearInterval(chordTimer)
    window.clearInterval(sparkleTimer)
  }

  function startAmbient() {
    clearAmbientTimers()
    retunePads()
    chordTimer = window.setInterval(retunePads, 12000)
    sparkleTimer = window.setInterval(
      scheduleSparkle,
      1500,
    )
    applyMasterLevel()
  }

  function ensureReady() {
    if (context.state === 'suspended') {
      context.resume()
    }

    if (!unlocked) {
      unlocked = true
      startAmbient()
    }
  }

  function playTone({
    attack = 0.01,
    duration = 0.16,
    frequency = 440,
    release = 0.24,
    type = 'triangle',
    volume = 0.04,
  }) {
    ensureReady()

    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = type
    oscillator.frequency.value = frequency
    gain.gain.value = 0.0001
    oscillator.connect(gain)
    gain.connect(lowpass)

    const now = context.currentTime
    oscillator.start(now)
    gain.gain.exponentialRampToValueAtTime(volume, now + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release)
    oscillator.stop(now + duration + release + 0.02)
  }

  return {
    ensureReady,
    get muted() {
      return muted
    },
    get unlocked() {
      return unlocked
    },
    playAction() {
      playTone({ frequency: 392, volume: 0.038, duration: 0.08 })
      playTone({ frequency: 523.25, volume: 0.026, duration: 0.12 })
    },
    playButton() {
      playTone({ frequency: 466.16, volume: 0.03, duration: 0.05 })
      playTone({ frequency: 698.46, volume: 0.016, duration: 0.09 })
    },
    playError() {
      playTone({ frequency: 220, type: 'sawtooth', volume: 0.022, duration: 0.1 })
      playTone({ frequency: 196, type: 'triangle', volume: 0.018, duration: 0.14 })
    },
    playPhase(type) {
      if (type === 'duel') {
        playTone({ frequency: 622.25, type: 'square', volume: 0.05, duration: 0.12 })
      } else if (type === 'activity') {
        playTone({ frequency: 415.3, volume: 0.03, duration: 0.1 })
      } else if (type === 'finale') {
        playTone({ frequency: 523.25, volume: 0.03, duration: 0.1 })
        playTone({ frequency: 659.25, volume: 0.022, duration: 0.14 })
        playTone({ frequency: 783.99, volume: 0.018, duration: 0.16 })
      }
    },
    playSuccess() {
      playTone({ frequency: 523.25, volume: 0.03, duration: 0.08 })
      playTone({ frequency: 659.25, volume: 0.022, duration: 0.12 })
    },
    setMuted(nextMuted) {
      muted = nextMuted
      if (!muted && unlocked) {
        startAmbient()
      }
      applyMasterLevel()
    },
    setStage(nextStage) {
      if (!MUSIC_PATTERNS[nextStage] || stage === nextStage) return
      stage = nextStage
      // Keep the clock and ringing notes; the next musical tick takes the new voice.
      applyMasterLevel()
      if (import.meta.env.DEV) window.__atLongLastMusicStage = stage
    },
    stop() {
      clearAmbientTimers()
      masterGain.disconnect()
      musicBoxBus.disconnect()
      echo.disconnect()
      echoReturn.disconnect()
      echoFeedback.disconnect()
      room.disconnect()
      roomReturn.disconnect()
      stringFilter.disconnect()
      lowpass.disconnect()
      activeNotes.forEach((oscillator) => oscillator.stop())
      context.close()
    },
    toggleMuted() {
      muted = !muted
      if (!muted && unlocked) {
        startAmbient()
      }
      applyMasterLevel()
      return muted
    },
  }
}
