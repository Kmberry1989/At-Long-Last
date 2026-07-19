import { Suspense, lazy } from 'react'
import { AudioProvider } from './audio/AudioProvider.jsx'
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
      <Suspense fallback={null}>
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
