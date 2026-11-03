import { useEffect, useRef } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { musicStageFor } from '../audio/musicPatterns.js'

export function useSynth(session, activity) {
  const { playSuccess, setStage } = useAudio()
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

  }, [activity, playSuccess, session, setStage])
}
