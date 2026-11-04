import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ActivityCardModal } from './ActivityCardModal.jsx'

const audioMocks = {
  playAction: vi.fn(),
  playCardFlip: vi.fn(),
  playCardSeal: vi.fn(),
  playChoiceTap: vi.fn(),
  playSuccess: vi.fn(),
}

vi.mock('../audio/AudioProvider.jsx', () => ({
  useAudio: () => audioMocks,
}))

describe('ActivityCardModal', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  const mockDefinition = {
    description: 'Leave a tender beat together.',
    id: 'comfort-menu',
    intensity: 1,
    label: 'Comfort Menu',
    skippable: true,
    type: 'reflection',
    vibe: 'tender',
  }

  const mockPlayers = [
    { displayName: 'Kyle', avatar: '/assets/players/heart.glb' },
    { displayName: 'Morgan', avatar: '/assets/players/rose-bouquet.glb' },
  ]

  const mockActivity = {
    id: 'act-123',
    type: 'comfort-menu',
    vibe: 'tender',
    state: {
      entries: [],
      prompt: 'What helps you unwind after a long day?',
      turnIndex: 0,
    },
  }

  it('renders only the prompt and a compact next action', () => {
    render(
      <ActivityCardModal
        activity={mockActivity}
        definition={mockDefinition}
        playerIndex={0}
        players={mockPlayers}
      />,
    )

    expect(screen.getByText('Comfort Menu')).toBeDefined()
    expect(screen.getByText('What helps you unwind after a long day?')).toBeDefined()
    expect(screen.queryByText('tender reflection')).toBeNull()
    expect(screen.queryByText(/Need a spark/i)).toBeNull()

    const flipBtn = screen.getByRole('button', { name: 'NEXT' })
    expect(flipBtn.hasAttribute('disabled')).toBe(true)
  })

  it('does not show suggested answer examples', () => {
    render(<ActivityCardModal activity={mockActivity} definition={mockDefinition} playerIndex={0} players={mockPlayers} />)
    expect(screen.queryByRole('button', { name: /quiet moment|hot tea|spontaneous/i })).toBeNull()
    expect(screen.getByLabelText(/Your Answer/i)).not.toHaveAttribute('placeholder')
  })

  it('flips 3D card to Face 2 when flip button is clicked', () => {
    render(
      <ActivityCardModal
        activity={mockActivity}
        definition={mockDefinition}
        playerIndex={0}
        players={mockPlayers}
      />,
    )

    const textarea = screen.getByLabelText(/Your Answer/i)
    fireEvent.change(textarea, { target: { value: 'Drinking hot tea by the window.' } })

    const flipBtn = screen.getByRole('button', { name: 'NEXT' })
    expect(flipBtn.hasAttribute('disabled')).toBe(false)

    fireEvent.click(flipBtn)
    expect(audioMocks.playCardFlip).toHaveBeenCalledTimes(1)

    // Back face header should now be active
    expect(screen.getByText('Guess for Morgan')).toBeDefined()

    // Flip back
    const backBtn = screen.getByRole('button', { name: /My Answer/i })
    fireEvent.click(backBtn)
    expect(audioMocks.playCardFlip).toHaveBeenCalledTimes(2)
  })

  it('submits sealed response with audio on Face 2', () => {
    const onSubmit = vi.fn()
    render(
      <ActivityCardModal
        activity={mockActivity}
        definition={mockDefinition}
        onSubmit={onSubmit}
        playerIndex={0}
        players={mockPlayers}
      />,
    )

    // Enter answer
    const textarea = screen.getByLabelText(/Your Answer/i)
    fireEvent.change(textarea, { target: { value: 'Hot tea and quiet.' } })

    // Flip
    fireEvent.click(screen.getByRole('button', { name: 'NEXT' }))

    // Enter guess
    const guessTextarea = screen.getByLabelText(/Your guess for Morgan/i)
    fireEvent.change(guessTextarea, { target: { value: 'A warm bath and reading.' } })

    // Seal
    const sealBtn = screen.getByRole('button', { name: /Seal My Turn/i })
    fireEvent.click(sealBtn)

    expect(audioMocks.playCardSeal).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      guess: 'A warm bath and reading.',
      text: 'Hot tea and quiet.',
    })
  })

  it('renders wax sealed waiting state when current player has submitted but partner has not', () => {
    const activityWithMyEntry = {
      ...mockActivity,
      state: {
        entries: [
          { playerIndex: 0, text: 'My sealed answer', guess: 'My guess for partner' },
        ],
        prompt: 'What helps you unwind after a long day?',
        turnIndex: 1,
      },
    }

    render(
      <ActivityCardModal
        activity={activityWithMyEntry}
        definition={mockDefinition}
        playerIndex={0}
        players={mockPlayers}
      />,
    )

    expect(screen.getByText('Sealed with Care')).toBeDefined()
    expect(screen.getByText(/Your reflection and guess are locked in wax/i)).toBeDefined()
    expect(screen.getByText(/^You$/i)).toBeDefined()
    expect(screen.getAllByText(/^Morgan$/i).length).toBeGreaterThan(0)
  })

  it('renders synchronized reveal state when both entries exist', () => {
    const onSubmit = vi.fn()
    const activityWithBothEntries = {
      ...mockActivity,
      state: {
        entries: [
          { playerIndex: 0, text: 'Tea and book', guess: 'Long walk' },
          { playerIndex: 1, text: 'Long bath', guess: 'Hot tea' },
        ],
        prompt: 'What helps you unwind after a long day?',
        turnIndex: -1,
      },
    }

    render(
      <ActivityCardModal
        activity={activityWithBothEntries}
        definition={mockDefinition}
        onSubmit={onSubmit}
        playerIndex={0}
        players={mockPlayers}
      />,
    )

    expect(screen.getByText('Revealed Together')).toBeDefined()
    expect(screen.getByText('Tea and book')).toBeDefined()
    expect(screen.getByText('Long bath')).toBeDefined()
    expect(screen.getByText(/Morgan guessed:/i)).toBeDefined()
    expect(screen.getByText(/"Hot tea"/i)).toBeDefined()
    expect(screen.getByText(/\+3 Hearts Added to Your Bloom/i)).toBeDefined()

    const doneBtn = screen.getByRole('button', { name: /Keep This Memory & Return to Board/i })
    fireEvent.click(doneBtn)
    expect(audioMocks.playSuccess).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      completed: true,
      guess: 'Long walk',
      text: 'Tea and book',
    })
  })

  it('supports minimizing to floating pill and toggling back', () => {
    const onToggleMinimize = vi.fn()
    const { rerender } = render(
      <ActivityCardModal
        activity={mockActivity}
        definition={mockDefinition}
        isMinimized={false}
        onToggleMinimize={onToggleMinimize}
        playerIndex={0}
        players={mockPlayers}
      />,
    )

    const peekBtn = screen.getByRole('button', { name: /Peek at the board/i })
    fireEvent.click(peekBtn)
    expect(onToggleMinimize).toHaveBeenCalledTimes(1)

    rerender(
      <ActivityCardModal
        activity={mockActivity}
        definition={mockDefinition}
        isMinimized={true}
        onToggleMinimize={onToggleMinimize}
        playerIndex={0}
        players={mockPlayers}
      />,
    )

    const pill = screen.getByRole('button', { name: /Resume active moment/i })
    expect(pill).toBeDefined()
    fireEvent.click(pill)
    expect(onToggleMinimize).toHaveBeenCalledTimes(2)
  })

  it('omits skip controls, duplicate portraits, and example answer copy', () => {
    const { container } = render(<ActivityCardModal activity={mockActivity} definition={mockDefinition} playerIndex={0} players={mockPlayers} />)
    expect(screen.queryByRole('button', { name: /skip/i })).toBeNull()
    expect(container.querySelector('.activity-paired-portraits')).toBeNull()
    expect(screen.queryByText(/Need a spark/i)).toBeNull()
    expect(container.querySelector('textarea')).not.toHaveAttribute('placeholder')
  })
})
