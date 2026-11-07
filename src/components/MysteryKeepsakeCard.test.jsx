import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { KeepsakeCard, MysteryKeepsakeCard } from './MysteryKeepsakeCard.jsx'

const audioMocks = {
  playCardFlip: vi.fn(),
  playSuccess: vi.fn(),
}

vi.mock('../audio/AudioProvider.jsx', () => ({
  useAudio: () => audioMocks,
}))

describe('MysteryKeepsakeCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers()
    })
    vi.useRealTimers()
    cleanup()
    vi.clearAllMocks()
  })

  const mockItem = {
    blurb: 'A flash-lit snapshot worth replaying.',
    cost: 5,
    id: 'sparkler-photo',
    label: 'Sparkler Photo',
    perkDescription: 'The next journal-saving activity grants +1 extra heart.',
    perkId: 'sparkler-photo',
    perkLabel: 'Encore Glow',
  }

  const mockPlayer = {
    avatar: '/assets/players/heart.glb',
    displayName: 'Kyle',
  }

  it('renders KeepsakeCard compact and full forms', () => {
    const { container: compact } = render(
      <KeepsakeCard compact item={mockItem} player={mockPlayer} revealed />,
    )
    expect(compact.querySelector('.is-compact')).toBeDefined()
    expect(screen.getByText('Sparkler Photo')).toBeDefined()
    expect(screen.queryByText('Drawn by Kyle')).not.toBeInTheDocument()
  })

  it('reveals card with audio after reveal timer expires', () => {
    const onReveal = vi.fn()
    render(
      <MysteryKeepsakeCard
        item={mockItem}
        onReveal={onReveal}
        player={mockPlayer}
      />,
    )

    // Initially face-down
    expect(screen.getByText('A little gift for tonight')).toBeDefined()
    expect(audioMocks.playCardFlip).not.toHaveBeenCalled()

    // Fast-forward reveal timer
    act(() => {
      vi.advanceTimersByTime(650)
    })

    expect(audioMocks.playCardFlip).toHaveBeenCalledTimes(1)
    expect(onReveal).toHaveBeenCalledTimes(1)

    // Revealed front face is visible
    expect(screen.getByText('Sparkler Photo')).toBeDefined()
    expect(screen.getByText('Encore Glow', { exact: false })).toBeDefined()
    expect(screen.queryByText(/Free Privilege/i)).not.toBeInTheDocument()
  })

  it('collects card with audio and invokes onCollect callback', () => {
    const onCollect = vi.fn()
    render(
      <MysteryKeepsakeCard
        item={mockItem}
        onCollect={onCollect}
        player={mockPlayer}
      />,
    )

    // Reveal card
    act(() => {
      vi.advanceTimersByTime(650)
    })

    // Click collect button
    const collectBtn = screen.getByRole('button', { name: 'Collect' })
    fireEvent.click(collectBtn)

    expect(audioMocks.playSuccess).toHaveBeenCalledTimes(1)

    // Wait for collection swoop animation timer
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onCollect).toHaveBeenCalledTimes(1)
  })

  it('keeps one clear collect action instead of duplicating it on the card', () => {
    const onCollect = vi.fn()
    render(
      <MysteryKeepsakeCard
        item={mockItem}
        onCollect={onCollect}
        player={mockPlayer}
      />,
    )

    act(() => {
      vi.advanceTimersByTime(650)
    })

    expect(screen.getAllByRole('button')).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Collect' }))

    expect(audioMocks.playSuccess).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onCollect).toHaveBeenCalledTimes(1)
  })
})
