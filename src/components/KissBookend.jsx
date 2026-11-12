import { useEffect, useRef, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { PlayerPortrait } from './PlayerPortrait.jsx'
import { MAX_NIGHT_KISS_DATA_URI_CHARS, MAX_NIGHT_KISS_DURATION_MS } from '../features/session/nightKissService.js'

export const KISS_COURIER_VOICE_PROMPT = 'Tell them what you love—in a movie-trailer voice.'

function supportedAudioType() {
  if (typeof MediaRecorder === 'undefined') return ''
  return [
    'audio/mp4;codecs=mp4a.40.2',
    'audio/webm;codecs=opus',
    'audio/ogg;codecs=opus',
  ].find(type => MediaRecorder.isTypeSupported?.(type)) || ''
}

function readAudioData(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not prepare the voice note.'))
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

export function KissBookend({ mode = 'send', recording, featuredPlayer, onSend, onCatch, onContinue, voicePrompt = KISS_COURIER_VOICE_PROMPT, working = false }) {
  const { setMusicPaused } = useAudio() || {}
  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const startedAtRef = useRef(0)
  const stopTimerRef = useRef(null)
  const [recorded, setRecorded] = useState(null)
  const [recordingActive, setRecordingActive] = useState(false)
  const [caught, setCaught] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => () => {
    window.clearTimeout(stopTimerRef.current)
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    streamRef.current?.getTracks().forEach(track => track.stop())
    setMusicPaused?.(false)
  }, [setMusicPaused])

  async function startRecording() {
    setError('')
    setRecorded(null)
    setMusicPaused?.(true)
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        throw new Error('Microphone recording is not available in this browser.')
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const type = supportedAudioType()
      const recorder = new MediaRecorder(stream, type ? { mimeType: type, audioBitsPerSecond: 24_000 } : { audioBitsPerSecond: 24_000 })
      streamRef.current = stream
      recorderRef.current = recorder
      chunksRef.current = []
      startedAtRef.current = performance.now()
      recorder.ondataavailable = event => { if (event.data?.size) chunksRef.current.push(event.data) }
      recorder.onerror = () => setError('Recording stopped. Try again.')
      recorder.onstop = async () => {
        window.clearTimeout(stopTimerRef.current)
        const durationMs = Math.min(MAX_NIGHT_KISS_DURATION_MS, Math.round(performance.now() - startedAtRef.current))
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null
        recorderRef.current = null
        setMusicPaused?.(false)
        setRecordingActive(false)
        if (durationMs < 400) {
          setError('Record a little longer.')
          return
        }
        try {
          const audioData = await readAudioData(blob)
          if (audioData.length > MAX_NIGHT_KISS_DATA_URI_CHARS) {
            setError('That note was too large. Try a shorter recording.')
            return
          }
          setRecorded({ audioData, durationMs, mimeType: blob.type || recorder.mimeType || 'audio/webm' })
        } catch (nextError) { setError(nextError.message) }
      }
      recorder.start()
      setRecordingActive(true)
      stopTimerRef.current = window.setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop()
      }, MAX_NIGHT_KISS_DURATION_MS)
    } catch (nextError) {
      streamRef.current?.getTracks().forEach(track => track.stop())
      streamRef.current = null
      setMusicPaused?.(false)
      setError(nextError.name === 'NotAllowedError' ? 'Allow microphone access to record your note.' : nextError.message || 'Could not start the microphone.')
    }
  }

  function stopRecording() {
    window.clearTimeout(stopTimerRef.current)
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }

  async function submitRecording() {
    if (!recorded || working) return
    setError('')
    try { await onSend(recorded) } catch (nextError) { setError(nextError.message || 'Could not send the kiss.') }
  }

  async function catchKiss() {
    if (working || caught) return
    setError('')
    try {
      await onCatch()
      setCaught(true)
    } catch (nextError) { setError(nextError.message || 'Could not catch the kiss.') }
  }

  if (mode === 'catch') {
    return (
      <section className="kiss-bookend" aria-label="Catch your partner’s kiss">
      <div className="kiss-bookend-art is-kiss-marked">
        <PlayerPortrait className="kiss-bookend-portrait" player={featuredPlayer} label={`${featuredPlayer?.displayName || 'Your person'}’s portrait`} />
        <img className="kiss-bookend-stamp" src="/assets/kiss/lipstick-kiss.png" alt="" aria-hidden="true" />
      </div>
        {!caught ? <>
          <h2>Catch their kiss</h2>
          <p className="kiss-bookend-prompt">{voicePrompt}</p>
          <button className="primary-btn kiss-bookend-action" disabled={working} onClick={catchKiss} type="button">Catch</button>
        </> : <>
          <audio className="kiss-bookend-audio" controls autoPlay src={recording?.audioData} />
          <button className="primary-btn kiss-bookend-action" disabled={working} onClick={onContinue} type="button">Continue</button>
        </>}
        {error && <p className="error-copy" role="alert">{error}</p>}
      </section>
    )
  }

  return (
    <section className="kiss-bookend" aria-label="Send a kiss with a voice note">
      <div className="kiss-bookend-art is-kiss-marked">
        <PlayerPortrait className="kiss-bookend-portrait" player={featuredPlayer} label={`${featuredPlayer?.displayName || 'Your person'}’s portrait`} />
        <img className="kiss-bookend-stamp" src="/assets/kiss/lipstick-kiss.png" alt="" aria-hidden="true" />
      </div>
      <h2>{recording ? 'Kiss sent' : 'Send a kiss'}</h2>
      {!recording ? <>
        {!recorded ? <button className={`primary-btn kiss-bookend-action${recordingActive ? ' is-recording' : ''}`} disabled={working} onClick={recordingActive ? stopRecording : startRecording} type="button">{recordingActive ? 'Stop' : 'Record a note'}</button> : <>
          <audio className="kiss-bookend-audio" controls src={recorded.audioData} />
          <div className="kiss-bookend-actions">
            <button className="secondary-btn" disabled={working} onClick={startRecording} type="button">Record again</button>
            <button className="primary-btn" disabled={working} onClick={submitRecording} type="button">Send kiss</button>
          </div>
        </>}
      </> : <button className="primary-btn kiss-bookend-action" disabled={working} onClick={onContinue} type="button">Begin our night</button>}
      {error && <p className="error-copy" role="alert">{error}</p>}
    </section>
  )
}
