import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { buildInitialSession } from '../features/session/sessionLogic.js'
const mocks = vi.hoisted(() => ({ db: {}, session: null, command: vi.fn(), next: null }))
vi.mock('../features/couple/CoupleProvider.jsx', () => ({ useCouple: () => ({ couple: { id: 'pair' }, hasPartner: true, progress: {} }) }))
vi.mock('../features/couple/FirebaseAppContext.jsx', () => ({ useFirebaseApp: () => ({ db: mocks.db, enabled: true, userId: 'b' }) }))
vi.mock('../features/session/SessionProvider.jsx', () => ({ useSession: () => ({ session: mocks.session, gameOpen: true, boardState: {}, journalEntries: [] }) }))
vi.mock('../features/session/independentNightService.js', () => ({ runNightCommand: (...args) => mocks.command(...args), subscribeToNightSteps: (_db, _id, next) => { mocks.next = next; next([]); return () => {} } }))
vi.mock('../audio/AudioProvider.jsx', () => ({ useAudio: () => ({}) }))
vi.mock('../board/BoardScene.jsx', () => ({ BoardScene: () => <div data-testid="board" /> }))
vi.mock('./JournalDrawer.jsx', () => ({ JournalDrawer: () => null }))
import { IndependentNight } from './IndependentNight.jsx'
beforeEach(() => {
  mocks.session = { ...buildInitialSession({ id: 'pair', players: [{ uid: 'a', displayName: 'A' }, { uid: 'b', displayName: 'B' }], sessionPreset: 'quick' }), id: 'night', status: 'active' }
  mocks.command.mockResolvedValue(undefined)
})
afterEach(() => { cleanup(); vi.clearAllMocks() })
it('lets the second player start the board and writes exactly one roll command on press', async () => {
  render(<IndependentNight />)
  const roll = await screen.findByRole('button', { name: 'Roll 2 Dice (2–12)' })
  fireEvent.click(roll)
  await waitFor(() => expect(mocks.command).toHaveBeenCalledTimes(1))
  expect(mocks.command.mock.calls[0].slice(1, 3)).toEqual(['night', 'b'])
  expect(mocks.command.mock.calls[0][3]).toMatchObject({ kind: 'roll', round: 1 })
  expect(mocks.command.mock.calls[0][3].dice.every(value => value >= 1 && value <= 6)).toBe(true)
  expect(screen.getByRole('button', { name: 'Rolling two dice' })).toBeDisabled()
})
it('surfaces a rejected save instead of silently swallowing it', async () => {
  mocks.command.mockRejectedValueOnce(new Error('Reconnect to save this roll.'))
  render(<IndependentNight />)
  fireEvent.click(await screen.findByRole('button', { name: 'Roll 2 Dice (2–12)' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Reconnect to save this roll.')
})
