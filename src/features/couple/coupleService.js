import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { getSessionPreset } from '../session/sessionPresets.js'
import { createDefaultBoardState } from '../session/sessionWiring.js'

const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const PLAYER_THEMES = [
  {
    color: '#ff7a97',
    accent: '#ff5478',
    avatar: '/assets/players/rochelle.glb',
  },
  {
    color: '#59b5ff',
    accent: '#2aa1ff',
    avatar: '/assets/players/kyle.glb',
  },
]

export function normalizeInviteCode(value = '') {
  return value.toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, 6)
}

export function createInviteCode(random = Math.random) {
  return Array.from({ length: 6 }, () => {
    const index = Math.floor(random() * INVITE_ALPHABET.length)
    return INVITE_ALPHABET[index]
  }).join('')
}

export function buildShareLink(origin, inviteCode) {
  return `${origin}/?code=${inviteCode}`
}

export function buildCreateCouplePayload({
  displayName,
  userId,
  inviteCode,
  origin,
  sessionPreset = 'standard',
}) {
  return {
    inviteCode,
    shareLink: buildShareLink(origin, inviteCode),
    sessionPreset: getSessionPreset(sessionPreset).id,
    status: 'waiting',
    playerIds: [userId],
    players: [
      {
        uid: userId,
        displayName: displayName.trim(),
        ...PLAYER_THEMES[0],
      },
    ],
    activeSessionId: null,
    boardState: createDefaultBoardState(),
  }
}

export function buildInviteLookupPayload({ coupleId }) {
  return {
    coupleId,
  }
}

export function buildPlayerCoupleLinkPayload({ coupleId }) {
  return {
    coupleId,
  }
}

export function buildPublicLobbyPayload({
  coupleId,
  hostId,
  hostName,
  inviteCode,
  shareLink,
}) {
  return {
    coupleId,
    hostId,
    hostName: hostName.trim(),
    inviteCode,
    playerCount: 1,
    shareLink,
    status: 'open',
  }
}

export function buildLobbyMessagePayload({
  authorId,
  authorName,
  lobbyId,
  text,
}) {
  return {
    authorId,
    authorName: authorName.trim(),
    lobbyId,
    text: text.trim(),
  }
}

export function buildJoinCouplePatch(couple, { displayName, userId }) {
  if (couple.playerIds.includes(userId)) {
    return couple
  }

  return {
    ...couple,
    playerIds: [...couple.playerIds, userId],
    players: [
      ...couple.players,
      {
        uid: userId,
        displayName: displayName.trim(),
        ...PLAYER_THEMES[1],
      },
    ],
    status: 'paired',
  }
}

export function buildJoinFromPublicLobbyPatch(lobby, { displayName, userId }) {
  return {
    playerIds: [lobby.hostId, userId],
    players: [
      {
        uid: lobby.hostId,
        displayName: lobby.hostName.trim(),
        ...PLAYER_THEMES[0],
      },
      {
        uid: userId,
        displayName: displayName.trim(),
        ...PLAYER_THEMES[1],
      },
    ],
    status: 'paired',
  }
}

export function buildLeaveCouplePatch(couple, userId) {
  const remainingPlayerIds = couple.playerIds.filter((id) => id !== userId)
  const remainingPlayers = couple.players.filter((player) => player.uid !== userId)

  if (remainingPlayerIds.length === 0) {
    return null
  }

  return {
    ...couple,
    playerIds: remainingPlayerIds,
    players: remainingPlayers,
    status: 'waiting',
  }
}

function buildPublicLobbyFromCouple(couple) {
  const host = couple.players[0]

  return buildPublicLobbyPayload({
    coupleId: couple.id,
    hostId: host.uid,
    hostName: host.displayName,
    inviteCode: couple.inviteCode,
    shareLink: couple.shareLink,
  })
}

const INVITE_CODE_COLLISION_ERROR = 'invite-code-collision'

