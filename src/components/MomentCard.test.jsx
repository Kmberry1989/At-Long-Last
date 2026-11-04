import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MomentCard } from './MomentCard.jsx'

afterEach(() => { cleanup(); vi.useRealTimers() })

describe('MomentCard', () => {
  it('shows the named Trash moment and its automatic effect resolution', () => {
    vi.useFakeTimers()
    const onResolve = vi.fn()
    const { container } = render(<MomentCard card={{ category: 'trash', title: 'Dinner Runs Late', scene: 'The day ran long.', effect: 'Dinner delay', movement: -2, image: '/assets/moment-cards/late-dinner.jpg' }} onResolve={onResolve} />)
    expect(container.querySelector('.moment-card-back-art')).toBeInTheDocument()
    expect(container.querySelector('.moment-card-resolve')).toBeDisabled()
    act(() => vi.advanceTimersByTime(680))
    expect(screen.getByRole('heading', { name: 'Dinner Runs Late' })).toBeInTheDocument()
    expect(screen.getByText('Back 2 spaces')).toBeInTheDocument()
    expect(container.querySelector('.moment-card-art')).toHaveAttribute('src', '/assets/moment-cards/late-dinner.jpg')
    fireEvent.click(screen.getByRole('button', { name: 'Move piece' }))
    expect(onResolve).toHaveBeenCalledOnce()
  })

  it('uses one shared branded reverse for every moment category', () => {
    const { container } = render(<MomentCard card={{ category: 'treasure', title: 'A Small Gift', scene: 'A bright moment.', effect: 'Move ahead', movement: 2 }} />)
    expect(container.querySelector('.moment-card-back-art')).toHaveStyle({ backgroundImage: "url('/assets/game-ui/moment-card-back.png')" })
  })
})
