import { playMomentScore } from './commitScore.js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react'
import { MUSIC_PATTERNS } from './musicPatterns.js'
import { SCORE_TICK_SECONDS, scoreFrame } from './ambientScore.js'
import { createKeepsakeAudioEngine } from './keepsakeSoundtrack.js'
import { createFirstAmbientEngine } from './firstAmbientSoundtrack.js'

const AudioContextContext = createContext(null)
export function createAudioEngine(suppliedContext = null) {
  const Context = window.AudioContext || window.webkitAudioContext
  if (!Context) {
    return null
  }

  const context = suppliedContext || new Context()
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
  const accompaniment = context.createGain()
  accompaniment.gain.value = 0
  const accompanimentFilter = context.createBiquadFilter()
  accompanimentFilter.type = 'lowpass'
  accompanimentFilter.frequency.value = 1150
  accompaniment.connect(accompanimentFilter)
  accompanimentFilter.connect(masterGain)
  const wetGate = context.createGain()
  wetGate.gain.value = 0.75
  wetGate.connect(masterGain)
  const echo = context.createDelay(3)
  echo.delayTime.value = 1.2
  const echoReturn = context.createGain()
  echoReturn.gain.value = 0.18
  musicBoxBus.connect(echo)
  echo.connect(echoReturn)
  const echoPan = context.createStereoPanner()
  echoPan.pan.value = -0.55
  echoReturn.connect(echoPan)
  echoPan.connect(wetGate)
  const reflection = context.createDelay(3)
  reflection.delayTime.value = 1.8
  const reflectionLevel = context.createGain()
  reflectionLevel.gain.value = 0.12
  const reflectionPan = context.createStereoPanner()
  reflectionPan.pan.value = 0.55
  musicBoxBus.connect(reflection)
  reflection.connect(reflectionLevel)
  reflectionLevel.connect(reflectionPan)
  reflectionPan.connect(wetGate)
  const echoFeedback = context.createGain()
  echoFeedback.gain.value = 0.22
  echoReturn.connect(echoFeedback)
  echoFeedback.connect(echo)
  const room = context.createConvolver()
  const impulse = context.createBuffer(2, Math.floor(context.sampleRate * 7), context.sampleRate)
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
  accompanimentFilter.connect(room)
  room.connect(roomReturn)
  roomReturn.connect(wetGate)
  const stringFilter = context.createBiquadFilter()
  stringFilter.type = 'lowpass'
  stringFilter.frequency.value = 850
  stringFilter.Q.value = 0.35
  stringFilter.connect(masterGain)
  stringFilter.connect(room)

  let unlocked = false
  let muted = false
  let stage = 'menu'
  let scoreTimer = null
  let nextTickTime = 0
  let scoreTick = 0
  let bassStyle = 'held'
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
      envelope.gain.exponentialRampToValueAtTime(0.0001, when + 12)
      oscillator.connect(envelope)
      envelope.connect(lowpass)
      activeNotes.add(oscillator)
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); activeNotes.delete(oscillator) }
      oscillator.start(when)
      oscillator.stop(when + 12.05)
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
        envelope.gain.exponentialRampToValueAtTime(0.012, when + 4)
        envelope.gain.setTargetAtTime(0.0001, when + 12, 2)
        oscillator.connect(envelope)
        envelope.connect(stringFilter)
        activeNotes.add(oscillator)
        oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); activeNotes.delete(oscillator) }
        oscillator.start(when)
        oscillator.stop(when + 23)
      }
    })
  }

  function uprightBass(frequency, when, duration = 18) {
    // A rounded fundamental and short woody overtones imitate a softly plucked string.
    ;[1, 2, 3, 4].forEach((partial, index) => {
      const oscillator = context.createOscillator()
      const envelope = context.createGain()
      const length = Math.max(1.5, duration / (1 + index * 1.7))
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency * partial * 1.007, when)
      oscillator.frequency.exponentialRampToValueAtTime(frequency * partial, when + 0.12)
      envelope.gain.setValueAtTime(0.0001, when)
      envelope.gain.exponentialRampToValueAtTime(0.15 / (1 + index * 3), when + 0.025)
      envelope.gain.exponentialRampToValueAtTime(0.0001, when + length)
      oscillator.connect(envelope)
      envelope.connect(accompaniment)
      activeNotes.add(oscillator)
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); activeNotes.delete(oscillator) }
      oscillator.start(when)
      oscillator.stop(when + length + 0.05)
    })
  }

  function getOutputLevel() {
    if (!unlocked || muted) {
      return 0
    }

    return 0.075
  }

  function applyMasterLevel() {
    masterGain.gain.cancelScheduledValues(context.currentTime)
    masterGain.gain.setTargetAtTime(
      getOutputLevel(),
      context.currentTime,
      0.7,
    )
  }

  function scheduleScoreTick(tick, when) {
    const frame = scoreFrame(tick, stage)
    const { chord, piano: note, bell: answer } = frame
    if (frame.barStart) {
      pluck(chord[0] / 2, when, 0.28)
      chord.forEach((frequency, index) => pluck(frequency, when + index * 0.2, 0.13))
      softNote(chord[0] / 4, when, 12, 0.24, lowpass)
      sustainStrings(chord, when)
      if (stage !== 'menu') uprightBass(chord[0] / 2, when)
    }
    if (note >= 0) pluck(chord[note] * 2, when, 0.11)
    if (answer >= 0) {
      softNote(chord[answer] * 4, when + 0.6, 10, 0.065, musicBoxBus, 'sine', frame.bend)
      softNote(chord[answer] * 4 * 2.01, when + 0.6, 2, 0.009, musicBoxBus)
    }
    if (frame.accompaniment >= 0) {
      const frequency = chord[frame.accompaniment]
      softNote(frequency, when + 0.35, 7, 0.075, accompaniment, 'triangle', frame.bend)
      softNote(frequency * 2, when + 0.43, 4, 0.022, accompaniment)
    }
    if (stage !== 'menu' && bassStyle === 'walking' && (tick % 8 === 4 || tick % 8 === 6)) {
      uprightBass(chord[tick % 8 === 4 ? 2 : 1] / 2, when, tick % 8 === 4 ? 5 : 4)
    }
    if (frame.pulse) {
      for (let hit = 0; hit < frame.pulseCount; hit += 1) {
        const at = when + hit * 0.32
        const thump = context.createOscillator()
        const envelope = context.createGain()
        thump.type = 'sine'
        thump.frequency.setValueAtTime(72, at)
        thump.frequency.exponentialRampToValueAtTime(42, at + 0.22)
        envelope.gain.setValueAtTime(0.0001, at)
        envelope.gain.exponentialRampToValueAtTime(hit === 0 ? 0.13 : 0.08, at + 0.035)
        envelope.gain.exponentialRampToValueAtTime(0.0001, at + 0.65)
        thump.connect(envelope)
        envelope.connect(accompaniment)
        activeNotes.add(thump)
        thump.onended = () => { thump.disconnect(); envelope.disconnect(); activeNotes.delete(thump) }
        thump.start(at)
        thump.stop(at + 0.7)
      }
    }
    // Foreground notes gently duck the room; the gap lets their reflections bloom.
    if (note >= 0 || answer >= 0) {
      wetGate.gain.setTargetAtTime(0.22, when, 0.08)
      wetGate.gain.setTargetAtTime(0.85, when + 0.9, 1.1)
    }
  }

  function clearAmbientTimers() {
    window.clearInterval(scoreTimer)
    scoreTimer = null
  }

  function startAmbient() {
    if (suppliedContext) { applyMasterLevel(); return }
    if (scoreTimer !== null) return
    nextTickTime = context.currentTime + 0.06
    const schedule = () => {
      // Skip missed beats after a background-tab stall instead of playing a burst.
      if (nextTickTime < context.currentTime - SCORE_TICK_SECONDS) {
        const missed = Math.ceil((context.currentTime - nextTickTime) / SCORE_TICK_SECONDS)
        scoreTick += missed
        nextTickTime += missed * SCORE_TICK_SECONDS
      }
      while (nextTickTime < context.currentTime + 0.2) {
        if (!muted) scheduleScoreTick(scoreTick, Math.max(nextTickTime, context.currentTime))
        scoreTick += 1
        nextTickTime += SCORE_TICK_SECONDS
      }
    }
    schedule()
    scoreTimer = window.setInterval(schedule, 80)
    applyMasterLevel()
  }

  function ensureReady() {
    if (!suppliedContext && context.state === 'suspended') {
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
    get context() { return context },
    scheduleTick: scheduleScoreTick,
    setBassStyle(style) { bassStyle = style === 'walking' ? 'walking' : 'held' },
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
    setStage(nextStage, when = context.currentTime) {
      if (!MUSIC_PATTERNS[nextStage] || stage === nextStage) return
      stage = nextStage
      accompaniment.gain.setTargetAtTime(stage === 'menu' ? 0 : 0.8, when, 1.2)
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
      accompaniment.disconnect()
      accompanimentFilter.disconnect()
      wetGate.disconnect()
      echoPan.disconnect()
      reflection.disconnect()
      reflectionLevel.disconnect()
      reflectionPan.disconnect()
      lowpass.disconnect()
      activeNotes.forEach((oscillator) => oscillator.stop())
      context.close?.()
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

function savedMusicChoice(key, allowed, fallback) {
  try {
    const value = localStorage.getItem(key)
    return allowed.includes(value) ? value : fallback
  } catch { return fallback }
}

export function AudioProvider({ children }) {
  const engineRef = useRef(null)
  const keepsakeEngineRef = useRef(null)
  const scrapbookOpenRef = useRef(false)
  const mutedRef = useRef(false)
  const firstEngineRef = useRef(null)
  const archiveStageRef = useRef({})
  const [musicTheme, setMusicThemeState] = useState(() => savedMusicChoice('at-long-last:music-theme', ['continuous', 'original', 'first'], 'continuous'))
  const [bassStyle, setBassStyleState] = useState(() => savedMusicChoice('at-long-last:bass-style', ['held', 'walking'], 'held'))
  const themeRef = useRef(musicTheme)
  const bassRef = useRef(bassStyle)
  const desiredStageRef = useRef('menu')
  const celebratingRef = useRef(false)
  const [muted, setMuted] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  const syncTracks = useCallback(() => {
    const main = engineRef.current
    if (!main?.unlocked) return
    const activeTheme = scrapbookOpenRef.current ? 'original' : themeRef.current
    const mainMuted = celebratingRef.current || mutedRef.current || activeTheme !== 'continuous'
    if (main.muted !== mainMuted) main.setMuted(mainMuted)
    if (activeTheme === 'original' && !mutedRef.current && !keepsakeEngineRef.current) {
      keepsakeEngineRef.current = createKeepsakeAudioEngine()
      keepsakeEngineRef.current?.ensureReady()
    }
    if (activeTheme === 'first' && !mutedRef.current && !firstEngineRef.current) {
      firstEngineRef.current = createFirstAmbientEngine()
      firstEngineRef.current?.ensureReady()
    }
    for (const [name, engine] of [['original', keepsakeEngineRef.current], ['first', firstEngineRef.current]]) {
      if (!engine) continue
      const nextStage = name === 'first'
        ? desiredStageRef.current === 'menu' ? 'lobby' : 'game'
        : scrapbookOpenRef.current ? 'reflective' : desiredStageRef.current
      if (archiveStageRef.current[name] !== nextStage) {
        engine.setStage(nextStage)
        archiveStageRef.current[name] = nextStage
      }
      const shouldMute = celebratingRef.current || mutedRef.current || activeTheme !== name
      if (engine.muted !== shouldMute) engine.setMuted(shouldMute)
    }
    if (import.meta.env.DEV) window.__atLongLastSoundtrack = activeTheme
  }, [])

  const setMusicTheme = useCallback((theme) => {
    if (!['continuous', 'original', 'first'].includes(theme)) return
    themeRef.current = theme
    try { localStorage.setItem('at-long-last:music-theme', theme) } catch { /* Preferences are optional in private browsing. */ }
    setMusicThemeState(theme)
    syncTracks()
  }, [syncTracks])
  const setBassStyle = useCallback((style) => {
    bassRef.current = style === 'walking' ? 'walking' : 'held'
    try { localStorage.setItem('at-long-last:bass-style', bassRef.current) } catch { /* Playback still works without storage. */ }
    setBassStyleState(bassRef.current)
    engineRef.current?.setBassStyle(bassRef.current)
  }, [])

  const setScrapbookOpen = useCallback((open) => {
    scrapbookOpenRef.current = open
    syncTracks()
  }, [syncTracks])

  function ensureEngine() {
    if (!engineRef.current) {
      engineRef.current = createAudioEngine()
      engineRef.current?.setStage(desiredStageRef.current)
      engineRef.current?.setBassStyle(bassRef.current)
    }

    return engineRef.current
  }

  function getExistingEngine() {
    if (scrapbookOpenRef.current || themeRef.current === 'original') return keepsakeEngineRef.current
    return themeRef.current === 'first' ? firstEngineRef.current : engineRef.current
  }

  const unlockAudio = useEffectEvent(() => {
    ensureEngine()?.ensureReady()
    syncTracks()
    setUnlocked(Boolean(engineRef.current?.unlocked))
  })

  useEffect(() => {
    function handlePointerDown(event) {
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest('.audio-toggle')) return
      unlockAudio()
      if (!target) {
        return
      }

      if (target.closest('button, [data-sound="button"], [role="button"]')) {
        getExistingEngine()?.playButton()
      }
    }

    window.addEventListener('pointerdown', handlePointerDown, true)
    return () => window.removeEventListener('pointerdown', handlePointerDown, true)
  }, [unlockAudio])

  useEffect(() => () => {
    engineRef.current?.stop()
    keepsakeEngineRef.current?.stop()
    firstEngineRef.current?.stop()
    engineRef.current = null
    keepsakeEngineRef.current = null
    firstEngineRef.current = null
    archiveStageRef.current = {}
  }, [])

  const value = useMemo(
    () => ({
      muted,
      musicTheme,
      bassStyle,
      setMusicTheme,
      setBassStyle,
      playAction: () => getExistingEngine()?.playAction(),
      playError: () => getExistingEngine()?.playError(),
      playPhase: (phase) => getExistingEngine()?.playPhase(phase),
      playSuccess: () => getExistingEngine()?.playSuccess(),
      playCelebration: (kind) => {
        const engine = ensureEngine()
        if (!engine?.context) return null
        celebratingRef.current = true
        syncTracks()
        const score = playMomentScore(engine.context, kind, mutedRef.current)
        return { ...score, stop: () => { score.stop(); celebratingRef.current = false; syncTracks() } }
      },
      setStage: (stage) => {
        desiredStageRef.current = stage
        engineRef.current?.setStage(stage)
        syncTracks()
      },
      setScrapbookOpen,
      toggleMuted: () => {
        const wasUnlocked = Boolean(engineRef.current?.unlocked)
        ensureEngine()?.ensureReady()
        const nextMuted = wasUnlocked ? !mutedRef.current : false
        mutedRef.current = nextMuted
        syncTracks()
        setMuted(nextMuted)
        setUnlocked(Boolean(engineRef.current?.unlocked))
      },
      unlocked,
    }),
    [bassStyle, musicTheme, muted, setBassStyle, setMusicTheme, setScrapbookOpen, syncTracks, unlocked],
  )

  return (
    <AudioContextContext.Provider value={value}>
      {children}
    </AudioContextContext.Provider>
  )
}

export function useAudio() {
  return useContext(AudioContextContext)
}
