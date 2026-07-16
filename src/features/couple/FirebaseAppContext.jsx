import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  linkWithCredential,
  linkWithPopup,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import {
  doc,
  getFirestore,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
import { getFirebaseConfig, isFirebaseEnabled } from './firebaseConfig.js'
import {
  ensureProfileDocument,
  saveProfileDisplayName,
} from './profileService.js'

const FirebaseAppContext = createContext(null)
let firebaseSingleton = null

function getFirebaseServices(config) {
  if (firebaseSingleton) {
    return firebaseSingleton
  }

  const hadExistingApp = getApps().length > 0
  const app = hadExistingApp ? getApp() : initializeApp(config)
  const db = hadExistingApp
    ? getFirestore(app)
    : initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      })
  const auth = getAuth(app)

  firebaseSingleton = { app, auth, db }
  return firebaseSingleton
}

function buildReadyState(baseState) {
  return {
    ...baseState,
    ready: true,
  }
}

function buildAvailableProviders() {
  return {
    apple: import.meta.env.VITE_ENABLE_APPLE_AUTH === 'true',
    google: true,
  }
}

function getFriendlyAuthMessage(error, providerLabel = 'That sign-in method') {
  switch (error?.code) {
    case 'auth/operation-not-allowed':
      return `${providerLabel} is not enabled in Firebase Auth yet.`
    case 'auth/popup-blocked':
      return `Your browser blocked the ${providerLabel.toLowerCase()} popup. Allow popups and try again.`
    case 'auth/popup-closed-by-user':
      return `${providerLabel} was canceled before it finished.`
    case 'auth/cancelled-popup-request':
      return `${providerLabel} is already opening.`
    case 'auth/account-exists-with-different-credential':
      return 'That email already belongs to a different sign-in method on this phone.'
    default:
      return error?.message || `${providerLabel} could not start.`
  }
}

function createProvider(providerId) {
  if (providerId === 'google') {
    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    return provider
  }

  if (providerId === 'apple') {
    const provider = new OAuthProvider('apple.com')
    provider.addScope('email')
    provider.addScope('name')
    return provider
  }

  throw new Error(`Unknown provider: ${providerId}`)
}

