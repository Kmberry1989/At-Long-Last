import { useEffect, useRef, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { useFirebaseApp } from '../features/couple/FirebaseAppContext.jsx'
import { useSession } from '../features/session/SessionProvider.jsx'
import {
  DEFAULT_PLAYER_AVATAR,
  PLAYER_THEMES,
  resolvePlayerAvatar,
} from '../features/couple/playerAvatar.js'
import {
  DEFAULT_SESSION_PRESET,
  SESSION_PRESET_OPTIONS,
} from '../features/session/sessionPresets.js'
import { Disclosure } from './Disclosure.jsx'
import { InviteJoinScreen } from './InviteJoinScreen.jsx'
import { PlayerPiecePicker } from './PlayerPiecePicker.jsx'
import { ProgressHub } from './ProgressHub.jsx'
import { LoginStreak } from './LoginStreak.jsx'

const PLAYER_PIECE_STORAGE_KEY = 'at-long-last:player-piece:v1'

function getSavedPlayerPiece() {
  try {
    return resolvePlayerAvatar(
      window.localStorage.getItem(PLAYER_PIECE_STORAGE_KEY),
    )
  } catch {
    return DEFAULT_PLAYER_AVATAR
  }
}

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
    activePublicLobbyId,
    couple,
    createCouple,
    error,
    hasPartner,
    joinCouple,
    joinPublicLobby,
    leaveCouple,
    launchPreview,
    loading,
    postLobbyMessage,
    profile,
    publicLobbyMessages,
    publicLobbies,
    sessionPreset,
    roomVisibility,
    selectedPublicLobbyId,
    selectPublicLobby,
    setRoomVisibility,
    switchCouple,
    switchPublicLobby,
    updateSessionPreset,
  } = useCouple()
  const {
    authError,
    authWorking,
    createAccount,
    db,
    enabled,
    isSignedIn,
    ready,
    signInWithEmail,
    signInWithProvider,
    signOutUser,
    updateDisplayName,
    user,
  } = useFirebaseApp()
  const { playAction, playError, playSuccess, setStage } = useAudio()
  const { readyToPlay, error: sessionError } = useSession()
  const [displayName, setDisplayName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [entryMode, setEntryMode] = useState('start')
  const [authMode, setAuthMode] = useState('signin')
  const [draftSessionPreset, setDraftSessionPreset] = useState(DEFAULT_SESSION_PRESET)
  const [deepLinkCode, setDeepLinkCode] = useState('')
  const [inviteNickname, setInviteNickname] = useState('')
  const [lobbyChatDraft, setLobbyChatDraft] = useState('')
  const [notice, setNotice] = useState('')
  const [editingProfile, setEditingProfile] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(getSavedPlayerPiece)
  // Whether the player had already chosen a piece before this visit. The
  // invite join path assigns the joiner-side default piece only when there
  // is no saved choice to respect. Captured on first render, before the
  // save effect below writes the current selection.
  const hadSavedPlayerPieceRef = useRef(null)
  if (hadSavedPlayerPieceRef.current === null) {
    try {
      hadSavedPlayerPieceRef.current = Boolean(
        window.localStorage.getItem(PLAYER_PIECE_STORAGE_KEY),
      )
    } catch {
      hadSavedPlayerPieceRef.current = false
    }
  }

  useEffect(() => {
    setStage?.('menu')
  }, [setStage])

  useEffect(() => {
    setShowPassword(false)
  }, [authMode])

  useEffect(() => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('invite') || url.searchParams.get('code')
    if (code) {
      const normalized = code.toUpperCase()
      setInviteCode(normalized)
      setDeepLinkCode(normalized)
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

  useEffect(() => {
    setLobbyChatDraft('')
  }, [activePublicLobbyId])

  useEffect(() => {
    if (couple) {
      setDraftSessionPreset(sessionPreset)
    }
  }, [couple, sessionPreset])

  useEffect(() => {
    try {
      window.localStorage.setItem(PLAYER_PIECE_STORAGE_KEY, selectedAvatar)
    } catch {
      // The selection still works for this visit when storage is unavailable.
    }
  }, [selectedAvatar])

  const working = loading || authWorking
  const authNotice = authError || error || notice
  const profileName =
    profile?.displayName?.trim() ||
    user?.displayName?.trim() ||
    displayName.trim()
  const canCreateAccount = Boolean(
    displayName.trim() && email.trim() && password.trim().length >= 6,
  )
  const canSignIn = Boolean(email.trim() && password.trim())
  const canJoinByCode = Boolean(profileName && inviteCode.trim().length >= 4)
  const selectedPublicLobby = publicLobbies.find((entry) => entry.id === selectedPublicLobbyId) || null
  const isActive = !hasPartner || !readyToPlay
  const waitingForPartner = Boolean(couple && !hasPartner)
  const authScreenActive = Boolean(ready && enabled && !isSignedIn)
  const showInviteJoin = Boolean(
    ready && enabled && isSignedIn && deepLinkCode && !couple && !loading,
  )

  useEffect(() => {
    if (!inviteNickname && profileName) {
      setInviteNickname(profileName)
    }
  }, [inviteNickname, profileName])
  const alternatePublicLobbies = waitingForPartner
    ? publicLobbies.filter((entry) => entry.id !== couple?.id)
    : publicLobbies

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

  async function handleCreate(preset = sessionPreset) {
    playAction?.()
    setNotice('')
    await createCouple(profileName, preset, selectedAvatar)
  }

  async function handleInviteJoin(nickname) {
    playAction?.()
    setNotice('')
    const avatar = hadSavedPlayerPieceRef.current
      ? selectedAvatar
      : PLAYER_THEMES[1].avatar
    await joinCouple(nickname, deepLinkCode, avatar)
  }

  function handleUseCodeInstead() {
    setDeepLinkCode('')
    setEntryMode('join')
  }

  async function handleJoin() {
    playAction?.()
    setNotice('')
    await joinCouple(profileName, inviteCode, selectedAvatar)
  }

  async function handleSwitch() {
    playAction?.()
    setNotice('')
    await switchCouple(profileName, inviteCode, selectedAvatar)
  }

  async function handleLeave() {
    playAction?.()
    setNotice('')
    await leaveCouple()
  }

  function handlePreview() {
    playAction?.()
    launchPreview(displayName, selectedAvatar)
  }

  async function handlePresetChange(nextPreset) {
    if (!couple) {
      setDraftSessionPreset(nextPreset)
      return
    }

    if (!updateSessionPreset) {
      return
    }

    playAction?.()
    setNotice('')
    await updateSessionPreset(nextPreset)
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

    playSuccess?.()
  }

  async function handleJoinPublicLobby() {
    if (!selectedPublicLobbyId) {
      return
    }

    playAction?.()
    setNotice('')
    await joinPublicLobby(selectedPublicLobbyId, selectedAvatar)
  }

  async function handleSendLobbyMessage() {
    const nextMessage = lobbyChatDraft.trim()
    if (!nextMessage) {
      return
    }

    playAction?.()
    setNotice('')
    await postLobbyMessage(nextMessage)
    setLobbyChatDraft('')
    playSuccess?.()
  }

  async function handleSwitchPublicLobby() {
    if (!selectedPublicLobbyId) {
      return
    }

    playAction?.()
    setNotice('')
    await switchPublicLobby(selectedPublicLobbyId, selectedAvatar)
  }

  function renderGoogleButton(label = 'Continue with Google') {
    return (
      <div className="provider-stack">
        <button
          className="ghost-btn provider-btn"
          disabled={working}
          onClick={() => handleProviderAuth('google')}
          type="button"
        >
          <GoogleMark />
          <span>{label}</span>
        </button>
      </div>
    )
  }

  function renderAuthCard() {
    return (
      <>
        <div className="auth-intro">
          <h2>Sign in</h2>
        </div>
        {renderGoogleButton('Google')}
        <div className="divider-label">or</div>
        <div className="mode-toggle" role="tablist" aria-label="Auth mode">
          <button
            aria-selected={authMode === 'create'}
            className={`mode-pill${authMode === 'create' ? ' active' : ''}`}
            onClick={() => setAuthMode('create')}
            role="tab"
            type="button"
          >
            Sign up
          </button>
          <button
            aria-selected={authMode === 'signin'}
            className={`mode-pill${authMode === 'signin' ? ' active' : ''}`}
            onClick={() => setAuthMode('signin')}
            role="tab"
            type="button"
          >
            Sign In
          </button>
        </div>

        {authMode === 'create' ? (
          <form
            className="auth-email-fields"
            onSubmit={(event) => {
              event.preventDefault()
              handleCreateAccount()
            }}
          >
            <label className="sr-only" htmlFor="auth-display-name">Name</label>
            <input
              autoComplete="name"
              className="text-input"
              id="auth-display-name"
              onChange={(event) => setDisplayName(event.target.value)}
              aria-label="Name"
              placeholder="Name"
              value={displayName}
            />
            <label className="sr-only" htmlFor="auth-email">Email</label>
            <input
              autoComplete="email"
              className="text-input"
              id="auth-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              required
              type="email"
              value={email}
            />
            <div className="password-field">
              <label className="sr-only" htmlFor="auth-password">Password</label>
              <input
                autoComplete="new-password"
                className="text-input"
                id="auth-password"
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password (6+ characters)"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="button-row">
              <button
                className="primary-btn"
                disabled={!canCreateAccount || working}
                type="submit"
              >
                Sign up
              </button>
            </div>
          </form>
        ) : (
          <form
            className="auth-email-fields"
            onSubmit={(event) => {
              event.preventDefault()
              handleSignIn()
            }}
          >
            <label className="sr-only" htmlFor="auth-email">Email</label>
            <input
              autoComplete="email"
              className="text-input"
              id="auth-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              required
              type="email"
              value={email}
            />
            <div className="password-field">
              <label className="sr-only" htmlFor="auth-password">Password</label>
              <input
                autoComplete="current-password"
                className="text-input"
                id="auth-password"
                onChange={(event) => setPassword(event.target.value)}

                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="button-row">
              <button
                className="primary-btn"
                disabled={!canSignIn || working}
                type="submit"
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </>
    )
  }

  function renderPresetPicker({
    disabled = false,
    heading = 'Length',
  } = {}) {
    const selectedPreset = couple ? sessionPreset : draftSessionPreset

    return (
      <div className="preset-card">
        <h3>{heading}</h3>
        <div className="preset-grid">
          {SESSION_PRESET_OPTIONS.map((preset) => (
            <button
              aria-pressed={selectedPreset === preset.id}
              className={`public-lobby-card${selectedPreset === preset.id ? ' active' : ''}`}
              disabled={disabled}
              key={preset.id}
              onClick={() => handlePresetChange(preset.id)}
              type="button"
            >
              <strong>{preset.label}</strong>
            </button>
          ))}
        </div>
      </div>
    )
  }

  function renderLobbyChat({
    cta,
    emptyCopy,
    kicker,
  }) {
    return (
      <div className="lobby-chat-card">
        <p className="eyebrow">{kicker}</p>
        <div className="lobby-chat-thread">
          {publicLobbyMessages.length ? (
            publicLobbyMessages.map((message) => (
              <div
                key={message.id}
                className={`lobby-chat-bubble${message.authorId === user?.uid ? ' mine' : ''}`}
              >
                <strong>{message.authorName}</strong>
                <p>{message.text}</p>
              </div>
            ))
          ) : (
            <p className="support-copy">{emptyCopy}</p>
          )}
        </div>
        <div className="lobby-chat-compose">
          <input
            className="text-input"
            onChange={(event) => setLobbyChatDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleSendLobbyMessage()
              }
            }}
            aria-label="Message"
            placeholder="Message"
            value={lobbyChatDraft}
          />
          <button
            className="primary-btn alt"
            disabled={!lobbyChatDraft.trim() || working}
            onClick={handleSendLobbyMessage}
            type="button"
          >
            Send
          </button>
        </div>
        {cta || null}
      </div>
    )
  }

  function renderPublicLobbyBrowser() {
    return (
      <>

        <div className="public-lobby-list">
          {alternatePublicLobbies.length ? (
            alternatePublicLobbies.map((lobby) => (
              <button
                key={lobby.id}
                className={`public-lobby-card${lobby.id === selectedPublicLobbyId ? ' active' : ''}`}
                onClick={() => {
                  playAction?.()
                  selectPublicLobby(lobby.id)
                }}
                type="button"
              >
                <strong>{lobby.hostName}&apos;s room</strong>

                <span>1 spot open</span>
              </button>
            ))
          ) : (
            <div className="public-lobby-empty">
              <p className="support-copy">
                {waitingForPartner
                  ? 'No other open rooms'
                  : 'No open rooms'}
              </p>
            </div>
          )}
        </div>

        {selectedPublicLobby && renderLobbyChat({
          cta: (
            <div className="button-row">
              <button
                className="primary-btn"
                disabled={working}
                onClick={waitingForPartner ? handleSwitchPublicLobby : handleJoinPublicLobby}
                type="button"
              >
                {waitingForPartner
                  ? 'Switch room'
                  : 'Join room'}
              </button>
            </div>
          ),
          emptyCopy: 'No messages yet',
          kicker: 'Chat',
        })}
      </>
    )
  }

  function renderAccountStrip() {
    return (
      <div className="account-strip">
        <div className="account-copy">
          <strong>{profileName || 'Player'}</strong>
          {user?.email && <p>{user.email}</p>}
        </div>
        <div className="account-actions">
          <button
            className="ghost-btn"
            onClick={() => setEditingProfile((current) => !current)}
            type="button"
          >
            {editingProfile ? 'Done' : 'Edit Name'}
          </button>
          <button
            className="ghost-btn"
            disabled={working}
            onClick={handleSignOut}
            type="button"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <section
      className={`screen lobby-screen${isActive ? ' active' : ' inactive'}${authScreenActive ? ' auth-screen' : ''}`}
    >
      <DecorativePath />
      <div className="lobby-content">
        <div className={`title-band${authScreenActive ? ' auth-title-band' : ''}`}>
          <img
            alt="At Long Last"
            className="brand-logo"
            src="/assets/ui/atlonglast-wordmark-wide.png"
          />
          {!authScreenActive && (
            <img
              alt=""
              className="lobby-hero"
              src="/assets/themes/landing-hero.webp"
            />
          )}
        </div>

        {isSignedIn && <LoginStreak streak={profile?.loginStreak} />}
        <div className={`glass-card hero-card lobby-card${authScreenActive ? ' auth-card' : ''}`}>
          {!ready ? (
            <>

              <h2>Loading…</h2>
            </>
          ) : !enabled ? (
            <>

              <h2>Preview</h2>
              <p className="support-copy">Local play</p>
              <input
                className="text-input"
                onChange={(event) => setDisplayName(event.target.value)}
                aria-label="Name"
                    placeholder="Name"
                value={displayName}
              />
              <PlayerPiecePicker
                onChange={setSelectedAvatar}
                value={selectedAvatar}
              />
              <div className="button-row">
                <button
                  className="primary-btn"
                  onClick={handlePreview}
                  type="button"
                >
                  Play
                </button>
              </div>
            </>
          ) : !isSignedIn ? (
            <>
              {deepLinkCode && (
                <div className="invite-context">
                  <p className="eyebrow">Invite</p>
                  <p className="support-copy">
                    Sign in to join
                  </p>
                </div>
              )}
              {renderAuthCard()}
            </>
          ) : hasPartner && !readyToPlay ? (
            <>
              {renderAccountStrip()}
              <h2>{sessionError ? 'Game unavailable' : 'Loading game…'}</h2>
              {sessionError ? (
                <p className="error-copy" role="alert">{sessionError}</p>
              ) : (
                <p className="support-copy" role="status">Connecting to your room.</p>
              )}
              <div className="button-row">
                <button className="ghost-btn" onClick={() => window.location.reload()} type="button">
                  Reload
                </button>
              </div>
            </>
          ) : waitingForPartner ? (
            <>
              {renderAccountStrip()}
              {editingProfile && (
                <div className="inline-editor">
                  <input
                    className="text-input"
                    onChange={(event) => setDisplayName(event.target.value)}
                    aria-label="Name"
                    placeholder="Name"
                    value={displayName}
                  />
                  <div className="button-row">
                    <button
                      className="primary-btn alt"
                      disabled={!displayName.trim() || working}
                      onClick={handleSaveDisplayName}
                      type="button"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              <p className="eyebrow">Waiting Room</p>
              <h2>{couple.players[0]?.displayName}&apos;s room</h2>

              {renderPresetPicker({
                disabled: working,
                heading: 'Length',
              })}

              <div className="invite-display">
                <span className="invite-label">Code</span>
                <strong>{couple.inviteCode}</strong>
              </div>

              {couple.playerIds?.[0] === user?.uid && (
                <div className="visibility-toggle">
                  <button
                    className="secondary-btn"
                    disabled={working}
                    onClick={() => {
                      playAction?.()
                      setRoomVisibility(roomVisibility !== 'public')
                    }}
                    type="button"
                  >
                    {roomVisibility === 'public' ? 'Make private' : 'List publicly'}
                  </button>
                </div>
              )}

              <div className="button-row">
                <button className="primary-btn" onClick={handleShareInvite} type="button">
                  Share
                </button>
                <button className="primary-btn alt" onClick={handleCopyCode} type="button">
                  Copy
                </button>
              </div>

              <Disclosure label="Public rooms">
                {renderLobbyChat({
                  emptyCopy: 'No messages yet',
                  kicker: 'Chat',
                })}

              <div className="public-lobby-list">
                {alternatePublicLobbies.length ? (
                  alternatePublicLobbies.map((lobby) => (
                    <button
                      key={lobby.id}
                      className={`public-lobby-card${lobby.id === selectedPublicLobbyId ? ' active' : ''}`}
                      onClick={() => {
                        playAction?.()
                        selectPublicLobby(lobby.id)
                      }}
                      type="button"
                    >
                      <strong>{lobby.hostName}&apos;s room</strong>

                    </button>
                  ))
                ) : (
                  <div className="public-lobby-empty">
                    <p className="support-copy">
                      No other open rooms
                    </p>
                  </div>
                )}
              </div>

              <div className="join-row">
                <input
                  className="text-input code-input"
                  onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                  aria-label="Invite code"
                  placeholder="Code"
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
              </Disclosure>

              <Disclosure label="Collection">
                <ProgressHub />
              </Disclosure>

              <div className="button-row split-row">
                <button className="ghost-btn" disabled={working} onClick={handleLeave} type="button">
                  Leave room
                </button>
                <button className="ghost-btn" disabled={working} onClick={handleSignOut} type="button">
                  Sign Out
                </button>
              </div>
            </>
          ) : showInviteJoin ? (
            <>
              {renderAccountStrip()}
              <InviteJoinScreen
                db={db}
                inviteCode={deepLinkCode}
                nickname={inviteNickname}
                onJoin={handleInviteJoin}
                onNicknameChange={setInviteNickname}
                onUseCodeInstead={handleUseCodeInstead}
                working={working}
              />
            </>
          ) : (
            <>
              {renderAccountStrip()}
              {editingProfile && (
                <div className="inline-editor">
                  <input
                    className="text-input"
                    onChange={(event) => setDisplayName(event.target.value)}
                    aria-label="Name"
                    placeholder="Name"
                    value={displayName}
                  />
                  <div className="button-row">
                    <button
                      className="primary-btn alt"
                      disabled={!displayName.trim() || working}
                      onClick={handleSaveDisplayName}
                      type="button"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              <Disclosure label="Your piece">
                <PlayerPiecePicker
                  disabled={working}
                  onChange={setSelectedAvatar}
                  value={selectedAvatar}
                />
              </Disclosure>

              <div className="mode-toggle" role="tablist" aria-label="Entry mode">
                <button
                  className={`mode-pill${entryMode === 'start' ? ' active' : ''}`}
                  onClick={() => handleModeChange('start')}
                  type="button"
                >
                  Start
                </button>
                <button
                  className={`mode-pill${entryMode === 'join' ? ' active' : ''}`}
                  onClick={() => handleModeChange('join')}
                  type="button"
                >
                  Join
                </button>
              </div>

              {entryMode === 'start' ? (
                <>
                  {renderPresetPicker({
                    disabled: working,
                  })}
                  <div className="button-row">
                    <button
                      className="primary-btn"
                      disabled={!profileName || working}
                      onClick={() => handleCreate(draftSessionPreset)}
                      type="button"
                    >
                      Create room
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="join-row">
                    <input
                      className="text-input code-input"
                      onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                      aria-label="Invite code"
                      placeholder="Code"
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
                  <Disclosure label="Public rooms">
                    {renderPublicLobbyBrowser()}
                  </Disclosure>
                </>
              )}
            </>
          )}

          {(authNotice) && (
            <p
              aria-live={authError || error ? 'assertive' : 'polite'}
              className={authError || error ? 'error-copy' : 'notice-copy'}
              role={authError || error ? 'alert' : 'status'}
            >
              {authNotice}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
