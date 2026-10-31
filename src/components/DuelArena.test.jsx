import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { DuelArena } from './DuelArena.jsx'
import { DuelRevealOverlay } from './DuelRevealOverlay.jsx'

const audioMocks = {
  playDuelPulse: vi.fn(),
  playSuccess: vi.fn(),
}

vi.mock('../audio/AudioProvider.jsx', () => ({
  useAudio: () => audioMocks,
}))

describe('DuelArena & DuelRevealOverlay', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  const mockDuel = {
    id: 'doodle-duel-memory',
    label: 'Doodle Duel',
    prompt: 'Draw each other in 30 seconds.',
    skippable: true,
    vibe: 'playful',
  }

  const mockPlayers = [
    { displayName: 'Kyle', uid: 'u1' },
    { displayName: 'Elaine', uid: 'u2' },
  ]

  const mockSession = {
    currentDuel: {
      attempt: 1,
      heartBonus: 3,
      id: 'doodle-duel-memory',
      revealAcks: {},
      revealForce: false,
    },
    duelResults: {},
    players: mockPlayers,
  }

  function DummyMinigame({ onComplete }) {
    return (
      <div data-testid="dummy-minigame">
        <button type="button" onClick={() => onComplete({ drawing: 'data:image/png' })}>
          Submit Doodle
        </button>
      </div>
    )
  }

  it('renders DuelArena split-screen with partner top frame, golden dividing beam, and your interactive bottom zone', () => {
    const onSkip = vi.fn()
    const onComplete = vi.fn()

    render(
      <DuelArena
        duel={mockDuel}
        session={mockSession}
        playerIndex={0}
        players={mockPlayers}
        onComplete={onComplete}
        onSkip={onSkip}
        DuelComponent={DummyMinigame}
      />,
    )

    expect(screen.getByText(/✦ Playful Duel ✦/i)).toBeDefined()
    expect(screen.getByText(/Doodle Duel/i)).toBeDefined()
    expect(screen.getByText('Elaine')).toBeDefined()
    expect(screen.getByText(/Thinking… 💭/i)).toBeDefined()
    expect(screen.getByText(/Head-to-Head Arena/i)).toBeDefined()
    expect(screen.getByText('Kyle')).toBeDefined()
    expect(screen.getByTestId('dummy-minigame')).toBeDefined()

    // Test skip
    const skipBtn = screen.getByRole('button', { name: /Skip Duel/i })
    fireEvent.click(skipBtn)
    expect(onSkip).toHaveBeenCalled()

    // Test submit
    const submitBtn = screen.getByRole('button', { name: /Submit Doodle/i })
    fireEvent.click(submitBtn)
    expect(onComplete).toHaveBeenCalledWith({ drawing: 'data:image/png' })
  })

  it('displays sealed waiting state in bottom zone once you have locked in', () => {
    render(
      <DuelArena
        duel={mockDuel}
        session={mockSession}
        playerIndex={0}
        players={mockPlayers}
        myDuelResult={{ drawing: 'data:image/png' }}
        DuelComponent={DummyMinigame}
      />,
    )

    expect(screen.getByText(/Your Answer is Sealed/i)).toBeDefined()
    expect(screen.getByText(/Waiting for Elaine to lock in/i)).toBeDefined()
    expect(screen.queryByTestId('dummy-minigame')).toBeNull()
  })

  it('shows Locked In badge when partner has submitted their move', () => {
    const sessionPartnerSubmitted = {
      ...mockSession,
      duelResults: {
        u2: { drawing: 'data:image/png' },
      },
    }

    render(
      <DuelArena
        duel={mockDuel}
        session={sessionPartnerSubmitted}
        playerIndex={0}
        players={mockPlayers}
        DuelComponent={DummyMinigame}
      />,
    )

    expect(screen.getByText(/✓ Locked In/i)).toBeDefined()
  })

  it('renders DuelRevealOverlay with countdown pulses and Co-Op Harmony outcome (Zero Losers)', () => {
    vi.useFakeTimers()

    const sessionBothSubmitted = {
      ...mockSession,
      duelResults: {
        u1: { score: 90, won: true },
        u2: { score: 85, won: true },
      },
    }

    const onAck = vi.fn()

    render(
      <DuelRevealOverlay
        isHost
        onAck={onAck}
        playerIndex={0}
        players={mockPlayers}
        preview={false}
        session={sessionBothSubmitted}
      />,
    )

    // Countdown active
    expect(screen.getByText(/Both answers are in…/i)).toBeDefined()
    expect(audioMocks.playDuelPulse).toHaveBeenCalledWith(3)

    // Fast-forward countdown past 0
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Co-op Harmony revealed
    expect(screen.getAllByText(/Pure Resonance/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/In Perfect Sync!/i)).toBeDefined()
    expect(screen.getByText(/\+4 shared hearts 💞/i)).toBeDefined()
    expect(audioMocks.playSuccess).toHaveBeenCalled()

    // Comparative split cards
    expect(screen.getByText(/Synchronized/i)).toBeDefined()

    // Acknowledge tap
    const ackBtn = screen.getByRole('button', { name: /We saw it 💞/i })
    fireEvent.click(ackBtn)
    expect(onAck).toHaveBeenCalled()

    vi.useRealTimers()
  })
})
