import { useEffect, useRef } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { musicStageFor } from '../audio/musicPatterns.js'

export function useSynth(session, activity) {
  const { playPhase, playSuccess, setStage } = useAudio()
  const previousPhase = useRef('')
  const previousRound = useRef(0)

  useEffect(() => {
    setStage?.(musicStageFor(session, activity))
    if (!session) {
      return
    }

    if (session.round !== previousRound.current) {
      playSuccess?.()
      previousRound.current = session.round
    }

    if (session.phase !== previousPhase.current) {
      playPhase?.(session.phase)
      previousPhase.current = session.phase
    }
  }, [activity, playPhase, playSuccess, session, setStage])
}
