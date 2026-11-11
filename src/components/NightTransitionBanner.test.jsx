import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { NightTransitionBanner } from './NightTransitionBanner.jsx'

afterEach(cleanup)

describe('NightTransitionBanner', () => {
  it('introduces each night phase with one branded visual and sound cue', () => {
    const playPhase = vi.fn()
    const { rerender } = render(<NightTransitionBanner phase="turn" transitionKey="night:turn:1" playPhase={playPhase} />)

    expect(screen.getByRole('status')).toHaveTextContent('Your move')
    expect(playPhase).toHaveBeenCalledTimes(1)
    expect(playPhase).toHaveBeenCalledWith('turn')

    rerender(<NightTransitionBanner phase="keepsake" transitionKey="night:keepsake:1" playPhase={playPhase} />)
    // The full-size card already carries its category, so suppress the extra
    // keepsake banner while still playing the phase transition cue.
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(playPhase).toHaveBeenLastCalledWith('keepsake')
    expect(playPhase).toHaveBeenCalledTimes(2)
  })

  it('stays silent when there is no phase to introduce', () => {
    const playPhase = vi.fn()
    render(<NightTransitionBanner phase="" transitionKey="night:none" playPhase={playPhase} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(playPhase).not.toHaveBeenCalled()
  })
})
