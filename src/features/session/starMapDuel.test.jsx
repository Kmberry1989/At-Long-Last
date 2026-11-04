import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { duelRegistry } from './duelRegistry.jsx'

describe('Star Map', () => {
  afterEach(cleanup)

  it('collects five ranked values and submits them privately in their selected order', () => {
    const onComplete = vi.fn()
    const StarMap = duelRegistry['constellation-home'].start
    render(<StarMap disabled={false} onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Trust' }))
    fireEvent.click(screen.getByRole('button', { name: 'Home' }))
    fireEvent.click(screen.getByRole('button', { name: 'Laughter' }))
    fireEvent.click(screen.getByRole('button', { name: 'Belonging' }))
    fireEvent.click(screen.getByRole('button', { name: 'Patience' }))

    expect(screen.getByRole('button', { name: 'Reveal tonight' })).toBeEnabled()
    expect(screen.getByRole('list', { name: 'Your ranked values' }).textContent).toContain('1Trust')
    fireEvent.click(screen.getByRole('button', { name: 'Reveal tonight' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
      excerpt: 'thlbp',
      highlight: 'ranked five meaningful values',
      won: true,
    }))
  })

  it('allows ranking order to be adjusted before submission', () => {
    const onComplete = vi.fn()
    const StarMap = duelRegistry['constellation-home'].start
    render(<StarMap disabled={false} onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Trust' }))
    fireEvent.click(screen.getByRole('button', { name: 'Home' }))
    fireEvent.click(screen.getByRole('button', { name: 'Laughter' }))
    fireEvent.click(screen.getByRole('button', { name: 'Belonging' }))
    fireEvent.click(screen.getByRole('button', { name: 'Patience' }))
    fireEvent.click(screen.getByRole('button', { name: 'Move Home up' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reveal tonight' }))

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ excerpt: 'htlbp' }))
  })
})
