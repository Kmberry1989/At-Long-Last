import { useEffect, useMemo, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { useFirebaseApp } from '../features/couple/FirebaseAppContext.jsx'

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
    switchCouple,
  } = useCouple()
  const { enabled, ready } = useFirebaseApp()
  const { playAction, playError, playSuccess, setStage } = useAudio()
  const [displayName, setDisplayName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [entryMode, setEntryMode] = useState('start')
  const [notice, setNotice] = useState('')

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
    if (error) {
      playError?.()
    }
  }, [error, playError])

  const canSubmit = useMemo(
    () => Boolean(displayName.trim()),
    [displayName],
  )
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
          text: `Join my At Long Last board night with code ${couple.inviteCode}.`,
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
    await createCouple(displayName)
  }

  async function handleJoin() {
    playAction?.()
    setNotice('')
    await joinCouple(displayName, inviteCode)
  }

  async function handleSwitch() {
    playAction?.()
    setNotice('')
    await switchCouple(displayName, inviteCode)
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

  return (
    <section
      className={`screen lobby-screen${isActive ? ' active' : ' inactive'}`}
    >
      <DecorativePath />
      <div className="lobby-content">
        <div className="title-band">
          <p className="brand-script">At Long Last</p>
          <p className="title-kicker">A five-round board night for two phones.</p>
          <h1>Two phones. One little world.</h1>
          <p className="title-copy">
            Trade tiny confessions, chase shared hearts, buy keepsakes, and walk
            away with a scrapbook instead of a scoreboard.
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
          ) : waitingForPartner ? (
            <>
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
                  disabled={!canSubmit || inviteCode.trim().length < 4 || loading}
                  onClick={handleSwitch}
                  type="button"
                >
                  Switch
                </button>
              </div>

              <div className="button-row split-row">
                <button className="ghost-btn" disabled={loading} onClick={handleLeave} type="button">
                  Leave This Room
                </button>
                <button className="ghost-btn" onClick={() => handleModeChange('join')} type="button">
                  I Have A Code
                </button>
              </div>
            </>
          ) : (
            <>
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

              <input
                className="text-input"
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your display name"
                value={displayName}
              />

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
                      disabled={!canSubmit || loading}
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
                      disabled={!canSubmit || inviteCode.trim().length < 4 || loading}
                      onClick={handleJoin}
                      type="button"
                    >
                      Join
                    </button>
                  </div>
                  <div className="step-strip">
                    <span>Name</span>
                    <span>Code</span>
                    <span>Board</span>
                  </div>
                </>
              )}
            </>
          )}

          {(notice || error) && (
            <p className={error ? 'error-copy' : 'notice-copy'}>
              {error || notice}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
