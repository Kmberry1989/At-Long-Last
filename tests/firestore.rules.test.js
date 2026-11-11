import { beginPairingNight } from '../src/features/couple/pairingService.js'
import { runNightCommand } from '../src/features/session/independentNightService.js'
import { catchNightKiss, nightKissesCaughtByBothPlayers, sendNightKiss } from '../src/features/session/nightKissService.js'
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
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
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
  finalizeActivity,
  skipSessionOpeningSetup,
  updateSessionStateWithJournal,
} from '../src/features/session/sessionService.js'
import { activityRegistry } from '../src/features/session/activityRegistry.jsx'
import { applyCoupleArcadeAction, createCoupleArcadeState, prepareCoupleArcade, resetCoupleArcade, runCoupleArcadeAction } from '../src/features/couple/coupleArcadeService.js'
import { ensureProfileDocument } from '../src/features/couple/profileService.js'
import { resolveKeepsakeDecision } from '../src/features/session/sessionLogic.js'
import { KEEPSAKES } from '../src/features/session/boardConfig.js'
import { dropConnectFourMove, pickFlower, waterFlower } from '../src/features/couple/progressService.js'

const PROJECT_ID = process.env.RULES_TEST_PROJECT || 'demo-at-long-last'
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

async function resolvePlayerRoll(db, sessionId, uid, round, ownerIndex) {
  const stepRef = doc(db, 'sessions', sessionId, 'steps', `roll-${round}-${ownerIndex}`)
  let step = (await getDoc(stepRef)).data()
  if (step.state.momentPending) {
    await runNightCommand(db, sessionId, uid, { kind: 'submit', stepId: stepRef.id, input: { flipMoment: true } })
    step = (await getDoc(stepRef)).data()
  }
  if (step.state.momentCard) {
    await runNightCommand(db, sessionId, uid, { kind: 'submit', stepId: stepRef.id, input: { resolveMoment: true } })
    step = (await getDoc(stepRef)).data()
  }
  if (step.kind === 'activity') await runNightCommand(db, sessionId, uid, { kind: 'submit', stepId: stepRef.id, input: { skip: true } })
  if (step.kind === 'keepsake') await runNightCommand(db, sessionId, uid, { kind: 'submit', stepId: stepRef.id, input: { collect: true } })
}

