import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { TruceTradeModal } from './TruceTradeModal.jsx'

const audioMocks = {
  playCardSlide: vi.fn(),
  playChoiceTap: vi.fn(),
  playSuccess: vi.fn(),
}

vi.mock('../audio/AudioProvider.jsx', () => ({
  useAudio: () => audioMocks,
}))

describe('TruceTradeModal', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  const mockSession = {
    players: [
      { displayName: 'Kyle', uid: 'u1' },
      { displayName: 'Elaine', uid: 'u2' },
    ],
    keepsakes: [
      {
        id: 'coffee-pass',
        instanceId: 'inst-coffee',
        label: 'Morning Coffee Pass',
        ownerIndex: 0,
        perkLabel: 'Cozy Morning',
      },
      {
        id: 'massage-pass',
        instanceId: 'inst-massage',
        label: 'Late Night Massage',
        ownerIndex: 1,
        perkLabel: 'Pure Bliss',
      },
    ],
    lastMove: null,
  }

  it('renders nothing when closed', () => {
    const { container } = render(
      <TruceTradeModal
        isOpen={false}
        session={mockSession}
        playerIndex={0}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders sliding trays and selects cards onto the negotiation coaster', () => {
    const onSendOffer = vi.fn()
    const onClose = vi.fn()

    render(
      <TruceTradeModal
        isOpen
        onClose={onClose}
        session={mockSession}
        playerIndex={0}
        onSendOffer={onSendOffer}
      />,
    )

    expect(screen.getByText(/Keepsake Negotiation Coaster/i)).toBeDefined()
    expect(screen.getByText(/Your Keepsakes \(Kyle\)/i)).toBeDefined()
    expect(screen.getByText(/Elaine's Keepsakes/i)).toBeDefined()

    // Select your card
    const myCardBtn = screen.getByLabelText(/Select Morning Coffee Pass to offer/i)
    fireEvent.click(myCardBtn)
    expect(audioMocks.playCardSlide).toHaveBeenCalled()

    // Select partner card
    const partnerCardBtn = screen.getByLabelText(/Select Late Night Massage from Elaine/i)
    fireEvent.click(partnerCardBtn)
    expect(audioMocks.playCardSlide).toHaveBeenCalledTimes(2)

    // Add note via quick tag
    const quickTag = screen.getByText('Breakfast in bed ♡')
    fireEvent.click(quickTag)
    expect(audioMocks.playChoiceTap).toHaveBeenCalled()

    // Send Trade Offer
    const sendBtn = screen.getByRole('button', { name: /Send Trade Offer 🕊️/i })
    fireEvent.click(sendBtn)

    expect(onSendOffer).toHaveBeenCalledWith({
      offeredInstanceId: 'inst-coffee',
      requestedInstanceId: 'inst-massage',
      note: 'Breakfast in bed ♡',
    })
    expect(audioMocks.playSuccess).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('supports sending a generous gift when no partner card is selected', () => {
    const onSendOffer = vi.fn()
    const onClose = vi.fn()

    render(
      <TruceTradeModal
        isOpen
        onClose={onClose}
        session={mockSession}
        playerIndex={0}
        onSendOffer={onSendOffer}
      />,
    )

    // Select only your card
    const myCardBtn = screen.getByLabelText(/Select Morning Coffee Pass to offer/i)
    fireEvent.click(myCardBtn)

    // Gift button should be active with couple heart bonus
    const giftBtn = screen.getByRole('button', { name: /Gift to Elaine 💛 \(\+2 Hearts\)/i })
    expect(giftBtn).toBeDefined()
    fireEvent.click(giftBtn)

    expect(onSendOffer).toHaveBeenCalledWith({
      offeredInstanceId: 'inst-coffee',
      requestedInstanceId: null,
      note: '',
    })
  })

  it('renders incoming trade offer in review mode and supports accept and decline', () => {
    const sessionWithIncomingOffer = {
      ...mockSession,
      lastMove: {
        tradeOffer: {
          fromPlayerIndex: 1, // Elaine sent offer to Kyle
          offeredInstanceId: 'inst-massage',
          requestedInstanceId: 'inst-coffee',
          note: 'Trade massage for coffee tomorrow? ♡',
          status: 'pending',
        },
      },
    }

    const onRespondOffer = vi.fn()
    const onClose = vi.fn()

    const { rerender } = render(
      <TruceTradeModal
        isOpen
        onClose={onClose}
        session={sessionWithIncomingOffer}
        playerIndex={0}
        onRespondOffer={onRespondOffer}
      />,
    )

    expect(screen.getByText(/Elaine wants to connect/i)).toBeDefined()
    expect(screen.getByText(/"Trade massage for coffee tomorrow\? ♡"/i)).toBeDefined()

    // Click Accept Trade
    const acceptBtn = screen.getByRole('button', { name: /Accept Trade ✨/i })
    fireEvent.click(acceptBtn)
    expect(onRespondOffer).toHaveBeenCalledWith(true)
    expect(audioMocks.playSuccess).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()

    // Re-render and click Politely Pass
    rerender(
      <TruceTradeModal
        isOpen
        onClose={onClose}
        session={sessionWithIncomingOffer}
        playerIndex={0}
        onRespondOffer={onRespondOffer}
      />,
    )

    const passBtn = screen.getByRole('button', { name: /Politely Pass 🕊️/i })
    fireEvent.click(passBtn)
    expect(onRespondOffer).toHaveBeenCalledWith(false)
    expect(audioMocks.playCardSlide).toHaveBeenCalled()
  })

  it('shows helpful empty guidance when player has no keepsakes', () => {
    const emptySession = {
      ...mockSession,
      keepsakes: [],
    }

    render(
      <TruceTradeModal
        isOpen
        session={emptySession}
        playerIndex={0}
      />,
    )

    expect(screen.getByText(/No keepsakes in hand yet!/i)).toBeDefined()
    expect(screen.getByText(/Elaine hasn't drawn any keepsakes yet/i)).toBeDefined()
  })
})
