import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConnectFourFinale } from './ConnectFourFinale.jsx'
import { createConnectFourState, placeConnectFourPiece } from '../features/session/connectFour.js'

const players = [
  { uid: 'avery', displayName: 'Avery' },
  { uid: 'rowan', displayName: 'Rowan' },
]

afterEach(cleanup)

describe('Four Ever board input', () => {
  it('sends a selected column and the active player token to the move handler', () => {
    const onDrop = vi.fn()
    render(<ConnectFourFinale state={createConnectFourState(['avery', 'rowan'], 'avery')} players={players} playerUid="avery" tokenPreferences={{ avery: 'garnet' }} onDrop={onDrop} onClose={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: 'Drop piece in column 4' }))
    expect(onDrop).toHaveBeenCalledWith(3, 'garnet')
  })

  it('accepts each open column and disables columns when it is the partner turn', () => {
    const onDrop = vi.fn()
    render(<ConnectFourFinale state={createConnectFourState(['avery', 'rowan'], 'avery')} players={players} playerUid="rowan" onDrop={onDrop} onClose={() => {}} />)
    for (let column = 1; column <= 7; column += 1) {
      expect(screen.getByRole('button', { name: `Drop piece in column ${column}` })).toBeDisabled()
    }
    expect(onDrop).not.toHaveBeenCalled()
  })

  it('shows the piece in its gravity landing cell after the saved state updates', () => {
    const initial = createConnectFourState(['avery', 'rowan'], 'avery')
    const moved = placeConnectFourPiece(initial, { column: 2, playerUid: 'avery', sessionId: 'fall-test-1', tokenId: 'garnet' }).state
    const { container, rerender } = render(<ConnectFourFinale state={initial} players={players} playerUid="avery" onDrop={() => {}} onClose={() => {}} />)

    rerender(<ConnectFourFinale state={moved} players={players} playerUid="avery" onDrop={() => {}} onClose={() => {}} />)
    const occupiedCells = container.querySelectorAll('.connect-four-cell.has-token')
    expect(occupiedCells).toHaveLength(1)
    expect(occupiedCells[0].querySelector('.connect-four-token-art').getAttribute('style')).toContain('token-atlas')
  })
})
