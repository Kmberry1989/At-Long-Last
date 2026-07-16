import {
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

export function buildProfilePatch({
  displayName,
  email,
  isAnonymous,
}) {
  const trimmedName = displayName?.trim() || (isAnonymous ? 'Guest' : 'Player')

  return {
    createdAt: serverTimestamp(),
    displayName: trimmedName,
    email: email || null,
    isAnonymous: Boolean(isAnonymous),
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

  await setDoc(
    doc(db, 'profiles', user.uid),
    buildProfilePatch({
      displayName: user.displayName,
      email: user.email,
      isAnonymous: user.isAnonymous,
    }),
    { merge: true },
  )
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
