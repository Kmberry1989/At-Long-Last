import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { finalizeVibeSetup, buildInitialSession } from './sessionLogic.js'
import {
  averageVibeVotes,
  buildBoardRewardPatch,
  createDefaultBoardState,
} from './sessionWiring.js'

export async function ensureActiveSession(db, couple) {
  if (couple.activeSessionId) {
    return couple.activeSessionId
  }

  const coupleRef = doc(db, 'couples', couple.id)
  const sessionRef = doc(collection(db, 'sessions'))

  await runTransaction(db, async (transaction) => {
    const fresh = await transaction.get(coupleRef)
    if (!fresh.exists()) {
      throw new Error('Couple no longer exists.')
    }

    const current = { id: fresh.id, ...fresh.data() }
    if (current.activeSessionId) {
      return
    }

    transaction.set(sessionRef, {
      ...buildInitialSession(current),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    transaction.update(coupleRef, {
      activeSessionId: sessionRef.id,
      updatedAt: serverTimestamp(),
    })
  })

  return sessionRef.id
}

export function subscribeToSession(db, sessionId, onNext, onError) {
  return onSnapshot(doc(db, 'sessions', sessionId), (snapshot) => {
    if (!snapshot.exists()) {
      onNext(null)
      return
    }

    onNext({ id: snapshot.id, ...snapshot.data() })
  }, onError)
}

export function subscribeToActivity(db, activityId, onNext, onError) {
  return onSnapshot(doc(db, 'activities', activityId), (snapshot) => {
    if (!snapshot.exists()) {
      onNext(null)
      return
    }

    onNext({ id: snapshot.id, ...snapshot.data() })
  }, onError)
}

export function subscribeToJournal(db, coupleId, onNext, onError) {
  const journalQuery = query(
    collection(db, 'journalEntries'),
    where('coupleId', '==', coupleId),
    orderBy('createdAt', 'desc'),
  )

  return onSnapshot(
    journalQuery,
    (snapshot) => {
      const entries = snapshot.docs.map((entry) => ({
        id: entry.id,
        ...entry.data(),
      }))
      onNext(entries)
    },
    onError,
  )
}

export async function createActivityRecord(db, session, activityType, initialState) {
  const activityRef = await addDoc(collection(db, 'activities'), {
    coupleId: session.coupleId,
    createdAt: serverTimestamp(),
    sessionId: session.id,
    state: initialState,
    status: 'in_progress',
    type: activityType,
    updatedAt: serverTimestamp(),
  })

  await updateDoc(doc(db, 'sessions', session.id), {
    pendingActivityId: activityRef.id,
    updatedAt: serverTimestamp(),
  })

  return activityRef.id
}

export async function finalizeActivity({
  activityId,
  activityResult = null,
  db,
  journalEntry,
  nextSession,
  sessionId,
  state,
  status = 'completed',
}) {
  const sessionRef = doc(db, 'sessions', sessionId)
  const activityRef = doc(db, 'activities', activityId)

  await runTransaction(db, async (transaction) => {
    const fresh = await transaction.get(sessionRef)
    if (!fresh.exists()) {
      throw new Error('Session disappeared.')
    }

    transaction.update(activityRef, {
      resolvedAt: serverTimestamp(),
      result: activityResult,
      state,
      status,
      updatedAt: serverTimestamp(),
    })

    transaction.update(sessionRef, {
      ...nextSession,
      updatedAt: serverTimestamp(),
    })
  })

  if (journalEntry) {
    await addDoc(collection(db, 'journalEntries'), {
      ...journalEntry,
      createdAt: serverTimestamp(),
      sessionId,
    })
  }
}

export async function appendJournalEntry(db, payload) {
  await addDoc(collection(db, 'journalEntries'), {
    ...payload,
    createdAt: serverTimestamp(),
  })
}

export async function updateSessionState(db, sessionId, nextSession) {
  await updateDoc(doc(db, 'sessions', sessionId), {
    ...nextSession,
    updatedAt: serverTimestamp(),
  })
}

export async function submitVibeVote(db, sessionId, userId, vote) {
  const sessionRef = doc(db, 'sessions', sessionId)

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(sessionRef)
    if (!snapshot.exists()) {
      throw new Error('Session disappeared.')
    }

    const session = { id: snapshot.id, ...snapshot.data() }
    const vibeVotes = {
      ...session.vibeVotes,
      [userId]: vote,
    }

    if (Object.keys(vibeVotes).length >= session.players.length) {
      const vibeWeights = averageVibeVotes(vibeVotes)
      transaction.update(sessionRef, {
        ...finalizeVibeSetup(session, vibeWeights),
        updatedAt: serverTimestamp(),
      })
      return
    }

    transaction.update(sessionRef, {
      vibeVotes,
      updatedAt: serverTimestamp(),
    })
  })
}

export async function applyCoupleBoardReward(db, coupleId, vibe, rewardId) {
  const coupleRef = doc(db, 'couples', coupleId)

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(coupleRef)
    if (!snapshot.exists()) {
      throw new Error('Couple no longer exists.')
    }

    const couple = snapshot.data()
    const boardState = buildBoardRewardPatch(
      couple.boardState || createDefaultBoardState(),
      vibe,
      rewardId,
    )

    transaction.update(coupleRef, {
      boardState,
      updatedAt: serverTimestamp(),
    })
  })
}

export async function getLatestSession(db, sessionId) {
  const snapshot = await getDoc(doc(db, 'sessions', sessionId))
  if (!snapshot.exists()) {
    return null
  }

  return { id: snapshot.id, ...snapshot.data() }
}
