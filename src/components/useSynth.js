import { useEffect, useRef } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'

export function useSynth(session) {
  const { playPhase, playSuccess, setStage } = useAudio()
  const previousPhase = useRef('')
  const previousRound = useRef(0)

  useEffect(() => {
    if (!session) {
      return
    }

    setStage?.('game')

    if (session.round !== previousRound.current) {
      playSuccess?.()
      previousRound.current = session.round
    }

    if (session.phase !== previousPhase.current) {
      playPhase?.(session.phase)
      previousPhase.current = session.phase
    }
  }, [playPhase, playSuccess, session, setStage])
}
