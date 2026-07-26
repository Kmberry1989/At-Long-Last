import { readFile } from 'node:fs/promises'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  doc,
  getDoc,
  getDocs,
  collection,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  createCoupleDocument,
  joinCoupleByInviteCode,
  leaveCoupleDocument,
} from '../src/features/couple/coupleService.js'
import {
  applyCoupleBoardReward,
  abandonSession,
  ensureActiveSession,
} from '../src/features/session/sessionService.js'

const PROJECT_ID = 'demo-at-long-last'
const HOST_UID = 'host-account'
const GUEST_UID = 'guest-account'
const OUTSIDER_UID = 'outsider-account'

let testEnv

function authedDb(uid) {
  return testEnv.authenticatedContext(uid, {
    email: `${uid}@example.test`,
    email_verified: true,
  }).firestore()
}

async function createRoom(db, userId = HOST_UID) {
  const coupleId = await createCoupleDocument({
    db,
    displayName: userId === HOST_UID ? 'Host' : 'Guest',
    origin: 'http://127.0.0.1:4173',
    sessionPreset: 'quick',
    userId,
  })
  const coupleSnapshot = await getDoc(doc(db, 'couples', coupleId))
  return {
    couple: { id: coupleSnapshot.id, ...coupleSnapshot.data() },
    inviteCode: coupleSnapshot.data().inviteCode,
  }
}

async function createAndJoinRoom() {
  const hostDb = authedDb(HOST_UID)
  const guestDb = authedDb(GUEST_UID)
  const created = await createRoom(hostDb)

  await joinCoupleByInviteCode({
    code: created.inviteCode,
    db: guestDb,
    displayName: 'Guest',
    userId: GUEST_UID,
  })

  const pairedSnapshot = await getDoc(
    doc(hostDb, 'couples', created.couple.id),
  )

  return {
    couple: { id: pairedSnapshot.id, ...pairedSnapshot.data() },
    guestDb,
    hostDb,
    inviteCode: created.inviteCode,
  }
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: process.env.FIRESTORE_EMULATOR_HOST?.split(':')[0],
      port: Number(process.env.FIRESTORE_EMULATOR_HOST?.split(':')[1]),
      rules: await readFile('firestore.rules', 'utf8'),
    },
  })
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

afterAll(async () => {
  await testEnv.cleanup()
})

describe('verified two-account lifecycle', () => {
  it('creates an invite, joins it, starts a shared session, and abandons it', async () => {
    const {
      couple,
      guestDb,
      hostDb,
      inviteCode,
    } = await createAndJoinRoom()

    expect(couple.playerIds).toEqual([HOST_UID, GUEST_UID])
    expect(couple.status).toBe('paired')

    const guestLink = await getDoc(doc(guestDb, 'playerCouples', GUEST_UID))
    expect(guestLink.data().coupleId).toBe(couple.id)
    const closedLobby = await getDoc(
      doc(guestDb, 'publicLobbies', couple.id),
    )
    expect(closedLobby.exists()).toBe(false)

    const sessionId = await ensureActiveSession(hostDb, couple)
    const hostSession = await assertSucceeds(
      getDoc(doc(hostDb, 'sessions', sessionId)),
    )
    const guestSession = await assertSucceeds(
      getDoc(doc(guestDb, 'sessions', sessionId)),
    )

    expect(hostSession.data().coupleId).toBe(couple.id)
    expect(guestSession.data().players.map((player) => player.uid)).toEqual([
      HOST_UID,
      GUEST_UID,
    ])

    await abandonSession(hostDb, {
      coupleId: couple.id,
      sessionId,
    })

    const abandoned = await getDoc(doc(guestDb, 'sessions', sessionId))
    const detachedCouple = await getDoc(doc(guestDb, 'couples', couple.id))
    expect(abandoned.data().status).toBe('abandoned')
    expect(detachedCouple.data().activeSessionId).toBeNull()

    await assertFails(
      updateDoc(doc(guestDb, 'sessions', sessionId), {
        endedAt: null,
        status: 'active',
        updatedAt: serverTimestamp(),
      }),
    )

    const invite = await getDoc(doc(hostDb, 'coupleInvites', inviteCode))
    expect(invite.data().coupleId).toBe(couple.id)
  })
})

