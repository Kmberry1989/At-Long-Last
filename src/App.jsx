import { AudioProvider } from './audio/AudioProvider.jsx'
import { AudioToggle } from './components/AudioToggle.jsx'
import { FirebaseAppProvider } from './features/couple/FirebaseAppContext.jsx'
import { CoupleProvider } from './features/couple/CoupleProvider.jsx'
import { SessionProvider } from './features/session/SessionProvider.jsx'
import { LobbyScreen } from './components/LobbyScreen.jsx'
import { GameScreen } from './components/GameScreen.jsx'

function AppContent() {
  return (
    <div className="app-shell">
      <AudioToggle />
      <LobbyScreen />
      <GameScreen />
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
