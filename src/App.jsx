import { usePressFeedback } from './components/usePressFeedback.js'
import { PortraitProvider } from './components/PlayerPortrait.jsx'
import { BrandIcon } from './components/BrandIcon.jsx'
import { Suspense, lazy } from 'react'
import { AudioProvider } from './audio/AudioProvider.jsx'
import { AccountToggle } from './components/AccountToggle.jsx'
import { AudioToggle } from './components/AudioToggle.jsx'
import { FirebaseAppProvider } from './features/couple/FirebaseAppContext.jsx'
import { CoupleProvider } from './features/couple/CoupleProvider.jsx'
import { MilestonesProvider } from './components/Milestones.jsx'
import { SessionProvider } from './features/session/SessionProvider.jsx'

const LobbyScreen = lazy(() =>
  import('./components/LobbyScreen.jsx').then((module) => ({ default: module.LobbyScreen })),
)
const GameScreen = lazy(() =>
  import('./components/GameScreen.jsx').then((module) => ({ default: module.GameScreen })),
)

function AppContent() {
  usePressFeedback()
  return (
    <div className="app-shell" onContextMenu={(event) => {
      if (!event.target.closest?.('input, textarea, [contenteditable="true"]')) event.preventDefault()
    }}>
      <AudioToggle />
      <AccountToggle />
      <Suspense
        fallback={(
          <div aria-live="polite" className="app-loading" role="status">
            <span aria-hidden="true" className="app-loading-mark"><BrandIcon name="heart" /></span>
            <span>Loading…</span>
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
            <PortraitProvider><MilestonesProvider><AppContent /></MilestonesProvider></PortraitProvider>
          </SessionProvider>
        </CoupleProvider>
      </FirebaseAppProvider>
    </AudioProvider>
  )
}
