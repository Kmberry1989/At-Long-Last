import { useEffect, useMemo, useState } from 'react'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { useFirebaseApp } from '../features/couple/FirebaseAppContext.jsx'

function copyText(value) {
  if (!value) {
    return
  }
  navigator.clipboard?.writeText(value)
}

export function LobbyScreen() {
  const {
    couple,
    createCouple,
    error,
    hasPartner,
    joinCouple,
    leaveCouple,
    launchPreview,
    loading,
    switchCouple,
  } = useCouple()
  const { enabled, ready } = useFirebaseApp()
  const [displayName, setDisplayName] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  useEffect(() => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    if (code) {
      setInviteCode(code)
    }
  }, [])

  const canSubmit = useMemo(
    () => Boolean(displayName.trim()),
    [displayName],
  )

  if (!ready) {
    return (
      <section className="screen active lobby-screen">
        <div className="logo">
          <span>AT LONG</span>
          <span>LAST</span>
        </div>
        <div className="glass-card hero-card">
          <h1>Warming up the room...</h1>
        </div>
      </section>
    )
  }

  if (hasPartner) {
    return null
  }

  if (!enabled) {
    return (
      <section className="screen active lobby-screen">
        <div className="logo">
          <span>AT LONG</span>
          <span>LAST</span>
        </div>
        <div className="glass-card hero-card">
          <h1>Firebase keys are still missing.</h1>
          <p>
            Add the `VITE_FIREBASE_*` vars and `VITE_APP_ID` to enable the live
            two-phone board session. A local preview is still available below.
          </p>
          <input
            className="text-input"
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Your display name"
            value={displayName}
          />
          <button
            className="primary-btn"
            onClick={() => launchPreview(displayName)}
            type="button"
          >
            Launch Preview Board
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="screen active lobby-screen">
      <img
        alt=""
        aria-hidden="true"
        className="lobby-poster"
        src="/assets/ui/warring-home.png"
      />
      <div className="logo">
        <span>AT LONG</span>
        <span>LAST</span>
      </div>
      <div className="glass-card hero-card">
        <h1>Two phones. One board. Better chemistry.</h1>
        <p>
          Build a shared stash of hearts, duel for bonus bursts, and leave with a
          tiny scrapbook of whatever the two of you made together.
        </p>
        <input
          className="text-input"
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Your display name"
          value={displayName}
        />
        {couple ? (
          <div className="invite-card">
            <strong>{couple.inviteCode}</strong>
            <p>Share this code or send the link straight out.</p>
            <div className="button-row">
              <button className="primary-btn" onClick={() => copyText(couple.shareLink)} type="button">
                Copy Link
              </button>
              <button className="primary-btn alt" onClick={() => copyText(couple.inviteCode)} type="button">
                Copy Code
              </button>
            </div>
            <p className="support-copy room-help">
              Made the wrong room? Paste your partner&apos;s code below or back out and try again.
            </p>
            <div className="join-row">
              <input
                className="text-input code-input"
                onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                placeholder="Switch to their code"
                value={inviteCode}
              />
              <button
                className="primary-btn alt"
                disabled={!canSubmit || inviteCode.trim().length < 4 || loading}
                onClick={() => switchCouple(displayName, inviteCode)}
                type="button"
              >
                Switch
              </button>
            </div>
            <div className="button-row">
              <button className="ghost-btn" disabled={loading} onClick={() => leaveCouple()} type="button">
                Back
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="button-row stacked">
              <button
                className="primary-btn"
                disabled={!canSubmit || loading}
                onClick={() => createCouple(displayName)}
                type="button"
              >
                Create Couple
              </button>
            </div>
            <div className="join-row">
              <input
                className="text-input code-input"
                onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                placeholder="Invite code"
                value={inviteCode}
              />
              <button
                className="primary-btn alt"
                disabled={!canSubmit || inviteCode.trim().length < 4}
                onClick={() => joinCouple(displayName, inviteCode)}
                type="button"
              >
                Join
              </button>
            </div>
          </>
        )}
        {error && <p className="error-copy">{error}</p>}
      </div>
    </section>
  )
}
