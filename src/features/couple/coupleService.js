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
import { getSessionPreset, DEFAULT_SESSION_PRESET } from '../session/sessionPresets.js'
import { createDefaultBoardState } from '../session/sessionWiring.js'
import {
  PLAYER_THEMES,
  resolvePlayerAvatar,
} from './playerAvatar.js'

const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export { PLAYER_THEMES } from './playerAvatar.js'

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
  return `${origin}/?invite=${inviteCode}`
}

/**
 * Resolves an invite code to a lightweight room preview without joining.
 * Used by the deep-link join screen so the partner sees host identity and
 * room privacy before supplying a nickname. Authenticated reads of
 * coupleInvites and publicLobbies are permitted by the security rules.
 * Private rooms carry the host preview on the invite itself; only public
 * rooms have a lobby row.
 */
export async function resolveInviteRoom({ code, db }) {
  const normalized = normalizeInviteCode(code)

  if (!normalized) {
    throw new Error('That invite link is missing its code. Ask your partner to send a fresh link.')
  }

  const inviteSnapshot = await getDoc(doc(db, 'coupleInvites', normalized))

  if (!inviteSnapshot.exists()) {
    throw new Error('Invite not found. Ask your partner to send a fresh link.')
  }

  const invite = inviteSnapshot.data()
  const lobbySnapshot = await getDoc(
    doc(db, 'publicLobbies', invite.coupleId),
  )
  const lobby = lobbySnapshot.exists()
    ? { id: lobbySnapshot.id, ...lobbySnapshot.data() }
    : null

  if (lobby && (lobby.status !== 'open' || lobby.playerCount !== 1)) {
    throw new Error('That room is no longer open. Ask your partner to send a fresh link.')
  }

  return {
    coupleId: invite.coupleId,
    hostAvatar: invite.hostAvatar || lobby?.hostAvatar || null,
    hostName: invite.hostName || lobby?.hostName || 'Your partner',
    inviteCode: normalized,
    isPublic: Boolean(lobby),
  }
}

export function buildCreateCouplePayload({
  avatar,
  displayName,
  userId,
  inviteCode,
  isPublic = false,
  origin,
  sessionPreset = DEFAULT_SESSION_PRESET,
}) {
  return {
    inviteCode,
    shareLink: buildShareLink(origin, inviteCode),
    sessionPreset: getSessionPreset(sessionPreset).id,
    status: 'waiting',
    visibility: isPublic ? 'public' : 'private',
    playerIds: [userId],
    players: [
      {
        uid: userId,
        displayName: displayName.trim(),
        ...PLAYER_THEMES[0],
        avatar: resolvePlayerAvatar(avatar),
      },
    ],
    activeSessionId: null,
    boardState: createDefaultBoardState(),
  }
}

export function buildInviteLookupPayload({ coupleId, hostAvatar = null, hostName = '' }) {
  const payload = {
    coupleId,
  }

  if (hostName) {
    payload.hostName = hostName.trim().slice(0, 60)
  }

  if (hostAvatar) {
    payload.hostAvatar = resolvePlayerAvatar(hostAvatar)
  }

  return payload
}

export function buildPlayerCoupleLinkPayload({ coupleId }) {
  return {
    coupleId,
  }
}

export function buildPublicLobbyPayload({
  coupleId,
  hostAvatar,
  hostId,
  hostName,
  inviteCode,
  shareLink,
}) {
  return {
    coupleId,
    hostAvatar: resolvePlayerAvatar(hostAvatar),
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

export function buildJoinCouplePatch(couple, { avatar, displayName, userId }) {
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
        avatar: resolvePlayerAvatar(avatar),
      },
    ],
    status: 'paired',
  }
}

