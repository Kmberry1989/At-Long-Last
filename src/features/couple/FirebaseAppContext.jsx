import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
import { getFirebaseConfig, isFirebaseEnabled } from './firebaseConfig.js'

const FirebaseAppContext = createContext(null)

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

    const app = initializeApp(config)
    const db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })
    const auth = getAuth(app)

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
