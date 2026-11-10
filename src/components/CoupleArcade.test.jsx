import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
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

describe('CoupleArcade', () => {
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
      ['Our Little Pieces', /0 \/ 9 fit/],
    ]) {
      fireEvent.click(screen.getByRole('button', { name }))
      expect(screenText === 'Draw a card'
        ? screen.getByRole('button', { name: screenText })
        : screen.getByText(screenText)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'All games' }))
    }
  })
})
