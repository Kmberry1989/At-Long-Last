import { Suspense, lazy } from 'react'
import { AudioProvider } from './audio/AudioProvider.jsx'
import { AccountToggle } from './components/AccountToggle.jsx'
import { AudioToggle } from './components/AudioToggle.jsx'
import { FirebaseAppProvider } from './features/couple/FirebaseAppContext.jsx'
import { CoupleProvider } from './features/couple/CoupleProvider.jsx'
import { SessionProvider } from './features/session/SessionProvider.jsx'

const LobbyScreen = lazy(() =>
  import('./components/LobbyScreen.jsx').then((module) => ({ default: module.LobbyScreen })),
)
const GameScreen = lazy(() =>
  import('./components/GameScreen.jsx').then((module) => ({ default: module.GameScreen })),
)

function AppContent() {
  return (
    <div className="app-shell">
      <AudioToggle />
      <AccountToggle />
      <Suspense
        fallback={(
          <div aria-live="polite" className="app-loading" role="status">
            <span aria-hidden="true" className="app-loading-mark">♥</span>
            <span>Setting the room…</span>
          </div>
        )}
      >
        <LobbyScreen />
        <GameScreen />
      </Suspense>
    </div>
  )
}

export default function App() {
  return (
    <AudioProvider>
      <FirebaseAppProvider>
        <CoupleProvider>
          <SessionProvider>
            <AppContent />
          </SessionProvider>
        </CoupleProvider>
      </FirebaseAppProvider>
    </AudioProvider>
  )
}