describe('couple authorization boundaries', () => {
  it('denies unauthenticated access and invite enumeration', async () => {
    const { couple, hostDb } = await createAndJoinRoom()
    const anonymousDb = testEnv.unauthenticatedContext().firestore()

    await assertFails(getDoc(doc(anonymousDb, 'couples', couple.id)))
    await assertFails(getDocs(collection(anonymousDb, 'publicLobbies')))
    await assertFails(getDocs(collection(hostDb, 'coupleInvites')))
  })

  it('keeps couple data private from authenticated outsiders', async () => {
    const { couple } = await createAndJoinRoom()
    const outsiderDb = authedDb(OUTSIDER_UID)

    await assertFails(getDoc(doc(outsiderDb, 'couples', couple.id)))
  })

  it('rejects participant, invite, and schema hijacking', async () => {
    const { couple, guestDb, hostDb } = await createAndJoinRoom()

    await assertFails(
      updateDoc(doc(guestDb, 'couples', couple.id), {
        playerIds: [HOST_UID, GUEST_UID, OUTSIDER_UID],
        updatedAt: serverTimestamp(),
      }),
    )

    await assertFails(
      updateDoc(doc(hostDb, 'couples', couple.id), {
        inviteCode: 'ZZZZZZ',
        updatedAt: serverTimestamp(),
      }),
    )

    await assertFails(
      updateDoc(doc(hostDb, 'couples', couple.id), {
        extraData: 'schema pollution',
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('rejects self-linking to a couple that does not contain the caller', async () => {
    const { couple } = await createRoom(authedDb(HOST_UID))
    const outsiderDb = authedDb(OUTSIDER_UID)

    await assertFails(
      setDoc(doc(outsiderDb, 'playerCouples', OUTSIDER_UID), {
        coupleId: couple.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('rejects attaching an arbitrary active session id', async () => {
    const { couple, hostDb } = await createAndJoinRoom()

    await assertFails(
      updateDoc(doc(hostDb, 'couples', couple.id), {
        activeSessionId: 'forged-session',
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('allows a real leave transition but rejects replacing the remaining player', async () => {
    const { couple, guestDb, hostDb } = await createAndJoinRoom()

    await assertFails(
      updateDoc(doc(guestDb, 'couples', couple.id), {
        playerIds: [OUTSIDER_UID],
        players: [
          {
            accent: '#2aa1ff',
            avatar: '/assets/players/kyle.glb',
            color: '#59b5ff',
            displayName: 'Outsider',
            uid: OUTSIDER_UID,
          },
        ],
        status: 'waiting',
        updatedAt: serverTimestamp(),
      }),
    )

    await leaveCoupleDocument({
      couple,
      db: guestDb,
      userId: GUEST_UID,
    })

    const waitingCouple = await getDoc(doc(hostDb, 'couples', couple.id))
    const reopenedLobby = await getDoc(
      doc(hostDb, 'publicLobbies', couple.id),
    )
    expect(waitingCouple.data().playerIds).toEqual([HOST_UID])
    expect(waitingCouple.data().status).toBe('waiting')
    expect(reopenedLobby.data().hostId).toBe(HOST_UID)
  })

  it('allows one bounded board reward but rejects a forged jump', async () => {
    const { couple, guestDb, hostDb } = await createAndJoinRoom()

    await applyCoupleBoardReward(
      guestDb,
      couple.id,
      'tender',
      'comfort-menu',
    )

    const rewardedCouple = await getDoc(doc(hostDb, 'couples', couple.id))
    expect(rewardedCouple.data().boardState.tenderStars).toBe(1)

    await assertFails(
      updateDoc(doc(guestDb, 'couples', couple.id), {
        boardState: {
          ...rewardedCouple.data().boardState,
          tenderStars: 100,
        },
        updatedAt: serverTimestamp(),
      }),
    )
  })
})

describe('session lifecycle boundaries', () => {
  it('protects immutable identity and oversized fields', async () => {
    const { couple, guestDb, hostDb } = await createAndJoinRoom()
    const sessionId = await ensureActiveSession(hostDb, couple)

    await assertFails(
      updateDoc(doc(guestDb, 'sessions', sessionId), {
        coupleId: 'another-couple',
        updatedAt: serverTimestamp(),
      }),
    )

    await assertFails(
      updateDoc(doc(hostDb, 'sessions', sessionId), {
        actionText: 'x'.repeat(501),
        updatedAt: serverTimestamp(),
      }),
    )

    await assertFails(
      updateDoc(doc(hostDb, 'sessions', sessionId), {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )

    await assertFails(
      updateDoc(doc(hostDb, 'sessions', sessionId), {
        endedAt: serverTimestamp(),
        phase: 'finale',
        status: 'completed',
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it("does not let one participant replace the other's duel result", async () => {
    const { couple, guestDb, hostDb } = await createAndJoinRoom()
    const sessionId = await ensureActiveSession(hostDb, couple)

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await updateDoc(doc(context.firestore(), 'sessions', sessionId), {
        currentDuel: {
          attempt: 1,
          heartBonus: 3,
          id: 'letterpress-one-word',
        },
        duelResults: {
          [HOST_UID]: {
            excerpt: 'ours',
            highlight: 'locked an answer',
            score: 4,
            time: 2,
            won: true,
          },
        },
        phase: 'duel',
      })
    })

    await assertFails(
      updateDoc(doc(guestDb, 'sessions', sessionId), {
        [`duelResults.${HOST_UID}`]: {
          excerpt: 'forged',
          highlight: 'forged their partner result',
          score: 9999,
          time: 0,
          won: true,
        },
        updatedAt: serverTimestamp(),
      }),
    )

    await assertSucceeds(
      updateDoc(doc(guestDb, 'sessions', sessionId), {
        [`duelResults.${GUEST_UID}`]: {
          excerpt: 'mine',
          highlight: 'locked my answer',
          score: 5,
          time: 1,
          won: true,
        },
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('requires abandon and couple detach to commit together', async () => {
    const { couple, hostDb } = await createAndJoinRoom()
    const sessionId = await ensureActiveSession(hostDb, couple)

    await assertFails(
      updateDoc(doc(hostDb, 'sessions', sessionId), {
        endedAt: serverTimestamp(),
        lastActionAt: serverTimestamp(),
        status: 'abandoned',
        updatedAt: serverTimestamp(),
      }),
    )

    await assertFails(
      updateDoc(doc(hostDb, 'couples', couple.id), {
        activeSessionId: null,
        updatedAt: serverTimestamp(),
      }),
    )

    await assertSucceeds(
      runTransaction(hostDb, async (transaction) => {
        transaction.update(doc(hostDb, 'couples', couple.id), {
          activeSessionId: null,
          updatedAt: serverTimestamp(),
        })
        transaction.update(doc(hostDb, 'sessions', sessionId), {
          endedAt: serverTimestamp(),
          lastActionAt: serverTimestamp(),
          status: 'abandoned',
          updatedAt: serverTimestamp(),
        })
      }),
    )
  })
})
