import { useEffect, useRef } from 'react'

export function useSynth(session) {
  const audioRef = useRef(null)
  const previousPhase = useRef('')
  const previousRound = useRef(0)

  useEffect(() => {
    function init() {
      if (!audioRef.current) {
        audioRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
    }

    window.addEventListener('pointerdown', init, { once: true })
    return () => window.removeEventListener('pointerdown', init)
  }, [])

  useEffect(() => {
    if (!audioRef.current || !session) {
      return
    }

    const audio = audioRef.current

    function play(freq, duration, type = 'triangle', volume = 0.05) {
      const oscillator = audio.createOscillator()
      const gain = audio.createGain()
      oscillator.type = type
      oscillator.frequency.value = freq
      gain.gain.value = volume
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration)
      oscillator.connect(gain)
      gain.connect(audio.destination)
      oscillator.start()
      oscillator.stop(audio.currentTime + duration)
    }

    if (session.round !== previousRound.current) {
      play(480, 0.18)
      window.setTimeout(() => play(620, 0.2), 90)
      previousRound.current = session.round
    }

    if (session.phase !== previousPhase.current) {
      if (session.phase === 'duel') {
        play(780, 0.16, 'square', 0.08)
      } else if (session.phase === 'finale') {
        play(520, 0.18)
        window.setTimeout(() => play(760, 0.18), 120)
        window.setTimeout(() => play(960, 0.24), 240)
      } else if (session.phase === 'activity') {
        play(420, 0.16)
      }
      previousPhase.current = session.phase
    }
  }, [session])
}
