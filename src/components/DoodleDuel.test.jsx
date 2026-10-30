/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DoodleDuel } from './DoodleDuel.jsx'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('DoodleDuel', () => {
  it('waits for the player to save instead of ending on a countdown', () => {
    vi.useFakeTimers()
    const context = {
      beginPath: vi.fn(),
      fillRect: vi.fn(),
      lineTo: vi.fn(),
      moveTo: vi.fn(),
      scale: vi.fn(),
      stroke: vi.fn(),
    }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,test')
    const onComplete = vi.fn()

    const { container } = render(<DoodleDuel onComplete={onComplete} />)
    const save = screen.getByRole('button', { name: 'Save Drawing' })
    expect(save).toBeDisabled()
    expect(screen.queryByText(/seconds? left/i)).not.toBeInTheDocument()

    const canvas = container.querySelector('canvas')
    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 })
    fireEvent.mouseMove(canvas, { clientX: 20, clientY: 20 })
    fireEvent.mouseUp(canvas)
    expect(save).toBeEnabled()

    vi.advanceTimersByTime(120_000)
    expect(onComplete).not.toHaveBeenCalled()

    fireEvent.click(save)
    expect(onComplete).toHaveBeenCalledWith({
      dataUrl: 'data:image/png;base64,test',
      highlight: 'saved a drawing',
      score: 1,
      time: 0,
      won: true,
    })
  })
})