const testKissRecording = { audioData: `data:audio/webm;base64,${'A'.repeat(64)}`, mimeType: 'audio/webm;codecs=opus', durationMs: 1200 }
async function sendNightKisses(hostDb, guestDb, sessionId) {
  await sendNightKiss(hostDb, sessionId, HOST_UID, testKissRecording)
  await sendNightKiss(guestDb, sessionId, GUEST_UID, testKissRecording)
}
async function catchNightKisses(hostDb, guestDb, sessionId) {
  await catchNightKiss(hostDb, sessionId, HOST_UID, GUEST_UID)
  await catchNightKiss(guestDb, sessionId, GUEST_UID, HOST_UID)
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

describe('Our Bloom collection rules', () => {
  it('lets both partners water and collect a bloom while rejecting forged collection order', async () => {
    const { couple, guestDb, hostDb } = await createAndJoinRoom()
    const ref = doc(hostDb, 'coupleProgress', couple.id)
    await waterFlower(hostDb, couple.id, { dateStr: '2026-10-31', uid: HOST_UID })
    await waterFlower(guestDb, couple.id, { dateStr: '2026-10-31', uid: GUEST_UID })
    const first = (await getDoc(ref)).data().flower
    expect(first).toMatchObject({ collected: [], growth: 1, speciesIndex: 0, stage: 1 })

    await assertFails(updateDoc(ref, { flower: { ...first, collected: ['rose'], speciesIndex: 1 }, updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(ref, { flower: { ...first, wateredBy: [OUTSIDER_UID] }, updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(ref, { flower: { ...first, growth: 6, stage: 1 }, updatedAt: serverTimestamp() }))

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await updateDoc(doc(context.firestore(), 'coupleProgress', couple.id), { flower: { ...first, growth: 6, stage: 3 } })
    })
    const picked = await pickFlower(hostDb, couple.id)
    expect(picked.events).toEqual([{ type: 'flower-picked', speciesId: 'daisy' }])
    expect((await getDoc(ref)).data().flower).toMatchObject({ collected: ['daisy'], growth: 0, speciesIndex: 1, stage: 0 })
  })
})

describe('Connect Four night-finale rules', () => {
  it('persists a legal drop, rejects duplicate and out-of-turn moves, then alternates next night', async () => {
    const { couple, hostDb, guestDb } = await createAndJoinRoom()
    await expect(dropConnectFourMove(guestDb, couple.id, GUEST_UID, 'move-two', 2, 'moon')).rejects.toThrow(/partner’s turn/i)

    const first = await dropConnectFourMove(hostDb, couple.id, HOST_UID, 'move-one', 2, 'garnet')
    expect(first.state.lastMove).toMatchObject({ column: 2, playerUid: HOST_UID, row: 0, sessionId: 'move-one' })
    expect((await getDoc(doc(guestDb, 'coupleProgress', couple.id))).data().connectFour.board[2]).toBe(0)
    await expect(dropConnectFourMove(guestDb, couple.id, GUEST_UID, 'locked-token', 3, 'leaf')).rejects.toThrow(/not been unlocked/i)
    await expect(dropConnectFourMove(hostDb, couple.id, HOST_UID, 'move-one', 3, 'garnet')).rejects.toThrow(/already been played/i)

    const next = await dropConnectFourMove(guestDb, couple.id, GUEST_UID, 'move-two', 2, 'moon')
    expect(next.state.lastMove).toMatchObject({ column: 2, playerUid: GUEST_UID, row: 1, sessionId: 'move-two' })
  })
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

afterAll(async () => {
  await testEnv?.cleanup()
})

describe('verified two-account lifecycle', () => {
  it('accepts either coin-toss result as the first active player', async () => {
    const { couple, hostDb } = await createAndJoinRoom()
    const random = vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation(value => { value[0] = 0xc0000000; return value })
    let sessionId
    try { sessionId = await ensureActiveSession(hostDb, couple) }
    finally { random.mockRestore() }
    const saved = (await getDoc(doc(hostDb, 'sessions', sessionId))).data()
    expect(saved.startingPlayerIndex).toBe(1)
    expect(saved.activePlayerIndex).toBe(1)
  })

  it('stores a free keepsake draw and its page atomically without spending hearts', async () => {
    const { couple, hostDb } = await createAndJoinRoom()
    const sessionId = await ensureActiveSession(hostDb, couple)
    await updateDoc(doc(hostDb, 'sessions', sessionId), { phase: 'keepsake', pendingKeepsake: KEEPSAKES[0], updatedAt: serverTimestamp() })
    const snapshot = await getDoc(doc(hostDb, 'sessions', sessionId))
    const session = { id: snapshot.id, ...snapshot.data() }
    const next = resolveKeepsakeDecision(session, true)
    const page = { coupleId: couple.id, payload: KEEPSAKES[0], summary: 'A keepsake for us.', text: KEEPSAKES[0].blurb, title: KEEPSAKES[0].label, type: 'keepsake', vibe: 'tender' }
    await updateSessionStateWithJournal(hostDb, sessionId, next, [page], 'keepsake')
    await updateSessionStateWithJournal(hostDb, sessionId, next, [page], 'keepsake')
    const saved = (await getDoc(doc(hostDb, 'sessions', sessionId))).data()
    expect(saved.hearts).toBe(6)
    const pages = await getDocs(query(collection(hostDb, 'journalEntries'), where('coupleId', '==', couple.id)))
    expect(pages.size).toBe(1)
    expect(pages.docs[0].data().sessionId).toBe(sessionId)
  })

  it('starts another night without rewriting the completed session', async () => {
    const { couple, hostDb } = await createAndJoinRoom()
    const oldId = await ensureActiveSession(hostDb, couple)
    await testEnv.withSecurityRulesDisabled(async context => {
      await updateDoc(doc(context.firestore(), 'sessions', oldId), { status: 'completed', phase: 'finale', endedAt: serverTimestamp() })
    })
    await abandonSession(hostDb, { coupleId: couple.id, sessionId: oldId })
    expect((await getDoc(doc(hostDb, 'sessions', oldId))).data().status).toBe('completed')
    const freshId = await ensureActiveSession(hostDb, { ...couple, activeSessionId: null })
    expect(freshId).not.toBe(oldId)
    expect((await getDoc(doc(hostDb, 'couples', couple.id))).data().activeSessionId).toBe(freshId)
  })
  it('records login checks once a day while preserving profile creation time', async () => {
    const db = authedDb(HOST_UID)
    const user = { uid: HOST_UID, displayName: 'Host', email: `${HOST_UID}@example.test` }
    await ensureProfileDocument({ db, user })
    const first = (await getDoc(doc(db, 'profiles', HOST_UID))).data()
    await ensureProfileDocument({ db, user })
    const second = (await getDoc(doc(db, 'profiles', HOST_UID))).data()
    expect(second.createdAt.isEqual(first.createdAt)).toBe(true)
    expect(second.loginStreak).toEqual(first.loginStreak)
    expect(second.loginStreak.dayCount).toBe(1)
    await assertFails(updateDoc(doc(authedDb(GUEST_UID), 'profiles', HOST_UID), { loginStreak: second.loginStreak }))
  })
  it('starts a new night on the board without mood or vibe votes', async () => {
    const { couple, guestDb, hostDb } = await createAndJoinRoom()
    const sessionId = await ensureActiveSession(hostDb, couple)

    const sessionSnapshot = await getDoc(doc(guestDb, 'sessions', sessionId))
    expect(sessionSnapshot.data()).toMatchObject({
      phase: 'turn',
      vibeVotes: {},
      moodVotes: {},
      vibeWeights: {
        playful: 0.3,
        spicy: 0.2,
        tender: 0.5,
      },
    })
    expect(sessionSnapshot.data()).not.toHaveProperty('id')

    const journalSnapshot = await getDocs(query(
      collection(guestDb, 'journalEntries'),
      where('coupleId', '==', couple.id),
    ))
    expect(journalSnapshot.docs).toHaveLength(0)
  })

  it('lets either partner move an active setup night to the board without a vote', async () => {
    const { guestDb, hostDb } = await seedLegacyActiveSession()

    await assertSucceeds(skipSessionOpeningSetup(guestDb, LEGACY_SESSION_ID))
    const sessionSnapshot = await getDoc(doc(hostDb, 'sessions', LEGACY_SESSION_ID))
    expect(sessionSnapshot.data()).toMatchObject({
      phase: 'turn',
      moodVotes: {},
      vibeVotes: {},
      vibeWeights: { playful: 0.3, spicy: 0.2, tender: 0.5 },
    })
  })

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
      'dual-axis-maze',
      'blind-canvas',
      'harmonic-lock',
      'bluff-bidding',
      'photo-flashback',
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

  it('accepts the bounded initial state for every registered activity', async () => {
    const { couple, hostDb } = await createAndJoinRoom()
    const sessionId = await ensureActiveSession(hostDb, couple)
    const sessionSnapshot = await getDoc(doc(hostDb, 'sessions', sessionId))
    const session = { id: sessionSnapshot.id, ...sessionSnapshot.data() }

    for (const activityType of Object.keys(activityRegistry)) {
      const state = activityRegistry[activityType].createInitialState(
        session.players,
        { activePlayerIndex: 0, random: () => 0 },
      )

      await assertSucceeds(
        createActivityRecord(hostDb, session, activityType, state).catch(error => {
          throw new Error(`${activityType}: ${error.message}`)
        }),
      )
    }
  })

  it('commits a completed response and its scrapbook page together', async () => {
    const { couple, guestDb, hostDb } = await createAndJoinRoom()
    const sessionId = await ensureActiveSession(hostDb, couple)

    const sessionSnapshot = await getDoc(doc(hostDb, 'sessions', sessionId))
    const session = { id: sessionSnapshot.id, ...sessionSnapshot.data() }
    const activityState = {
      activityId: 'weather-report',
      entries: [
        { playerIndex: 0, text: 'Cloudy, but clearing.' },
        { playerIndex: 1, text: 'Sunny after lunch.' },
      ],
      prompt: 'What is your internal weather?',
      turnIndex: 0,
    }
    const activityId = await createActivityRecord(
      hostDb,
      session,
      'weather-report',
      activityState,
    )

    await assertSucceeds(finalizeActivity({
      activityId,
      activityResult: {
        payload: activityState,
        savesToJournal: true,
        summary: 'A playful prompt beat was saved.',
        text: 'Host: Cloudy, but clearing.\nGuest: Sunny after lunch.',
        title: 'Weather Report',
        type: 'prompt',
        vibe: 'playful',
      },
      db: hostDb,
      journalEntry: {
        coupleId: couple.id,
        payload: activityState,
        sessionId,
        summary: 'A playful prompt beat was saved.',
        text: 'Host: Cloudy, but clearing.\nGuest: Sunny after lunch.',
        title: 'Weather Report',
        type: 'prompt',
        vibe: 'playful',
      },
      nextSession: {
        ...session,
        pendingActivityId: null,
        pendingActivityType: null,
      },
      sessionId,
      state: activityState,
    }))

    const activitySnapshot = await getDoc(doc(guestDb, 'activities', activityId))
    expect(activitySnapshot.data().status).toBe('completed')

    const journalSnapshot = await getDocs(query(
      collection(guestDb, 'journalEntries'),
      where('coupleId', '==', couple.id),
    ))
    expect(journalSnapshot.docs).toHaveLength(1)
    expect(journalSnapshot.docs.some(
      (entry) => entry.data().title === 'Weather Report',
    )).toBe(true)
  })

  it('rejects mini-game schema expansion and rolls back an oversized scrapbook artifact', async () => {
    const { couple, hostDb } = await createAndJoinRoom()
    const sessionId = await ensureActiveSession(hostDb, couple)
    const sessionSnapshot = await getDoc(doc(hostDb, 'sessions', sessionId))
    const session = { id: sessionSnapshot.id, ...sessionSnapshot.data() }
    const mindMeldState = activityRegistry['mind-meld'].createInitialState(
      session.players,
      { activePlayerIndex: 0, random: () => 0 },
    )
    const mindMeldId = await createActivityRecord(
      hostDb,
      session,
      'mind-meld',
      mindMeldState,
    )

    await assertFails(
      updateDoc(doc(hostDb, 'activities', mindMeldId), {
        state: {
          ...mindMeldState,
          extraData: 'schema pollution',
          extraDataTwo: 'second forged field',
          extraDataThree: 'third forged field',
          extraDataFour: 'fourth forged field',
          extraDataFive: 'fifth forged field',
          extraDataSix: 'sixth forged field',
          extraDataSeven: 'seventh forged field',
          extraDataEight: 'eighth forged field',
          extraDataNine: 'ninth forged field',
          extraDataTen: 'tenth forged field',
        },
        updatedAt: serverTimestamp(),
      }),
    )

    const photoState = activityRegistry['photo-flashback'].createInitialState(
      session.players,
      { activePlayerIndex: 0, random: () => 0 },
    )
    const photoId = await createActivityRecord(
      hostDb,
      session,
      'photo-flashback',
      photoState,
    )
    const oversizedImage = `data:image/webp;base64,${'A'.repeat(350001)}`
    const photoPayload = {
      captions: [
        { label: 'Host', playerIndex: 0, text: 'A saved detail.' },
        { label: 'Guest', playerIndex: 1, text: 'Another saved detail.' },
      ],
      heartBonus: 4,
      imageDataUrl: oversizedImage,
      prompt: photoState.prompt,
      promptId: photoState.promptId,
    }

    await assertFails(finalizeActivity({
      activityId: photoId,
      activityResult: {
        heartBonus: 4,
        label: 'Photo Flashback',
        payload: photoPayload,
        savesToJournal: true,
        summary: 'An oversized photo must not be stored.',
        text: 'Host: A saved detail.\nGuest: Another saved detail.',
        title: 'Photo Flashback',
        type: 'photo',
        vibe: 'tender',
      },
      db: hostDb,
      journalEntry: {
        coupleId: couple.id,
        payload: photoPayload,
        sessionId,
        summary: 'An oversized photo must not be stored.',
        text: 'Host: A saved detail.\nGuest: Another saved detail.',
        title: 'Photo Flashback',
        type: 'photo',
        vibe: 'tender',
      },
      nextSession: {
        ...session,
        pendingActivityId: null,
        pendingActivityType: null,
      },
      sessionId,
      state: photoState,
    }))

    const photoSnapshot = await getDoc(doc(hostDb, 'activities', photoId))
    expect(photoSnapshot.data().status).toBe('in_progress')
    expect(photoSnapshot.data()).not.toHaveProperty('result')
    const journalSnapshot = await getDocs(query(
      collection(hostDb, 'journalEntries'),
      where('coupleId', '==', couple.id),
    ))
    expect(journalSnapshot.docs).toHaveLength(0)
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
    expect(invite.exists()).toBe(false)
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
    expect(reopenedLobby.exists()).toBe(false)
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

    await applyCoupleBoardReward(hostDb, couple.id, 'spicy', 'prediction-box')
    await applyCoupleBoardReward(guestDb, couple.id, 'playful', 'mind-meld')
    await applyCoupleBoardReward(guestDb, couple.id, 'playful', 'mind-meld')
    const decorated = (await getDoc(doc(hostDb, 'couples', couple.id))).data()
    expect(decorated.boardState.spicyGlowLevel).toBe(1)
    expect(decorated.boardState.playfulStickerIds).toHaveLength(1)
    await assertFails(updateDoc(doc(guestDb, 'couples', couple.id), {
      boardState: { ...decorated.boardState, tenderStars: 2 },
      playerIds: [GUEST_UID],
      updatedAt: serverTimestamp(),
    }))

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


describe('independent night two-account transactions', () => {
  it.each(['love-in-the-blanks', 'our-next-line'])('%s accepts private contributions from both partners', async (type) => {
    const { couple, hostDb, guestDb } = await createAndJoinRoom()
    const sessionId = await ensureActiveSession(hostDb, couple)
    const stepRef = doc(hostDb, 'sessions', sessionId, 'steps', 'duel-1')
    await setDoc(stepRef, {
      kind: 'duel', type, round: 1, ownerIndex: -1,
      state: { results: {} }, ready: false, completed: false, skipped: false,
      updatedAt: serverTimestamp(),
    })

    await assertSucceeds(updateDoc(stepRef, {
      state: { results: { '0': { words: ['we', 'found'], answers: { place: 'the seaside' } } } },
      updatedAt: serverTimestamp(),
    }))
    await assertFails(updateDoc(doc(guestDb, 'sessions', sessionId, 'steps', 'duel-1'), {
      state: { results: { '0': { words: ['changed'] } } },
      updatedAt: serverTimestamp(),
    }))
    await assertSucceeds(updateDoc(doc(guestDb, 'sessions', sessionId, 'steps', 'duel-1'), {
      state: { results: {
        '0': { words: ['we', 'found'], answers: { place: 'the seaside' } },
        '1': { words: ['a', 'home'], answers: { place: 'a tiny cafe' } },
      } },
      updatedAt: serverTimestamp(),
    }))
  })

  it('keeps Portrait Panic cue sets private to each writer while allowing independent drawing', async () => {
    const { couple, hostDb, guestDb } = await createAndJoinRoom()
    const sessionId = await ensureActiveSession(hostDb, couple)
    const stepRef = doc(hostDb, 'sessions', sessionId, 'steps', 'duel-1')
    await setDoc(stepRef, {
      kind: 'duel', type: 'portrait-panic-directed', round: 1, ownerIndex: -1,
      state: { guides: {}, results: {} }, ready: false, completed: false, skipped: false,
      updatedAt: serverTimestamp(),
    })

    await assertFails(updateDoc(stepRef, {
      state: { guides: { '0': ['left', 'left', 'smile'] }, results: {} },
      updatedAt: serverTimestamp(),
    }))
    await runNightCommand(hostDb, sessionId, HOST_UID, {
      kind: 'submit', stepId: stepRef.id, input: { guideCues: ['left', 'larger', 'smile'] },
    })
    expect((await getDoc(doc(guestDb, 'sessions', sessionId, 'steps', 'duel-1'))).data().state.guides['0'])
      .toEqual(['left', 'larger', 'smile'])
    await assertFails(updateDoc(stepRef, {
      state: { guides: { '0': ['left', 'larger', 'smile'], '1': ['right', 'simple', 'closer'] }, results: {} },
      updatedAt: serverTimestamp(),
    }))

    await runNightCommand(guestDb, sessionId, GUEST_UID, {
      kind: 'submit', stepId: stepRef.id, input: { guideCues: ['right', 'simple', 'closer'] },
    })
    await runNightCommand(hostDb, sessionId, HOST_UID, {
      kind: 'submit', stepId: stepRef.id,
      input: { dataUrl: 'data:image/png;base64,AAAA', highlight: 'portrait', time: 0, won: true },
    })
    expect((await getDoc(stepRef)).data()).toMatchObject({ ready: false })
    expect((await getDoc(stepRef)).data().state.results['0'].highlight).toBe('portrait')
  })

  it('keeps opening kiss audio couple-private and finish waits for both partner catches', async () => {
    const { couple, guestDb, hostDb } = await createAndJoinRoom()
    const sessionId = await ensureActiveSession(hostDb, couple)
    const mobileSafariRecording = { ...testKissRecording, audioData: `data:audio/webm;base64,${'A'.repeat(60_000)}` }
    await sendNightKiss(hostDb, sessionId, HOST_UID, mobileSafariRecording)
    await sendNightKiss(guestDb, sessionId, GUEST_UID, mobileSafariRecording)
    const hostKiss = doc(hostDb, 'sessions', sessionId, 'nightKisses', HOST_UID)
    expect((await getDoc(doc(guestDb, 'sessions', sessionId, 'nightKisses', HOST_UID))).data().audioData).toBe(mobileSafariRecording.audioData)
    await assertFails(getDoc(doc(authedDb(OUTSIDER_UID), 'sessions', sessionId, 'nightKisses', HOST_UID)))
    await assertFails(updateDoc(hostKiss, { audioData: 'data:audio/webm;base64,BBBB', updatedAt: serverTimestamp() }))
    await assertFails(setDoc(doc(guestDb, 'sessions', sessionId, 'nightKisses', OUTSIDER_UID), { ...testKissRecording, caughtBy: {}, sentAt: serverTimestamp(), updatedAt: serverTimestamp() }))
    await catchNightKisses(hostDb, guestDb, sessionId)
    const caught = Object.fromEntries((await getDocs(collection(hostDb, 'sessions', sessionId, 'nightKisses'))).docs.map(record => [record.id, record.data()]))
    expect(nightKissesCaughtByBothPlayers(caught, couple.players)).toBe(true)
  })

  it('lets only the owning player flip the coin and resolve a completed board landing', async () => {
    const { couple, guestDb, hostDb } = await createAndJoinRoom()
    const sessionId = await ensureActiveSession(hostDb, couple)
    const stepRef = doc(hostDb, 'sessions', sessionId, 'steps', 'roll-1-0')
    const move = { id: 'roll-1-0', dice: [1, 2], from: 0, playerIndex: 0, steps: 3, to: 3 }
    await setDoc(stepRef, { kind: 'board', type: 'connection', round: 1, ownerIndex: 0, state: { momentPending: true, move, race: { progress: 3, laps: 0 } }, ready: true, completed: true, skipped: false, updatedAt: serverTimestamp() })
    // The command service intentionally treats another player's board step as
    // a harmless no-op; verify the unauthorized client did not reveal it.
    await runNightCommand(guestDb, sessionId, GUEST_UID, { kind: 'submit', stepId: stepRef.id, input: { flipMoment: true } })
    expect((await getDoc(doc(guestDb, 'sessions', sessionId, 'steps', stepRef.id))).data().state.momentPending).toBe(true)
    await assertFails(updateDoc(doc(guestDb, 'sessions', sessionId, 'steps', stepRef.id), {
      state: { ...((await getDoc(stepRef)).data().state), momentPending: false, coinResult: 'treasure', momentCard: { category: 'treasure' } },
      updatedAt: serverTimestamp(),
    }))
    await runNightCommand(hostDb, sessionId, HOST_UID, { kind: 'submit', stepId: stepRef.id, input: { flipMoment: true } })
    const flipped = (await getDoc(stepRef)).data()
    expect(['trash', 'treasure']).toContain(flipped.state.coinResult)
    expect(flipped.state.momentCard.category).toBe(flipped.state.coinResult)
    expect(flipped.state.momentCard.movement).toBe(flipped.state.coinResult === 'trash' ? -1 : 1)
    const momentCard = flipped.state.momentCard
    await assertFails(updateDoc(doc(guestDb, 'sessions', sessionId, 'steps', 'roll-1-0'), { state: { ...flipped.state, momentResolution: { movement: momentCard.movement } }, updatedAt: serverTimestamp() }))
    await runNightCommand(hostDb, sessionId, HOST_UID, { kind: 'submit', stepId: stepRef.id, input: { resolveMoment: true } })
    const saved = (await getDoc(stepRef)).data()
    expect(saved.state.momentResolution).toMatchObject({ movement: momentCard.movement, lowerDie: 1 })
    expect((await getDoc(doc(hostDb, 'sessions', sessionId))).data()).toMatchObject({ hearts: 6, positions: [((momentCard.movement % 20) + 20) % 20, 0] })
  })

  it('preserves simultaneous rolls, frees either player after sealing, and survives duplicate saves', async () => {
    const { couple, hostDb, guestDb } = await createAndJoinRoom()
    const sessionId = await ensureActiveSession(hostDb, couple)
    const step = doc(hostDb, 'sessions', sessionId, 'steps', 'roll-1-0')
    await setDoc(step, {
      kind: 'activity', type: 'comfort-menu', round: 1, ownerIndex: 0,
      state: activityRegistry['comfort-menu'].createInitialState(couple.players, { random: () => 0 }),
      ready: false, completed: false, skipped: false, updatedAt: serverTimestamp(),
    })
    await Promise.all([
      runNightCommand(hostDb, sessionId, HOST_UID, { kind: 'submit', stepId: 'roll-1-0', input: { text: 'Host answer', guess: 'Host guess' } }),
      runNightCommand(guestDb, sessionId, GUEST_UID, { kind: 'submit', stepId: 'roll-1-0', input: { text: 'Guest answer', guess: 'Guest guess' } }),
    ])
    await runNightCommand(hostDb, sessionId, HOST_UID, { kind: 'submit', stepId: 'roll-1-0', input: { text: 'Overwrite' } })
    expect((await getDoc(step)).data().state.entries.map(row => row.text).sort()).toEqual(['Guest answer', 'Host answer'])
    expect((await getDocs(query(collection(hostDb, 'journalEntries'), where('coupleId', '==', couple.id)))).size).toBe(0)
    await Promise.all([
      runNightCommand(hostDb, sessionId, HOST_UID, { kind: 'roll', round: 2, dice: [1, 2] }),
      runNightCommand(guestDb, sessionId, GUEST_UID, { kind: 'roll', round: 1, dice: [1, 2] }),
    ])
    const saved = (await getDoc(doc(hostDb, 'sessions', sessionId))).data()
    expect(saved.positions).toEqual([3, 3])
    await runNightCommand(hostDb, sessionId, HOST_UID, { kind: 'roll', round: 2, dice: [1, 2] })
    expect((await getDoc(doc(hostDb, 'sessions', sessionId))).data().positions).toEqual([3, 3])
    await assertFails(getDocs(collection(authedDb(OUTSIDER_UID), 'sessions', sessionId, 'steps')))
    await assertFails(updateDoc(step, { state: { entries: [] }, updatedAt: serverTimestamp() }))
  })

  it('lets the faster player finish every roll and duel input before the partner, then closes once with durable reveals', async () => {
    const { couple, hostDb, guestDb } = await createAndJoinRoom()
    const sessionId = await ensureActiveSession(hostDb, couple)
    for (const [db, uid] of [[guestDb, GUEST_UID], [hostDb, HOST_UID]]) {
      for (let round = 1; round <= 4; round++) {
        await runNightCommand(db, sessionId, uid, { kind: 'roll', round, dice: round === 1 ? [1, 2] : [1, 1], selectionSeed: 0.01 })
        await resolvePlayerRoll(db, sessionId, uid, round, uid === HOST_UID ? 0 : 1)
        await runNightCommand(db, sessionId, uid, { kind: 'submit', stepId: `duel-${round}`, input: { highlight: 'Played with care', time: uid === HOST_UID ? 1 : 3, won: true } })
      }
      if (uid === GUEST_UID) {
        await sendNightKisses(hostDb, guestDb, sessionId)
        const positionsBeforeEarlyFinish = (await getDoc(doc(db, 'sessions', sessionId))).data().positions
        await expect(runNightCommand(db, sessionId, uid, { kind: 'finish' })).rejects.toThrow('still moments')
        expect((await getDoc(doc(db, 'sessions', sessionId))).data().positions).toEqual(positionsBeforeEarlyFinish)
        expect((await getDocs(query(collection(db, 'journalEntries'), where('coupleId', '==', couple.id)))).size).toBe(0)
      }
    }
    await expect(runNightCommand(hostDb, sessionId, HOST_UID, { kind: 'finish' })).rejects.toThrow('Catch your partner')
    await catchNightKisses(hostDb, guestDb, sessionId)
    await Promise.all([
      runNightCommand(hostDb, sessionId, HOST_UID, { kind: 'finish' }),
      runNightCommand(guestDb, sessionId, GUEST_UID, { kind: 'finish' }),
    ])
    const final = (await getDoc(doc(guestDb, 'sessions', sessionId))).data()
    expect(final).toMatchObject({ phase: 'finale', status: 'completed', round: 4 })
    expect(final.positions).toHaveLength(2)
    expect(final.positions.every(position => Number.isInteger(position) && position >= 0)).toBe(true)
    const entries = (await getDocs(query(collection(guestDb, 'journalEntries'), where('coupleId', '==', couple.id)))).docs.map(record => record.data())
    expect(entries.filter(entry => entry.type === 'duel')).toHaveLength(4)
    expect(entries.filter(entry => ['moment-trash', 'moment-treasure'].includes(entry.type))).toHaveLength(8)
    expect(entries.filter(entry => entry.type === 'trophy')).toHaveLength(1)
    expect(entries.filter(entry => entry.type === 'finale')).toHaveLength(1)
    const savedEntryCount = (await getDocs(query(collection(hostDb, 'journalEntries'), where('coupleId', '==', couple.id)))).size
    await runNightCommand(hostDb, sessionId, HOST_UID, { kind: 'finish' })
    expect((await getDocs(query(collection(hostDb, 'journalEntries'), where('coupleId', '==', couple.id)))).size).toBe(savedEntryCount)
    await assertFails(updateDoc(doc(hostDb, 'sessions', sessionId, 'steps', 'duel-1'), { ready: false, updatedAt: serverTimestamp() }))
  })
})

describe('paired couple arcade games', () => {
  it('prepares and advances each arcade game through its Firestore transaction helper', async () => {
    const { couple, hostDb } = await createAndJoinRoom()
    for (const gameId of ['my-one-and-only', 'catch-my-heart', 'radar-love', 'say-it-without-saying', 'our-little-pieces']) {
      const record = await assertSucceeds(prepareCoupleArcade(hostDb, couple.id, gameId, couple.playerIds))
      expect(record.gameId).toBe(gameId)
      expect(record.state.game).toBe(gameId)

      if (gameId === 'my-one-and-only') {
        const uid = couple.playerIds[0]
        const state = record.state
        const top = state.discardPile.at(-1)
        const card = state.hands[uid].find(item => item.color === state.activeColor || item.value === top.value)
        await assertSucceeds(runCoupleArcadeAction(hostDb, couple.id, gameId, uid, card
          ? { kind: 'play', cardId: card.id }
          : { kind: 'draw' }))
      } else if (gameId === 'catch-my-heart') {
        const uid = couple.playerIds[0]
        await assertSucceeds(runCoupleArcadeAction(hostDb, couple.id, gameId, uid, { kind: 'ask', rank: record.state.hands[uid][0].rank }))
      } else if (gameId === 'radar-love') {
        const [first, second] = couple.playerIds
        for (const uid of [first, second]) {
          await assertSucceeds(runCoupleArcadeAction(hostDb, couple.id, gameId, uid, { kind: 'auto-place' }))
          await assertSucceeds(runCoupleArcadeAction(hostDb, couple.id, gameId, uid, { kind: 'ready' }))
        }
        await assertSucceeds(runCoupleArcadeAction(hostDb, couple.id, gameId, first, { kind: 'shot', row: 0, column: 0 }))
      } else if (gameId === 'our-little-pieces') {
        await assertSucceeds(runCoupleArcadeAction(hostDb, couple.id, gameId, couple.playerIds[0], { kind: 'rotate-piece', pieceId: 'p0', direction: 1 }))
      }
      await assertSucceeds(resetCoupleArcade(hostDb, couple.id, gameId, couple.playerIds))
    }
  })

  it('stores all playable arcade states without Firestore nested arrays', async () => {
    const { couple, hostDb } = await createAndJoinRoom()
    for (const gameId of ['my-one-and-only', 'catch-my-heart', 'radar-love', 'our-little-pieces']) {
      const state = createCoupleArcadeState(gameId, couple.playerIds, () => 0.23)
      await assertSucceeds(setDoc(doc(hostDb, 'coupleArcades', couple.id, 'games', gameId), {
        gameId,
        playerUids: couple.playerIds,
        state,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }))
      const actorUid = couple.playerIds[0]
      let nextState
      if (gameId === 'my-one-and-only') {
        const topCard = state.discardPile.at(-1)
        const card = state.hands[actorUid].find(item => item.color === state.activeColor || item.value === topCard.value)
        nextState = applyCoupleArcadeAction(state, gameId, actorUid, card
          ? { kind: 'play', cardId: card.id }
          : { kind: 'draw' })
      } else if (gameId === 'catch-my-heart') {
        nextState = applyCoupleArcadeAction(state, gameId, actorUid, { kind: 'ask', rank: state.hands[actorUid][0].rank })
      } else if (gameId === 'radar-love') {
        let readyState = applyCoupleArcadeAction(state, gameId, actorUid, { kind: 'auto-place' })
        readyState = applyCoupleArcadeAction(readyState, gameId, actorUid, { kind: 'ready' })
        const partnerUid = couple.playerIds[1]
        readyState = applyCoupleArcadeAction(readyState, gameId, partnerUid, { kind: 'auto-place' })
        readyState = applyCoupleArcadeAction(readyState, gameId, partnerUid, { kind: 'ready' })
        nextState = applyCoupleArcadeAction(readyState, gameId, actorUid, { kind: 'shot', row: 0, column: 0 })
      } else if (gameId === 'our-little-pieces') {
        nextState = applyCoupleArcadeAction(state, gameId, actorUid, { kind: 'rotate-piece', pieceId: 'p0', direction: 1 })
      } else {
        nextState = applyCoupleArcadeAction(state, gameId, actorUid, { kind: 'shot', row: 0, column: 0 })
      }
      await assertSucceeds(updateDoc(doc(hostDb, 'coupleArcades', couple.id, 'games', gameId), {
        state: nextState,
        updatedAt: serverTimestamp(),
      }))
    }
  })

  it('allows paired play and bounds private charade clips in Firestore', async () => {
    const { couple, hostDb } = await createAndJoinRoom()
    const state = createCoupleArcadeState('say-it-without-saying', couple.playerIds, () => 0)
    const gameRef = doc(hostDb, 'coupleArcades', couple.id, 'games', 'say-it-without-saying')
    await assertSucceeds(setDoc(gameRef, {
      gameId: state.game,
      playerUids: couple.playerIds,
      state,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }))
    await assertFails(getDoc(doc(authedDb(OUTSIDER_UID), 'coupleArcades', couple.id, 'games', state.game)))

    await assertSucceeds(updateDoc(gameRef, {
      state: { ...state, phase: 'guess', clips: { [HOST_UID]: 'data:video/webm;base64,AAAA' } },
      updatedAt: serverTimestamp(),
    }))
    await assertFails(updateDoc(gameRef, {
      state: { ...state, phase: 'guess', clips: { [HOST_UID]: `data:video/webm;base64,${'A'.repeat(260000)}` } },
      updatedAt: serverTimestamp(),
    }))
  })
})


describe('long independent nights', () => {
  it.each([['standard', 6], ['long', 8]])('closes a full %s preset with all round artifacts', async (preset, rounds) => {
    const { couple, hostDb, guestDb } = await createAndJoinRoom()
    const sessionId = await beginPairingNight({ db: hostDb, coupleId: couple.id, preset })
    const dice = [[1,2], [1,1], [1,1], [1,1], [2,3], [2,2], [3,3], [2,3]]
    for (const [db, uid] of [[hostDb, HOST_UID], [guestDb, GUEST_UID]]) {
      for (let round = 1; round <= rounds; round++) {
        await runNightCommand(db, sessionId, uid, { kind: 'roll', round, dice: dice[round - 1] })
        await resolvePlayerRoll(db, sessionId, uid, round, uid === HOST_UID ? 0 : 1)
      }
    }
    for (let round = 1; round <= rounds; round++) {
      const stepId = `duel-${round}`
      const duel = (await getDoc(doc(hostDb, 'sessions', sessionId, 'steps', stepId))).data()
      if (duel.type === 'portrait-panic-directed') {
        await runNightCommand(hostDb, sessionId, HOST_UID, { kind: 'submit', stepId, input: { guideCues: ['left', 'larger', 'smile'] } })
        await runNightCommand(guestDb, sessionId, GUEST_UID, { kind: 'submit', stepId, input: { guideCues: ['right', 'simple', 'closer'] } })
      }
      await runNightCommand(hostDb, sessionId, HOST_UID, { kind: 'submit', stepId, input: { highlight: 'Played with care', time: 1, won: true } })
      await runNightCommand(guestDb, sessionId, GUEST_UID, { kind: 'submit', stepId, input: { highlight: 'Played with care', time: 3, won: true } })
    }
    await sendNightKisses(hostDb, guestDb, sessionId)
    await catchNightKisses(hostDb, guestDb, sessionId)
    await runNightCommand(guestDb, sessionId, GUEST_UID, { kind: 'finish' })
    expect((await getDoc(doc(hostDb, 'sessions', sessionId))).data().status).toBe('completed')
    const entries = (await getDocs(query(collection(hostDb, 'journalEntries'), where('coupleId', '==', couple.id)))).docs.map(record => record.data())
    expect(entries.filter(entry => entry.type === 'duel')).toHaveLength(rounds)
    expect(entries.filter(entry => entry.type === 'finale')).toHaveLength(1)
  })
})
