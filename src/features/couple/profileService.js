import {
  doc,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { advanceLoginStreak } from './loginStreak.js'

export function buildProfilePatch({
  displayName,
  email,
}) {
  const trimmedName = displayName?.trim() || 'Player'

  return {
    createdAt: serverTimestamp(),
    displayName: trimmedName,
    email: email || null,
    isAnonymous: false,
    lastSeenAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}

const profileWrites = new WeakMap()

export async function ensureProfileDocument({
  db,
  user,
}) {
  if (!db || !user) {
    return
  }

  let writes = profileWrites.get(db)
  if (!writes) { writes = new Map(); profileWrites.set(db, writes) }
  if (writes.has(user.uid)) return writes.get(user.uid)
  const profileRef = doc(db, 'profiles', user.uid)
  const pending = runTransaction(db, async (transaction) => {
    const existing = await transaction.get(profileRef)
    const patch = buildProfilePatch({
      displayName: user.displayName,
      email: user.email,
    })
    if (existing.exists()) patch.createdAt = existing.data().createdAt
    patch.loginStreak = advanceLoginStreak(existing.data()?.loginStreak)
    transaction.set(profileRef, patch, { merge: true })
  })
  writes.set(user.uid, pending)
  try { await pending } finally { if (writes.get(user.uid) === pending) writes.delete(user.uid) }
}

export async function saveProfileDisplayName({
  db,
  displayName,
  user,
}) {
  if (!db || !user) {
    return
  }

  await setDoc(
    doc(db, 'profiles', user.uid),
    {
      displayName: displayName.trim(),
      lastSeenAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}
