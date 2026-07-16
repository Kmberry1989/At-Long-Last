import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
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
}) {
  return {
    inviteCode,
    shareLink: buildShareLink(origin, inviteCode),
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

const INVITE_CODE_COLLISION_ERROR = 'invite-code-collision'

export async function createCoupleDocument({
  db,
  displayName,
  origin,
  userId,
}) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const coupleRef = doc(collection(db, 'couples'))
    const inviteCode = createInviteCode()
    const inviteRef = doc(db, 'coupleInvites', inviteCode)
    const playerLinkRef = doc(db, 'playerCouples', userId)
    const payload = buildCreateCouplePayload({
      displayName,
      userId,
      inviteCode,
      origin,
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

  const coupleRef = doc(db, 'couples', inviteSnapshot.data().coupleId)
  const playerLinkRef = doc(db, 'playerCouples', userId)

  await runTransaction(db, async (transaction) => {
    const fresh = await transaction.get(coupleRef)
    if (!fresh.exists()) {
      throw new Error('Couple no longer exists.')
    }

    const couple = fresh.data()
    if (couple.playerIds.length >= 2 && !couple.playerIds.includes(userId)) {
      throw new Error('That couple is already full.')
    }

    const patch = buildJoinCouplePatch(couple, { displayName, userId })
    transaction.update(coupleRef, {
      playerIds: patch.playerIds,
      players: patch.players,
      status: patch.status,
      updatedAt: serverTimestamp(),
    })
    transaction.set(playerLinkRef, {
      ...buildPlayerCoupleLinkPayload({ coupleId: coupleRef.id }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })

  return coupleRef.id
}

export async function leaveCoupleDocument({
  couple,
  db,
  userId,
}) {
  const playerLinkRef = doc(db, 'playerCouples', userId)
  const coupleRef = doc(db, 'couples', couple.id)

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
  })
}
