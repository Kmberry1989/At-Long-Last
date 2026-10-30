import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
const state = vi.hoisted(() => ({ couple: null, firebase: null, session: null }))
vi.mock('../features/couple/CoupleProvider.jsx', () => ({ useCouple: () => state.couple }))
vi.mock('../features/couple/FirebaseAppContext.jsx', () => ({ useFirebaseApp: () => state.firebase }))
vi.mock('../features/session/SessionProvider.jsx', () => ({ useSession: () => state.session }))
vi.mock('../audio/AudioProvider.jsx', () => ({ useAudio: () => ({ setStage: vi.fn() }) }))
vi.mock('./PlayerPiecePicker.jsx', () => ({ PlayerPiecePicker: () => <div data-testid="pieces" /> }))
vi.mock('./ProgressHub.jsx', () => ({ ProgressHub: () => <div>Collection contents</div> }))
vi.mock('./InviteJoinScreen.jsx', () => ({ InviteJoinScreen: ({ inviteCode, nickname, onJoin, onUseCodeInstead }) => <><p>Invite {inviteCode}</p><button onClick={() => onJoin(nickname)}>Accept invite</button><button onClick={onUseCodeInstead}>Use code</button></> }))
import { LobbyScreen } from './LobbyScreen.jsx'
function pair() {
  state.couple.couple = { id: 'pair-1', playerIds: ['a', 'b'], players: [{ uid: 'a', displayName: 'Alex' }, { uid: 'b', displayName: 'Blair' }], commitments: [], activeSessionId: null, sessionPreset: 'quick' }
  state.couple.hasPartner = true
}
beforeEach(() => {
  localStorage.clear()
  state.couple = { couple: null, hasPartner: false, loading: false, profile: { displayName: 'Alex' }, createCouple: vi.fn(), joinCouple: vi.fn(), commitPairing: vi.fn(), unpair: vi.fn(), launchPreview: vi.fn(), error: '' }
  state.firebase = { ready: true, enabled: true, isSignedIn: true, user: { uid: 'a', displayName: 'Alex', email: 'alex@example.test', emailVerified: true }, authWorking: false, signOutUser: vi.fn(), signInWithEmail: vi.fn(), signInWithProvider: vi.fn(), createAccount: vi.fn(), updateDisplayName: vi.fn() }
  state.session = { readyToPlay: false, gameOpen: false, error: '', beginNight: vi.fn(), openGame: vi.fn(), closeGame: vi.fn(), journalEntries: [] }
})
afterEach(() => { cleanup(); history.replaceState({}, '', '/') })
describe('permanent pairing menus', () => {
  it('keeps the existing link/code invitation path without public discovery', () => {
    render(<LobbyScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Create invite' }))
    expect(state.couple.createCouple).toHaveBeenCalledWith('Alex', 'quick', expect.stringContaining('/assets/players/'))
    expect(screen.queryByText('Public rooms')).toBeNull()
  })
  it('accepts a one-time code from the collapsed fallback', () => {
    render(<LobbyScreen />); fireEvent.click(screen.getByRole('button', { name: 'Use code' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Invite code' }), { target: { value: 'ABC234' } })
    fireEvent.click(screen.getByRole('button', { name: 'Connect' }))
    expect(state.couple.joinCouple).toHaveBeenCalledWith('Alex', 'ABC234', expect.any(String))
  })
  it('accepts an existing invite link after sign-in', () => {
    history.replaceState({}, '', '/?invite=ABC234'); render(<LobbyScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Accept invite' }))
    expect(state.couple.joinCouple).toHaveBeenCalledWith('Alex', 'ABC234', expect.any(String))
  })
  it('returns to a shared home instead of automatically starting a game', () => {
    pair(); state.couple.couple.activeSessionId = 'night-1'; state.session.session = { status: 'active' }; state.session.readyToPlay = true
    const { container } = render(<LobbyScreen />)
    expect(container.querySelector('.lobby-screen')).toHaveClass('active')
    expect(screen.getByRole('heading', { name: 'You & Blair' })).toBeVisible()
    expect(state.session.openGame).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(state.session.openGame).toHaveBeenCalledOnce()
  })
  it('requires an explicit irreversible confirmation from each player', async () => {
    pair(); render(<LobbyScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Commit' }))
    expect(screen.getByRole('button', { name: 'Commit forever' })).toBeDisabled()
    expect(screen.getByText(/Neither email can choose another partner/)).toBeVisible()
    fireEvent.click(screen.getByRole('checkbox', { name: 'I understand this is permanent.' }))
    fireEvent.click(screen.getByRole('button', { name: 'Commit forever' }))
    await waitFor(() => expect(state.couple.commitPairing).toHaveBeenCalledOnce())
  })
  it('does not offer unpair or another commitment after mutual commitment', () => {
    pair(); state.couple.couple.commitments = ['a', 'b']; state.couple.couple.commitmentEmails = { a: 'alex@example.test', b: 'blair@example.test' }
    render(<LobbyScreen />)
    expect(screen.getByText('♥ Committed')).toBeVisible()
    expect(screen.queryByRole('button', { name: /Unpair|Cancel connection|Commit forever/ })).toBeNull()
  })
  it('requires email verification before commitment', () => {
    pair(); state.firebase.user.emailVerified = false; render(<LobbyScreen />)
    expect(screen.getByRole('button', { name: 'Verify email' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Commit' })).toBeNull()
  })
  it('starts the selected length while keeping the pairing', () => {
    pair(); render(<LobbyScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Date night' }))
    fireEvent.click(screen.getByRole('button', { name: 'New night' }))
    expect(state.session.beginNight).toHaveBeenCalledWith('standard')
  })
  it('keeps a screen visible if opening a saved session fails', () => {
    pair(); state.session.gameOpen = true; state.session.error = 'Permission denied'
    const { container } = render(<LobbyScreen />)
    expect(container.querySelector('.lobby-screen')).toHaveClass('active')
    expect(screen.getByRole('heading', { name: 'Game unavailable' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Home' }))
    expect(state.session.closeGame).toHaveBeenCalledOnce()
  })
  it('preserves labeled email sign-in, password visibility, and submit', () => {
    state.firebase.isSignedIn = false; render(<LobbyScreen />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), { target: { value: 'alex@example.test' } })
    const password = screen.getByLabelText('Password')
    fireEvent.change(password, { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(password).toHaveAttribute('type', 'text')
    fireEvent.submit(password)
    expect(state.firebase.signInWithEmail).toHaveBeenCalledWith({ email: 'alex@example.test', password: 'secret123' })
  })
})
