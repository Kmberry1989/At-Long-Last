import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { duelRegistry } from './duelRegistry.jsx'

const scalePrompt = {
  id: 'scale-night',
  scale: true,
  scaleLabels: ['Not at all', 'A lot'],
  text: 'How much would this delight you?',
  options: Array.from({ length: 10 }, (_, index) => ({ id: 'abcdefghij'[index], label: String(index + 1) })),
}
const choicePrompts = Array.from({ length: 4 }, (_, index) => ({
  id: `choice-${index}`,
  text: `Pick a favorite ${index + 1}`,
  options: [
    { id: 'a', label: 'First' },
    { id: 'b', label: 'Second' },
    { id: 'c', label: 'Third' },
    { id: 'd', label: 'Fourth' },
  ],
}))

describe('Wavelength mixed prompt flow', () => {
  afterEach(cleanup)

  it('accepts and seals a 1–10 scale answer and partner guess within a mixed prompt set', () => {
    const onComplete = vi.fn()
    const Wavelength = duelRegistry['wavelength-duel'].start
    render(<Wavelength
      disabled={false}
      onComplete={onComplete}
      playerIndex={0}
      players={[{ displayName: 'Kyle' }, { displayName: 'Elaine' }]}
      prompts={[scalePrompt, ...choicePrompts]}
    />)

    const scale = screen.getByRole('slider', { name: scalePrompt.text })
    fireEvent.change(scale, { target: { value: '8' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lock My Answer' }))
    fireEvent.change(screen.getByRole('slider', { name: scalePrompt.text }), { target: { value: '7' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lock My Guess' }))

    for (let promptIndex = 0; promptIndex < choicePrompts.length; promptIndex += 1) {
      fireEvent.click(screen.getByRole('radio', { name: 'First' }))
      fireEvent.click(screen.getByRole('button', { name: 'Lock My Answer' }))
      fireEvent.click(screen.getByRole('radio', { name: 'Second' }))
      fireEvent.click(screen.getByRole('button', {
        name: promptIndex === choicePrompts.length - 1 ? 'Seal My Guesses' : 'Lock My Guess',
      }))
    }

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
      excerpt: 'a=haaaa;g=gbbbb',
      won: true,
    }))
  })
})