export async function createCoupleDocument({
  db,
  displayName,
  origin,
  sessionPreset = 'standard',
  userId,
}) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const coupleRef = doc(collection(db, 'couples'))
    const publicLobbyRef = doc(db, 'publicLobbies', coupleRef.id)
    const inviteCode = createInviteCode()
    const inviteRef = doc(db, 'coupleInvites', inviteCode)
    const playerLinkRef = doc(db, 'playerCouples', userId)
    const payload = buildCreateCouplePayload({
      displayName,
      userId,
      inviteCode,
      origin,
      sessionPreset,
    })

    try {
      await runTransaction(db, async (transaction) => {
        const existingInvite = await transaction.get(inviteRef)
        if (existingInvite.exists()) {
          throw new Error(INVITE_CODE_COLLISION_ERROR)
        }

        transaction.set(coupleRef, {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        transaction.set(inviteRef, {
          ...buildInviteLookupPayload({ coupleId: coupleRef.id }),
          createdAt: serverTimestamp(),
        })
        transaction.set(playerLinkRef, {
          ...buildPlayerCoupleLinkPayload({ coupleId: coupleRef.id }),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        transaction.set(publicLobbyRef, {
          ...buildPublicLobbyPayload({
            coupleId: coupleRef.id,
            hostId: userId,
            hostName: displayName,
            inviteCode,
            shareLink: payload.shareLink,
          }),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      })

      return coupleRef.id
    } catch (error) {
      if (error instanceof Error && error.message === INVITE_CODE_COLLISION_ERROR) {
        continue
      }

      throw error
    }
  }

  throw new Error('Could not generate a unique invite code.')
}

export async function joinCoupleByInviteCode({
  code,
  db,
  displayName,
  userId,
}) {
  const normalized = normalizeInviteCode(code)
  const inviteSnapshot = await getDoc(doc(db, 'coupleInvites', normalized))
  if (!inviteSnapshot.exists()) {
    throw new Error('Invite code not found.')
  }

  const lobbySnapshot = await getDoc(
    doc(db, 'publicLobbies', inviteSnapshot.data().coupleId),
  )

  if (!lobbySnapshot.exists()) {
    throw new Error('That room is no longer open.')
  }

  return joinOpenLobby({
    db,
    displayName,
    lobby: { id: lobbySnapshot.id, ...lobbySnapshot.data() },
    userId,
  })
}

export async function joinPublicLobby({
  db,
  displayName,
  lobbyId,
  userId,
}) {
  const lobbySnapshot = await getDoc(doc(db, 'publicLobbies', lobbyId))
  if (!lobbySnapshot.exists()) {
    throw new Error('That public room is no longer open.')
  }

  return joinOpenLobby({
    db,
    displayName,
    lobby: { id: lobbySnapshot.id, ...lobbySnapshot.data() },
    userId,
  })
}

async function joinOpenLobby({
  db,
  displayName,
  lobby,
  userId,
}) {
  const coupleId = lobby.coupleId || lobby.id
  const coupleRef = doc(db, 'couples', coupleId)
  const playerLinkRef = doc(db, 'playerCouples', userId)
  const publicLobbyRef = doc(db, 'publicLobbies', lobby.id)

  await runTransaction(db, async (transaction) => {
    const freshLobby = await transaction.get(publicLobbyRef)

    if (!freshLobby.exists()) {
      throw new Error('That public room is no longer open.')
    }

    const currentLobby = { id: freshLobby.id, ...freshLobby.data() }

    if (
      currentLobby.status !== 'open' ||
      currentLobby.playerCount !== 1 ||
      currentLobby.hostId === userId
    ) {
      throw new Error('That public room is no longer joinable.')
    }

    const patch = buildJoinFromPublicLobbyPatch(currentLobby, {
      displayName,
      userId,
    })

    transaction.update(coupleRef, {
      playerIds: patch.playerIds,
      players: patch.players,
      status: patch.status,
      updatedAt: serverTimestamp(),
    })
    transaction.set(playerLinkRef, {
      ...buildPlayerCoupleLinkPayload({ coupleId }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    transaction.delete(publicLobbyRef)
  })

  return coupleId
}

export async function leaveCoupleDocument({
  couple,
  db,
  userId,
}) {
  const playerLinkRef = doc(db, 'playerCouples', userId)
  const coupleRef = doc(db, 'couples', couple.id)
  const publicLobbyRef = doc(db, 'publicLobbies', couple.id)

  await runTransaction(db, async (transaction) => {
    const fresh = await transaction.get(coupleRef)

    if (!fresh.exists()) {
      transaction.delete(playerLinkRef)
      return
    }

    const current = fresh.data()

    if (!current.playerIds.includes(userId)) {
      transaction.delete(playerLinkRef)
      return
    }

    if (current.activeSessionId) {
      throw new Error('This couple already has a live session. Finish or reset the session before leaving.')
    }

    const nextCouple = buildLeaveCouplePatch(current, userId)

    transaction.delete(playerLinkRef)

    if (!nextCouple) {
      transaction.delete(coupleRef)
      transaction.delete(publicLobbyRef)
      if (current.inviteCode) {
        transaction.delete(doc(db, 'coupleInvites', current.inviteCode))
      }
      return
    }

    transaction.update(coupleRef, {
      playerIds: nextCouple.playerIds,
      players: nextCouple.players,
      status: nextCouple.status,
      updatedAt: serverTimestamp(),
    })
    transaction.set(publicLobbyRef, {
      ...buildPublicLobbyFromCouple({ id: couple.id, ...nextCouple }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })
}

export async function updateCoupleSessionPreset({
  coupleId,
  db,
  preset,
  userId,
}) {
  const coupleRef = doc(db, 'couples', coupleId)
  const nextPreset = getSessionPreset(preset).id

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(coupleRef)
    if (!snapshot.exists()) {
      throw new Error('That room is no longer available.')
    }

    const couple = snapshot.data()
    if (couple.activeSessionId) {
      throw new Error('The night already started, so the preset can no longer change.')
    }

    if (couple.playerIds?.[0] !== userId) {
      throw new Error('Only the room owner can change the preset before the night starts.')
    }

    transaction.update(coupleRef, {
      sessionPreset: nextPreset,
      updatedAt: serverTimestamp(),
    })
  })
}

export async function clearPlayerCoupleLink({
  db,
  userId,
}) {
  await deleteDoc(doc(db, 'playerCouples', userId))
}

export function subscribeToPublicLobbies(db, onNext, onError) {
  const publicLobbyQuery = query(
    collection(db, 'publicLobbies'),
    orderBy('updatedAt', 'desc'),
  )

  return onSnapshot(
    publicLobbyQuery,
    (snapshot) => {
      onNext(snapshot.docs.map((entry) => ({
        id: entry.id,
        ...entry.data(),
      })))
    },
    onError,
  )
}

export function subscribeToLobbyMessages(db, lobbyId, onNext, onError) {
  const messagesQuery = query(
    collection(db, 'lobbyMessages'),
    orderBy('createdAt', 'asc'),
  )

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const entries = snapshot.docs
        .map((entry) => ({
          id: entry.id,
          ...entry.data(),
        }))
        .filter((entry) => entry.lobbyId === lobbyId)
      onNext(entries)
    },
    onError,
  )
}

export async function sendLobbyMessage({
  authorId,
  authorName,
  db,
  lobbyId,
  text,
}) {
  const trimmed = text.trim()
  if (!trimmed) {
    return
  }

  await addDoc(collection(db, 'lobbyMessages'), {
    ...buildLobbyMessagePayload({
      authorId,
      authorName,
      lobbyId,
      text: trimmed,
    }),
    createdAt: serverTimestamp(),
  })
}
