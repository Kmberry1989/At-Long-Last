import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
const state = vi.hoisted(() => ({ couple: null, firebase: null, session: null }))
vi.mock('../features/couple/CoupleProvider.jsx', () => ({ useCouple: () => state.couple }))
vi.mock('../features/couple/FirebaseAppContext.jsx', () => ({ useFirebaseApp: () => state.firebase }))
vi.mock('../features/session/SessionProvider.jsx', () => ({ useSession: () => state.session }))
vi.mock('../audio/AudioProvider.jsx', () => ({ useAudio: () => ({ setStage: vi.fn() }) }))
vi.mock('./PlayerPiecePicker.jsx', () => ({ PlayerPiecePicker: () => <div data-testid="pieces" /> }))
vi.mock('./ProgressHub.jsx', () => ({ ProgressHub: () => <div>Collection contents</div> }))
import { LobbyScreen } from './LobbyScreen.jsx'
function pair() {
  state.couple.couple = { id: 'pair-1', playerIds: ['a', 'b'], players: [{ uid: 'a', displayName: 'Alex' }, { uid: 'b', displayName: 'Blair' }], commitments: [], activeSessionId: null, sessionPreset: 'quick' }
  state.couple.hasPartner = true
}
beforeEach(() => {
  localStorage.clear()
  state.couple = { couple: null, hasPartner: false, loading: false, profile: { displayName: 'Alex' }, inviteByEmail: vi.fn(), acceptInvitation: vi.fn(), declineInvitation: vi.fn(), incomingInvitations: [], sentInvitation: null, commitPairing: vi.fn(), unpair: vi.fn(), launchPreview: vi.fn(), error: '' }
  state.firebase = { ready: true, enabled: true, isSignedIn: true, user: { uid: 'a', displayName: 'Alex', email: 'alex@example.test', emailVerified: true }, authWorking: false, signOutUser: vi.fn(), signInWithEmail: vi.fn(), signInWithProvider: vi.fn(), createAccount: vi.fn(), updateDisplayName: vi.fn() }
  state.session = { readyToPlay: false, gameOpen: false, error: '', beginNight: vi.fn(), openGame: vi.fn(), closeGame: vi.fn(), journalEntries: [] }
})
afterEach(() => { cleanup(); history.replaceState({}, '', '/') })
describe('permanent pairing menus', () => {
  it('offers one email invitation form without code or link controls', () => {
    render(<LobbyScreen />)
    expect(screen.getByRole('button', { name: 'Invite your person' })).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox', { name: 'Your person’s email' }), { target: { value: 'blair@example.test' } })
    fireEvent.click(screen.getByRole('button', { name: 'Invite your person' }))
    expect(state.couple.inviteByEmail).toHaveBeenCalledWith('blair@example.test', expect.stringContaining('/assets/players/'))
    expect(screen.queryByRole('button', { name: /Use code|Share|Copy link|Create invite/ })).toBeNull()
  })
  it('shows the verified addressee an invitation to accept instead of another invite form', () => {
    state.couple.incomingInvitations = [{ id: 'inv-1', senderName: 'Blair', senderEmail: 'blair@example.test' }]
    render(<LobbyScreen />)
    expect(screen.getByRole('heading', { name: 'Blair chose you' })).toBeVisible()
    expect(screen.queryByRole('textbox', { name: 'Your person’s email' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Accept invitation' }))
    expect(state.couple.acceptInvitation).toHaveBeenCalledWith('inv-1', expect.any(String))
  })
  it('ignores obsolete invite links and opens the new email flow', () => {
    history.replaceState({}, '', '/?invite=ABC234'); render(<LobbyScreen />)
    expect(screen.getByRole('heading', { name: 'Choose your person' })).toBeVisible()
    expect(window.location.search).toBe('')
  })
  it('shows exactly who is being invited and explains where the invitation appears', () => {
    state.couple.couple = { id: 'pair-1', status: 'waiting', playerIds: ['a'], players: [{ uid: 'a' }] }
    state.couple.sentInvitation = { recipientEmail: 'blair@example.test', status: 'pending' }
    render(<LobbyScreen />)
    expect(screen.getByText('blair@example.test')).toBeVisible()
    expect(screen.getByText(/They’ll see your invitation when they sign in/)).toBeVisible()
    expect(screen.queryByRole('textbox', { name: 'Your person’s email' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Cancel invite' })).toBeVisible()
  })
  it('requires verification before discovering or sending invitations', () => {
    state.firebase.user.emailVerified = false
    render(<LobbyScreen />)
    expect(screen.getByRole('heading', { name: 'Verify your email' })).toBeVisible()
    expect(screen.queryByRole('textbox', { name: 'Your person’s email' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Send verification email' })).toBeVisible()
  })
  it('prevents sending an invitation to the signed-in email', () => {
    render(<LobbyScreen />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Your person’s email' }), { target: { value: 'ALEX@EXAMPLE.TEST' } })
    expect(screen.getByRole('button', { name: 'Invite your person' })).toBeDisabled()
  })
  it('returns to a shared home instead of automatically starting a game', () => {
    pair(); state.couple.couple.activeSessionId = 'night-1'; state.session.session = { status: 'active' }; state.session.readyToPlay = true
    const { container } = render(<LobbyScreen />)
    expect(container.querySelector('.lobby-screen')).toHaveClass('active')
    expect(screen.getByRole('heading', { name: 'You & Blair' })).toBeVisible()
    expect(state.session.openGame).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Continue our night' }))
    expect(state.session.openGame).toHaveBeenCalledOnce()
  })
  it('requires an explicit irreversible confirmation from each player', async () => {
    pair(); render(<LobbyScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Commit' }))
    expect(screen.getByRole('button', { name: 'Commit forever' })).toBeDisabled()
    expect(screen.getByText(/You’ll both confirm this permanent commitment\. It can’t be undone\./)).toBeVisible()
    fireEvent.click(screen.getByRole('checkbox', { name: 'I understand this is permanent.' }))
    fireEvent.click(screen.getByRole('button', { name: 'Commit forever' }))
    await waitFor(() => expect(state.couple.commitPairing).toHaveBeenCalledOnce())
  })
  it('keeps the committed home compact without secondary sections', () => {
    pair(); state.couple.couple.commitments = ['a', 'b']; state.couple.couple.commitmentEmails = { a: 'alex@example.test', b: 'blair@example.test' }
    render(<LobbyScreen />)
    expect(screen.queryByRole('button', { name: /Unpair|Cancel connection|Commit forever|Couple's Vault|Milestones/i })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Scrapbook' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Collection' })).toBeNull()
  })
  it('opens the portrait frames from the profile portrait without adding a lobby section', () => {
    pair(); state.couple.couple.commitments = ['a', 'b']
    render(<LobbyScreen />)
    expect(screen.queryByRole('button', { name: 'Collection' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Edit profile portrait' }))
    expect(screen.getByRole('dialog', { name: 'Profile' })).toBeVisible()
    expect(screen.getByLabelText('0 day streak')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Close profile' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
  it('opens standalone destinations from one Our Story control', () => {
    pair(); state.couple.couple.commitments = ['a', 'b']
    render(<LobbyScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Our Story' }))
    expect(screen.getByRole('navigation', { name: 'Our Story sections' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Scrapbook' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Vault' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Collection' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Scrapbook' }))
    expect(screen.getByRole('heading', { name: 'Scrapbook' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Back to Our Story' }))
    expect(screen.getByRole('navigation', { name: 'Our Story sections' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Collection' }))
    expect(screen.getByRole('heading', { name: 'Collection' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Back to Our Story' }))
    fireEvent.click(screen.getByRole('button', { name: 'Vault' }))
    expect(screen.getByRole('dialog', { name: "The Couple's Vault" })).toBeVisible()
  })
  it('requires email verification before commitment', () => {
    pair(); state.firebase.user.emailVerified = false; render(<LobbyScreen />)
    expect(screen.getByRole('button', { name: 'Verify email' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Commit' })).toBeNull()
  })
  it('starts the longest night from one centered action without lobby editing or length choices', () => {
    pair(); render(<LobbyScreen />)
    expect(screen.queryByRole('button', { name: /Couple's Vault|Milestones/i })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Scrapbook' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Collection' })).toBeNull()
    expect(screen.queryByText('Length')).toBeNull()
    expect(screen.queryByRole('button', { name: /Edit Name/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /Quick|Date night|Stay awhile/ })).toBeNull()
    const start = screen.getByRole('button', { name: 'Begin our night' })
    expect(start.querySelector('.brand-icon')).not.toBeNull()
    fireEvent.click(start)
    expect(state.session.beginNight).toHaveBeenCalledWith('long')
  })
  it('keeps both real partner portraits over a subtle animated atmosphere', () => {
    pair(); state.couple.couple.commitments = ['a', 'b']
    const { container } = render(<LobbyScreen />)
    const stage = container.querySelector('.couple-portrait-stage')
    expect(stage.querySelectorAll('.profile-portrait')).toHaveLength(2)
    expect(stage.querySelector('.own .profile-portrait')).toHaveAttribute('aria-label', 'Alex portrait')
    expect(stage.querySelector('.partner .profile-portrait')).toHaveAttribute('aria-label', 'Blair portrait')
    expect(stage.querySelectorAll('.couple-art-layer')).toHaveLength(0)
    expect(stage.querySelectorAll('.couple-glint')).toHaveLength(5)
    expect(screen.getByRole('button', { name: 'Edit profile portrait' })).toBeVisible()
  })
  it('keeps a screen visible if opening a saved session fails', () => {
    pair(); state.session.gameOpen = true; state.session.error = 'Permission denied'
    const { container } = render(<LobbyScreen />)
    expect(container.querySelector('.lobby-screen')).toHaveClass('active')
    expect(screen.getByRole('heading', { name: 'Game unavailable' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Home' }))
    expect(state.session.closeGame).toHaveBeenCalledOnce()
  })
  it('opens Google sign-in using the provider handler contract', () => {
    state.firebase.isSignedIn = false
    render(<LobbyScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google', exact: true }))
    expect(state.firebase.signInWithProvider).toHaveBeenCalledExactlyOnceWith({ providerId: 'google' })
    expect(state.firebase.signInWithEmail).not.toHaveBeenCalled()
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
  it('switches to account creation and back while preserving the email and resetting password visibility', async () => {
    state.firebase.isSignedIn = false; render(<LobbyScreen />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alex@example.test' } })
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
    fireEvent.click(screen.getByRole('button', { name: 'Create an account' }))
    expect(screen.getByRole('heading', { name: 'Your story starts here' })).toBeVisible()
    expect(screen.getByLabelText('Email')).toHaveValue('alex@example.test')
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'new-password')
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Alex' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    await waitFor(() => expect(state.firebase.createAccount).toHaveBeenCalledWith({ displayName: 'Alex', email: 'alex@example.test', password: 'secret123' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sign in', exact: true }))
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    expect(screen.queryByLabelText('Name')).toBeNull()
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password')
  })
})
