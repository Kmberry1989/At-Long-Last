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

export async function ensureProfileDocument({
  db,
  user,
}) {
  if (!db || !user) {
    return
  }

  const profileRef = doc(db, 'profiles', user.uid)
  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(profileRef)
    const patch = buildProfilePatch({
      displayName: user.displayName,
      email: user.email,
    })
    if (existing.exists()) patch.createdAt = existing.data().createdAt
    patch.loginStreak = advanceLoginStreak(existing.data()?.loginStreak)
    transaction.set(profileRef, patch, { merge: true })
  })
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
