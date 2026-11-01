import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TactileDiceCast, DieFace } from './TactileDiceCast.jsx'

const diceAudio = vi.hoisted(() => ({ playDiceRattle: vi.fn(), playDiceCast: vi.fn() }))
vi.mock('../audio/AudioProvider.jsx', () => ({
  useAudio: () => diceAudio,
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('DieFace', () => {
  it('renders pips matching the die face value', () => {
    const { container } = render(<DieFace value={5} />)
    const circles = container.querySelectorAll('circle')
    expect(circles).toHaveLength(5)
  })

  it('clamps values below 1 or above 6', () => {
    const { container: low } = render(<DieFace value={0} />)
    expect(low.querySelectorAll('circle')).toHaveLength(1)

    const { container: high } = render(<DieFace value={9} />)
    expect(high.querySelectorAll('circle')).toHaveLength(6)
  })
})

describe('TactileDiceCast', () => {
  it('renders two dice and the roll button with accessible labels', () => {
    render(
      <TactileDiceCast
        canRoll={true}
        lastDice={[3, 4]}
        onRoll={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /Roll 2 Dice/i })).toBeInTheDocument()
    expect(screen.getByText(/Rub to rattle/i)).toBeInTheDocument()
  })

  it('calls onRoll when the button is clicked', () => {
    const handleRoll = vi.fn()
    render(
      <TactileDiceCast
        canRoll={true}
        lastDice={[2, 2]}
        onRoll={handleRoll}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Roll 2 Dice/i }))
    expect(handleRoll).toHaveBeenCalledTimes(1)
  })

  it('calls onRoll when Space is pressed on the tactile pad', () => {
    const handleRoll = vi.fn()
    render(
      <TactileDiceCast
        canRoll={true}
        lastDice={[1, 5]}
        onRoll={handleRoll}
      />,
    )

    const pad = screen.getByTestId('tactile-dice-pad')
    fireEvent.keyDown(pad, { key: ' ' })
    expect(handleRoll).toHaveBeenCalledTimes(1)
  })

  it('disables the roll action when canRoll is false', () => {
    const handleRoll = vi.fn()
    render(
      <TactileDiceCast
        canRoll={false}
        statusLabel="Partner's turn"
        onRoll={handleRoll}
      />,
    )

    const btn = screen.getByRole('button', { name: /Partner's turn/i })
    expect(btn).toBeDisabled()
    fireEvent.click(btn)
    expect(handleRoll).not.toHaveBeenCalled()
  })

  it('uses touch swipe direction and distance to shape a board roll', () => {
    const onRoll = vi.fn()
    render(<TactileDiceCast themeId="garden" onRoll={onRoll} />)
    const pad = screen.getByTestId('tactile-dice-pad')

    fireEvent.pointerDown(pad, { pointerId: 3, clientX: 100, clientY: 120 })
    fireEvent.pointerMove(pad, { pointerId: 3, clientX: 145, clientY: 55 })
    fireEvent.pointerUp(pad, { pointerId: 3, clientX: 145, clientY: 55 })

    expect(onRoll).toHaveBeenCalledWith(expect.objectContaining({
      source: 'touch',
      direction: { x: expect.closeTo(45 / 96), y: expect.closeTo(65 / 96) },
      power: expect.closeTo(Math.hypot(45, 65) / 110 + 0.18),
    }))
    expect(diceAudio.playDiceRattle).toHaveBeenCalled()
    expect(diceAudio.playDiceCast).toHaveBeenCalledTimes(1)
  })

  it('uses the selected theme palette on the tactile dice', () => {
    const { container } = render(<TactileDiceCast themeId="aurora-veil" />)
    expect(container.querySelector('.tactile-dice-container')).toHaveStyle({ '--die-face': '#174c56' })
  })
})
