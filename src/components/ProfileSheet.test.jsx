import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ProfileSheet } from './ProfileSheet.jsx'

vi.mock('./PortraitFrames.jsx', () => ({ PortraitFrames: () => <div>Portrait frames</div> }))
afterEach(cleanup)

it('lets each player choose a spectrum color and PBR finish', async () => {
  const onSavePieceStyle = vi.fn().mockResolvedValue(undefined)
  render(<ProfileSheet streak={{ dayCount: 2 }} pieceStyle={{ color: '#ff7a97', material: 'porcelain' }} onSavePieceStyle={onSavePieceStyle} onClose={() => {}} />)
  fireEvent.click(screen.getByRole('button', { name: 'Piece' }))
  fireEvent.change(screen.getByLabelText('Piece color'), { target: { value: '#8050c8' } })
  fireEvent.click(screen.getByRole('radio', { name: 'Satin' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save piece style' }))
  await waitFor(() => expect(onSavePieceStyle).toHaveBeenCalledWith({ color: '#8050c8', material: 'satin' }))
})
