import { readFile } from 'node:fs/promises'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  addDoc,
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
  createActivityRecord,
  ensureActiveSession,
} from '../src/features/session/sessionService.js'

const PROJECT_ID = 'demo-at-long-last'
const HOST_UID = 'host-account'
const GUEST_UID = 'guest-account'
const OUTSIDER_UID = 'outsider-account'
const LEGACY_SESSION_ID = 'legacy-session'

let testEnv

function authedDb(uid) {
  return testEnv.authenticatedContext(uid, {
    email: `${uid}@example.test`,
    email_verified: true,
  }).firestore()
}

async function createRoom(db, userId = HOST_UID) {
  const coupleId = await createCoupleDocument({
    avatar: userId === HOST_UID
      ? '/assets/players/owl.glb'
      : '/assets/players/rabbit.glb',
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
    avatar: '/assets/players/rabbit.glb',
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

async function seedLegacyActiveSession() {
  const hostDb = authedDb(HOST_UID)
  const guestDb = authedDb(GUEST_UID)
  const coupleId = 'legacy-couple'
  const createdAt = new Date('2026-07-18T07:08:56.546Z')
  const startedAt = new Date('2026-07-18T07:15:16.810Z')
  const players = [
    {
      accent: '#ff5478',
      avatar: '/assets/players/heart.glb',
      color: '#ff7a97',
      displayName: 'Host',
      uid: HOST_UID,
    },
    {
      accent: '#2aa1ff',
      avatar: '/assets/players/globe-classic.glb',
      color: '#59b5ff',
      displayName: 'Guest',
      uid: GUEST_UID,
    },
  ]

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore()
    await setDoc(doc(adminDb, 'couples', coupleId), {
      activeSessionId: LEGACY_SESSION_ID,
      boardState: {
        playfulStickerIds: [],
        spicyGlowLevel: 0,
        tenderStars: 0,
      },
      createdAt,
      inviteCode: 'ABC234',
      playerIds: [HOST_UID, GUEST_UID],
      players,
      sessionPreset: 'quick',
      shareLink: 'https://example.test/?code=ABC234',
      status: 'paired',
      updatedAt: createdAt,
    })
    await setDoc(doc(adminDb, 'sessions', LEGACY_SESSION_ID), {
      actionText: 'Set the vibe together before the first roll.',
      activePlayerIndex: 0,
      coupleId,
      createdAt: startedAt,
      currentDuel: null,
      duelResults: {},
      endedAt: null,
      goals: ['Reach round 4', 'Save one keepsake'],
      hearts: 6,
      hostId: HOST_UID,
      keepsakes: [],
      lastActionAt: startedAt,
      lastDuelOutcome: null,
      lastMove: null,
      lastRoll: null,
      pendingActivityId: null,
      pendingActivityType: null,
      pendingKeepsake: null,
      phase: 'vibeSetup',
      players,
      positions: [0, 0],
      preset: 'quick',
      round: 1,
      roundDuelBonus: 0,
      startedAt,
      startingPlayerIndex: 0,
      status: 'active',
      totalRounds: 4,
      turnsTakenThisRound: 0,
      updatedAt: startedAt,
      usedActivityIds: [],
      usedDuelIds: [],
      vibeVotes: {},
      vibeWeights: null,
    })
  })

  return { coupleId, guestDb, hostDb }
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
  it('allows the three connection games only inside the couple session', async () => {
    const { couple, hostDb } = await createAndJoinRoom()
    const sessionId = await ensureActiveSession(hostDb, couple)
    const sessionSnapshot = await getDoc(doc(hostDb, 'sessions', sessionId))
    const session = { id: sessionSnapshot.id, ...sessionSnapshot.data() }

    for (const activityType of [
      'mind-meld',
      'prediction-box',
      'the-vault',
      'vibe-check',
      'tempo-tap',
      'word-weaver',
    ]) {
      const activityId = await assertSucceeds(
        createActivityRecord(
          hostDb,
          session,
          activityType,
          {
            activityId: activityType,
            prompt: 'A bounded connection-game prompt.',
            turnIndex: 0,
          },
        ),
      )
      const activitySnapshot = await getDoc(
        doc(hostDb, 'activities', activityId),
      )
      expect(activitySnapshot.data().type).toBe(activityType)
    }

    const outsiderDb = authedDb(OUTSIDER_UID)
    await assertFails(
      addDoc(collection(outsiderDb, 'activities'), {
        coupleId: couple.id,
        createdAt: serverTimestamp(),
        sessionId,
        state: {
          activityId: 'mind-meld',
          prompt: 'Forged prompt.',
          turnIndex: 0,
        },
        status: 'in_progress',
        type: 'mind-meld',
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('creates an invite, joins it, starts a shared session, and abandons it', async () => {
    const {
      couple,
      guestDb,
      hostDb,
      inviteCode,
    } = await createAndJoinRoom()

    expect(couple.playerIds).toEqual([HOST_UID, GUEST_UID])
    expect(couple.players.map((player) => player.avatar)).toEqual([
      '/assets/players/owl.glb',
      '/assets/players/rabbit.glb',
    ])
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
            avatar: '/assets/players/owl.glb',
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

  it('allows the final participant to remove the reopened waiting room', async () => {
    const { couple, guestDb, hostDb } = await createAndJoinRoom()
    const sessionId = await ensureActiveSession(hostDb, couple)

    await abandonSession(guestDb, {
      coupleId: couple.id,
      sessionId,
    })
    const detached = await getDoc(doc(hostDb, 'couples', couple.id))
    await leaveCoupleDocument({
      couple: { id: detached.id, ...detached.data() },
      db: guestDb,
      userId: GUEST_UID,
    })
    const waiting = await getDoc(doc(hostDb, 'couples', couple.id))

    await assertSucceeds(
      leaveCoupleDocument({
        couple: { id: waiting.id, ...waiting.data() },
        db: hostDb,
        userId: HOST_UID,
      }),
    )

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore()
      expect((await getDoc(doc(adminDb, 'couples', couple.id))).exists()).toBe(false)
      expect((await getDoc(doc(adminDb, 'playerCouples', HOST_UID))).exists()).toBe(false)
      expect((await getDoc(doc(adminDb, 'coupleInvites', couple.inviteCode))).exists()).toBe(false)
      expect((await getDoc(doc(adminDb, 'publicLobbies', couple.id))).exists()).toBe(false)
    })
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
  it('allows a participant to atomically abandon a pre-arc legacy session', async () => {
    const { coupleId, guestDb } = await seedLegacyActiveSession()

    await assertSucceeds(
      abandonSession(guestDb, {
        coupleId,
        sessionId: LEGACY_SESSION_ID,
      }),
    )

    const abandoned = await getDoc(
      doc(guestDb, 'sessions', LEGACY_SESSION_ID),
    )
    const detachedCouple = await getDoc(doc(guestDb, 'couples', coupleId))
    expect(abandoned.data().status).toBe('abandoned')
    expect(detachedCouple.data().activeSessionId).toBeNull()

    await assertFails(
      updateDoc(doc(guestDb, 'sessions', LEGACY_SESSION_ID), {
        endedAt: null,
        status: 'active',
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('denies one-sided, outsider, and field-smuggling legacy cleanup', async () => {
    const { coupleId, guestDb, hostDb } = await seedLegacyActiveSession()
    const outsiderDb = authedDb(OUTSIDER_UID)

    await assertFails(
      updateDoc(doc(hostDb, 'sessions', LEGACY_SESSION_ID), {
        endedAt: serverTimestamp(),
        lastActionAt: serverTimestamp(),
        status: 'abandoned',
        updatedAt: serverTimestamp(),
      }),
    )

    await assertFails(
      abandonSession(outsiderDb, {
        coupleId,
        sessionId: LEGACY_SESSION_ID,
      }),
    )

    await assertFails(
      runTransaction(guestDb, async (transaction) => {
        const coupleRef = doc(guestDb, 'couples', coupleId)
        const sessionRef = doc(guestDb, 'sessions', LEGACY_SESSION_ID)
        await Promise.all([
          transaction.get(coupleRef),
          transaction.get(sessionRef),
        ])
        transaction.update(coupleRef, {
          activeSessionId: null,
          updatedAt: serverTimestamp(),
        })
        transaction.update(sessionRef, {
          endedAt: serverTimestamp(),
          extraData: 'schema pollution',
          lastActionAt: serverTimestamp(),
          status: 'abandoned',
          updatedAt: serverTimestamp(),
        })
      }),
    )

    await assertFails(
      runTransaction(guestDb, async (transaction) => {
        const coupleRef = doc(guestDb, 'couples', coupleId)
        const sessionRef = doc(guestDb, 'sessions', LEGACY_SESSION_ID)
        await Promise.all([
          transaction.get(coupleRef),
          transaction.get(sessionRef),
        ])
        transaction.update(coupleRef, {
          activeSessionId: null,
          inviteCode: 'ZZZZZZ',
          updatedAt: serverTimestamp(),
        })
        transaction.update(sessionRef, {
          endedAt: serverTimestamp(),
          lastActionAt: serverTimestamp(),
          status: 'abandoned',
          updatedAt: serverTimestamp(),
        })
      }),
    )
  })

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
