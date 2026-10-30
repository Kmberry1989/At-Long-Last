import { useEffect, useState } from 'react'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { useFirebaseApp } from '../features/couple/FirebaseAppContext.jsx'
import { useSession } from '../features/session/SessionProvider.jsx'
import { hasCommitted, pairingShareLink } from '../features/couple/pairingService.js'
import { SESSION_PRESET_OPTIONS } from '../features/session/sessionPresets.js'
import { Disclosure } from './Disclosure.jsx'
import { InviteJoinScreen } from './InviteJoinScreen.jsx'
import { PlayerPiecePicker } from './PlayerPiecePicker.jsx'
import { ProgressHub } from './ProgressHub.jsx'
import { PairingStory } from './Milestones.jsx'
import { JournalTimeline } from './JournalTimeline.jsx'
import './PairingHome.css'

export function PairingHome({ avatar, onAvatarChange }) {
  const { couple, createCouple, joinCouple, commitPairing, unpair, loading, error, profile } = useCouple()
  const { user, db, updateDisplayName, authWorking, verifyEmail, refreshEmailVerification } = useFirebaseApp()
  const { session, journalEntries, gameOpen, readyToPlay, error: sessionError, beginNight, openGame, closeGame, working: sessionWorking } = useSession()
  const name = profile?.displayName || user?.displayName || 'Player'
  const [draftName, setDraftName] = useState(name)
  const [editingName, setEditingName] = useState(false)
  const [code, setCode] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return (params.get('invite') || params.get('code') || '').toUpperCase()
  })
  const [deepLink, setDeepLink] = useState(() => Boolean(new URLSearchParams(window.location.search).get('invite') || new URLSearchParams(window.location.search).get('code')))
  const [preset, setPreset] = useState(couple?.sessionPreset || 'quick')
  const [confirmUnpair, setConfirmUnpair] = useState(false)
  const [confirmCommit, setConfirmCommit] = useState(false)
  const [acceptPermanent, setAcceptPermanent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const partner = couple?.players?.find((player) => player.uid !== user?.uid)
  const paired = couple?.playerIds?.length === 2
  const committed = hasCommitted(couple)
  const ownCommitment = couple?.commitments?.includes(user?.uid)
  const hasCurrentNight = Boolean(couple?.activeSessionId && (!session || session.status === 'active'))
  const disabled = busy || loading || authWorking || sessionWorking

  useEffect(() => { setDraftName(name) }, [name])
  useEffect(() => { setPreset(couple?.sessionPreset || 'quick'); setConfirmUnpair(false); setConfirmCommit(false); setAcceptPermanent(false); setNotice('') }, [couple?.id, couple?.sessionPreset])
  useEffect(() => {
    if (!couple) return
    const url = new URL(window.location.href)
    if (url.searchParams.has('invite') || url.searchParams.has('code')) {
      url.searchParams.delete('invite'); url.searchParams.delete('code')
      window.history.replaceState({}, '', url)
    }
  }, [couple?.id])

  async function act(callback) {
    if (disabled) return
    setBusy(true); setNotice('')
    try { await callback() }
    catch (nextError) { setNotice(nextError.message || 'Please try again.') }
    finally { setBusy(false) }
  }

  async function share(copyOnly = false) {
    const url = pairingShareLink(couple, window.location.origin)
    try {
      if (!copyOnly && navigator.share) {
        await navigator.share({ title: 'At Long Last', text: 'Connect with me on At Long Last.', url })
        setNotice('Invite shared')
      } else {
        if (!navigator.clipboard?.writeText) throw new Error('Copy the code below to share your invitation.')
        await navigator.clipboard.writeText(url)
        setNotice('Link copied')
      }
    } catch (nextError) { if (nextError.name !== 'AbortError') setNotice(nextError.message) }
  }

  function piecePicker() {
    return <Disclosure label="Your piece"><PlayerPiecePicker disabled={disabled} value={avatar} onChange={onAvatarChange} /></Disclosure>
  }

  return (
    <>
      <div className="account-strip">
        <div className="account-copy"><strong>{name}</strong>{user?.email && <p>{user.email}</p>}</div>
        <div className="account-actions">
          <button className="ghost-btn" onClick={() => setEditingName(!editingName)} type="button">{editingName ? 'Done' : 'Edit Name'}</button>
        </div>
      </div>
      {editingName && <form className="pairing-editor" onSubmit={(event) => { event.preventDefault(); act(async () => { await updateDisplayName(draftName); setEditingName(false) }) }}>
        <input aria-label="Name" className="text-input" value={draftName} onChange={(event) => setDraftName(event.target.value)} maxLength={60} placeholder="Name" />
        <button className="primary-btn alt" disabled={!draftName.trim() || disabled} type="submit">Save</button>
      </form>}

      {loading && !couple ? <p role="status">Loading your connection…</p> : gameOpen && paired && !readyToPlay ? <>
        <h2>{sessionError ? 'Game unavailable' : 'Loading game…'}</h2>
        <p role={sessionError ? 'alert' : 'status'}>{sessionError ? 'Your saved game could not be opened.' : 'Connecting to your game.'}</p>
        <button className="ghost-btn" onClick={closeGame} type="button">Home</button>
      </> : !couple ? deepLink ? <InviteJoinScreen db={db} inviteCode={code} nickname={draftName} onNicknameChange={setDraftName} onJoin={(nickname) => act(() => joinCouple(nickname, code, avatar))} onUseCodeInstead={() => setDeepLink(false)} working={disabled} /> : <>
        <h2>Connect once.</h2>
        <p className="support-copy">Share a link with your person.</p>
        {piecePicker()}
        <button className="primary-btn" disabled={disabled} onClick={() => act(() => createCouple(name, preset, avatar))} type="button">Create invite</button>
        <Disclosure label="Use code">
          <form className="join-row" onSubmit={(event) => { event.preventDefault(); act(() => joinCouple(name, code, avatar)) }}>
            <input aria-label="Invite code" className="text-input code-input" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} maxLength={6} autoComplete="off" placeholder="Code" />
            <button className="primary-btn" disabled={code.trim().length !== 6 || disabled} type="submit">Connect</button>
          </form>
        </Disclosure>
      </> : !paired ? <>
        <h2>Invite your person</h2>
        <p className="support-copy">One link connects your accounts for future nights.</p>
        <div className="button-row">
          <button className="primary-btn" disabled={disabled} onClick={() => share()} type="button">Share invite</button>
          <button className="primary-btn alt" disabled={disabled} onClick={() => share(true)} type="button">Copy link</button>
        </div>
        <Disclosure label="Code"><div className="invite-display"><strong>{couple.inviteCode}</strong></div></Disclosure>
        <p className="support-copy" role="status">Waiting for your person to connect.</p>
      </> : <>
        <div className="pairing-title"><h2>You &amp; {partner?.displayName || 'your person'}</h2>{committed && <span className="pairing-committed">♥ Committed</span>}</div>
        {!committed && <div className="pairing-commit">
          <h3>Commit</h3>
          <p className="support-copy">One person. One permanent commitment.</p>
          {ownCommitment ? <p role="status">Your commitment is pending until {partner?.displayName || 'your person'} confirms.</p> : !user?.emailVerified ? <>
            <p>Verify {user?.email} before committing.</p>
            <button className="ghost-btn" disabled={disabled} onClick={() => act(async () => { await verifyEmail(); setNotice('Verification email sent') })} type="button">Verify email</button>
            <button className="ghost-btn" disabled={disabled} onClick={() => act(async () => { const verified = await refreshEmailVerification(); setNotice(verified ? 'Email verified' : 'Open the verification link in your email, then check again.') })} type="button">Check verification</button>
          </> : confirmCommit ? <form className="commit-confirm" aria-label="Permanent commitment" onSubmit={(event) => { event.preventDefault(); if (acceptPermanent) act(async () => { await commitPairing(); setConfirmCommit(false) }) }}>
            <strong>Commit to {partner?.displayName || 'your person'}?</strong>
            <p>This permanently links {user.email} with their account when you both confirm. Neither email can choose another partner. It cannot be undone.</p>
            <label><input type="checkbox" checked={acceptPermanent} onChange={(event) => setAcceptPermanent(event.target.checked)} required />I understand this is permanent.</label>
            <button className="primary-btn" disabled={!acceptPermanent || disabled} type="submit">Commit forever</button>
            <button className="ghost-btn" onClick={() => { setConfirmCommit(false); setAcceptPermanent(false) }} type="button">Not yet</button>
          </form> : <button className="primary-btn" disabled={disabled} onClick={() => setConfirmCommit(true)} type="button">Commit</button>}
        </div>}
        {hasCurrentNight ? <button className="primary-btn" disabled={disabled} onClick={openGame} type="button">Continue</button> : <>
          <div className="preset-card"><h3>Length</h3><div className="preset-grid">{SESSION_PRESET_OPTIONS.map((option) => <button className={`public-lobby-card${preset === option.id ? ' active' : ''}`} aria-pressed={preset === option.id} key={option.id} disabled={disabled} onClick={() => setPreset(option.id)} type="button"><strong>{option.label}</strong></button>)}</div></div>
          <button className="primary-btn" disabled={disabled} onClick={() => act(() => beginNight(preset))} type="button">New night</button>
        </>}
        {sessionError && !gameOpen && <p className="error-copy" role="alert">{hasCurrentNight ? 'Your saved game is unavailable. Try Continue again, or sign out and back in.' : 'Could not start your night. Try New night again.'}</p>}
        <Disclosure label="Scrapbook"><PairingStory /><JournalTimeline entries={journalEntries || []} /></Disclosure>
        <Disclosure label="Collection"><ProgressHub /></Disclosure>
      </>}

      {couple && !committed && <div className="pairing-unpair">
        {confirmUnpair ? <>
          <p>Disconnect {paired ? 'both accounts' : 'this invitation'}? Saved games and memories will be kept.</p>
          <div className="button-row"><button className="ghost-btn" disabled={disabled} onClick={() => act(unpair)} type="button">{paired ? 'Confirm disconnect' : 'Confirm cancel'}</button><button className="ghost-btn" disabled={disabled} onClick={() => setConfirmUnpair(false)} type="button">Cancel</button></div>
        </> : <button className="ghost-btn" disabled={disabled} onClick={() => setConfirmUnpair(true)} type="button">{paired ? 'Cancel connection' : 'Cancel invite'}</button>}
      </div>}
      {(notice || error) && <p className="error-copy" role="status">{notice || error}</p>}
    </>
  )
}
