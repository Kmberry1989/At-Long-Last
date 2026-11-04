import { collection, doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore'

export const MAX_NIGHT_KISS_DATA_URI_CHARS = 45_000
export const MAX_NIGHT_KISS_DURATION_MS = 8_000

export function subscribeToNightKisses(db, sessionId, onNext, onError) {
  return onSnapshot(collection(db, 'sessions', sessionId, 'nightKisses'), snapshot => {
    onNext(Object.fromEntries(snapshot.docs.map(record => [record.id, record.data()])))
  }, onError)
}

export async function sendNightKiss(db, sessionId, userId, recording) {
  if (typeof recording?.audioData !== 'string' || recording.audioData.length > MAX_NIGHT_KISS_DATA_URI_CHARS) {
    throw new Error('Keep the voice note short and record it again.')
  }
  if (!/^data:audio\/(webm|mp4|ogg)(;[^,]*)?;base64,/.test(recording.audioData)) {
    throw new Error('This recording format is not supported. Try recording again.')
  }
  if (!/^audio\/(webm|mp4|ogg)(;.*)?$/.test(recording.mimeType || '')) {
    throw new Error('This recording format is not supported. Try recording again.')
  }
  if (!Number.isInteger(recording.durationMs) || recording.durationMs < 400 || recording.durationMs > MAX_NIGHT_KISS_DURATION_MS) {
    throw new Error('Record a short note, up to eight seconds.')
  }

  const sessionRef = doc(db, 'sessions', sessionId)
  const kissRef = doc(db, 'sessions', sessionId, 'nightKisses', userId)
  await runTransaction(db, async transaction => {
    const sessionSnapshot = await transaction.get(sessionRef)
    const kissSnapshot = await transaction.get(kissRef)
    if (!sessionSnapshot.exists()) throw new Error('This night no longer exists.')
    const session = sessionSnapshot.data()
    if (session.status !== 'active' || session.kissBookendVersion !== 1 || !session.players.some(player => player.uid === userId)) {
      throw new Error('This night cannot accept a kiss note.')
    }
    if (kissSnapshot.exists()) throw new Error('Your kiss is already on its way.')
    transaction.set(kissRef, {
      audioData: recording.audioData,
      mimeType: recording.mimeType,
      durationMs: recording.durationMs,
      caughtBy: {},
      sentAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })
}

export async function catchNightKiss(db, sessionId, userId, senderId) {
  if (userId === senderId) throw new Error('Catch your partner’s kiss.')
  const sessionRef = doc(db, 'sessions', sessionId)
  const kissRef = doc(db, 'sessions', sessionId, 'nightKisses', senderId)
  await runTransaction(db, async transaction => {
    const sessionSnapshot = await transaction.get(sessionRef)
    const kissSnapshot = await transaction.get(kissRef)
    if (!sessionSnapshot.exists() || !kissSnapshot.exists()) throw new Error('That kiss has not arrived yet.')
    const session = sessionSnapshot.data()
    const playerIds = session.players.map(player => player.uid)
    if (session.status !== 'active' || session.kissBookendVersion !== 1 || !playerIds.includes(userId) || !playerIds.includes(senderId)) {
      throw new Error('This kiss does not belong to this night.')
    }
    if (kissSnapshot.data().caughtBy?.[userId]) throw new Error('You have already caught this kiss.')
    transaction.update(kissRef, {
      [`caughtBy.${userId}`]: true,
      updatedAt: serverTimestamp(),
    })
  })
}

export function nightKissesCaughtByBothPlayers(kisses, players = []) {
  if (players.length !== 2) return false
  return players.every((sender, index) => Boolean(kisses?.[sender.uid]?.caughtBy?.[players[1 - index].uid]))
}
