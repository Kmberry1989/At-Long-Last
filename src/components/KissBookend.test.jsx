import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { KISS_COURIER_VOICE_PROMPT, KissBookend } from './KissBookend.jsx'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('records a short note from the device microphone and sends the captured audio', async () => {
  const stopTrack = vi.fn()
  const getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] })
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } })
  class MockMediaRecorder {
    static isTypeSupported = () => true
    state = 'inactive'
    mimeType = 'audio/webm;codecs=opus'
    start() { this.state = 'recording' }
    stop() {
      this.state = 'inactive'
      this.ondataavailable({ data: new Blob(['voice note'], { type: this.mimeType }) })
      this.onstop()
    }
  }
  vi.stubGlobal('MediaRecorder', MockMediaRecorder)
  let now = 1000
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  const onSend = vi.fn().mockResolvedValue(undefined)
  render(<KissBookend onSend={onSend} />)
  expect(screen.getByText(KISS_COURIER_VOICE_PROMPT)).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Record a note' }))
  await waitFor(() => expect(getUserMedia).toHaveBeenCalledWith({ audio: true }))
  now = 1600
  fireEvent.click(await screen.findByRole('button', { name: 'Stop' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Send kiss' }))

  await waitFor(() => expect(onSend).toHaveBeenCalledWith(expect.objectContaining({
    audioData: expect.stringMatching(/^data:audio\/webm(;[^,]*)?;base64,/),
    durationMs: 600,
    mimeType: 'audio/webm;codecs=opus',
  })))
  expect(stopTrack).toHaveBeenCalledOnce()
})

it('shows the same integrated voice prompt when catching the partner’s kiss', () => {
  render(<KissBookend mode="catch" recording={{ audioData: 'data:audio/webm;base64,AAAA' }} onCatch={vi.fn()} />)
  expect(screen.getByText(KISS_COURIER_VOICE_PROMPT)).toBeInTheDocument()
})
