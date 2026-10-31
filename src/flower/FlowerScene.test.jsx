import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FlowerScene } from './FlowerScene.jsx'

describe('mystery flower presentation', () => {
  it('does not announce the species before the bloom is picked', () => {
    render(<FlowerScene speciesId="sunflower" stage={3} />)
    expect(screen.getByRole('button', { name: /rotate mystery flower/i })).toBeInTheDocument()
    expect(screen.queryByText(/sunflower/i)).toBeNull()
  })

  it('allows the collected flower to be named', () => {
    render(<FlowerScene revealName speciesId="sunflower" stage={3} />)
    expect(screen.getByRole('button', { name: /rotate sunflower/i })).toBeInTheDocument()
  })

  it('lets a player pick the full bloom with the keyboard', () => {
    const onPick = vi.fn()
    render(<FlowerScene onPick={onPick} speciesId="rose" stage={3} />)
    fireEvent.keyDown(screen.getByRole('button', { name: /pick mystery flower/i }), { key: 'Enter' })
    expect(onPick).toHaveBeenCalledOnce()
  })
})
