import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MomentCard } from './MomentCard.jsx'

afterEach(cleanup)

describe('MomentCard', () => {
  it('shows the named Trash moment and its automatic effect resolution', () => {
    const onResolve = vi.fn()
    const { container } = render(<MomentCard card={{ category: 'trash', title: 'Dinner Runs Late', scene: 'The day ran long.', effect: 'Dinner delay', movement: -2, image: '/assets/moment-cards/late-dinner.jpg' }} onResolve={onResolve} />)
    expect(screen.getByRole('heading', { name: 'Dinner Runs Late' })).toBeInTheDocument()
    expect(screen.getByText('Back 2 spaces')).toBeInTheDocument()
    expect(container.querySelector('.moment-card-art')).toHaveAttribute('src', '/assets/moment-cards/late-dinner.jpg')
    fireEvent.click(screen.getByRole('button', { name: 'Move piece' }))
    expect(onResolve).toHaveBeenCalledOnce()
  })
})
