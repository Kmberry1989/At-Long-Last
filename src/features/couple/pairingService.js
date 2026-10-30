import { collection, doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { buildCreateCouplePayload, buildShareLink, createInviteCode, normalizeInviteCode } from './coupleService.js'
import { PLAYER_THEMES, resolvePlayerAvatar } from './playerAvatar.js'
import { buildInitialSession } from '../session/sessionLogic.js'
import { momentId, momentPayload } from './milestoneService.js'
import { getSessionPreset } from '../session/sessionPresets.js'

export function emailLockKey(email) { return email.trim().toLowerCase().replaceAll('%', '%25').replaceAll('/', '%2F') }

export function hasCommitted(couple) {
  return couple?.playerIds?.length === 2 && couple.playerIds.every((uid) => couple.commitments?.includes(uid) && couple.commitmentEmails?.[uid])
}

async function assertUnlinked(transaction, db, userId) {
  const link = await transaction.get(doc(db, 'playerCouples', userId))
  if (!link.exists()) return
  const previous = await transaction.get(doc(db, 'couples', link.data().coupleId))
  if (previous.exists() && previous.data().status !== 'unpaired') {
    throw new Error('You are already connected. Unpair before connecting with someone else.')
  }
}

export async function createPairingInvite({ db, userId, displayName, avatar, origin, sessionPreset = 'quick' }) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const coupleRef = doc(collection(db, 'couples'))
    const code = createInviteCode()
    const inviteRef = doc(db, 'coupleInvites', code)
    try {
      await runTransaction(db, async (transaction) => {
        await assertUnlinked(transaction, db, userId)
        const invite = await transaction.get(inviteRef)
        if (invite.exists()) throw new Error('invite-code-collision')
        const payload = buildCreateCouplePayload({ userId, displayName, avatar, origin, inviteCode: code, sessionPreset, isPublic: false })
        transaction.set(coupleRef, { ...payload, commitments: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
        transaction.set(inviteRef, { coupleId: coupleRef.id, hostId: userId, hostName: payload.players[0].displayName, hostAvatar: payload.players[0].avatar, createdAt: serverTimestamp() })
        transaction.set(doc(db, 'playerCouples', userId), { coupleId: coupleRef.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      })
      return coupleRef.id
    } catch (error) {
      if (error.message !== 'invite-code-collision') throw error
    }
  }
  throw new Error('Could not create an invitation. Please try again.')
}

// Enrich old invitations when their owner returns; no account/history migration.
export async function refreshPairingInvite({ db, couple, userId }) {
  if (couple?.playerIds?.[0] !== userId || couple.playerIds.length !== 1) return
  const inviteRef = doc(db, 'coupleInvites', couple.inviteCode)
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(inviteRef)
    if (!snapshot.exists() || snapshot.data().hostId) return
    transaction.update(inviteRef, { hostId: userId })
  })
}

export async function acceptPairingInvite({ db, userId, displayName, avatar, code }) {
  const normalized = normalizeInviteCode(code)
  if (normalized.length !== 6) throw new Error('Enter the six-character code.')
  const inviteRef = doc(db, 'coupleInvites', normalized)
  return runTransaction(db, async (transaction) => {
    await assertUnlinked(transaction, db, userId)
    const snapshot = await transaction.get(inviteRef)
    if (!snapshot.exists()) throw new Error('This invitation has already been used or cancelled.')
    const invite = snapshot.data()
    if (!invite.hostId) throw new Error('Ask your person to open their invitation once, then try again.')
    if (invite.hostId === userId) throw new Error('This is your own invitation.')
    const publicRef = doc(db, 'publicLobbies', invite.coupleId)
    const publicSnapshot = await transaction.get(publicRef)
    const host = { uid: invite.hostId, displayName: invite.hostName, ...PLAYER_THEMES[0], avatar: resolvePlayerAvatar(invite.hostAvatar) }
    const guest = { uid: userId, displayName: displayName.trim(), ...PLAYER_THEMES[1], avatar: resolvePlayerAvatar(avatar) }
    transaction.update(doc(db, 'couples', invite.coupleId), { playerIds: [host.uid, userId], players: [host, guest], status: 'paired', updatedAt: serverTimestamp() })
    transaction.set(doc(db, 'playerCouples', userId), { coupleId: invite.coupleId, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    transaction.delete(inviteRef)
    transaction.set(doc(db, 'pairingMoments', momentId(invite.coupleId, 'connected')), momentPayload({ id: invite.coupleId, players: [host, guest] }, 'connected'))
    if (publicSnapshot.exists()) transaction.delete(publicRef)
    return invite.coupleId
  })
}

export async function commitPairing({ db, coupleId, userId, email, emailVerified }) {
  if (!emailVerified || !email) throw new Error('Verify your email before making this permanent commitment.')
  const ref = doc(db, 'couples', coupleId)
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) throw new Error('This connection is unavailable.')
    const couple = { id: snapshot.id, ...snapshot.data() }
    if (couple.status !== 'paired' || !couple.playerIds.includes(userId)) throw new Error('Connect with your person first.')
    const commitments = couple.commitments || []
    if (commitments.includes(userId)) return
    const commitmentEmails = { ...couple.commitmentEmails, [userId]: email.trim().toLowerCase() }
    const next = [...commitments, userId]
    const finishing = next.length === 2
    const lockUids = finishing ? couple.playerIds : [userId]
    for (const uid of lockUids) {
      const lock = await transaction.get(doc(db, 'pairingLocks', emailLockKey(commitmentEmails[uid])))
      if (lock.exists() && lock.data().coupleId !== coupleId) throw new Error('This email already has a permanent commitment.')
    }
    transaction.update(ref, { commitments: next, commitmentEmails, ...(finishing ? { committedAt: serverTimestamp() } : {}), updatedAt: serverTimestamp() })
    if (finishing) {
      for (const uid of couple.playerIds) transaction.set(doc(db, 'pairingLocks', emailLockKey(commitmentEmails[uid])), { coupleId, uid, email: commitmentEmails[uid], createdAt: serverTimestamp() })
      transaction.set(doc(db, 'pairingMoments', momentId(coupleId, 'committed')), momentPayload(couple, 'committed'))
    }
  })
}

