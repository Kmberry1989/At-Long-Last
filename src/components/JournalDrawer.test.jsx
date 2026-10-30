import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { JournalDrawer } from './JournalDrawer.jsx'

afterEach(cleanup)
const entries = [
  { id: 'new', sessionId: 'tonight', title: 'A fresh memory', type: 'prompt', vibe: 'tender', createdAt: '2026-10-29', summary: 'A moment from this night.', payload: { entries: [] } },
  { id: 'old', sessionId: 'yesterday', title: 'An older memory', type: 'prompt', vibe: 'tender', createdAt: '2026-10-28', summary: 'A moment from a previous night.', payload: { entries: [] } },
  { id: 'finale', sessionId: 'yesterday', title: 'Previous finale', type: 'finale', payload: { headline: 'Yesterday is complete.' } },
]

describe('scrapbook night scope', () => {
  it('starts with this night, with earlier memories available in All nights', () => {
    render(<JournalDrawer entries={entries} sessionId="tonight" open onClose={vi.fn()} />)
    expect(screen.getByText('A fresh memory')).toBeInTheDocument()
    expect(screen.queryByText('An older memory')).not.toBeInTheDocument()
    expect(screen.queryByText('Yesterday is complete.')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Tonight · Change view'))
    fireEvent.change(screen.getByLabelText('Scrapbook night'), { target: { value: 'all' } })
    expect(screen.getByText('An older memory')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Your Nights Together' })).toBeInTheDocument()
  })
  it('returns to the current night when a new session starts', () => {
    const props = { entries, open: true, onClose: vi.fn() }
    const view = render(<JournalDrawer {...props} sessionId="tonight" />)
    fireEvent.change(screen.getByLabelText('Scrapbook night'), { target: { value: 'all' } })
    view.rerender(<JournalDrawer {...props} sessionId="yesterday" />)
    expect(screen.queryByText('A fresh memory')).not.toBeInTheDocument()
    expect(screen.getByText('An older memory')).toBeInTheDocument()
    expect(screen.getByLabelText('Scrapbook night')).toHaveValue('tonight')
  })
})
