import { collection, deleteField, doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore'
import { FREE_FRAME_IDS, framePurchase, googlePhotoURL } from './portraitFrames.js'
import { BASE_THEME_CARDS, UNLOCKABLE_THEMES, ensureCoupleProgress, spendableHearts } from './progressService.js'

export function subscribePortraits(db, coupleId, onNext, onError) {
  return onSnapshot(collection(db, 'couplePortraits', coupleId, 'players'), snapshot => {
    onNext(Object.fromEntries(snapshot.docs.map(record => [record.id, record.data()])))
  }, onError)
}

export function subscribePieceStyles(db, coupleId, onNext, onError) {
  return onSnapshot(collection(db, 'couplePortraits', coupleId, 'players'), snapshot => {
    onNext(Object.fromEntries(snapshot.docs.map(record => [record.id, {
      pieceColor: record.data().pieceColor || null,
      pieceMaterial: record.data().pieceMaterial || 'porcelain',
      themeVote: record.data().themeVote || null,
    }])))
  }, onError)
}

export async function saveThemeVote(db, coupleId, uid, partnerUid, themeId) {
  const validThemeIds = [
    'auto',
    ...BASE_THEME_CARDS.map(theme => theme.id),
    ...UNLOCKABLE_THEMES.map(theme => theme.id),
  ]
  if (!validThemeIds.includes(themeId)) throw new Error('Choose a valid board theme.')

  await ensureCoupleProgress(db, coupleId)
  const playerRef = doc(db, 'couplePortraits', coupleId, 'players', uid)
  const partnerRef = doc(db, 'couplePortraits', coupleId, 'players', partnerUid)
  const progressRef = doc(db, 'coupleProgress', coupleId)
  return runTransaction(db, async transaction => {
    const [player, partner, progress] = await Promise.all([
      transaction.get(playerRef), transaction.get(partnerRef), transaction.get(progressRef),
    ])
    const playerData = player.exists() ? player.data() : {
      photoURL: null,
      selectedFrame: 'ribbon',
      ownedFrames: FREE_FRAME_IDS,
    }
    const partnerVote = partner.data()?.themeVote || progress.data()?.selectedTheme || null
    transaction.set(playerRef, { ...playerData, themeVote: themeId, updatedAt: serverTimestamp() })

    if (partnerVote === themeId) {
      transaction.update(progressRef, {
        selectedTheme: themeId === 'auto' ? deleteField() : themeId,
        updatedAt: serverTimestamp(),
      })
    }
    return { agreed: partnerVote === themeId, themeId }
  })
}

export async function savePieceStyle(db, coupleId, uid, style) {
  const ref = doc(db, 'couplePortraits', coupleId, 'players', uid)
  return runTransaction(db, async transaction => {
    const saved = await transaction.get(ref)
    const existing = saved.exists() ? saved.data() : {
      photoURL: null,
      selectedFrame: 'ribbon',
      ownedFrames: FREE_FRAME_IDS,
    }
    transaction.set(ref, {
      ...existing,
      pieceColor: style.color,
      pieceMaterial: style.material,
      updatedAt: serverTimestamp(),
    })
  })
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
  await ensureCoupleProgress(db, coupleId)
  const ref = doc(db, 'couplePortraits', coupleId, 'players', uid)
  const progressRef = doc(db, 'coupleProgress', coupleId)
  return runTransaction(db, async transaction => {
    const [portrait, progress] = await Promise.all([transaction.get(ref), transaction.get(progressRef)])
    const purchase = framePurchase(portrait.data(), frameId, spendableHearts(progress.data()))
    transaction.set(ref, { ...purchase.portrait, updatedAt: serverTimestamp() })
    if (purchase.cost) transaction.update(progressRef, { heartsSpent: progress.data().heartsSpent + purchase.cost, updatedAt: serverTimestamp() })
  })
}
