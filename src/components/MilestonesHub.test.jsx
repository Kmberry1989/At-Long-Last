import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MilestonesHub } from './MilestonesHub.jsx'

vi.mock('../audio/AudioProvider.jsx', () => ({
  useAudio: () => ({
    playCelebration: vi.fn(),
    playSuccess: vi.fn(),
  }),
}))

vi.mock('../features/couple/CoupleProvider.jsx', () => ({
  useCouple: () => ({
    couple: {
      id: 'couple-1',
      players: [
        { displayName: 'Alex', uid: 'u1' },
        { displayName: 'Taylor', uid: 'u2' },
      ],
    },
    fulfillKoupon: vi.fn(),
    progress: {
      anniversary: '2025-11-15',
      koupons: [
        { id: 'k1', label: 'Breakfast in bed with warm coffee', status: 'active' },
        { id: 'k2', label: 'Foot rub with no timer', status: 'fulfilled' },
      ],
      lifetimeHearts: 42,
      lifetimeNights: 8,
      streakCount: 4,
    },
    redeemKoupon: vi.fn(),
  }),
}))

vi.mock('../features/couple/FirebaseAppContext.jsx', () => ({
  useFirebaseApp: () => ({
    db: {},
    userId: 'u1',
  }),
}))

vi.mock('./Milestones.jsx', () => ({
  momentCopy: (m) => ({
    chapter: 'Chapter 1',
    icon: '✦',
    line: 'Our first night together.',
    title: m.title || 'Our Genesis Star',
  }),
  useMilestones: () => ({
    moments: [
      {
        avatars: ['piece-1', 'piece-2'],
        createdAt: { toDate: () => new Date('2025-10-01') },
        id: 'm1',
        kind: 'night',
        names: ['Alex', 'Taylor'],
        nights: 1,
      },
    ],
  }),
}))

describe('MilestonesHub (Screen 7: Milestones & Year-in-Review Hub)', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(),
      },
    })
  })

  it('renders the header and navigation tabs', () => {
    render(<MilestonesHub onClose={vi.fn()} open={true} />)

    expect(screen.getByText(/The Eternal Couple's Vault/i)).toBeInTheDocument()
    expect(screen.getByText(/Milestones & Memories/i)).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Stars/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Capsules/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Pinkies/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Recap/i })).toBeInTheDocument()
  })

  it('renders living constellation and opens star details on click', () => {
    render(<MilestonesHub onClose={vi.fn()} open={true} />)

    expect(screen.getByLabelText(/Celestial Constellation/i)).toBeInTheDocument()
    const starNode = screen.getByText(/Our Genesis Star/i)
    expect(starNode).toBeInTheDocument()

    // Click star node
    fireEvent.click(starNode)
    expect(screen.getByText(/Our first night together/i)).toBeInTheDocument()
  })

  it('switches to Anniversary Time Capsules tab and seals a vow', () => {
    render(<MilestonesHub onClose={vi.fn()} open={true} />)

    const capsulesTab = screen.getByRole('tab', { name: /Capsules/i })
    fireEvent.click(capsulesTab)

    expect(screen.getByText(/Anniversary Milestone/i)).toBeInTheDocument()
    expect(screen.getByText(/Our Anniversary Time Capsule/i)).toBeInTheDocument()

    const vowInput = screen.getByPlaceholderText(/Write a sweet promise or memory/i)
    fireEvent.change(vowInput, { target: { value: 'Can not wait to celebrate year one in Paris!' } })

    const sealBtn = screen.getByRole('button', { name: /Seal in Vault/i })
    fireEvent.click(sealBtn)

    expect(screen.getByText(/Secret vow sealed into the Anniversary Capsule!/i)).toBeInTheDocument()
  })

  it('switches to Pinkie Swears tab and interacts with pinkie promises', () => {
    render(<MilestonesHub onClose={vi.fn()} open={true} />)

    const pinkiesTab = screen.getByRole('tab', { name: /Pinkies/i })
    fireEvent.click(pinkiesTab)

    expect(screen.getByText(/Pinkie Swears Vault/i)).toBeInTheDocument()
    expect(screen.getByText(/Breakfast in bed with warm coffee/i)).toBeInTheDocument()

    // Redeem button
    const redeemBtn = screen.getByRole('button', { name: /Redeem/i })
    fireEvent.click(redeemBtn)
    expect(screen.getByText(/Redeemed Pinkie Swear:/i)).toBeInTheDocument()

    // Fulfill button
    const fulfillBtn = screen.getByRole('button', { name: /Mark Breakfast in bed with warm coffee fulfilled/i })
    fireEvent.click(fulfillBtn)
    expect(screen.getByText(/Pinkie Swear fulfilled!/i)).toBeInTheDocument()
  })

  it('switches to Celestial Recap tab and copies share text', async () => {
    render(<MilestonesHub onClose={vi.fn()} open={true} />)

    const recapTab = screen.getByRole('tab', { name: /Recap/i })
    fireEvent.click(recapTab)

    expect(screen.getByText(/Our Story in the Stars/i)).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument() // 8 nights
    expect(screen.getByText('42')).toBeInTheDocument() // 42 hearts

    const shareBtn = screen.getByRole('button', { name: /Share Celestial Story 💌/i })
    await act(async () => {
      fireEvent.click(shareBtn)
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(screen.getByText(/Celestial Recap copied to clipboard!/i)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked or Escape is pressed', () => {
    const handleClose = vi.fn()
    render(<MilestonesHub onClose={handleClose} open={true} />)

    const closeBtn = screen.getByRole('button', { name: /Close Milestones Vault/i })
    fireEvent.click(closeBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(2)
  })
})
