import { collection, doc, onSnapshot, query, runTransaction, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { buildCreateCouplePayload, createInviteCode } from './coupleService.js'
import { PLAYER_THEMES, resolvePlayerAvatar } from './playerAvatar.js'
import { momentId, momentPayload } from './milestoneService.js'

export function normalizePartnerEmail(value = '') { return value.trim().toLowerCase() }
export function validPartnerEmail(value) { return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) }
function requireVerified(email, verified) {
  if (!email || !verified) throw new Error('Verify your email before inviting or accepting your person.')
}

export async function sendEmailInvitation({ db, userId, email, emailVerified, recipientEmail, displayName, avatar, origin }) {
  requireVerified(email, emailVerified)
  const recipient = normalizePartnerEmail(recipientEmail)
  const sender = normalizePartnerEmail(email)
  if (!validPartnerEmail(recipient)) throw new Error('Enter your person’s email address.')
  if (recipient === sender) throw new Error('Enter your person’s email, rather than your own.')
  const freshRef = doc(collection(db, 'couples'))
  return runTransaction(db, async (transaction) => {
    const linkRef = doc(db, 'playerCouples', userId)
    const link = await transaction.get(linkRef)
    const previous = link.exists() ? await transaction.get(doc(db, 'couples', link.data().coupleId)) : null
    const waiting = previous?.exists() && previous.data().status === 'waiting' && previous.data().playerIds[0] === userId
    if (previous?.exists() && previous.data().status !== 'unpaired' && !waiting) throw new Error('You are already connected to your person.')
    const coupleRef = waiting ? previous.ref : freshRef
    const inviteRef = doc(db, 'emailInvitations', coupleRef.id)
    const oldInvite = waiting ? await transaction.get(inviteRef) : null
    if (oldInvite?.exists()) throw new Error('Cancel your current invitation before inviting someone else.')
    const payload = waiting ? previous.data() : buildCreateCouplePayload({ userId, displayName, avatar, origin, inviteCode: createInviteCode(), sessionPreset: 'quick', isPublic: false })
    const legacyRef = waiting ? doc(db, 'coupleInvites', payload.inviteCode) : null
    const legacy = legacyRef ? await transaction.get(legacyRef) : null
    if (!waiting) {
      transaction.set(coupleRef, { ...payload, commitments: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      transaction.set(linkRef, { coupleId: coupleRef.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    }
    transaction.set(inviteRef, {
      senderId: userId, senderEmail: sender, senderName: payload.players[0].displayName,
      senderAvatar: payload.players[0].avatar, recipientEmail: recipient, status: 'pending',
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    })
    if (legacy?.exists()) transaction.delete(legacyRef)
    return coupleRef.id
  })
}

export function subscribeToEmailInvitations(db, email, onNext, onError) {
  return onSnapshot(query(collection(db, 'emailInvitations'), where('recipientEmail', '==', normalizePartnerEmail(email))), (snapshot) => {
    onNext(snapshot.docs.filter((entry) => entry.data().status === 'pending' && !entry.metadata.hasPendingWrites).map((entry) => ({ id: entry.id, ...entry.data() })))
  }, onError)
}
export function subscribeToSentInvitation(db, coupleId, onNext, onError) {
  return onSnapshot(doc(db, 'emailInvitations', coupleId), (snapshot) => onNext(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null), onError)
}
export async function acceptEmailInvitation({ db, invitationId, userId, email, emailVerified, displayName, avatar }) {
  requireVerified(email, emailVerified)
  return runTransaction(db, async (transaction) => {
    const linkRef = doc(db, 'playerCouples', userId)
    const link = await transaction.get(linkRef)
    if (link.exists()) {
      const existing = await transaction.get(doc(db, 'couples', link.data().coupleId))
      if (existing.exists() && existing.data().status !== 'unpaired') throw new Error('Cancel your pending invitation before accepting this one.')
    }
    const inviteRef = doc(db, 'emailInvitations', invitationId)
    const snapshot = await transaction.get(inviteRef)
    if (!snapshot.exists() || snapshot.data().status !== 'pending') throw new Error('This invitation is no longer available.')
    const invite = snapshot.data()
    if (invite.recipientEmail !== normalizePartnerEmail(email) || invite.senderId === userId) throw new Error('This invitation belongs to a different email address.')
    const players = [
      { uid: invite.senderId, displayName: invite.senderName, avatar: invite.senderAvatar, ...PLAYER_THEMES[0] },
      { uid: userId, displayName: displayName.trim(), avatar: resolvePlayerAvatar(avatar), ...PLAYER_THEMES[1] },
    ]
    transaction.update(doc(db, 'couples', invitationId), { playerIds: players.map((player) => player.uid), players, status: 'paired', updatedAt: serverTimestamp() })
    transaction.set(linkRef, { coupleId: invitationId, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    transaction.delete(inviteRef)
    transaction.set(doc(db, 'pairingMoments', momentId(invitationId, 'connected')), momentPayload({ id: invitationId, players }, 'connected'))
    return invitationId
  })
}
export async function declineEmailInvitation({ db, invitationId }) {
  await updateDoc(doc(db, 'emailInvitations', invitationId), { status: 'declined', updatedAt: serverTimestamp() })
}
