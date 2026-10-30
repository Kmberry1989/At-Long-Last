import { useEffect, useState } from 'react'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { useFirebaseApp } from '../features/couple/FirebaseAppContext.jsx'
import { useSession } from '../features/session/SessionProvider.jsx'
import { hasCommitted } from '../features/couple/pairingService.js'
import { SESSION_PRESET_OPTIONS } from '../features/session/sessionPresets.js'
import { Disclosure } from './Disclosure.jsx'
import { PlayerPiecePicker } from './PlayerPiecePicker.jsx'
import { LoginStreak } from './LoginStreak.jsx'
import { ProgressHub } from './ProgressHub.jsx'
import { PairingStory } from './Milestones.jsx'
import { JournalTimeline } from './JournalTimeline.jsx'
import { normalizePartnerEmail, validPartnerEmail } from '../features/couple/emailInvitationService.js'
import './PairingHome.css'

export function PairingHome({ avatar, onAvatarChange }) {
  const { couple, inviteByEmail, acceptInvitation, declineInvitation, incomingInvitations = [], sentInvitation, invitationsLoading, invitationError, commitPairing, unpair, loading, error, profile } = useCouple()
  const { user, updateDisplayName, authWorking, verifyEmail, refreshEmailVerification } = useFirebaseApp()
  const { session, journalEntries, gameOpen, readyToPlay, error: sessionError, beginNight, openGame, closeGame, working: sessionWorking } = useSession()
  const name = profile?.displayName || user?.displayName || 'Player'
  const [draftName, setDraftName] = useState(name)
  const [editingName, setEditingName] = useState(false)
  const [partnerEmail, setPartnerEmail] = useState('')
  const [preset, setPreset] = useState(couple?.sessionPreset || 'quick')
  const [confirmUnpair, setConfirmUnpair] = useState(false)
  const [confirmCommit, setConfirmCommit] = useState(false)
  const [acceptPermanent, setAcceptPermanent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [noticeError, setNoticeError] = useState(false)
  const partner = couple?.players?.find((player) => player.uid !== user?.uid)
  const paired = couple?.playerIds?.length === 2
  const committed = hasCommitted(couple)
  const ownCommitment = couple?.commitments?.includes(user?.uid)
  const hasCurrentNight = Boolean(couple?.activeSessionId && (!session || session.status === 'active'))
  const disabled = busy || loading || authWorking || sessionWorking

  useEffect(() => { setDraftName(name) }, [name])
  useEffect(() => { setPreset(couple?.sessionPreset || 'quick'); setConfirmUnpair(false); setConfirmCommit(false); setAcceptPermanent(false); setNotice('') }, [couple?.id, couple?.sessionPreset])
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.has('invite') || url.searchParams.has('code')) {
      url.searchParams.delete('invite'); url.searchParams.delete('code')
      window.history.replaceState({}, '', url)
    }
  }, [])

  async function act(callback) {
    if (disabled) return
    setBusy(true); setNotice(''); setNoticeError(false)
    try { await callback() }
    catch (nextError) { setNoticeError(true); setNotice(nextError.code === 'permission-denied' ? 'This invitation changed or your sign-in expired. Refresh and try again.' : nextError.message || 'Please try again.') }
    finally { setBusy(false) }
  }

  function piecePicker() {
    return <Disclosure label="Your piece"><PlayerPiecePicker disabled={disabled} value={avatar} onChange={onAvatarChange} /></Disclosure>
  }

  return (
    <>
      <div className={`account-strip${!paired ? ' account-compact' : ''}`}>
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
      </> : !paired ? <>
        {!user?.emailVerified ? <div className="email-onboarding">
          <h2>Verify your email</h2>
          <p>Confirm <strong>{user?.email}</strong> before inviting or accepting your person.</p>
          <button className="primary-btn" disabled={disabled} onClick={() => act(async () => { await verifyEmail(); setNotice('Verification email sent. Open it, then come back here.') })} type="button">Send verification email</button>
          <button className="ghost-btn" disabled={disabled} onClick={() => act(async () => { const verified = await refreshEmailVerification(); setNotice(verified ? 'Email verified' : 'Open the verification email, then try again.') })} type="button">I’ve verified my email</button>
        </div> : <>
          {invitationsLoading && <p role="status">Checking invitations…</p>}
          {incomingInvitations.map((invitation) => <section className="email-invitation" aria-label={`Invitation from ${invitation.senderName}`} key={invitation.id}>
            <p className="eyebrow">You’re invited</p>
            <h2>{invitation.senderName} chose you</h2>
            <p className="email-address">{invitation.senderEmail}</p>
            <p>Share your game. Commit becomes permanent only after you both confirm.</p>
            {couple && <p>Accepting replaces your pending invitation.</p>}
            <button className="primary-btn" disabled={disabled} onClick={() => act(() => acceptInvitation(invitation.id, avatar))} type="button">Accept invitation</button>
            <button className="ghost-btn" disabled={disabled} onClick={() => act(() => declineInvitation(invitation.id))} type="button">Decline</button>
          </section>)}
          {sentInvitation ? <section className="email-onboarding" aria-label="Your invitation">
            <p className="eyebrow">{sentInvitation.status === 'declined' ? 'Invitation declined' : 'Invitation sent'}</p>
            <h2>{sentInvitation.status === 'declined' ? 'They declined your invitation' : 'Waiting for your person'}</h2>
            <p className="email-address">{sentInvitation.recipientEmail}</p>
            <p>{sentInvitation.status === 'declined' ? 'Cancel this invitation to choose another email.' : 'They’ll see your invitation when they sign in to At Long Last with this email. Tell them to open the game and sign in.'}</p>
            <p className="support-copy">Invitations appear inside the game; no invitation email is sent.</p>
          </section> : incomingInvitations.length ? null : <form className="email-onboarding" aria-label="Invite your person" onSubmit={(event) => { event.preventDefault(); act(() => inviteByEmail(partnerEmail, avatar)) }}>
            <h2>Choose your person</h2>
            <p>Enter the email they’ll use to sign in. They’ll find your invitation inside the game.</p>
            <label htmlFor="partner-email">Your person’s email</label>
            <input id="partner-email" className="text-input" autoComplete="off" autoCapitalize="none" spellCheck={false} type="email" required maxLength={254} placeholder="name@example.com" value={partnerEmail} onChange={(event) => setPartnerEmail(event.target.value)} />
            <button className="primary-btn" disabled={disabled || !validPartnerEmail(normalizePartnerEmail(partnerEmail)) || normalizePartnerEmail(partnerEmail) === normalizePartnerEmail(user?.email)} type="submit">Invite your person</button>
            <p className="support-copy">Already invited? Sign in with the email your person used. Both of you confirm Commit separately.</p>
          </form>}
          {piecePicker()}
          {invitationError && <p role="alert" className="error-copy">{invitationError}</p>}
        </>}
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
        <Disclosure label="Collection"><LoginStreak streak={profile?.loginStreak} /><ProgressHub /></Disclosure>
      </>}

      {couple && !committed && <div className="pairing-unpair">
        {confirmUnpair ? <>
          <p>Disconnect {paired ? 'both accounts' : 'this invitation'}? Saved games and memories will be kept.</p>
          <div className="button-row"><button className="ghost-btn" disabled={disabled} onClick={() => act(unpair)} type="button">{paired ? 'Confirm disconnect' : 'Confirm cancel'}</button><button className="ghost-btn" disabled={disabled} onClick={() => setConfirmUnpair(false)} type="button">Cancel</button></div>
        </> : <button className="ghost-btn" disabled={disabled} onClick={() => setConfirmUnpair(true)} type="button">{paired ? 'Cancel connection' : 'Cancel invite'}</button>}
      </div>}
      {(notice || error) && <p className={noticeError || (!notice && error) ? 'error-copy' : 'support-copy'} role={noticeError || (!notice && error) ? 'alert' : 'status'}>{notice || error}</p>}
    </>
  )
}
