/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mockState = vi.hoisted(() => ({
  firebaseContext: null,
}))

vi.mock('../features/couple/FirebaseAppContext.jsx', () => ({
  useFirebaseApp: () => mockState.firebaseContext,
}))

import { AccountToggle } from './AccountToggle.jsx'

describe('AccountToggle', () => {
  afterEach(() => {
    cleanup()
    mockState.firebaseContext = null
  })

  it('delegates the visible sign-out escape to Firebase Auth', () => {
    const signOutUser = vi.fn()
    mockState.firebaseContext = {
      authWorking: false,
      enabled: true,
      isSignedIn: true,
      signOutUser,
    }

    render(<AccountToggle />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign out of At Long Last' }))

    expect(signOutUser).toHaveBeenCalledOnce()
  })

  it('does not expose the escape for a signed-out or local-preview state', () => {
    mockState.firebaseContext = {
      authWorking: false,
      enabled: false,
      isSignedIn: false,
      signOutUser: vi.fn(),
    }

    render(<AccountToggle />)

    expect(screen.queryByRole('button', { name: 'Sign out of At Long Last' })).toBeNull()
  })
})
