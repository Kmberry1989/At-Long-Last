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

function buildSessionWritePayload(nextSession) {
  const payload = {
    ...nextSession,
    lastActionAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  if (nextSession.status === 'abandoned') {
    payload.endedAt = serverTimestamp()
    return payload
  }

  if (nextSession.phase === 'finale') {
    payload.endedAt = serverTimestamp()
    payload.status = 'completed'
    return payload
  }

  payload.status = 'active'
  return payload
}

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
      lastActionAt: serverTimestamp(),
      startedAt: serverTimestamp(),
      status: 'active',
      createdAt: serverTimestamp(),
      endedAt: null,
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
      onNext(null, snapshot.metadata)
      return
    }

    onNext({ id: snapshot.id, ...snapshot.data() }, snapshot.metadata)
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
      ...buildSessionWritePayload(nextSession),
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
    ...buildSessionWritePayload(nextSession),
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
        ...buildSessionWritePayload(finalizeVibeSetup(session, vibeWeights)),
      })
      return
    }

    transaction.update(sessionRef, {
      lastActionAt: serverTimestamp(),
      status: 'active',
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

export async function claimSessionHost(db, sessionId, userId) {
  await updateDoc(doc(db, 'sessions', sessionId), {
    hostId: userId,
    lastActionAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function abandonSession(db, { coupleId, sessionId }) {
  const coupleRef = doc(db, 'couples', coupleId)
  const sessionRef = doc(db, 'sessions', sessionId)

  await runTransaction(db, async (transaction) => {
    const coupleSnapshot = await transaction.get(coupleRef)

    if (coupleSnapshot.exists() && coupleSnapshot.data().activeSessionId === sessionId) {
      transaction.update(coupleRef, {
        activeSessionId: null,
        updatedAt: serverTimestamp(),
      })
    }

    const sessionSnapshot = await transaction.get(sessionRef)
    if (sessionSnapshot.exists()) {
      transaction.update(sessionRef, {
        endedAt: serverTimestamp(),
        lastActionAt: serverTimestamp(),
        status: 'abandoned',
        updatedAt: serverTimestamp(),
      })
    }
  })
}

export async function getLatestSession(db, sessionId) {
  const snapshot = await getDoc(doc(db, 'sessions', sessionId))
  if (!snapshot.exists()) {
    return null
  }

  return { id: snapshot.id, ...snapshot.data() }
}
