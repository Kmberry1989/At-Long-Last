import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { FinaleScreen } from './FinaleScreen.jsx'

const audioMocks = {
  playHeartTick: vi.fn(),
  playAction: vi.fn(),
  playSuccess: vi.fn(),
}

vi.mock('../audio/AudioProvider.jsx', () => ({
  useAudio: () => audioMocks,
}))

describe('FinaleScreen', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  const mockSession = {
    id: 'sess-1',
    hearts: 14,
    keepsakes: [
      { id: 'coffee', label: 'Morning Coffee Pass' },
      { id: 'massage', label: 'Late Night Massage' },
    ],
  }

  const mockFinalSummary = {
    dominantVibe: 'playful',
    headline: 'Spark & Laughter',
    journalCount: 5,
    tierLabel: 'Deep Harmony',
  }

  const mockJournalEntries = [
    { id: 'e1', sessionId: 'sess-1', title: 'Sunset Promise', type: 'activity' },
    { id: 'e2', sessionId: 'sess-1', title: 'Doodle Duel in sync', type: 'duel' },
    { id: 'e3', sessionId: 'sess-1', title: 'Collected Coffee Pass', type: 'keepsake' },
    { id: 'e4', sessionId: 'sess-1', title: "Tonight's Prize", type: 'trophy', payload: { winnerIndex: 1, prize: 'First Lap Laurel' } },
  ]

  const mockPlayers = [
    { displayName: 'Kyle', uid: 'u1' },
    { displayName: 'Elaine', uid: 'u2' },
  ]

  it('renders theme-adaptive ribbon for Cozy Night In', () => {
    vi.useFakeTimers()
    render(
      <FinaleScreen
        session={mockSession}
        finalSummary={mockFinalSummary}
        journalEntries={mockJournalEntries}
        themeId="cozy"
        players={mockPlayers}
      />,
    )

    expect(screen.getByText(/Wine-Velvet Scrapbook/i)).toBeDefined()
    expect(screen.queryByText('Tone')).toBeNull()
    expect(screen.getByText('Spark & Laughter')).toBeDefined()
    expect(screen.getByLabelText('Elaine won First Lap Laurel')).toBeInTheDocument()
    expect(screen.getByText('Elaine')).toBeInTheDocument()
    expect(screen.queryByText('Tonight was playful and warm in equal measure.')).not.toBeInTheDocument()
    expect(screen.getByLabelText('0 of 14 hearts counted')).toBeDefined()
    act(() => { vi.advanceTimersByTime(4000) })
    expect(screen.getByLabelText('14 of 14 hearts counted')).toBeDefined()
    expect(screen.getByText('Congratulations!')).toBeDefined()
    expect(screen.getByText('Congratulations!').closest('.finale-stat-box')).toBeNull()
    expect(audioMocks.playHeartTick).toHaveBeenCalledTimes(14)
    expect(screen.getByText('2')).toBeDefined()
  })

  it('renders theme-adaptive ribbon for Secret Garden', () => {
    render(
      <FinaleScreen
        session={mockSession}
        finalSummary={mockFinalSummary}
        journalEntries={mockJournalEntries}
        themeId="garden"
        players={mockPlayers}
      />,
    )

    expect(screen.getByText(/Pressed Botanical Herbarium/i)).toBeDefined()
  })

  it('auto-compiles Keepsake Capsule and opens scrapbook on tap', () => {
    const onOpenScrapbook = vi.fn()

    render(
      <FinaleScreen
        session={mockSession}
        finalSummary={mockFinalSummary}
        journalEntries={mockJournalEntries}
        themeId="beach"
        players={mockPlayers}
        onOpenScrapbook={onOpenScrapbook}
      />,
    )

    expect(screen.getByText(/Tonight's Keepsake Capsule/i)).toBeDefined()
    expect(screen.queryByText('Deep Harmony')).toBeNull()
    expect(screen.getByText('Sunset Promise')).toBeDefined()
    expect(screen.getByText('Doodle Duel in sync')).toBeDefined()

    const openBtn = screen.getByRole('button', { name: /Open Bound Scrapbook/i })
    fireEvent.click(openBtn)
    expect(onOpenScrapbook).toHaveBeenCalled()
    expect(audioMocks.playAction).toHaveBeenCalled()
  })

  it('shares keepsake capsule and triggers success chime', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })

    render(
      <FinaleScreen
        session={mockSession}
        finalSummary={mockFinalSummary}
        journalEntries={mockJournalEntries}
        themeId="cozy"
        players={mockPlayers}
      />,
    )

    const shareBtn = screen.getByRole('button', { name: /Share Keepsake Capsule/i })
    fireEvent.click(shareBtn)

    expect(audioMocks.playSuccess).toHaveBeenCalled()
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('At Long Last — Our Night in Review ♡'),
    )
  })

  it('triggers play again when host restarts', () => {
    const onPlayAgain = vi.fn()

    render(
      <FinaleScreen
        session={mockSession}
        finalSummary={mockFinalSummary}
        journalEntries={mockJournalEntries}
        themeId="city"
        players={mockPlayers}
        canPlayAgain
        onPlayAgain={onPlayAgain}
      />,
    )

    const playAgainBtn = screen.getByRole('button', { name: /Play Another Night/i })
    fireEvent.click(playAgainBtn)
    expect(onPlayAgain).toHaveBeenCalled()
  })
})
