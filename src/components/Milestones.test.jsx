import { cleanup, fireEvent, render, screen, act, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ moments: null, receipts: null, muted: false, acknowledge: vi.fn(), stop: vi.fn(), setMuted: vi.fn(), play: vi.fn(), toggle: vi.fn() }))
vi.mock('../features/couple/CoupleProvider.jsx', () => ({ useCouple: () => ({ couple: { id: 'pair', playerIds: ['a', 'b'] } }) }))
vi.mock('../features/couple/FirebaseAppContext.jsx', () => ({ useFirebaseApp: () => ({ db: 'db', userId: 'a', enabled: true }) }))
vi.mock('../features/couple/milestoneService.js', () => ({
  subscribeToMoments: (_db, _id, next) => { mocks.moments = next; return vi.fn() },
  subscribeToCelebrationReceipts: (_db, _id, next) => { mocks.receipts = next; return vi.fn() },
  acknowledgeMoment: (...args) => mocks.acknowledge(...args),
}))
vi.mock('../audio/AudioProvider.jsx', () => ({ useAudio: () => ({ muted: mocks.muted, unlocked: true, playCelebration: mocks.play, toggleMuted: mocks.toggle }) }))
import { MilestonesProvider, MomentCelebration, PairingStory } from './Milestones.jsx'
const moment = { id: 'pair_committed', kind: 'committed', nights: 0, names: ['Alex', 'Blair'], avatars: ['rose', 'globe'], createdAt: { toDate: () => new Date('2026-10-29T12:00:00Z') } }
beforeEach(() => { mocks.muted = false; localStorage.clear(); vi.clearAllMocks(); mocks.acknowledge.mockResolvedValue(); mocks.play.mockReturnValue({ stop: mocks.stop, setMuted: mocks.setMuted }) })
afterEach(cleanup)
it('waits for receipts, queues unseen moments, and stores dismissal per player', async () => {
  render(<MilestonesProvider><PairingStory /></MilestonesProvider>)
  act(() => mocks.moments([moment, { ...moment, id: 'pair_night_10', kind: 'night', nights: 10 }]))
  expect(screen.queryByRole('dialog')).toBeNull()
  act(() => mocks.receipts(new Set()))
  expect(screen.getByRole('dialog', { name: 'We choose us.' })).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  expect(mocks.acknowledge).toHaveBeenCalledWith('db', 'a', moment.id)
  expect(localStorage.getItem('at-long-last:celebration:a:pair_committed')).toBe('seen')
  await waitFor(() => expect(screen.getByRole('dialog', { name: '10 nights. One story.' })).toBeVisible())
  expect(mocks.play).toHaveBeenLastCalledWith('milestone')
  expect(screen.getByRole('region', { name: 'Our story' })).toHaveTextContent('Alex & Blair')
})
it('does not replay acknowledged moments after remount', () => {
  render(<MilestonesProvider><span>Home</span></MilestonesProvider>)
  act(() => { mocks.moments([moment]); mocks.receipts(new Set([moment.id])) })
  expect(screen.queryByRole('dialog')).toBeNull()
})
it('traps keyboard focus, allows sound and dismissal, stops music and restores focus', () => {
  const prior = document.createElement('button'); document.body.append(prior); prior.focus()
  const dismiss = vi.fn(); const { unmount } = render(<MomentCelebration moment={moment} onContinue={dismiss} />)
  const dialog = screen.getByRole('dialog')
  expect(dialog).toHaveFocus()
  fireEvent.keyDown(dialog, { key: 'Tab' })
  expect(screen.getByRole('button', { name: 'Mute celebration sound' })).toHaveFocus()
  fireEvent.click(screen.getByRole('button', { name: 'Mute celebration sound' }))
  expect(mocks.toggle).toHaveBeenCalledOnce()
  fireEvent.keyDown(dialog, { key: 'Escape' }); expect(dismiss).toHaveBeenCalledOnce()
  unmount(); expect(mocks.stop).toHaveBeenCalledOnce(); expect(prior).toHaveFocus(); prior.remove()
})

it('starts the full score when a player enables sound after initially viewing a muted ceremony', () => {
  mocks.muted = true
  const { rerender } = render(<MomentCelebration moment={moment} onContinue={vi.fn()} />)
  expect(mocks.play).not.toHaveBeenCalled()
  mocks.muted = false
  rerender(<MomentCelebration moment={moment} onContinue={vi.fn()} />)
  expect(mocks.play).toHaveBeenCalledExactlyOnceWith('committed')
})
