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
import { ConnectFourFinale } from './ConnectFourFinale.jsx'
import { CoupleArcade } from './CoupleArcade.jsx'
import { createConnectFourState, getConnectFourTokenPreferences, placeConnectFourPiece } from '../features/session/connectFour.js'
import { dropConnectFourMove, selectConnectFourTokenPreference, startNewConnectFourMatch, subscribeToCoupleProgress } from '../features/couple/progressService.js'
import { useAudio } from '../audio/AudioProvider.jsx'
import { arcadeStage } from '../audio/arcadeThemes.js'
import { savePieceStyle, subscribePieceStyles } from '../features/couple/portraitService.js'
import './PairingHome.css'

export function PairingHome({ avatar, onAvatarChange }) {
  const { couple, inviteByEmail, acceptInvitation, declineInvitation, incomingInvitations = [], sentInvitation, invitationsLoading, invitationError, commitPairing, unpair, loading, error, profile, progress: coupleProgress } = useCouple()
  const { user, db, enabled, authWorking, verifyEmail, refreshEmailVerification } = useFirebaseApp()
  const { session, gameOpen, readyToPlay, error: sessionError, beginNight, openGame, closeGame, working: sessionWorking, journalEntries = [] } = useSession()
  const audio = useAudio()
  const name = profile?.displayName || user?.displayName || 'Player'
  const [partnerEmail, setPartnerEmail] = useState('')
  const [confirmUnpair, setConfirmUnpair] = useState(false)
  const [confirmCommit, setConfirmCommit] = useState(false)
  const [acceptPermanent, setAcceptPermanent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [noticeError, setNoticeError] = useState(false)
  const [profileSheetOpen, setProfileSheetOpen] = useState(false)
  const [pieceStyles, setPieceStyles] = useState({})
  const [themeVotesLoaded, setThemeVotesLoaded] = useState(false)
  const [storyScreen, setStoryScreen] = useState('')
  const [connectFourOpen, setConnectFourOpen] = useState(false)
  const [connectFourPreview, setConnectFourPreview] = useState(null)
  const [connectFourLiveState, setConnectFourLiveState] = useState(null)
  const [connectFourBusy, setConnectFourBusy] = useState(false)
  const [connectFourError, setConnectFourError] = useState('')
  const [connectFourTokenPreview, setConnectFourTokenPreview] = useState({})
  const [arcadeOpen, setArcadeOpen] = useState(false)
  const profileButtonRef = useRef(null)
  const partner = couple?.players?.find((player) => player.uid !== user?.uid)
  const ownPlayer = couple?.players?.find((player) => player.uid === user?.uid)
  const ownPieceStyle = {
    pieceColor: pieceStyles[user?.uid]?.pieceColor || ownPlayer?.color || '#ff7a97',
    pieceMaterial: pieceStyles[user?.uid]?.pieceMaterial || 'porcelain',
  }
  const paired = couple?.playerIds?.length === 2
  const committed = hasCommitted(couple)
  const ownCommitment = couple?.commitments?.includes(user?.uid)
  const hasCurrentNight = Boolean(couple?.activeSessionId && (!session || session.status === 'active'))
  const disabled = busy || loading || authWorking || sessionWorking
  const connectFourPlayers = (couple?.playerIds || []).map((uid) => couple.players?.find((player) => player.uid === uid) || { uid, displayName: uid === user?.uid ? name : partner?.displayName || 'Your person' })
  const persistedConnectFour = connectFourOpen ? connectFourLiveState || coupleProgress?.connectFour : coupleProgress?.connectFour
  const connectFourState = connectFourPreview && (!persistedConnectFour || connectFourPreview.moveCount > persistedConnectFour.moveCount)
    ? connectFourPreview
    : persistedConnectFour || connectFourPreview || createConnectFourState(connectFourPlayers.map((player) => player.uid))
  const connectFourTokenPreferences = getConnectFourTokenPreferences({ ...coupleProgress, connectFourTokenPreferences: { ...coupleProgress?.connectFourTokenPreferences, ...connectFourTokenPreview } }, couple?.playerIds || [])
  const selectedConnectFourToken = connectFourTokenPreferences[user?.uid]
  const partnerConnectFourToken = connectFourTokenPreferences[partner?.uid]
  const connectFourMatchActive = connectFourState.moveCount > 0 && !connectFourState.winnerUid && connectFourState.moveCount < 42
  const hasThemeVote = (couple?.playerIds || []).some(uid => pieceStyles[uid]?.themeVote)
  const currentThemeVote = pieceStyles[user?.uid]?.themeVote || (!hasThemeVote ? coupleProgress?.selectedTheme || null : null)
  const partnerThemeVote = pieceStyles[partner?.uid]?.themeVote || (!hasThemeVote ? coupleProgress?.selectedTheme || null : null)
  const themeAgreed = Boolean(currentThemeVote && currentThemeVote === partnerThemeVote)

  useEffect(() => {
    if (!db || !couple?.id || !paired) {
      setThemeVotesLoaded(true)
      return undefined
    }
    setThemeVotesLoaded(false)
    return subscribePieceStyles(db, couple.id, next => {
      setPieceStyles(next)
      setThemeVotesLoaded(true)
    }, () => setThemeVotesLoaded(true))
  }, [db, couple?.id, paired])

  useEffect(() => {
    if (!connectFourOpen || !db || !enabled || !couple?.id) return undefined
    setConnectFourLiveState(null)
    return subscribeToCoupleProgress(db, couple.id, (progress) => {
      const state = progress?.connectFour || null
      setConnectFourLiveState(state)
      if (state) setConnectFourPreview((current) => current && current.moveCount > state.moveCount ? current : null)
    }, (nextError) => setConnectFourError(nextError.message || 'Could not sync Four Ever.'))
  }, [connectFourOpen, couple?.id, db, enabled])

  useEffect(() => {
    if (!connectFourOpen || arcadeOpen) return undefined
    audio?.setStage?.(arcadeStage('four-ever'))
    return () => audio?.setStage?.('menu')
  }, [audio, arcadeOpen, connectFourOpen])

  async function updatePieceStyle(style) {
    if (db && enabled && couple?.id && user?.uid) await savePieceStyle(db, couple.id, user.uid, style)
    else setPieceStyles(current => ({ ...current, [user?.uid || 'preview-you']: { pieceColor: style.color, pieceMaterial: style.material } }))
  }

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

  function beginOrChooseTheme() {
    if (enabled && (!themeVotesLoaded || !themeAgreed)) {
      setStoryScreen('collection')
      return
    }
    act(() => beginNight('long'))
  }

  async function dropConnectFour(column, tokenId) {
    if (connectFourBusy || !user?.uid || !couple?.id) return
    setConnectFourBusy(true); setConnectFourError('')
    try {
      const moveId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
      if (enabled) {
        const result = await dropConnectFourMove(db, couple.id, user.uid, moveId, column, tokenId)
        setConnectFourPreview(result.state)
      }
      else setConnectFourPreview(placeConnectFourPiece(connectFourState, { column, playerUid: user.uid, sessionId: moveId, tokenId }).state)
    } catch (nextError) { setConnectFourError(nextError.message || 'Could not place that token.') }
    finally { setConnectFourBusy(false) }
  }

  async function newConnectFourMatch() {
    if (connectFourBusy || !user?.uid || !couple?.id) return
    setConnectFourBusy(true); setConnectFourError('')
    try {
      if (enabled) await startNewConnectFourMatch(db, couple.id, user.uid)
      else {
        const previousStarter = connectFourState.starterUid || connectFourPlayers[0]?.uid
        setConnectFourPreview(createConnectFourState(connectFourPlayers.map((player) => player.uid), connectFourPlayers.find((player) => player.uid !== previousStarter)?.uid))
      }
    } catch (nextError) { setConnectFourError(nextError.message || 'Could not start another match.') }
    finally { setConnectFourBusy(false) }
  }

  async function selectPlayerConnectFourToken(tokenId) {
    if (!couple?.id || !user?.uid) return
    if (connectFourMatchActive) throw new Error('Finish this match before changing your token.')
    if (enabled) await selectConnectFourTokenPreference(db, couple.id, user.uid, tokenId)
    else {
      if (partnerConnectFourToken === tokenId) throw new Error('You both chose that token. Pick a different one.')
      setConnectFourTokenPreview((previous) => ({ ...previous, [user.uid]: tokenId }))
    }
  }

  const connectFourLanding = useCallback((winnerUid) => {
    if (winnerUid) audio?.playConnectFourWin?.()
    else audio?.playConnectFourDrop?.()
  }, [audio?.playConnectFourDrop, audio?.playConnectFourWin])

  function piecePicker() {
    return <Disclosure label="Your piece"><PlayerPiecePicker disabled={disabled} value={avatar} onChange={onAvatarChange} /></Disclosure>
  }

  const closeProfileSheet = useCallback(() => {
    setProfileSheetOpen(false)
    requestAnimationFrame(() => profileButtonRef.current?.focus())
  }, [])

  return (
    <>
      {paired ? <div className="couple-portrait-stage">
        <div aria-hidden="true" className="couple-atmosphere">
          <span className="couple-glint glint-one" />
          <span className="couple-glint glint-two" />
          <span className="couple-glint glint-three" />
          <span className="couple-glint glint-four" />
          <span className="couple-glint glint-five" />
        </div>
        <button ref={profileButtonRef} aria-haspopup="dialog" aria-label="Edit profile portrait" className="couple-portrait-button own" onClick={() => setProfileSheetOpen(true)} type="button">
          <PlayerPortrait label={`${name} portrait`} player={{ uid: user?.uid, displayName: name }} photoURL={user?.photoURL} />
        </button>
        <div className="couple-portrait-button partner" aria-hidden="true">
          <PlayerPortrait label={`${partner?.displayName || 'Your person'} portrait`} player={partner || { uid: 'partner', displayName: 'Your person' }} />
        </div>
      </div> : <div className="account-strip account-compact">
        <div className="account-profile">
          <PlayerPortrait player={{ uid: user?.uid, displayName: name }} photoURL={user?.photoURL} />
          <div className="account-copy"><strong>{name}</strong>{user?.email && <p>{user.email}</p>}</div>
        </div>
      </div>}

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
            <p>Invite them using the email they sign in with.</p>
            <label htmlFor="partner-email">Your person’s email</label>
            <input id="partner-email" className="text-input" autoComplete="off" autoCapitalize="none" spellCheck={false} type="email" required maxLength={254} placeholder="name@example.com" value={partnerEmail} onChange={(event) => setPartnerEmail(event.target.value)} />
            <button className="primary-btn" disabled={disabled || !validPartnerEmail(normalizePartnerEmail(partnerEmail)) || normalizePartnerEmail(partnerEmail) === normalizePartnerEmail(user?.email)} type="submit">Invite your person</button>
            <p className="support-copy">Already invited? They can sign in with that email.</p>
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
            <p>You’ll both confirm this permanent commitment. It can’t be undone.</p>
            <label><input type="checkbox" checked={acceptPermanent} onChange={(event) => setAcceptPermanent(event.target.checked)} required />I understand this is permanent.</label>
            <button className="primary-btn" disabled={!acceptPermanent || disabled} type="submit">Commit forever</button>
            <button className="ghost-btn" onClick={() => { setConfirmCommit(false); setAcceptPermanent(false) }} type="button">Not yet</button>
          </form> : <button className="primary-btn" disabled={disabled} onClick={() => setConfirmCommit(true)} type="button">Commit</button>}
        </div>}
        {hasCurrentNight ? <button className="primary-btn night-start-button" disabled={disabled} onClick={openGame} type="button"><BrandIcon name="moon" /><span>Continue our night</span></button> : <button className="primary-btn night-start-button" disabled={disabled} onClick={beginOrChooseTheme} type="button"><BrandIcon name="moon" /><span>{themeAgreed ? 'Begin our night' : 'Choose a theme together'}</span></button>}
        <div className="lobby-game-links">
          <button aria-label="Open Our Arcade" className="secondary-link couple-arcade-lobby-link" onClick={() => setArcadeOpen(true)} type="button"><img alt="" src="/assets/arcade/icons/our-arcade.png" /></button>
        </div>
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
      {profileSheetOpen && paired && <ProfileSheet streak={profile?.loginStreak} pieceStyle={{ color: ownPieceStyle.pieceColor, material: ownPieceStyle.pieceMaterial }} onSavePieceStyle={updatePieceStyle} selectedToken={selectedConnectFourToken} partnerToken={partnerConnectFourToken} lifetimeNights={coupleProgress?.lifetimeNights || 0} tokenLocked={connectFourMatchActive} onSelectToken={selectPlayerConnectFourToken} onClose={closeProfileSheet} />}
      {storyScreen && <OurStoryScreens initialScreen={storyScreen} entries={journalEntries} themeLocked={hasCurrentNight} onClose={() => setStoryScreen('')} />}
      {connectFourOpen && connectFourPlayers.length === 2 && <ConnectFourFinale state={connectFourState} players={connectFourPlayers} playerUid={user?.uid} lifetimeNights={coupleProgress?.lifetimeNights || 0} tokenPreferences={connectFourTokenPreferences} disabled={connectFourBusy} onDrop={dropConnectFour} onClose={() => setConnectFourOpen(false)} onNewGame={newConnectFourMatch} onLand={connectFourLanding} />}
      {arcadeOpen && paired && <CoupleArcade db={db} enabled={enabled} coupleId={couple.id} players={connectFourPlayers} currentUid={user?.uid} fourEverDisabled={connectFourBusy} onOpenFourEver={() => { setArcadeOpen(false); setConnectFourError(''); setConnectFourOpen(true) }} onClose={() => setArcadeOpen(false)} />}
      {connectFourError && <p className="error-copy" role="alert">{connectFourError}</p>}
    </>
  )
}
