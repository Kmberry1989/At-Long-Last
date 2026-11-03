import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { TruceTradeModal } from './TruceTradeModal.jsx'

const audioMocks = { playCardSlide: vi.fn(), playChoiceTap: vi.fn(), playSuccess: vi.fn() }
vi.mock('../audio/AudioProvider.jsx', () => ({ useAudio: () => audioMocks }))

describe('TruceTradeModal', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks() })

  const session = {
    players: [{ displayName: 'Kyle', uid: 'u1' }, { displayName: 'Elaine', uid: 'u2' }],
    keepsakes: [
      { id: 'coffee', instanceId: 'mine', label: 'Morning Coffee Pass', ownerIndex: 0, perkLabel: 'Cozy Morning' },
      { id: 'massage', instanceId: 'theirs', label: 'Late Night Massage', ownerIndex: 1, perkLabel: 'Pure Bliss' },
    ],
    lastMove: null,
  }

  it('stays compact and only lets the player offer their own keepsakes', () => {
    const onSendOffer = vi.fn()
    render(<TruceTradeModal isOpen session={session} playerIndex={0} onSendOffer={onSendOffer} />)

    expect(screen.getByRole('heading', { name: 'Trade' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Your keepsakes' })).toBeInTheDocument()
    expect(screen.getByText('Morning Coffee Pass')).toBeInTheDocument()
    expect(screen.queryByText('Late Night Massage')).not.toBeInTheDocument()
    expect(screen.queryByText(/Negotiation|Partner Request|Sweet Note|available/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Morning Coffee Pass' }))
    fireEvent.click(screen.getByRole('button', { name: 'Offer' }))
    expect(onSendOffer).toHaveBeenCalledWith({ offeredInstanceId: 'mine', requestedInstanceId: null, note: '' })
  })

  it('requires the recipient to accept or pass on the offered keepsake', () => {
    const onRespondOffer = vi.fn()
    const incoming = {
      ...session,
      lastMove: { tradeOffer: { fromPlayerIndex: 1, offeredInstanceId: 'theirs', requestedInstanceId: null, status: 'pending' } },
    }
    render(<TruceTradeModal isOpen session={incoming} playerIndex={0} onRespondOffer={onRespondOffer} />)

    expect(screen.getByLabelText('Keepsake offered to you')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Pass' }))
    expect(onRespondOffer).toHaveBeenCalledWith(false)
  })

  it('lets the sender cancel a pending offer', () => {
    const onDismissOffer = vi.fn()
    const outgoing = {
      ...session,
      lastMove: { tradeOffer: { fromPlayerIndex: 0, offeredInstanceId: 'mine', requestedInstanceId: null, status: 'pending' } },
    }
    render(<TruceTradeModal isOpen session={outgoing} playerIndex={0} onDismissOffer={onDismissOffer} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel offer' }))
    expect(onDismissOffer).toHaveBeenCalledOnce()
  })

  it('keeps the close control available with an empty hand', () => {
    const { container } = render(<TruceTradeModal isOpen session={{ ...session, keepsakes: [] }} playerIndex={0} />)
    expect(screen.getByText('No keepsakes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Offer' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Close trade' })).toBeInTheDocument()
    expect(container.querySelector('.truce-trade-compact')).toBeInTheDocument()
  })
})
