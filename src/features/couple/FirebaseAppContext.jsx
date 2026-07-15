import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
import { getFirebaseConfig, isFirebaseEnabled } from './firebaseConfig.js'

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

export function FirebaseAppProvider({ children }) {
  const [state, setState] = useState({
    enabled: false,
    ready: false,
    app: null,
    db: null,
    auth: null,
    user: null,
    userId: null,
  })

  useEffect(() => {
    const config = getFirebaseConfig()

    if (!isFirebaseEnabled(config)) {
      setState((current) => ({
        ...current,
        enabled: false,
        ready: true,
      }))
      return undefined
    }

    const { app, auth, db } = getFirebaseServices(config)

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        await signInAnonymously(auth)
        return
      }

      setState({
        enabled: true,
        ready: true,
        app,
        db,
        auth,
        user,
        userId: user.uid,
      })
    })

    return () => unsubscribe()
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      appId: import.meta.env.VITE_APP_ID || 'at-long-last',
      origin:
        typeof window === 'undefined'
          ? 'http://localhost:5173'
          : window.location.origin,
    }),
    [state],
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
