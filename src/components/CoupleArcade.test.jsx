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
  it('shows all four branded games and opens each playable local preview', () => {
    render(<CoupleArcade {...props} />)
    for (const [name, screenText] of [
      ['My One and Only!', 'Draw a card'],
      ['Catch My Heart', 'Your cards'],
      ['Radar Love', 'Your scan'],
      ['Say It Without Saying', 'Your turn to act'],
    ]) {
      fireEvent.click(screen.getByText(name))
      expect(screen.getByText(screenText)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'All games' }))
    }
  })
})
