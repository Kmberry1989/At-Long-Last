import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MilestonesHub } from './MilestonesHub.jsx'

const promiseActions = vi.hoisted(() => ({ fulfill: vi.fn(), redeem: vi.fn() }))

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
    fulfillKoupon: promiseActions.fulfill,
    setAnniversary: vi.fn().mockResolvedValue({}),
    progress: {
      anniversary: '2025-11-15',
      koupons: [
        { id: 'k1', label: 'Breakfast in bed with warm coffee', status: 'active' },
        { id: 'k2', label: 'Foot rub with no timer', status: 'redeemed' },
      ],
      lifetimeHearts: 42,
      lifetimeNights: 8,
      streakCount: 4,
    },
    redeemKoupon: promiseActions.redeem,
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
    promiseActions.redeem.mockResolvedValue({ redeemed: true })
    promiseActions.fulfill.mockResolvedValue({ progress: { koupons: [{ id: 'k2', status: 'fulfilled' }] } })
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(),
      },
    })
  })

  it('keeps the Vault header minimal and retains horizontal section controls', () => {
    render(<MilestonesHub onClose={vi.fn()} open={true} />)

    expect(screen.queryByRole('heading', { name: 'Vault' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close Vault' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Vault sections' })).toBeInTheDocument()
    expect(screen.getByText('1 / 4')).toBeInTheDocument()
  })

  it('moves to the next Vault section with a horizontal swipe', () => {
    const { container } = render(<MilestonesHub onClose={vi.fn()} open />)
    const page = container.querySelector('.milestones-hub-content')
    const overlay = container.querySelector('.milestones-hub-overlay')
    const initialParallax = overlay.style.getPropertyValue('--vault-parallax-x')
    fireEvent.touchStart(page, { touches: [{ clientX: 300 }] })
    fireEvent.touchEnd(page, { changedTouches: [{ clientX: 220 }] })
    expect(screen.getByText('Capsules')).toBeInTheDocument()
    expect(screen.getByText('2 / 4')).toBeInTheDocument()
    expect(overlay.style.getPropertyValue('--vault-parallax-x')).not.toBe(initialParallax)
  })

  it('swipes the full page to the next Vault section from inside its current panel', () => {
    const { container } = render(<MilestonesHub initialTab="capsules" onClose={vi.fn()} open />)
    const capsule = container.querySelector('.time-capsule-card')
    fireEvent.touchStart(capsule, { touches: [{ clientX: 300 }] })
    fireEvent.touchEnd(capsule, { changedTouches: [{ clientX: 220 }] })
    expect(screen.getByText('Pinkies')).toBeInTheDocument()
    expect(screen.getByText('3 / 4')).toBeInTheDocument()
  })

  it('renders living constellation and opens star details on click', () => {
    const { container } = render(<MilestonesHub onClose={vi.fn()} open={true} />)

    expect(screen.getByLabelText(/Celestial Constellation/i)).toBeInTheDocument()
    expect(container.querySelector('.constellation-intro p')).toBeNull()
    expect(container.querySelectorAll('.constellation-dust circle')).toHaveLength(14)
    expect(container.querySelector('.constellation-star-node').style.getPropertyValue('--twinkle-duration')).toBe('4s')
    const starNode = screen.getByText(/Our Genesis Star/i)
    expect(starNode).toBeInTheDocument()

    // Click star node
    fireEvent.click(starNode)
    expect(screen.getByText(/Our first night together/i)).toBeInTheDocument()
  })

  it('swirls and twinkles stars when touching any point on the map', () => {
    const { container } = render(<MilestonesHub onClose={vi.fn()} open />)
    const map = container.querySelector('.constellation-canvas-wrapper')
    map.getBoundingClientRect = () => ({ left: 40, top: 40, width: 320, height: 340, right: 360, bottom: 380 })

    fireEvent.pointerDown(map, { clientX: 210, clientY: 210 })

    expect(container.querySelector('.constellation-dust circle').style.getPropertyValue('--touch-drift-x')).not.toBe('')
    expect(container.querySelector('.constellation-dust circle').style.getPropertyValue('--dust-duration')).toBe('5s')
    expect(container.querySelector('.touch-swirl-orbit')).toBeInTheDocument()
    fireEvent.pointerUp(map)
  })

  it('shows one capsule at a time and saves the anniversary date', async () => {
    render(<MilestonesHub onClose={vi.fn()} open={true} />)

    fireEvent.click(screen.getByRole('button', { name: 'Next section' }))

    expect(screen.getByText('Anniversary')).toBeInTheDocument()
    expect(screen.getByText(/Our Anniversary Time Capsule/i)).toBeInTheDocument()
    expect(screen.getByText('1 of 3')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next capsule' }))
    expect(screen.getByText(/10 Nights Together Capsule/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Previous capsule' }))

    fireEvent.click(screen.getByRole('button', { name: 'Edit date' }))
    fireEvent.change(screen.getByLabelText('Anniversary date'), { target: { value: '2025-11-01' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
    expect(await screen.findByText('Date saved')).toBeInTheDocument()
  })

  it('updates the promise state when used and kept', async () => {
    render(<MilestonesHub onClose={vi.fn()} open={true} />)

    fireEvent.click(screen.getByRole('button', { name: 'Next section' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next section' }))

    expect(screen.getByText('Promises')).toBeInTheDocument()
    expect(screen.getByText(/Breakfast in bed with warm coffee/i)).toBeInTheDocument()
    expect(screen.queryByText(/Movie night, your pick/i)).toBeNull()

    const redeemBtn = screen.getByRole('button', { name: 'Use' })
    fireEvent.click(redeemBtn)
    expect(promiseActions.redeem).toHaveBeenCalledWith('k1')
    expect(await screen.findByText('Promise called in')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next promise' }))
    const fulfillBtn = screen.getByRole('button', { name: 'Mark kept' })
    fireEvent.click(fulfillBtn)
    expect(promiseActions.fulfill).toHaveBeenCalledWith('k2')
    expect(await screen.findByText('Marked as kept')).toBeInTheDocument()
  })

  it('does not let the couple choose pinky swears from the random night deck', () => {
    render(<MilestonesHub initialTab="pinkieswears" onClose={vi.fn()} open />)
    expect(screen.queryByRole('textbox', { name: 'A promise to add' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
    expect(promiseActions).not.toHaveProperty('grant')
  })

  it('switches to Celestial Recap tab and copies share text', async () => {
    render(<MilestonesHub onClose={vi.fn()} open={true} />)

    fireEvent.click(screen.getByRole('button', { name: 'Next section' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next section' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next section' }))

    expect(screen.getByRole('heading', { name: 'Our Story' })).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument() // 8 nights
    fireEvent.click(screen.getByRole('button', { name: 'Next statistic' }))
    expect(screen.getByText('42')).toBeInTheDocument() // 42 hearts

    const shareBtn = screen.getByRole('button', { name: /Share Celestial Story/i })
    await act(async () => {
      fireEvent.click(shareBtn)
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(screen.getByText(/Celestial Recap copied to clipboard!/i)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked or Escape is pressed', () => {
    const handleClose = vi.fn()
    render(<MilestonesHub onClose={handleClose} open={true} />)

    const closeBtn = screen.getByRole('button', { name: /Close Vault/i })
    fireEvent.click(closeBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(2)
  })
})
