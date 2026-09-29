/* @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  ActiveTurnState,
  PartnerAwayState,
  PlayStatePanel,
  ReadyToRevealState,
  WaitingState,
} from './PlayStates.jsx'

afterEach(cleanup)

describe('PlayStates', () => {
  it('announces the active turn with a hint', () => {
    render(<ActiveTurnState hint="Roll when you are ready." />)

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Your turn')
    expect(status).toHaveTextContent('Roll when you are ready.')
  })

  it('names who is acting, what is private, and what happens next while waiting', () => {
    render(
      <WaitingState
        actorName="Robin"
        activityVerb="taking their turn"
        nextHint="You are up after their roll."
        privateNote="Private: their card stays hidden."
      />,
    )

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Robin is taking their turn')
    expect(status).toHaveTextContent('Private: their card stays hidden.')
    expect(status).toHaveTextContent('You are up after their roll.')
  })

  it('marks the ready-to-reveal moment', () => {
    render(
      <ReadyToRevealState
        actorName="Robin"
        nextHint="Opening both answers together."
      />,
    )

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Ready to reveal')
    expect(status).toHaveTextContent('Robin answered too.')
    expect(status).toHaveTextContent('Opening both answers together.')
  })

  it('keeps the partner away state warm instead of a dead spinner', () => {
    render(<PartnerAwayState actorName="Robin" />)

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent("Robin's phone went quiet.")
    expect(status).toHaveTextContent('Their place is saved')
    expect(status.querySelector('.spinner')).toBeNull()
  })

  it('dispatches through PlayStatePanel by state name', () => {
    const { rerender } = render(<PlayStatePanel state="waiting" actorName="Robin" />)
    expect(screen.getByRole('status')).toHaveTextContent('Robin is')

    rerender(<PlayStatePanel state="active" />)
    expect(screen.getByRole('status')).toHaveTextContent('Your turn')

    rerender(<PlayStatePanel state="reveal" />)
    expect(screen.getByRole('status')).toHaveTextContent('Ready to reveal')

    rerender(<PlayStatePanel state="away" />)
    expect(screen.getByRole('status')).toHaveTextContent('went quiet')

    rerender(<PlayStatePanel state="unknown" />)
    expect(screen.queryByRole('status')).toBeNull()
  })
})
