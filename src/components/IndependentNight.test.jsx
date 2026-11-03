import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { buildInitialSession } from '../features/session/sessionLogic.js'
const mocks = vi.hoisted(() => ({ db: {}, session: null, command: vi.fn(), next: null, progress: { selectedTheme: 'garden' }, audio: { setStage: vi.fn(), playThemeArrival: vi.fn(), playPhase: vi.fn() } }))
vi.mock('../features/couple/CoupleProvider.jsx', () => ({ useCouple: () => ({ couple: { id: 'pair' }, hasPartner: true, progress: mocks.progress }) }))
vi.mock('../features/couple/FirebaseAppContext.jsx', () => ({ useFirebaseApp: () => ({ db: mocks.db, enabled: true, userId: 'b' }) }))
vi.mock('../features/session/SessionProvider.jsx', () => ({ useSession: () => ({ session: mocks.session, gameOpen: true, boardState: {}, journalEntries: [] }) }))
vi.mock('../features/session/independentNightService.js', () => ({ runNightCommand: (...args) => mocks.command(...args), subscribeToNightSteps: (_db, _id, next) => { mocks.next = next; next([]); return () => {} } }))
vi.mock('../audio/AudioProvider.jsx', () => ({ useAudio: () => mocks.audio }))
vi.mock('../board/BoardScene.jsx', () => ({ BoardScene: ({ canRoll, onReady, onRoll, rolling }) => { useEffect(() => onReady?.(), [onReady]); return <div data-testid="board" data-rolling={rolling ? 'true' : 'false'}><button aria-label="Roll dice" data-testid="board-dice" disabled={!canRoll} onClick={() => onRoll({ source: 'touch' })} /></div> } }))
vi.mock('./JournalDrawer.jsx', () => ({ JournalDrawer: () => null }))
import { IndependentNight } from './IndependentNight.jsx'
beforeEach(() => {
  sessionStorage.clear()
  mocks.session = { ...buildInitialSession({ id: 'pair', players: [{ uid: 'a', displayName: 'A' }, { uid: 'b', displayName: 'B' }], sessionPreset: 'quick' }), id: 'night', status: 'active' }
  mocks.command.mockResolvedValue(undefined)
  mocks.progress = { selectedTheme: 'garden' }
})
afterEach(() => { cleanup(); vi.clearAllMocks() })
it('lets the second player roll directly on the board dice', async () => {
  render(<IndependentNight />)
  const roll = await screen.findByRole('button', { name: 'Roll dice' })
  await waitFor(() => expect(roll).toBeEnabled())
  fireEvent.click(roll)
  await waitFor(() => expect(mocks.command).toHaveBeenCalledTimes(1))
  expect(mocks.command.mock.calls[0].slice(1, 3)).toEqual(['night', 'b'])
  expect(mocks.command.mock.calls[0][3]).toMatchObject({ kind: 'roll', round: 1 })
  expect(mocks.command.mock.calls[0][3].dice.every(value => value >= 1 && value <= 6)).toBe(true)
  expect(roll).toBeDisabled()
})
it('keeps only the trade action in the board HUD', async () => {
  render(<IndependentNight />)
  expect(await screen.findByRole('button', { name: 'Trade' })).toBeInTheDocument()
  expect(screen.queryByText('ROLLS')).not.toBeInTheDocument()
  expect(screen.queryByText('MATCHES')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /center the board/i })).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/shared hearts/i)).not.toBeInTheDocument()
})
it('does not start a board tumble until the current roll has been saved', async () => {
  let saveRoll
  mocks.command.mockImplementationOnce(() => new Promise(resolve => { saveRoll = resolve }))
  render(<IndependentNight />)
  const roll = await screen.findByRole('button', { name: 'Roll dice' })
  await waitFor(() => expect(roll).toBeEnabled())
  fireEvent.click(roll)
  expect(screen.getByTestId('board')).toHaveAttribute('data-rolling', 'false')
  saveRoll()
  await waitFor(() => expect(screen.getByTestId('board')).toHaveAttribute('data-rolling', 'true'))
})
it('surfaces a rejected save instead of silently swallowing it', async () => {
  mocks.command.mockRejectedValueOnce(new Error('Reconnect to save this roll.'))
  render(<IndependentNight />)
  const roll = await screen.findByRole('button', { name: 'Roll dice' })
  await waitFor(() => expect(roll).toBeEnabled())
  fireEvent.click(roll)
  expect(await screen.findByRole('alert')).toHaveTextContent('Reconnect to save this roll.')
})

it('carries the selected board theme into the play frame and cues its arrival once', async () => {
  const view = render(<IndependentNight />)
  expect(view.container.querySelector('.independent-night')).toHaveAttribute('data-board-theme', 'garden')
  await waitFor(() => expect(mocks.audio.playThemeArrival).toHaveBeenCalledWith('garden'))
  view.rerender(<IndependentNight />)
  expect(mocks.audio.playThemeArrival).toHaveBeenCalledTimes(1)
})
