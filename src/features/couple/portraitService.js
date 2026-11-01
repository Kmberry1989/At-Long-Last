import { collection, doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore'
import { FREE_FRAME_IDS, framePurchase, googlePhotoURL } from './portraitFrames.js'
import { spendableHearts } from './progressService.js'

export function subscribePortraits(db, coupleId, onNext, onError) {
  return onSnapshot(collection(db, 'couplePortraits', coupleId, 'players'), snapshot => {
    onNext(Object.fromEntries(snapshot.docs.map(record => [record.id, record.data()])))
  }, onError)
}

export async function syncGooglePortrait(db, coupleId, user) {
  const ref = doc(db, 'couplePortraits', coupleId, 'players', user.uid)
  const photoURL = googlePhotoURL(user.photoURL)
  return runTransaction(db, async transaction => {
    const saved = await transaction.get(ref)
    if (saved.exists() && saved.data().photoURL === photoURL) return
    transaction.set(ref, { ...(saved.exists() ? saved.data() : { selectedFrame: 'ribbon', ownedFrames: FREE_FRAME_IDS }), photoURL, updatedAt: serverTimestamp() })
  })
}

export async function selectPortraitFrame(db, coupleId, uid, frameId) {
  const ref = doc(db, 'couplePortraits', coupleId, 'players', uid)
  const progressRef = doc(db, 'coupleProgress', coupleId)
  return runTransaction(db, async transaction => {
    const [portrait, progress] = await Promise.all([transaction.get(ref), transaction.get(progressRef)])
    const purchase = framePurchase(portrait.data(), frameId, spendableHearts(progress.data()))
    transaction.set(ref, { ...purchase.portrait, updatedAt: serverTimestamp() })
    if (purchase.cost) transaction.update(progressRef, { heartsSpent: progress.data().heartsSpent + purchase.cost, updatedAt: serverTimestamp() })
  })
}