export function buildJoinFromPublicLobbyPatch(lobby, { avatar, displayName, userId }) {
  return {
    playerIds: [lobby.hostId, userId],
    players: [
      {
        uid: lobby.hostId,
        displayName: lobby.hostName.trim(),
        ...PLAYER_THEMES[0],
        avatar: resolvePlayerAvatar(lobby.hostAvatar),
      },
      {
        uid: userId,
        displayName: displayName.trim(),
        ...PLAYER_THEMES[1],
        avatar: resolvePlayerAvatar(avatar),
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
    hostAvatar: host.avatar,
    hostId: host.uid,
    hostName: host.displayName,
    inviteCode: couple.inviteCode,
    shareLink: couple.shareLink,
  })
}

const INVITE_CODE_COLLISION_ERROR = 'invite-code-collision'

export async function createCoupleDocument({
  avatar,
  db,
  displayName,
  isPublic = false,
  origin,
  sessionPreset = DEFAULT_SESSION_PRESET,
  userId,
}) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const coupleRef = doc(collection(db, 'couples'))
    const publicLobbyRef = doc(db, 'publicLobbies', coupleRef.id)
    const inviteCode = createInviteCode()
    const inviteRef = doc(db, 'coupleInvites', inviteCode)
    const playerLinkRef = doc(db, 'playerCouples', userId)
    const payload = buildCreateCouplePayload({
      avatar,
      displayName,
      userId,
      inviteCode,
      isPublic,
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
          ...buildInviteLookupPayload({
            coupleId: coupleRef.id,
            hostAvatar: payload.players[0].avatar,
            hostName: displayName,
          }),
          createdAt: serverTimestamp(),
        })
        transaction.set(playerLinkRef, {
          ...buildPlayerCoupleLinkPayload({ coupleId: coupleRef.id }),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        if (isPublic) {
          transaction.set(publicLobbyRef, {
            ...buildPublicLobbyPayload({
              coupleId: coupleRef.id,
              hostAvatar: payload.players[0].avatar,
              hostId: userId,
              hostName: displayName,
              inviteCode,
              shareLink: payload.shareLink,
            }),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        }
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
  avatar,
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

  const coupleId = inviteSnapshot.data().coupleId
  const lobbySnapshot = await getDoc(doc(db, 'publicLobbies', coupleId))

  if (lobbySnapshot.exists()) {
    return joinOpenLobby({
      avatar,
      db,
      displayName,
      lobby: { id: lobbySnapshot.id, ...lobbySnapshot.data() },
      userId,
    })
  }

  return joinPrivateCouple({
    avatar,
    coupleId,
    db,
    displayName,
    userId,
  })
}

export async function joinPublicLobby({
  avatar,
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
    avatar,
    db,
    displayName,
    lobby: { id: lobbySnapshot.id, ...lobbySnapshot.data() },
    userId,
  })
}

export function buildJoinPrivateCouplePatch(couple, { avatar, displayName, userId }) {
  const host = couple.players[0]

  return {
    playerIds: [host.uid, userId],
    players: [
      host,
      {
        uid: userId,
        displayName: displayName.trim(),
        ...PLAYER_THEMES[1],
        avatar: resolvePlayerAvatar(avatar),
      },
    ],
    status: 'paired',
  }
}

async function joinPrivateCouple({
  avatar,
  coupleId,
  db,
  displayName,
  userId,
}) {
  const coupleRef = doc(db, 'couples', coupleId)
  const playerLinkRef = doc(db, 'playerCouples', userId)

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(coupleRef)

    if (!snapshot.exists()) {
      throw new Error('That room is no longer open.')
    }

    const couple = { id: snapshot.id, ...snapshot.data() }

    if (
      couple.status !== 'waiting' ||
      couple.playerIds.length !== 1 ||
      couple.playerIds[0] === userId ||
      couple.activeSessionId
    ) {
      throw new Error('That room is no longer joinable.')
    }

    const patch = buildJoinPrivateCouplePatch(couple, {
      avatar,
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
  })

  return coupleId
}

async function joinOpenLobby({
  avatar,
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
      avatar,
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

    let publicLobbySnapshot = null
    let inviteRef = null
    let inviteSnapshot = null

    if (!nextCouple) {
      publicLobbySnapshot = await transaction.get(publicLobbyRef)
      if (current.inviteCode) {
        inviteRef = doc(db, 'coupleInvites', current.inviteCode)
        inviteSnapshot = await transaction.get(inviteRef)
      }
    }

    transaction.delete(playerLinkRef)

    if (!nextCouple) {
      transaction.delete(coupleRef)
      if (publicLobbySnapshot.exists()) {
        transaction.delete(publicLobbyRef)
      }
      if (inviteSnapshot?.exists()) {
        transaction.delete(inviteRef)
      }
      return
    }

    transaction.update(coupleRef, {
      playerIds: nextCouple.playerIds,
      players: nextCouple.players,
      status: nextCouple.status,
      updatedAt: serverTimestamp(),
    })
    if ((current.visibility ?? 'public') === 'public') {
      transaction.set(publicLobbyRef, {
        ...buildPublicLobbyFromCouple({ id: couple.id, ...nextCouple }),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
  })
}

/**
 * Toggles a waiting room's public listing. Private by default; the host can
 * opt in to the public room browser and back out at any time. Runs as one
 * transaction so the lobby row and the visibility flag never disagree.
 */
export async function setRoomVisibility({
  coupleId,
  db,
  isPublic,
  userId,
}) {
  const coupleRef = doc(db, 'couples', coupleId)
  const publicLobbyRef = doc(db, 'publicLobbies', coupleId)

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(coupleRef)

    if (!snapshot.exists()) {
      throw new Error('That room is no longer available.')
    }

    const couple = snapshot.data()
    const nextVisibility = isPublic ? 'public' : 'private'

    if (couple.playerIds?.[0] !== userId) {
      throw new Error('Only the room owner can change the room listing.')
    }

    if (couple.status !== 'waiting' || couple.activeSessionId) {
      throw new Error('The room listing can only change while waiting for a partner.')
    }

    if ((couple.visibility ?? 'private') === nextVisibility) {
      return
    }

    if (isPublic) {
      transaction.set(publicLobbyRef, {
        ...buildPublicLobbyFromCouple({ id: coupleId, ...couple }),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } else {
      transaction.delete(publicLobbyRef)
    }

    transaction.update(coupleRef, {
      visibility: nextVisibility,
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
