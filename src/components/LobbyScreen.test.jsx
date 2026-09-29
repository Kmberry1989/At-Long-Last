/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mockState = vi.hoisted(() => ({
  audioContext: {
    playAction: vi.fn(),
    playError: vi.fn(),
    playSuccess: vi.fn(),
    setStage: vi.fn(),
  },
  coupleContext: null,
  firebaseContext: null,
}))

vi.mock('../audio/AudioProvider.jsx', () => ({
  useAudio: () => mockState.audioContext,
}))

vi.mock('../features/couple/CoupleProvider.jsx', () => ({
  useCouple: () => mockState.coupleContext,
}))

vi.mock('../features/couple/FirebaseAppContext.jsx', () => ({
  useFirebaseApp: () => mockState.firebaseContext,
}))

vi.mock('./PlayerPiecePicker.jsx', () => ({
  PlayerPiecePicker: () => <div data-testid="player-piece-picker" />,
}))

vi.mock('./InviteJoinScreen.jsx', () => ({
  InviteJoinScreen: ({ inviteCode, nickname, onJoin, onUseCodeInstead }) => (
    <div>
      <p>Invite stub {inviteCode}</p>
      <button onClick={() => onJoin(nickname || 'Guest')} type="button">
        Stub Join
      </button>
      <button onClick={onUseCodeInstead} type="button">
        Stub Use Code
      </button>
    </div>
  ),
}))

import { waitFor } from '@testing-library/react'
import { LobbyScreen } from './LobbyScreen.jsx'

