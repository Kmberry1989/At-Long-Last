import { useEffect, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { useFirebaseApp } from '../features/couple/FirebaseAppContext.jsx'
import { DEFAULT_PLAYER_AVATAR, resolvePlayerAvatar } from '../features/couple/playerAvatar.js'
import { useSession } from '../features/session/SessionProvider.jsx'
import { PairingHome } from './PairingHome.jsx'
import { PlayerPiecePicker } from './PlayerPiecePicker.jsx'

const PIECE_KEY = 'at-long-last:player-piece:v1'
function savedPiece() {
  try {
    const saved = window.localStorage.getItem(PIECE_KEY)
    return resolvePlayerAvatar(saved)
  }
  catch { return DEFAULT_PLAYER_AVATAR }
}

function GoogleMark() {
  return <svg aria-hidden="true" className="provider-icon" viewBox="0 0 24 24">
    <path d="M21.8 12.23c0-.76-.07-1.49-.2-2.18H12v4.12h5.5a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.04-4.4 3.04-7.58Z" fill="#4285F4" />
    <path d="M12 22c2.75 0 5.06-.91 6.75-2.47l-3.3-2.56c-.91.61-2.07.98-3.45.98-2.65 0-4.9-1.79-5.7-4.2H2.9v2.64A10 10 0 0 0 12 22Z" fill="#34A853" />
    <path d="M6.3 13.75A5.99 5.99 0 0 1 6 12c0-.61.1-1.2.3-1.75V7.61H2.9A10 10 0 0 0 2 12c0 1.61.39 3.12 1.08 4.39l3.22-2.64Z" fill="#FBBC04" />
    <path d="M12 6.05c1.5 0 2.84.51 3.9 1.52l2.92-2.92C17.05 2.98 14.75 2 12 2A10 10 0 0 0 3.08 7.61l3.22 2.64c.8-2.41 3.05-4.2 5.7-4.2Z" fill="#EA4335" />
  </svg>
}

export function LobbyScreen() {
  const { hasPartner, loading, launchPreview } = useCouple()
  const { authError, authWorking, createAccount, enabled, isSignedIn, ready, signInWithEmail, signInWithProvider } = useFirebaseApp()
  const { gameOpen, readyToPlay } = useSession()
  const { setStage } = useAudio()
  const [avatar, setAvatar] = useState(savedPiece)
  const [authMode, setAuthMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const working = loading || authWorking
  const authScreen = ready && enabled && !isSignedIn
  const active = !hasPartner || !gameOpen || !readyToPlay

  useEffect(() => { if (active) setStage?.('menu') }, [active, setStage])
  useEffect(() => { setShowPassword(false) }, [authMode])
  useEffect(() => { try { window.localStorage.setItem(PIECE_KEY, avatar) } catch { /* Selection still works for this visit. */ } }, [avatar])

  async function authenticate(event) {
    event.preventDefault(); setError('')
    try {
      if (authMode === 'create') await createAccount({ displayName: name.trim(), email: email.trim(), password })
      else await signInWithEmail({ email: email.trim(), password })
    } catch (nextError) { setError(nextError.message) }
  }

  return <section className={`screen lobby-screen${active ? ' active' : ' inactive'}${authScreen ? ' auth-screen' : ''}`}>
    <div aria-hidden="true" className="lobby-backdrop"><div className="orbital orbital-a" /><div className="orbital orbital-b" /><div className="orbital orbital-c" /><div className="board-fragment fragment-a" /><div className="board-fragment fragment-b" /><div className="board-fragment fragment-c" /><div className="token token-heart">♥</div><div className="token token-die">✦</div><div className="token token-note">♫</div><div className="path-ribbon ribbon-a" /><div className="path-ribbon ribbon-b" /></div>
    <div className="lobby-content">
      <div className={`title-band${enabled ? ' auth-title-band' : ''}`}>
        <img alt="At Long Last" className="brand-logo" src="/assets/ui/atlonglast-wordmark-wide.png" />

      </div>
      <div className={`glass-card hero-card lobby-card${authScreen ? ' auth-card' : ''}`}>
        {!ready ? <h2>Loading…</h2> : !enabled ? <>
          <h2>Preview</h2><p className="support-copy">Local play</p>
          <input aria-label="Name" className="text-input" placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
          <PlayerPiecePicker value={avatar} onChange={setAvatar} />
          <button className="primary-btn" onClick={() => launchPreview(name || 'You', avatar)} type="button">Play</button>
        </> : !isSignedIn ? <>
          <div className="auth-intro"><h2>Sign in</h2></div>
          <button className="provider-btn ghost-btn google" disabled={working} onClick={async () => { try { await signInWithProvider({ providerId: 'google' }) } catch (nextError) { setError(nextError.message) } }} type="button"><GoogleMark /><span>Google</span></button>
          <div className="divider-label">or</div>
          <div className="mode-toggle" role="tablist" aria-label="Auth mode">
            <button aria-selected={authMode === 'create'} className={`mode-pill${authMode === 'create' ? ' active' : ''}`} onClick={() => setAuthMode('create')} role="tab" type="button">Sign up</button>
            <button aria-selected={authMode === 'signin'} className={`mode-pill${authMode === 'signin' ? ' active' : ''}`} onClick={() => setAuthMode('signin')} role="tab" type="button">Sign In</button>
          </div>
          <form className="auth-email-fields" onSubmit={authenticate}>
            {authMode === 'create' && <input aria-label="Name" autoComplete="name" className="text-input" maxLength={60} placeholder="Name" required value={name} onChange={(event) => setName(event.target.value)} />}
            <input aria-label="Email" autoComplete="email" className="text-input" placeholder="Email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <div className="password-field">
              <input aria-label="Password" autoComplete={authMode === 'create' ? 'new-password' : 'current-password'} className="text-input" minLength={authMode === 'create' ? 6 : undefined} placeholder={authMode === 'create' ? 'Password (6+ characters)' : undefined} required type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} />
              <button aria-label={showPassword ? 'Hide password' : 'Show password'} className="password-toggle" onClick={() => setShowPassword(!showPassword)} type="button">{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            <div className="button-row"><button className="primary-btn" disabled={working || !email.trim() || !password || (authMode === 'create' && (!name.trim() || password.length < 6))} type="submit">{authMode === 'create' ? 'Sign up' : 'Sign In'}</button></div>
          </form>
        </> : <PairingHome avatar={avatar} onAvatarChange={setAvatar} />}
        {(authError || error) && <p className="error-copy" role="alert">{authError || error}</p>}
      </div>
    </div>
  </section>
}
