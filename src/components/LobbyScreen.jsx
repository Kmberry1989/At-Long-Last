import { useEffect, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { useFirebaseApp } from '../features/couple/FirebaseAppContext.jsx'

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="provider-icon" viewBox="0 0 24 24">
      <path d="M21.8 12.23c0-.76-.07-1.49-.2-2.18H12v4.12h5.5a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.04-4.4 3.04-7.58Z" fill="#4285F4" />
      <path d="M12 22c2.75 0 5.06-.91 6.75-2.47l-3.3-2.56c-.91.61-2.07.98-3.45.98-2.65 0-4.9-1.79-5.7-4.2H2.9v2.64A10 10 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.3 13.75A5.99 5.99 0 0 1 6 12c0-.61.1-1.2.3-1.75V7.61H2.9A10 10 0 0 0 2 12c0 1.61.39 3.12 1.08 4.39l3.22-2.64Z" fill="#FBBC04" />
      <path d="M12 6.05c1.5 0 2.84.51 3.9 1.52l2.92-2.92C17.05 2.98 14.75 2 12 2A10 10 0 0 0 3.08 7.61l3.22 2.64c.8-2.41 3.05-4.2 5.7-4.2Z" fill="#EA4335" />
    </svg>
  )
}

function AppleMark() {
  return (
    <svg aria-hidden="true" className="provider-icon" viewBox="0 0 24 24">
      <path d="M15.18 2.21c.08 1-.28 1.97-.8 2.67-.64.85-1.7 1.5-2.72 1.42-.13-.98.3-1.99.83-2.63.6-.74 1.66-1.39 2.69-1.46ZM18.45 17.13c-.53 1.2-.78 1.73-1.46 2.82-.95 1.52-2.28 3.41-3.94 3.43-1.47.02-1.85-.94-3.85-.93-2 .01-2.42.95-3.89.93-1.66-.02-2.92-1.72-3.87-3.24-2.67-4.28-2.95-9.31-1.31-11.84 1.17-1.82 3-2.88 4.71-2.88 1.74 0 2.84.96 4.28.96 1.4 0 2.26-.96 4.27-.96 1.53 0 3.15.83 4.32 2.27-3.79 2.08-3.18 7.51.74 9.44Z" fill="currentColor" />
    </svg>
  )
}

function DecorativePath() {
  return (
    <div aria-hidden="true" className="lobby-backdrop">
      <div className="orbital orbital-a" />
      <div className="orbital orbital-b" />
      <div className="orbital orbital-c" />
      <div className="board-fragment fragment-a" />
      <div className="board-fragment fragment-b" />
      <div className="board-fragment fragment-c" />
      <div className="token token-heart">♥</div>
      <div className="token token-die">✦</div>
      <div className="token token-note">♫</div>
      <div className="path-ribbon ribbon-a" />
      <div className="path-ribbon ribbon-b" />
    </div>
  )
}