export function FirebaseAppProvider({ children }) {
  const [state, setState] = useState({
    enabled: false,
    ready: false,
    app: null,
    auth: null,
    db: null,
    profile: null,
    user: null,
    userId: null,
  })
  const [authWorking, setAuthWorking] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    const config = getFirebaseConfig()

    if (!isFirebaseEnabled(config)) {
      setState((current) => buildReadyState({
        ...current,
        enabled: false,
      }))
      return undefined
    }

    const { app, auth, db } = getFirebaseServices(config)
    let profileUnsubscribe = () => undefined

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      profileUnsubscribe()
      profileUnsubscribe = () => undefined

      if (!user) {
        setState({
          enabled: true,
          ready: true,
          app,
          auth,
          db,
          profile: null,
          user: null,
          userId: null,
        })
        return
      }

      await ensureProfileDocument({ db, user })

      setState({
        enabled: true,
        ready: true,
        app,
        auth,
        db,
        profile: null,
        user,
        userId: user.uid,
      })

      profileUnsubscribe = onSnapshot(
        doc(db, 'profiles', user.uid),
        (snapshot) => {
          setState((current) => ({
            ...current,
            profile: snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null,
          }))
        },
        () => undefined,
      )
    })

    return () => {
      profileUnsubscribe()
      unsubscribe()
    }
  }, [])

  async function signInAsGuest(displayName) {
    if (!state.auth || !state.db) {
      return false
    }

    setAuthWorking(true)
    setAuthError('')

    try {
      const credential = await signInAnonymously(state.auth)
      if (displayName.trim()) {
        await updateProfile(credential.user, {
          displayName: displayName.trim(),
        })
      }
      await ensureProfileDocument({
        db: state.db,
        user: credential.user,
      })
      return true
    } catch (error) {
      setAuthError(getFriendlyAuthMessage(error, 'Guest sign-in'))
      return false
    } finally {
      setAuthWorking(false)
    }
  }

  async function createAccount({
    displayName,
    email,
    password,
  }) {
    if (!state.auth || !state.db) {
      return false
    }

    setAuthWorking(true)
    setAuthError('')

    try {
      let user = state.user
      if (user?.isAnonymous) {
        const credential = EmailAuthProvider.credential(email, password)
        const linked = await linkWithCredential(user, credential)
        user = linked.user
      } else {
        const created = await createUserWithEmailAndPassword(state.auth, email, password)
        user = created.user
      }

      await updateProfile(user, {
        displayName: displayName.trim(),
      })
      await saveProfileDisplayName({
        db: state.db,
        displayName,
        user,
      })
      await ensureProfileDocument({
        db: state.db,
        user,
      })
      return true
    } catch (error) {
      setAuthError(getFriendlyAuthMessage(error, 'Email sign-in'))
      return false
    } finally {
      setAuthWorking(false)
    }
  }

  async function signInWithEmail({
    email,
    password,
  }) {
    if (!state.auth) {
      return false
    }

    setAuthWorking(true)
    setAuthError('')

    try {
      await signInWithEmailAndPassword(state.auth, email, password)
      return true
    } catch (error) {
      setAuthError(getFriendlyAuthMessage(error, 'Email sign-in'))
      return false
    } finally {
      setAuthWorking(false)
    }
  }

  async function signInWithProvider({
    displayName = '',
    providerId,
  }) {
    if (!state.auth || !state.db) {
      return false
    }

    const providerLabel = providerId === 'apple' ? 'Apple sign-in' : 'Google sign-in'

    setAuthWorking(true)
    setAuthError('')

    try {
      const provider = createProvider(providerId)
      let user = state.user

      if (user?.isAnonymous) {
        const linked = await linkWithPopup(user, provider)
        user = linked.user
      } else {
        const result = await signInWithPopup(state.auth, provider)
        user = result.user
      }

      const nextName = displayName.trim() || user.displayName?.trim() || ''

      if (nextName) {
        await updateProfile(user, {
          displayName: nextName,
        })
        await saveProfileDisplayName({
          db: state.db,
          displayName: nextName,
          user,
        })
      }

      await ensureProfileDocument({
        db: state.db,
        user,
      })
      return true
    } catch (error) {
      setAuthError(getFriendlyAuthMessage(error, providerLabel))
      return false
    } finally {
      setAuthWorking(false)
    }
  }

  async function signOutUser() {
    if (!state.auth) {
      return false
    }

    setAuthWorking(true)
    setAuthError('')

    try {
      await signOut(state.auth)
      return true
    } catch (error) {
      setAuthError(getFriendlyAuthMessage(error, 'Sign out'))
      return false
    } finally {
      setAuthWorking(false)
    }
  }

  async function updateDisplayName(displayName) {
    if (!state.user || !state.db) {
      return false
    }

    setAuthWorking(true)
    setAuthError('')

    try {
      await updateProfile(state.user, {
        displayName: displayName.trim(),
      })
      await saveProfileDisplayName({
        db: state.db,
        displayName,
        user: state.user,
      })
      return true
    } catch (error) {
      setAuthError(getFriendlyAuthMessage(error, 'Profile update'))
      return false
    } finally {
      setAuthWorking(false)
    }
  }

  const value = useMemo(
    () => ({
      ...state,
      appId: import.meta.env.VITE_APP_ID || 'at-long-last',
      availableProviders: buildAvailableProviders(),
      authError,
      authWorking,
      createAccount,
      isAnonymous: Boolean(state.user?.isAnonymous),
      isSignedIn: Boolean(state.user),
      origin:
        typeof window === 'undefined'
          ? 'http://localhost:5173'
          : window.location.origin,
      setAuthError,
      signInAsGuest,
      signInWithEmail,
      signInWithProvider,
      signOutUser,
      updateDisplayName,
    }),
    [authError, authWorking, state],
  )

  return (
    <FirebaseAppContext.Provider value={value}>
      {children}
    </FirebaseAppContext.Provider>
  )
}

export function useFirebaseApp() {
  return useContext(FirebaseAppContext)
}