export async function unpairAccounts({ db, coupleId, userId }) {
  const ref = doc(db, 'couples', coupleId)
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists() || !snapshot.data().playerIds.includes(userId)) throw new Error('This connection is unavailable.')
    const couple = snapshot.data()
    if (hasCommitted(couple)) throw new Error('This commitment is permanent and cannot be undone.')
    const inviteRef = doc(db, 'coupleInvites', couple.inviteCode)
    const publicRef = doc(db, 'publicLobbies', coupleId)
    const invite = await transaction.get(inviteRef)
    const publicLobby = await transaction.get(publicRef)
    transaction.update(ref, { status: 'unpaired', activeSessionId: null, visibility: 'private', updatedAt: serverTimestamp() })
    transaction.delete(doc(db, 'playerCouples', userId))
    if (invite.exists()) transaction.delete(inviteRef)
    if (publicLobby.exists()) transaction.delete(publicRef)
  })
}

export async function beginPairingNight({ db, coupleId, preset }) {
  const coupleRef = doc(db, 'couples', coupleId)
  const sessionRef = doc(collection(db, 'sessions'))
  try { return await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(coupleRef)
    if (!snapshot.exists() || snapshot.data().status !== 'paired') throw new Error('Connect with your person first.')
    const couple = { id: snapshot.id, ...snapshot.data() }
    if (couple.activeSessionId) {
      const previous = await transaction.get(doc(db, 'sessions', couple.activeSessionId))
      if (previous.exists() && previous.data().status === 'active') return previous.id
    }
    const sessionPreset = getSessionPreset(preset).id
    transaction.set(sessionRef, { ...buildInitialSession({ ...couple, sessionPreset }), lastActionAt: serverTimestamp(), startedAt: serverTimestamp(), status: 'active', createdAt: serverTimestamp(), endedAt: null, updatedAt: serverTimestamp() })
    transaction.update(coupleRef, { activeSessionId: sessionRef.id, sessionPreset, updatedAt: serverTimestamp() })
    return sessionRef.id
  }) } catch (error) {
    // A second starter can lose the race at rules evaluation before the SDK
    // retries its transaction. Reuse the winning active night, never create two.
    if (error.code === 'permission-denied' || error.code === 'aborted') {
      const current = await getDoc(coupleRef)
      if (current.exists() && current.data().activeSessionId) {
        const active = await getDoc(doc(db, 'sessions', current.data().activeSessionId))
        if (active.exists() && active.data().status === 'active') return active.id
      }
    }
    throw error
  }
}

export function pairingShareLink(couple, origin) {
  return buildShareLink(origin, couple.inviteCode)
}