async function copyText(value) {
  if (!value) {
    return false
  }

  try {
    await navigator.clipboard?.writeText(value)
    return true
  } catch {
    return false
  }
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
    profile,
    switchCouple,
  } = useCouple()
  const {
    availableProviders,
    authError,
    authWorking,
    createAccount,
    enabled,
    isAnonymous,
    isSignedIn,
    ready,
    signInAsGuest,
    signInWithEmail,
    signInWithProvider,
    signOutUser,
    updateDisplayName,
    user,
  } = useFirebaseApp()
  const { playAction, playError, playSuccess, setStage } = useAudio()
  const [displayName, setDisplayName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [entryMode, setEntryMode] = useState('start')
  const [authMode, setAuthMode] = useState('create')
  const [notice, setNotice] = useState('')
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)

  useEffect(() => {
    setStage?.('lobby')
  }, [setStage])

  useEffect(() => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    if (code) {
      setInviteCode(code.toUpperCase())
      setEntryMode('join')
    }
  }, [])

  useEffect(() => {
    if (error || authError) {
      playError?.()
    }
  }, [authError, error, playError])

  useEffect(() => {
    if (profile?.displayName && !displayName) {
      setDisplayName(profile.displayName)
    }
  }, [displayName, profile?.displayName])

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email)
    }
  }, [email, user?.email])

  const working = loading || authWorking
  const authNotice = authError || error || notice
  const profileName =
    profile?.displayName?.trim() ||
    user?.displayName?.trim() ||
    displayName.trim()
  const canGuest = Boolean(displayName.trim())
  const canCreateAccount = Boolean(
    displayName.trim() && email.trim() && password.trim().length >= 6,
  )
  const canSignIn = Boolean(email.trim() && password.trim())
  const canJoinByCode = Boolean(profileName && inviteCode.trim().length >= 4)
  const isActive = !hasPartner
  const waitingForPartner = Boolean(couple && !hasPartner)

  async function handleShareInvite() {
    if (!couple?.shareLink) {
      return
    }

    playAction?.()

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'At Long Last',
          text: `Join my At Long Last board game with code ${couple.inviteCode}.`,
          url: couple.shareLink,
        })
        setNotice('Invite shared.')
        playSuccess?.()
        return
      }
    } catch {
      // Share was canceled or failed. Fall back to clipboard instead.
    }

    const copied = await copyText(couple.shareLink)
    setNotice(copied ? 'Invite link copied.' : 'Could not share the invite yet.')
    if (copied) {
      playSuccess?.()
    } else {
      playError?.()
    }
  }

  async function handleCopyCode() {
    playAction?.()
    const copied = await copyText(couple?.inviteCode)
    setNotice(copied ? 'Invite code copied.' : 'Could not copy the code.')
    if (copied) {
      playSuccess?.()
    } else {
      playError?.()
    }
  }

  function handleModeChange(mode) {
    setEntryMode(mode)
    setNotice('')
  }

  async function handleCreate() {
    playAction?.()
    setNotice('')
    await createCouple(profileName)
  }

  async function handleJoin() {
    playAction?.()
    setNotice('')
    await joinCouple(profileName, inviteCode)
  }

  async function handleSwitch() {
    playAction?.()
    setNotice('')
    await switchCouple(profileName, inviteCode)
  }

  async function handleLeave() {
    playAction?.()
    setNotice('')
    await leaveCouple()
  }

  function handlePreview() {
    playAction?.()
    launchPreview(displayName)
  }

  async function handleCreateAccount() {
    playAction?.()
    setNotice('')
    const success = await createAccount({
      displayName,
      email,
      password,
    })
    if (success) {
      setUpgradeOpen(false)
      playSuccess?.()
    }
  }

  async function handleSignIn() {
    playAction?.()
    setNotice('')
    const success = await signInWithEmail({
      email,
      password,
    })
    if (success) {
      playSuccess?.()
    }
  }

  async function handleGuestEntry() {
    playAction?.()
    setNotice('')
    const success = await signInAsGuest(displayName)
    if (success) {
      setNotice('Guest profile ready. You can save it to email later.')
      playSuccess?.()
    }
  }

  async function handleSaveDisplayName() {
    playAction?.()
    setNotice('')
    const success = await updateDisplayName(displayName)
    if (success) {
      setEditingProfile(false)
      setNotice('Profile name updated.')
      playSuccess?.()
    }
  }

  async function handleSignOut() {
    playAction?.()
    setNotice('')
    const success = await signOutUser()
    if (success) {
      playSuccess?.()
    }
  }

  async function handleProviderAuth(providerId) {
    playAction?.()
    setNotice('')
    const success = await signInWithProvider({
      displayName,
      providerId,
    })

    if (!success) {
      return
    }

    if (isAnonymous) {
      setUpgradeOpen(false)
      setNotice(
        providerId === 'apple'
          ? 'Guest profile saved with Apple.'
          : 'Guest profile saved with Google.',
      )
    }

    playSuccess?.()
  }

  function renderProviderButtons(verb = 'Continue') {
    return (
      <div className="provider-stack">
        <button
          className="ghost-btn provider-btn"
          disabled={working}
          onClick={() => handleProviderAuth('google')}
          type="button"
        >
          <GoogleMark />
          <span>{verb} with Google</span>
        </button>
        {availableProviders?.apple ? (
          <button
            className="ghost-btn provider-btn provider-btn-apple"
            disabled={working}
            onClick={() => handleProviderAuth('apple')}
            type="button"
          >
            <AppleMark />
            <span>{verb} with Apple</span>
          </button>
        ) : null}
      </div>
    )
  }

  function renderAuthCard() {
    return (
      <>
        <div className="mode-toggle" role="tablist" aria-label="Auth mode">
          <button
            className={`mode-pill${authMode === 'create' ? ' active' : ''}`}
            onClick={() => setAuthMode('create')}
            type="button"
          >
            Create Account
          </button>
          <button
            className={`mode-pill${authMode === 'signin' ? ' active' : ''}`}
            onClick={() => setAuthMode('signin')}
            type="button"
          >
            Sign In
          </button>
        </div>

        {authMode === 'create' ? (
          <>
            <p className="eyebrow">Keep Your Place</p>
            <h2>Make this a profile, not a one-off room.</h2>
            <p className="support-copy">
              Create a saved profile so your couple, scrapbook, and keepsakes stay
              yours when you come back later.
            </p>
            <input
              className="text-input"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Display name"
              value={displayName}
            />
            <input
              autoComplete="email"
              className="text-input"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              type="email"
              value={email}
            />
            <input
              autoComplete="new-password"
              className="text-input"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password (6+ characters)"
              type="password"
              value={password}
            />
            <div className="button-row">
              <button
                className="primary-btn"
                disabled={!canCreateAccount || working}
                onClick={handleCreateAccount}
                type="button"
              >
                Create My Profile
              </button>
            </div>
            <div className="divider-label">or use a provider</div>
            {renderProviderButtons('Continue')}
            <div className="divider-label">or keep it light first</div>
            <div className="button-row">
              <button
                className="ghost-btn"
                disabled={!canGuest || working}
                onClick={handleGuestEntry}
                type="button"
              >
                Continue As Guest
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow">Welcome Back</p>
            <h2>Pick up where you left off.</h2>
            <p className="support-copy">
              Sign in on this phone and your saved couple link will reconnect if it
              still belongs to you.
            </p>
            <input
              autoComplete="email"
              className="text-input"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              type="email"
              value={email}
            />
            <input
              autoComplete="current-password"
              className="text-input"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
              value={password}
            />
            <div className="button-row">
              <button
                className="primary-btn"
                disabled={!canSignIn || working}
                onClick={handleSignIn}
                type="button"
              >
                Sign In
              </button>
            </div>
            <div className="divider-label">or use a saved provider</div>
            {renderProviderButtons('Continue')}
          </>
        )}
      </>
    )
  }

  function renderAccountStrip() {
    return (
      <div className="account-strip">
        <div className="account-copy">
          <p className="eyebrow">{isAnonymous ? 'Guest Profile' : 'Saved Profile'}</p>
          <strong>{profileName || 'Player'}</strong>
          <p>
            {isAnonymous
              ? 'This guest stays on this browser unless you save it with email.'
              : user?.email || 'Signed in and ready for return nights.'}
          </p>
        </div>
        <div className="account-actions">
          <button
            className="ghost-btn"
            onClick={() => setEditingProfile((current) => !current)}
            type="button"
          >
            {editingProfile ? 'Done' : 'Edit Name'}
          </button>
          {!isAnonymous && (
            <button
              className="ghost-btn"
              disabled={working}
              onClick={handleSignOut}
              type="button"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    )
  }

  function renderGuestUpgrade() {
    if (!isAnonymous) {
      return null
    }

    return (
      <div className="glass-card hero-card upgrade-card">
        <p className="eyebrow">Save This Guest</p>
        <h2>Keep this couple beyond one browser.</h2>
        <p className="support-copy">
          Upgrade this guest to an email profile and keep the same player ID, room
          link, and progress.
        </p>
        {!upgradeOpen ? (
          <>
            <div className="button-row">
              <button
                className="primary-btn"
                onClick={() => setUpgradeOpen(true)}
                type="button"
              >
                Save With Email
              </button>
            </div>
            <div className="divider-label">or keep this guest with a provider</div>
            {renderProviderButtons('Save')}
          </>
        ) : (
          <>
            <input
              autoComplete="nickname"
              className="text-input"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Display name"
              value={displayName}
            />
            <input
              autoComplete="email"
              className="text-input"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              type="email"
              value={email}
            />
            <input
              autoComplete="new-password"
              className="text-input"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password (6+ characters)"
              type="password"
              value={password}
            />
            <div className="button-row">
              <button
                className="primary-btn"
                disabled={!canCreateAccount || working}
                onClick={handleCreateAccount}
                type="button"
              >
                Save My Profile
              </button>
              <button
                className="ghost-btn"
                onClick={() => setUpgradeOpen(false)}
                type="button"
              >
                Not Yet
              </button>
            </div>
            <div className="divider-label">or save this guest another way</div>
            {renderProviderButtons('Save')}
          </>
        )}
      </div>
    )
  }

  return (
    <section
      className={`screen lobby-screen${isActive ? ' active' : ' inactive'}`}
    >
      <DecorativePath />
      <div className="lobby-content">
        <div className="title-band">
          <p className="brand-script">At Long Last</p>
          <p className="title-kicker">A five-round board game for two phones.</p>
          <h1>Two phones. One little world.</h1>
          <p className="title-copy">
            Walk away together with a scrapbook instead of a scoreboard.
          </p>
        </div>

        <div className="glass-card hero-card lobby-card">
          {!ready ? (
            <>
              <p className="eyebrow">Starting Up</p>
              <h2>Setting the room.</h2>
              <p className="support-copy">
                Pulling in your session and warming up the board.
              </p>
            </>
          ) : !enabled ? (
            <>
              <p className="eyebrow">Local Preview</p>
              <h2>Firebase keys are still missing.</h2>
              <p className="support-copy">
                Add your `VITE_FIREBASE_*` vars and `VITE_APP_ID` for live pairing.
                Until then, you can still open a local preview board.
              </p>
              <input
                className="text-input"
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your display name"
                value={displayName}
              />
              <div className="button-row">
                <button
                  className="primary-btn"
                  onClick={handlePreview}
                  type="button"
                >
                  Open Preview
                </button>
              </div>
            </>
          ) : !isSignedIn ? (
            renderAuthCard()
          ) : waitingForPartner ? (
            <>
              {renderAccountStrip()}
              {editingProfile && (
                <div className="inline-editor">
                  <input
                    className="text-input"
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Display name"
                    value={displayName}
                  />
                  <div className="button-row">
                    <button
                      className="primary-btn alt"
                      disabled={!displayName.trim() || working}
                      onClick={handleSaveDisplayName}
                      type="button"
                    >
                      Save Name
                    </button>
                  </div>
                </div>
              )}

              <p className="eyebrow">Waiting Room</p>
              <h2>{couple.players[0]?.displayName}&apos;s room is open.</h2>
              <p className="support-copy">
                Send the invite, then both phones will fall straight into the board
                as soon as your partner arrives.
              </p>

              <div className="invite-display">
                <span className="invite-label">Invite code</span>
                <strong>{couple.inviteCode}</strong>
                <p>{couple.shareLink}</p>
              </div>

              <div className="button-row">
                <button className="primary-btn" onClick={handleShareInvite} type="button">
                  Share Invite
                </button>
                <button className="primary-btn alt" onClick={handleCopyCode} type="button">
                  Copy Code
                </button>
              </div>

              <div className="step-strip">
                <span>1. Start</span>
                <span>2. Send</span>
                <span>3. Arrive</span>
              </div>

              <p className="support-copy room-help">
                If both of you created rooms by accident, paste their code below and
                jump over instead.
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
                  disabled={!canJoinByCode || working}
                  onClick={handleSwitch}
                  type="button"
                >
                  Switch
                </button>
              </div>

              <div className="button-row split-row">
                <button className="ghost-btn" disabled={working} onClick={handleLeave} type="button">
                  Leave This Room
                </button>
                {!isAnonymous && (
                  <button className="ghost-btn" disabled={working} onClick={handleSignOut} type="button">
                    Sign Out
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              {renderAccountStrip()}
              {editingProfile && (
                <div className="inline-editor">
                  <input
                    className="text-input"
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Display name"
                    value={displayName}
                  />
                  <div className="button-row">
                    <button
                      className="primary-btn alt"
                      disabled={!displayName.trim() || working}
                      onClick={handleSaveDisplayName}
                      type="button"
                    >
                      Save Name
                    </button>
                  </div>
                </div>
              )}

              <div className="mode-toggle" role="tablist" aria-label="Entry mode">
                <button
                  className={`mode-pill${entryMode === 'start' ? ' active' : ''}`}
                  onClick={() => handleModeChange('start')}
                  type="button"
                >
                  Start A Night
                </button>
                <button
                  className={`mode-pill${entryMode === 'join' ? ' active' : ''}`}
                  onClick={() => handleModeChange('join')}
                  type="button"
                >
                  Use A Code
                </button>
              </div>

              {entryMode === 'start' ? (
                <>
                  <div className="entry-copy">
                    <h2>Start the room on one phone.</h2>
                    <p className="support-copy">
                      You&apos;ll get a short invite code and a share link. Once your
                      partner joins, the board opens on both phones.
                    </p>
                  </div>
                  <div className="button-row">
                    <button
                      className="primary-btn"
                      disabled={!profileName || working}
                      onClick={handleCreate}
                      type="button"
                    >
                      Start Our Night
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="entry-copy">
                    <h2>Join the room from their invite.</h2>
                    <p className="support-copy">
                      Paste the short code from their phone or open the share link.
                    </p>
                  </div>
                  <div className="join-row">
                    <input
                      className="text-input code-input"
                      onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                      placeholder="Invite code"
                      value={inviteCode}
                    />
                    <button
                      className="primary-btn"
                      disabled={!canJoinByCode || working}
                      onClick={handleJoin}
                      type="button"
                    >
                      Join
                    </button>
                  </div>
                  <div className="step-strip">
                    <span>Profile</span>
                    <span>Code</span>
                    <span>Board</span>
                  </div>
                </>
              )}
            </>
          )}

          {(authNotice) && (
            <p className={authError || error ? 'error-copy' : 'notice-copy'}>
              {authNotice}
            </p>
          )}
        </div>

        {enabled && isSignedIn && renderGuestUpgrade()}
      </div>
    </section>
  )
}
