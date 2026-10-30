import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore'

export const NIGHT_MILESTONES = [1, 10, 25, 50, 100]
export function momentId(coupleId, kind, nights) { return `${coupleId}_${kind}${kind === 'night' ? `_${nights}` : ''}` }
export function momentPayload(couple, kind, nights) {
  return {
    coupleId: couple.id,
    kind,
    nights: kind === 'night' ? nights : 0,
    names: couple.players.map((player) => player.displayName),
    avatars: couple.players.map((player) => player.avatar),
    createdAt: serverTimestamp(),
  }
}
export function subscribeToMoments(db, coupleId, onNext, onError) {
  return onSnapshot(query(collection(db, 'pairingMoments'), where('coupleId', '==', coupleId)), { includeMetadataChanges: true }, (snapshot) => {
    onNext(snapshot.docs.filter((entry) => !entry.metadata.hasPendingWrites && entry.data().createdAt).map((entry) => ({ id: entry.id, ...entry.data() })).sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0)))
  }, onError)
}
export function subscribeToCelebrationReceipts(db, uid, onNext, onError) {
  return onSnapshot(collection(db, 'profiles', uid, 'celebrationReceipts'), (snapshot) => onNext(new Set(snapshot.docs.map((entry) => entry.id))), onError)
}
export async function acknowledgeMoment(db, uid, id) {
  await setDoc(doc(db, 'profiles', uid, 'celebrationReceipts', id), { seenAt: serverTimestamp() })
}
