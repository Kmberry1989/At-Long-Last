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

import { LobbyScreen } from './LobbyScreen.jsx'

describe('LobbyScreen', () => {
  afterEach(() => {
    cleanup()
    mockState.coupleContext = null
    mockState.firebaseContext = null
  })

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
})
