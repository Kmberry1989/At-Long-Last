import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useEffect, useRef } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { buildInitialSession } from '../features/session/sessionLogic.js'
const mocks = vi.hoisted(() => ({ db: {}, session: null, command: vi.fn(), next: null, kissNext: null, kisses: {}, sendKiss: vi.fn(), catchKiss: vi.fn(), progress: { selectedTheme: 'garden' }, audio: { setStage: vi.fn(), playThemeArrival: vi.fn(), playPhase: vi.fn() } }))
vi.mock('../features/couple/CoupleProvider.jsx', () => ({ useCouple: () => ({ couple: { id: 'pair' }, hasPartner: true, progress: mocks.progress }) }))
vi.mock('../features/couple/FirebaseAppContext.jsx', () => ({ useFirebaseApp: () => ({ db: mocks.db, enabled: true, userId: 'b' }) }))
vi.mock('../features/session/SessionProvider.jsx', () => ({ useSession: () => ({ session: mocks.session, gameOpen: true, boardState: {}, journalEntries: [], myVibeVote: null, submitVibeVote: vi.fn(), working: false }) }))
vi.mock('../features/session/independentNightService.js', () => ({ runNightCommand: (...args) => mocks.command(...args), subscribeToNightSteps: (_db, _id, next) => { mocks.next = next; next([]); return () => {} } }))
vi.mock('../features/session/nightKissService.js', () => ({
  catchNightKiss: (...args) => mocks.catchKiss(...args),
  nightKissesCaughtByBothPlayers: (kisses, players) => players.length === 2 && players.every((player, index) => Boolean(kisses[player.uid]?.caughtBy?.[players[1 - index].uid])),
  sendNightKiss: (...args) => mocks.sendKiss(...args),
  subscribeToNightKisses: (_db, _id, next) => { mocks.kissNext = next; next(mocks.kisses); return () => {} },
}))
vi.mock('../audio/AudioProvider.jsx', () => ({ useAudio: () => mocks.audio }))
vi.mock('../board/BoardScene.jsx', () => ({ BoardScene: ({ canRoll, canFlipCoin, onCoinFlip, onReady, onRoll, rolling, onDiceSettled, onPieceMoveComplete, coinFlipKey, onCoinFlipComplete, cardDrawKey, onCardDrawComplete }) => {
  const settled = useRef(false)
  const drawn = useRef(null)
  const flipped = useRef(null)
  useEffect(() => onReady?.(), [onReady])
  useEffect(() => {
    if (!rolling) { settled.current = false; return }
    if (!settled.current) { settled.current = true; onDiceSettled?.({ dice: [1, 2] }) }
  }, [onDiceSettled, rolling])
  useEffect(() => { if (coinFlipKey && flipped.current !== coinFlipKey) { flipped.current = coinFlipKey; onCoinFlipComplete?.(coinFlipKey) } }, [coinFlipKey, onCoinFlipComplete])
  useEffect(() => { if (cardDrawKey && drawn.current !== cardDrawKey) { drawn.current = cardDrawKey; onCardDrawComplete?.(cardDrawKey) } }, [cardDrawKey, onCardDrawComplete])
  return <div data-testid="board" data-rolling={rolling ? 'true' : 'false'}><button aria-label="Roll dice" data-testid="board-dice" disabled={!canRoll} onClick={() => onRoll({ source: 'touch' })} /><button aria-label="3D coin" data-testid="board-coin" disabled={!canFlipCoin} onClick={() => onCoinFlip({ source: 'touch', power: 0.7 })} /><button aria-label="Movement complete" data-testid="board-movement-complete" onClick={() => onPieceMoveComplete?.({ playerIndex: 1 })} /></div>
} }))
vi.mock('./JournalDrawer.jsx', () => ({ JournalDrawer: () => null }))
import { IndependentNight } from './IndependentNight.jsx'
beforeEach(() => {
  sessionStorage.clear()
  mocks.session = { ...buildInitialSession({ id: 'pair', players: [{ uid: 'a', displayName: 'A' }, { uid: 'b', displayName: 'B' }], sessionPreset: 'quick' }), activePlayerIndex: 1, startingPlayerIndex: 1, phase: 'turn', vibeWeights: { tender: 0.5, playful: 0.3, spicy: 0.2 }, id: 'night', status: 'active', kissBookendVersion: 0 }
  sessionStorage.setItem('at-long-last:first-turn-toss:night:b', 'yes')
  mocks.command.mockResolvedValue(undefined)
  mocks.kisses = {}
  mocks.sendKiss.mockResolvedValue(undefined)
  mocks.progress = { selectedTheme: 'garden' }
})
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.clearAllTimers(); vi.useRealTimers() })
it('shows both portraits on the toss coin before allowing the first roll', async () => {
  sessionStorage.removeItem('at-long-last:first-turn-toss:night:b')
  render(<IndependentNight />)
  expect(await screen.findByRole('dialog', { name: 'First turn coin toss' })).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'A on the coin' })).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'B on the coin' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Flip the coin to decide who rolls first' }))
  expect(await screen.findByText('B rolls first', {}, { timeout: 2500 })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Roll dice' })).toBeEnabled())
})
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
it('keeps the moment category hidden until the player flips the coin', async () => {
  render(<IndependentNight />)
  act(() => mocks.next([{
    id: 'roll-1-1', kind: 'board', round: 1, ownerIndex: 1, type: 'heart',
    state: { momentPending: true, move: { id: 'roll-1-1', playerIndex: 1, from: 0, to: 2, steps: 2, dice: [1, 1] } },
    ready: true, completed: true, skipped: false,
  }]))
  expect(await screen.findByText('Tap or flick the coin')).toBeInTheDocument()
  expect(screen.queryByText(/trash|treasure/i)).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'A Warm Mug Left Ready' })).not.toBeInTheDocument()
  expect(window.__atLongLastGameState.rollStage).toBe('confirm-landing')
})
it('flips the board coin, then draws and turns the selected deck card', async () => {
  render(<IndependentNight />)
  const pendingStep = {
    id: 'roll-1-1', kind: 'board', round: 1, ownerIndex: 1, type: 'heart', ready: true, completed: true, skipped: false,
    state: { move: { id: 'roll-1-1', playerIndex: 1, from: 0, to: 3, steps: 3, dice: [1, 2] }, momentPending: true },
  }
  act(() => mocks.next([pendingStep]))
  expect(await screen.findByText('Tap or flick the coin')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'A Warm Mug Left Ready' })).not.toBeInTheDocument()
  const cardStep = {
    id: 'roll-1-1', kind: 'board', round: 1, ownerIndex: 1, type: 'heart', ready: true, completed: true, skipped: false,
    state: { move: { id: 'roll-1-1', playerIndex: 1, from: 0, to: 3, steps: 3, dice: [1, 2] }, momentPending: false, coinResult: 'treasure', momentCard: { category: 'treasure', id: 'warm-mug', title: 'A Warm Mug Left Ready', scene: 'The kettle is still warm.', effect: 'A small kindness', movement: 2, lowerDie: 1 } },
  }
  mocks.command.mockImplementationOnce(async () => { act(() => mocks.next([cardStep])); return cardStep })
  fireEvent.click(screen.getByTestId('board-coin'))
  expect(await screen.findByRole('heading', { name: 'A Warm Mug Left Ready' }, { timeout: 2500 })).toBeInTheDocument()
})
it('tumbles before calculating and saving the roll result', async () => {
  vi.useFakeTimers()
  let saveRoll
  mocks.command.mockImplementationOnce(() => new Promise(resolve => { saveRoll = resolve }))
  render(<IndependentNight />)
  const roll = screen.getByRole('button', { name: 'Roll dice' })
  expect(roll).toBeEnabled()
  fireEvent.click(roll)
  expect(screen.getByTestId('board')).toHaveAttribute('data-rolling', 'true')
  expect(mocks.command).not.toHaveBeenCalled()
  await act(async () => { await vi.advanceTimersByTimeAsync(620) })
  expect(mocks.command).toHaveBeenCalledTimes(1)
  expect(typeof saveRoll).toBe('function')
  await act(async () => { saveRoll() })
})
it('surfaces a rejected save instead of silently swallowing it', async () => {
  mocks.command.mockRejectedValueOnce(new Error('Reconnect to save this roll.'))
  render(<IndependentNight />)
  const roll = await screen.findByRole('button', { name: 'Roll dice' })
  await waitFor(() => expect(roll).toBeEnabled())
  fireEvent.click(roll)
  expect(await screen.findByRole('alert', {}, { timeout: 2000 })).toHaveTextContent('Reconnect to save this roll.')
})

it('carries the selected board theme into the play frame and cues its arrival once', async () => {
  const view = render(<IndependentNight />)
  expect(view.container.querySelector('.independent-night')).toHaveAttribute('data-board-theme', 'garden')
  await waitFor(() => expect(mocks.audio.playThemeArrival).toHaveBeenCalledWith('garden'))
  view.rerender(<IndependentNight />)
  expect(mocks.audio.playThemeArrival).toHaveBeenCalledTimes(1)
})

it('gates each player at the opening kiss until their own microphone note is saved', async () => {
  mocks.session.kissBookendVersion = 1
  mocks.session.phase = 'vibeSetup'
  render(<IndependentNight />)
  expect(await screen.findByRole('button', { name: 'Record a note' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Roll dice' })).toBeDisabled()
  act(() => mocks.kissNext({ b: { audioData: 'data:audio/webm;base64,YQ==', mimeType: 'audio/webm', durationMs: 1000 } }))
  fireEvent.click(await screen.findByRole('button', { name: 'Begin our night' }))
  expect(screen.queryByRole('button', { name: 'Lock My Vote' })).not.toBeInTheDocument()
  expect(screen.getByTestId('board')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Roll dice' })).toBeDisabled()
})
