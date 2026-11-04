import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { duelRegistry } from './duelRegistry.jsx'
import { getGratitudePrompt } from './gratitudeData.js'

describe('Gratitude Duel', () => {
  afterEach(cleanup)

  it('shows one shared rotating prompt and accepts a private appreciation', () => {
    const onComplete = vi.fn()
    const Gratitude = duelRegistry['gratitude-duel'].start
    render(<Gratitude disabled={false} onComplete={onComplete} promptSeed="night-one" round={1} />)

    expect(screen.getByText(getGratitudePrompt(duelRegistry['gratitude-duel'].prompts, 'night-one', 1))).not.toBeUndefined()
    const input = screen.getByRole('textbox', { name: 'Your appreciation' })
    fireEvent.change(input, { target: { value: 'You made this morning easier' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
      excerpt: 'You made this morning easier',
      won: true,
    }))
  })

  it('requires at least three letters before saving', () => {
    const onComplete = vi.fn()
    const Gratitude = duelRegistry['gratitude-duel'].start
    render(<Gratitude disabled={false} onComplete={onComplete} promptSeed="night-one" round={1} />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Your appreciation' }), { target: { value: '❤️!' } })
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })
})
