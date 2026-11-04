import { fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { duelIds, duelRegistry, resolveTieByTime } from './duelRegistry.jsx'
import { duelDefinitions, selectableDuelDefinitions } from './contentPackData.js'

describe('duelRegistry', () => {
  it('exposes the prediction-based heart reward to the reveal and session resolver', () => {
    const perfect = { excerpt: 'a=aaaaa;g=aaaaa' }
    expect(duelRegistry['wavelength-duel'].resolveHearts(perfect, perfect)).toBe(10)
    expect(duelRegistry['wavelength-duel'].resolveHearts(perfect, { excerpt: 'a=bbbbb;g=bbbbb' })).toBe(2)
  })
  it('contains the full 16-item duel pack with unique ids', () => {
    expect(duelIds).toHaveLength(16)
    expect(new Set(duelIds).size).toBe(16)
    expect(duelIds).toContain('wavelength-duel')
  })

  it('keeps legacy duel implementations available without adding them to new nights', () => {
    expect(duelIds).toHaveLength(16)
    expect(selectableDuelDefinitions).toHaveLength(8)
    expect(duelRegistry['heartbeat-hold-tender']).toBeDefined()
    expect(duelRegistry['reaction-heart']).toBeDefined()
    expect(selectableDuelDefinitions.map((entry) => entry.id)).not.toContain('heartbeat-hold-tender')
    expect(selectableDuelDefinitions.map((entry) => entry.id)).not.toContain('reaction-heart')
    expect(selectableDuelDefinitions.map((entry) => entry.id)).not.toContain('voice-note-trailer')
    expect(selectableDuelDefinitions.map((entry) => entry.id)).toContain('letterpress-one-word')
    expect(duelDefinitions.find((entry) => entry.id === 'gratitude-duel').prompts).toHaveLength(24)
    expect(selectableDuelDefinitions.map((entry) => entry.id)).toContain('gratitude-duel')
    expect(selectableDuelDefinitions.map((entry) => entry.id)).toContain('portrait-panic-directed')
  })

  it('retries when both players are too close', () => {
    const outcome = resolveTieByTime(
      { won: true, time: 1 },
      { won: true, time: 1.05 },
    )

    expect(outcome).toEqual({ retry: true })
  })

  it('awards no points when Heartflash has an exact tie', () => {
    expect(duelRegistry['reaction-heart'].resolveTie(
      { won: true, time: 1 },
      { won: true, time: 1 },
    )).toEqual({ noContest: true })
  })

  it('renders and completes the selectable grounding pause', () => {
    const onComplete = vi.fn()
    const CalmPause = duelRegistry['sync-breath'].start
    render(createElement(CalmPause, { disabled: false, onComplete }))

    fireEvent.click(screen.getByRole('button', { name: /Ground/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Next', exact: true }))
    fireEvent.click(screen.getByRole('button', { name: 'Next', exact: true }))
    fireEvent.click(screen.getByRole('button', { name: 'Complete pause', exact: true }))

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ practice: 'ground', won: true }))
  })

  it('picks the faster winner when both clear the duel', () => {
    const outcome = resolveTieByTime(
      { won: true, time: 0.92 },
      { won: true, time: 1.14 },
    )

    expect(outcome.winnerIndex).toBe(0)
  })

  it('retries when both players miss', () => {
    const outcome = resolveTieByTime(
      { won: false, time: 99 },
      { won: false, time: 99 },
    )

    expect(outcome).toEqual({ retry: true })
  })

  it('treats creative and closeness challenges as shared completions', () => {
    const sharedIds = [
      'constellation-home',
      'doodle-duel-memory',
      'emoji-court',
      'fever-dream-date',
      'gratitude-duel',
      'letterpress-one-word',
      'portrait-panic-directed',
      'slow-draw-portrait-romantic',
      'temperature-check',
      'voice-note-trailer',
      'wavelength-slider',
    ]

    sharedIds.forEach((id) => {
      expect(duelRegistry[id].resolveTie(
        { score: 1, time: 9, value: 2, won: true },
        { score: 99, time: 1, value: 10, won: true },
      )).toEqual({ shared: true })
    })
  })
})
