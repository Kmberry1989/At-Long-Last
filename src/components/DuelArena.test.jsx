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
    label: 'Keepsake Sketch',
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

  function DummyMinigame({ disabled, onComplete }) {
    return (
      <div data-testid="dummy-minigame">
        <button disabled={disabled} type="button" onClick={() => onComplete({ drawing: 'data:image/png' })}>
          Submit Doodle
        </button>
      </div>
    )
  }

  it('keeps the mini-game centered without duplicate portraits, statuses, or skip controls', () => {
    const onComplete = vi.fn()

    render(
      <DuelArena
        duel={mockDuel}
        session={mockSession}
        playerIndex={0}
        players={mockPlayers}
        onComplete={onComplete}
        DuelComponent={DummyMinigame}
      />,
    )

    expect(screen.queryByText(/Playful Duel|Thinking|Partner|Your Challenge|Head-to-Head Arena/i)).toBeNull()
    expect(screen.queryByRole('button', { name: /Skip/i })).toBeNull()
    expect(screen.getByTestId('dummy-minigame')).toBeDefined()

    // Test submit
    const submitBtn = screen.getByRole('button', { name: /Submit Doodle/i })
    fireEvent.click(submitBtn)
    expect(onComplete).toHaveBeenCalledWith({ drawing: 'data:image/png' })
  })

  it('keeps the challenge surface without showing a partner waiting screen', () => {
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

    expect(screen.queryByText(/Your Answer is Sealed|Waiting for Elaine/i)).toBeNull()
    expect(screen.getByTestId('dummy-minigame')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit Doodle' })).toBeDisabled()
  })

  it('does not display a repeated partner status strip', () => {
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

    expect(screen.queryByText(/Locked In/i)).toBeNull()
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
    expect(screen.getByText(/\+4 shared hearts/i)).toBeDefined()
    expect(audioMocks.playSuccess).toHaveBeenCalled()

    // Comparative split cards
    expect(screen.getByText(/Synchronized/i)).toBeDefined()

    // Acknowledge tap
    const ackBtn = screen.getByRole('button', { name: /We saw it/i })
    fireEvent.click(ackBtn)
    expect(onAck).toHaveBeenCalled()

    vi.useRealTimers()
  })
})
