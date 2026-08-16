/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mockState = vi.hoisted(() => ({
  firebaseContext: null,
  listeners: [],
}))

vi.mock('./FirebaseAppContext.jsx', () => ({
  useFirebaseApp: () => mockState.firebaseContext,
}))

vi.mock('firebase/firestore', () => ({
  doc: (...parts) => ({ path: parts.slice(1).join('/') }),
  onSnapshot: (reference, next) => {
    const listener = {
      reference,
      unsubscribe: vi.fn(),
    }
    mockState.listeners.push(listener)

    if (reference.path === 'playerCouples/u1') {
      next({
        data: () => ({ coupleId: 'couple-1' }),
        exists: () => true,
      })
    }

    if (reference.path === 'couples/couple-1') {
      next({
        data: () => ({
          playerIds: ['u1', 'u2'],
          players: [
            { displayName: 'Kyle', uid: 'u1' },
            { displayName: 'Rochelle', uid: 'u2' },
          ],
          status: 'paired',
        }),
        exists: () => true,
        id: 'couple-1',
      })
    }

    return () => listener.unsubscribe()
  },
}))

vi.mock('./coupleService.js', () => ({
  clearPlayerCoupleLink: vi.fn(),
  createCoupleDocument: vi.fn(),
  joinPublicLobby: vi.fn(),
  joinCoupleByInviteCode: vi.fn(),
  leaveCoupleDocument: vi.fn(),
  sendLobbyMessage: vi.fn(),
  subscribeToLobbyMessages: vi.fn(() => vi.fn()),
  subscribeToPublicLobbies: vi.fn(() => vi.fn()),
  updateCoupleSessionPreset: vi.fn(),
}))

import { CoupleProvider, useCouple } from './CoupleProvider.jsx'

function Probe() {
  const { couple } = useCouple()
  return <div data-testid="couple-id">{couple?.id || 'none'}</div>
}

describe('CoupleProvider', () => {
  afterEach(() => {
    cleanup()
    mockState.firebaseContext = null
    mockState.listeners = []
  })

  it('tears down room listeners and clears the old couple when auth signs out', async () => {
    const signedIn = {
      db: {},
      enabled: true,
      origin: 'http://localhost:5173',
      profile: null,
      ready: true,
      user: { uid: 'u1' },
      userId: 'u1',
    }
    mockState.firebaseContext = signedIn
    const { rerender } = render(
      <CoupleProvider>
        <Probe />
      </CoupleProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('couple-id')).toHaveTextContent('couple-1'))
    const listenersBeforeSignOut = [...mockState.listeners]

    mockState.firebaseContext = {
      ...signedIn,
      user: null,
      userId: null,
    }
    rerender(
      <CoupleProvider>
        <Probe />
      </CoupleProvider>,
    )

    expect(screen.getByTestId('couple-id')).toHaveTextContent('none')
    expect(listenersBeforeSignOut.every((listener) => listener.unsubscribe.mock.calls.length === 1)).toBe(true)
  })
})