describe('LobbyScreen', () => {
  afterEach(() => {
    cleanup()
    mockState.coupleContext = null
    mockState.firebaseContext = null
    window.history.pushState({}, '', '/')
  })

  function setupLobby({ couple = null, publicLobbies = [] } = {}) {
    const joinCouple = vi.fn()
    mockState.coupleContext = {
      couple,
      createCouple: vi.fn(),
      error: '',
      hasPartner: false,
      joinCouple,
      joinPublicLobby: vi.fn(),
      leaveCouple: vi.fn(),
      launchPreview: vi.fn(),
      loading: false,
      postLobbyMessage: vi.fn(),
      profile: { displayName: 'Kyle' },
      publicLobbyMessages: [],
      publicLobbies,
      sessionPreset: 'standard',
      selectedPublicLobbyId: null,
      selectPublicLobby: vi.fn(),
      switchCouple: vi.fn(),
      switchPublicLobby: vi.fn(),
      updateSessionPreset: vi.fn(),
    }
    mockState.firebaseContext = {
      authError: '',
      authWorking: false,
      createAccount: vi.fn(),
      db: {},
      enabled: true,
      isSignedIn: true,
      ready: true,
      signInWithEmail: vi.fn(),
      signInWithProvider: vi.fn(),
      signOutUser: vi.fn(),
      updateDisplayName: vi.fn(),
      user: { email: 'kyle@example.test' },
    }
    return { joinCouple }
  }

  it('keeps a pre-room Quick selection and passes it into room creation', () => {
    const createCouple = vi.fn()
    const updateSessionPreset = vi.fn()
    mockState.coupleContext = {
      couple: null,
      createCouple,
      error: '',
      hasPartner: false,
      joinCouple: vi.fn(),
      joinPublicLobby: vi.fn(),
      leaveCouple: vi.fn(),
      launchPreview: vi.fn(),
      loading: false,
      postLobbyMessage: vi.fn(),
      profile: { displayName: 'Kyle' },
      publicLobbyMessages: [],
      publicLobbies: [],
      sessionPreset: 'standard',
      selectedPublicLobbyId: null,
      selectPublicLobby: vi.fn(),
      switchCouple: vi.fn(),
      switchPublicLobby: vi.fn(),
      updateSessionPreset,
    }
    mockState.firebaseContext = {
      authError: '',
      authWorking: false,
      createAccount: vi.fn(),
      enabled: true,
      isSignedIn: true,
      ready: true,
      signInWithEmail: vi.fn(),
      signInWithProvider: vi.fn(),
      signOutUser: vi.fn(),
      updateDisplayName: vi.fn(),
      user: { email: 'kyle@example.test' },
    }

    render(<LobbyScreen />)
    fireEvent.click(screen.getByRole('button', { name: /Quick/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Open Private Room' }))

    expect(updateSessionPreset).not.toHaveBeenCalled()
    expect(createCouple).toHaveBeenCalledWith(
      'Kyle',
      'quick',
      expect.stringContaining('/assets/players/'),
    )
  })

  it('supports labeled auth fields, password visibility, and Enter-to-submit', () => {
    const signInWithEmail = vi.fn()
    mockState.coupleContext = {
      couple: null,
      createCouple: vi.fn(),
      error: '',
      hasPartner: false,
      joinCouple: vi.fn(),
      joinPublicLobby: vi.fn(),
      leaveCouple: vi.fn(),
      launchPreview: vi.fn(),
      loading: false,
      postLobbyMessage: vi.fn(),
      profile: null,
      publicLobbyMessages: [],
      publicLobbies: [],
      sessionPreset: 'standard',
      selectedPublicLobbyId: null,
      selectPublicLobby: vi.fn(),
      switchCouple: vi.fn(),
      switchPublicLobby: vi.fn(),
      updateSessionPreset: vi.fn(),
    }
    mockState.firebaseContext = {
      authError: '',
      authWorking: false,
      createAccount: vi.fn(),
      enabled: true,
      isSignedIn: false,
      ready: true,
      signInWithEmail,
      signInWithProvider: vi.fn(),
      signOutUser: vi.fn(),
      updateDisplayName: vi.fn(),
      user: null,
    }

    render(<LobbyScreen />)

    const email = screen.getByRole('textbox', { name: 'Email' })
    const password = screen.getByLabelText('Password')
    fireEvent.change(email, { target: { value: 'kyle@example.test' } })
    fireEvent.change(password, { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))

    expect(password).toHaveAttribute('type', 'text')
    fireEvent.submit(password)

    expect(signInWithEmail).toHaveBeenCalledWith({
      email: 'kyle@example.test',
      password: 'secret123',
    })
  })

  it('routes invite deep links to the invite join screen with the joiner default piece', async () => {
    window.history.pushState({}, '', '/?invite=XYZ789')
    window.localStorage.clear()
    const { joinCouple } = setupLobby()

    render(<LobbyScreen />)

    expect(await screen.findByText('Invite stub XYZ789')).toBeTruthy()
    expect(screen.queryByPlaceholderText('Invite code')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Stub Join' }))

    await waitFor(() => {
      expect(joinCouple).toHaveBeenCalledWith(
        'Kyle',
        'XYZ789',
        '/assets/players/globe-classic.glb',
      )
    })
  })

  it('treats legacy code links as invite deep links', async () => {
    window.history.pushState({}, '', '/?code=ABC123')
    setupLobby()

    render(<LobbyScreen />)

    expect(await screen.findByText('Invite stub ABC123')).toBeTruthy()
  })

  it('falls back to manual code entry from the invite screen', async () => {
    window.history.pushState({}, '', '/?invite=XYZ789')
    setupLobby()

    render(<LobbyScreen />)

    expect(await screen.findByText('Invite stub XYZ789')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Stub Use Code' }))

    const input = await screen.findByPlaceholderText('Invite code')
    expect(input.value).toBe('XYZ789')
  })

  it('keeps the piece catalog behind an optional disclosure', () => {
    setupLobby()

    render(<LobbyScreen />)

    expect(screen.queryByTestId('player-piece-picker')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Choose your piece/ }))
    expect(screen.getByTestId('player-piece-picker')).toBeTruthy()
  })

  it('keeps the public browser behind Other ways to join', () => {
    setupLobby({
      publicLobbies: [
        {
          hostAvatar: '/assets/players/heart.glb',
          hostName: 'Robin',
          id: 'lobby-1',
          inviteCode: 'ABC123',
          playerCount: 1,
          status: 'open',
        },
      ],
    })

    render(<LobbyScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Join By Code' }))

    expect(screen.queryByText(/Robin's room/)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Other ways to join/ }))
    expect(screen.getByText(/Robin's room/)).toBeTruthy()
  })
})
