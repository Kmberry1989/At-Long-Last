import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { duelRegistry } from './duelRegistry.jsx'

describe('Letterpress', () => {
  afterEach(cleanup)

  it('requires four words and submits them for the independent reveal', () => {
    const onComplete = vi.fn()
    const Letterpress = duelRegistry['letterpress-one-word'].start
    render(<Letterpress disabled={false} onComplete={onComplete} promptSeed="night-one" round={1} />)

    const input = screen.getByRole('textbox', { name: 'Four words' })
    fireEvent.change(input, { target: { value: 'we make tiny magic' } })
    expect(screen.getByRole('button', { name: 'Lock words' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Lock words' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
      excerpt: 'we make tiny magic',
      won: true,
    }))
  })

  it('does not count or submit a fifth word', () => {
    const onComplete = vi.fn()
    const Letterpress = duelRegistry['letterpress-one-word'].start
    render(<Letterpress disabled={false} onComplete={onComplete} promptSeed="night-one" round={1} />)

    fireEvent.change(screen.getByRole('textbox', { name: 'Four words' }), {
      target: { value: 'we make tiny magic tonight' },
    })
    expect(screen.getByRole('button', { name: 'Lock words' })).toBeDisabled()
    expect(onComplete).not.toHaveBeenCalled()
  })
})
