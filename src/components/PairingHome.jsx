import { PlayerPortrait } from './PlayerPortrait.jsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { useFirebaseApp } from '../features/couple/FirebaseAppContext.jsx'
import { useSession } from '../features/session/SessionProvider.jsx'
import { hasCommitted } from '../features/couple/pairingService.js'
import { Disclosure } from './Disclosure.jsx'
import { PlayerPiecePicker } from './PlayerPiecePicker.jsx'
import { ProfileSheet } from './ProfileSheet.jsx'
import { OurStoryScreens } from './OurStoryScreens.jsx'
import { BrandIcon } from './BrandIcon.jsx'
import { normalizePartnerEmail, validPartnerEmail } from '../features/couple/emailInvitationService.js'
import './PairingHome.css'

export function PairingHome({ avatar, onAvatarChange }) {
  const { couple, inviteByEmail, acceptInvitation, declineInvitation, incomingInvitations = [], sentInvitation, invitationsLoading, invitationError, commitPairing, unpair, loading, error, profile } = useCouple()
  const { user, authWorking, verifyEmail, refreshEmailVerification } = useFirebaseApp()
  const { session, gameOpen, readyToPlay, error: sessionError, beginNight, openGame, closeGame, working: sessionWorking, journalEntries = [] } = useSession()
  const name = profile?.displayName || user?.displayName || 'Player'
  const [partnerEmail, setPartnerEmail] = useState('')
  const [confirmUnpair, setConfirmUnpair] = useState(false)
  const [confirmCommit, setConfirmCommit] = useState(false)
  const [acceptPermanent, setAcceptPermanent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [noticeError, setNoticeError] = useState(false)
  const [profileSheetOpen, setProfileSheetOpen] = useState(false)
  const [storyScreen, setStoryScreen] = useState('')
  const profileButtonRef = useRef(null)
  const partner = couple?.players?.find((player) => player.uid !== user?.uid)
  const paired = couple?.playerIds?.length === 2
  const committed = hasCommitted(couple)
  const ownCommitment = couple?.commitments?.includes(user?.uid)
  const hasCurrentNight = Boolean(couple?.activeSessionId && (!session || session.status === 'active'))
  const disabled = busy || loading || authWorking || sessionWorking

  useEffect(() => { setConfirmUnpair(false); setConfirmCommit(false); setAcceptPermanent(false); setNotice('') }, [couple?.id])
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

  const closeProfileSheet = useCallback(() => {
    setProfileSheetOpen(false)
    requestAnimationFrame(() => profileButtonRef.current?.focus())
  }, [])

  return (
    <>
      <div className={`account-strip${!paired ? ' account-compact' : ''}`}>
        <div className="account-profile">
          {paired ? <button ref={profileButtonRef} aria-haspopup="dialog" aria-label="Edit profile portrait" className="portrait-open-button" onClick={() => setProfileSheetOpen(true)} type="button"><PlayerPortrait player={{ uid: user?.uid, displayName: name }} photoURL={user?.photoURL} /></button> : <PlayerPortrait player={{ uid: user?.uid, displayName: name }} photoURL={user?.photoURL} />}
          <div className="account-copy"><strong>{name}</strong>{user?.email && <p>{user.email}</p>}</div>
        </div>
      </div>

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
        <div className="pairing-title"><h2>You &amp; {partner?.displayName || 'your person'}</h2></div>
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
        {hasCurrentNight ? <button className="primary-btn night-start-button" disabled={disabled} onClick={openGame} type="button"><BrandIcon name="moon" /><span>Continue our night</span></button> : <button className="primary-btn night-start-button" disabled={disabled} onClick={() => act(() => beginNight('long'))} type="button"><BrandIcon name="moon" /><span>Begin our night</span></button>}
        {sessionError && !gameOpen && <p className="error-copy" role="alert">{hasCurrentNight ? 'Saved game unavailable. Try Continue again.' : 'Couldn’t start. Try again.'}</p>}
          <button aria-label="Our Story" className="story-open-button" onClick={() => setStoryScreen('chooser')} type="button"><BrandIcon name="more" /></button>
      </>}

      {couple && !committed && <div className="pairing-unpair">
        {confirmUnpair ? <>
          <p>Disconnect {paired ? 'both accounts' : 'this invitation'}? Saved games and memories will be kept.</p>
          <div className="button-row"><button className="ghost-btn" disabled={disabled} onClick={() => act(unpair)} type="button">{paired ? 'Confirm disconnect' : 'Confirm cancel'}</button><button className="ghost-btn" disabled={disabled} onClick={() => setConfirmUnpair(false)} type="button">Cancel</button></div>
        </> : <button className="ghost-btn" disabled={disabled} onClick={() => setConfirmUnpair(true)} type="button">{paired ? 'Cancel connection' : 'Cancel invite'}</button>}
      </div>}
      {(notice || error) && <p className={noticeError || (!notice && error) ? 'error-copy' : 'support-copy'} role={noticeError || (!notice && error) ? 'alert' : 'status'}>{notice || error}</p>}
      {profileSheetOpen && paired && <ProfileSheet streak={profile?.loginStreak} onClose={closeProfileSheet} />}
      {storyScreen && <OurStoryScreens initialScreen={storyScreen} entries={journalEntries} onClose={() => setStoryScreen('')} />}
    </>
  )
}
