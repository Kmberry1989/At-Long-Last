import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { PlayerPiecePicker } from './PlayerPiecePicker.jsx'

afterEach(cleanup)

it('shows every retained piece together and resolves a legacy selection', () => {
  const onChange = vi.fn()
  render(<PlayerPiecePicker value="/assets/players/globe-vintage.glb" onChange={onChange} />)
  expect(screen.getAllByRole('radio')).toHaveLength(52)
  expect(screen.queryByRole('radio', { name: /Vintage Globe/ })).toBeNull()
  expect(screen.queryByLabelText('Player piece categories')).toBeNull()
  expect(screen.getByRole('radio', { name: 'Choose Globe' })).toHaveAttribute('aria-checked', 'true')
  fireEvent.click(screen.getByRole('radio', { name: 'Choose Pan' }))
  expect(onChange).toHaveBeenCalledWith('/assets/players/frying-pan.glb')
})
