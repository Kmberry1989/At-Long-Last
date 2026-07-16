import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react'

const AudioContextContext = createContext(null)
const CHORDS = {
  lobby: [
    [261.63, 329.63, 392],
    [293.66, 349.23, 440],
    [220, 329.63, 392],
    [246.94, 311.13, 392],
  ],
  game: [
    [293.66, 369.99, 440],
    [329.63, 415.3, 493.88],
    [261.63, 392, 523.25],
    [246.94, 392, 493.88],
  ],
}

function createAudioEngine() {
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

  const pulseGain = context.createGain()
  pulseGain.gain.value = 0.18
  pulseGain.connect(lowpass)

  const shimmerGain = context.createGain()
  shimmerGain.gain.value = 0.14
  shimmerGain.connect(lowpass)

  const pads = [0, 1, 2].map(() => {
    const oscillator = context.createOscillator()
    oscillator.type = 'triangle'
    oscillator.detune.value = (Math.random() - 0.5) * 12

    const gain = context.createGain()
    gain.gain.value = 0.0001
    oscillator.connect(gain)
    gain.connect(pulseGain)
    oscillator.start()

    return { oscillator, gain }
  })

  const shimmer = context.createOscillator()
  shimmer.type = 'sine'
  shimmer.frequency.value = 523.25
  const shimmerNode = context.createGain()
  shimmerNode.gain.value = 0.0001
  shimmer.connect(shimmerNode)
  shimmerNode.connect(shimmerGain)
  shimmer.start()

  const lfo = context.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.06
  const lfoGain = context.createGain()
  lfoGain.gain.value = 380
  lfo.connect(lfoGain)
  lfoGain.connect(lowpass.frequency)
  lfo.start()

  let unlocked = false
  let muted = false
  let stage = 'lobby'
  let chordIndex = 0
  let chordTimer = null
  let sparkleTimer = null

  function getOutputLevel() {
    if (!unlocked || muted) {
      return 0
    }

    return stage === 'lobby' ? 0.06 : 0.075
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
    const chord = CHORDS[stage][chordIndex % CHORDS[stage].length]
    chordIndex += 1

    pads.forEach((pad, index) => {
      pad.oscillator.frequency.setTargetAtTime(
        chord[index],
        context.currentTime,
        1.1,
      )
      pad.gain.gain.cancelScheduledValues(context.currentTime)
      pad.gain.gain.setTargetAtTime(
        stage === 'lobby' ? 0.055 : 0.07,
        context.currentTime,
        0.9,
      )
    })

    shimmer.frequency.setTargetAtTime(chord[2] * 2, context.currentTime, 1.6)
    shimmerNode.gain.cancelScheduledValues(context.currentTime)
    shimmerNode.gain.setTargetAtTime(
      stage === 'lobby' ? 0.016 : 0.022,
      context.currentTime,
      1.2,
    )
  }

  function scheduleSparkle() {
    if (!unlocked || muted) {
      return
    }

    const now = context.currentTime
    const oscillator = context.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.value = stage === 'lobby' ? 987.77 : 1174.66
    const gain = context.createGain()
    gain.gain.value = 0.0001
    oscillator.connect(gain)
    gain.connect(lowpass)
    oscillator.start(now)
    gain.gain.exponentialRampToValueAtTime(0.012, now + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
    oscillator.stop(now + 1.24)
  }

  function clearAmbientTimers() {
    window.clearInterval(chordTimer)
    window.clearInterval(sparkleTimer)
  }

  function startAmbient() {
    clearAmbientTimers()
    retunePads()
    chordTimer = window.setInterval(retunePads, 6200)
    sparkleTimer = window.setInterval(
      scheduleSparkle,
      stage === 'lobby' ? 3400 : 2600,
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
      stage = nextStage
      if (unlocked && !muted) {
        startAmbient()
      }
    },
    stop() {
      clearAmbientTimers()
      masterGain.disconnect()
      pulseGain.disconnect()
      shimmerGain.disconnect()
      lowpass.disconnect()
      lfo.disconnect()
      lfoGain.disconnect()
      pads.forEach(({ oscillator, gain }) => {
        oscillator.stop()
        gain.disconnect()
      })
      shimmer.stop()
      shimmerNode.disconnect()
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

export function AudioProvider({ children }) {
  const engineRef = useRef(null)
  const [muted, setMuted] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  function ensureEngine() {
    if (!engineRef.current) {
      engineRef.current = createAudioEngine()
    }

    return engineRef.current
  }

  function getExistingEngine() {
    return engineRef.current
  }

  const unlockAudio = useEffectEvent(() => {
    ensureEngine()?.ensureReady()
    setUnlocked(Boolean(engineRef.current?.unlocked))
  })

  useEffect(() => {
    function handlePointerDown(event) {
      unlockAudio()

      const target = event.target instanceof Element ? event.target : null
      if (!target) {
        return
      }

      if (target.closest('button, [data-sound="button"], [role="button"]')) {
        engineRef.current?.playButton()
      }
    }

    window.addEventListener('pointerdown', handlePointerDown, true)
    return () => window.removeEventListener('pointerdown', handlePointerDown, true)
  }, [unlockAudio])

  useEffect(() => () => engineRef.current?.stop(), [])

  const value = useMemo(
    () => ({
      muted,
      playAction: () => getExistingEngine()?.playAction(),
      playError: () => getExistingEngine()?.playError(),
      playPhase: (phase) => getExistingEngine()?.playPhase(phase),
      playSuccess: () => getExistingEngine()?.playSuccess(),
      setStage: (stage) => getExistingEngine()?.setStage(stage),
      toggleMuted: () => {
        const nextMuted = ensureEngine()?.toggleMuted() ?? !muted
        setMuted(nextMuted)
      },
      unlocked,
    }),
    [muted, unlocked],
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
