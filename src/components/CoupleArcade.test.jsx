import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CoupleArcade } from './CoupleArcade.jsx'

vi.mock('../audio/AudioProvider.jsx', () => ({
  useAudio: () => ({
    playChoiceTap: vi.fn(), playCardSlide: vi.fn(), playSuccess: vi.fn(), playCardFlip: vi.fn(),
    playDuelPulse: vi.fn(), playConnectFourWin: vi.fn(), playPhase: vi.fn(),
  }),
}))

const props = {
  app: null, db: null, enabled: false, coupleId: 'preview-couple', currentUid: 'a',
  players: [{ uid: 'a', displayName: 'A' }, { uid: 'b', displayName: 'B' }], onClose: vi.fn(),
}
const originalMediaDevices = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices')
const originalVideoSrcObject = Object.getOwnPropertyDescriptor(HTMLVideoElement.prototype, 'srcObject')

function restoreProperty(target, key, descriptor) {
  if (descriptor) Object.defineProperty(target, key, descriptor)
  else delete target[key]
}

describe('CoupleArcade', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    restoreProperty(navigator, 'mediaDevices', originalMediaDevices)
    restoreProperty(HTMLVideoElement.prototype, 'srcObject', originalVideoSrcObject)
  })

  it('shows all five branded games and opens each playable local preview', () => {
    render(<CoupleArcade {...props} />)
    for (const [name, icon] of [
      ['My One and Only!', '/assets/arcade/icons/my-one-and-only.png'],
      ['Say Without Saying', '/assets/arcade/icons/say-it-without-saying.png'],
      ['Catch My Heart', '/assets/arcade/icons/catch-my-heart.png'],
      ['Radar Love', '/assets/arcade/icons/radar-love.png'],
      ['Our Little Pieces', '/assets/arcade/icons/our-little-pieces.png'],
    ]) {
      const tile = screen.getByRole('button', { name })
      expect(tile.querySelector('img')).toHaveAttribute('src', icon)
    }
    for (const [name, screenText] of [
      ['My One and Only!', 'Draw a card'],
      ['Catch My Heart', 'Your cards'],
      ['Radar Love', 'Place your fleet'],
      ['Say Without Saying', 'Your turn to act'],
      ['Our Little Pieces', /\d+ \/ 9 fit/],
    ]) {
      fireEvent.click(screen.getByRole('button', { name }))
      expect(screenText === 'Draw a card'
        ? screen.getByRole('button', { name: screenText })
        : screen.getByText(screenText)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'All games' }))
    }
  })

  it('shows recording controls as soon as the camera stream opens', async () => {
    const stream = { getTracks: () => [{ readyState: 'live', stop: vi.fn() }] }
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    })
    Object.defineProperty(HTMLVideoElement.prototype, 'srcObject', {
      configurable: true,
      set: vi.fn(),
    })

    render(<CoupleArcade {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Say Without Saying' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open camera' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Record clip' })).toBeInTheDocument())
  })

  it('lets a player deselect a jigsaw piece before selecting another', () => {
    render(<CoupleArcade {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Our Little Pieces' }))
    const piece = screen.getAllByRole('gridcell').find(cell => cell.getAttribute('aria-label')?.startsWith('Piece '))
    const rotate = screen.getByRole('button', { name: 'Rotate ↷' })
    fireEvent.click(piece)
    expect(piece).toHaveAttribute('aria-pressed', 'true')
    expect(rotate).toBeEnabled()
    fireEvent.click(piece)
    expect(piece).toHaveAttribute('aria-pressed', 'false')
    expect(rotate).toBeDisabled()
  })
})
