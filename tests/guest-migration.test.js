/**
 * Guest-first migration spike (Milestone 1).
 *
 * EMULATOR ONLY. This test prototypes anonymous-auth -> linked-account
 * migration against the Firebase Auth + Firestore emulators and asserts the
 * same UID and the same profile data survive the link. It never touches the
 * production Firebase project, and no production code path calls
 * signInAnonymously: FirebaseAppContext still rejects anonymous users in the
 * shipped app. The email/password link below exercises the same
 * linkWithCredential primitive a Google link would use.
 *
 * NOTE: the Firestore data plane of the emulator must be functional for the
 * second test. (In one sandbox run the Auth emulator worked while the
 * Firestore emulator returned 503 UNAVAILABLE for every write, including
 * standalone — an environment issue, not an app issue.)
 */
import { afterAll, describe, expect, it } from 'vitest'
import { initializeApp } from 'firebase/app'
import {
  connectAuthEmulator,
  EmailAuthProvider,
  getAuth,
  linkWithCredential,
  signInAnonymously,
  signOut,
} from 'firebase/auth'
import {
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

const app = initializeApp({
  apiKey: 'demo-key',
  projectId: 'demo-at-long-last',
})
const auth = getAuth(app)
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
const db = getFirestore(app)
connectFirestoreEmulator(db, '127.0.0.1', 8080)

afterAll(async () => {
  await signOut(auth).catch(() => {})
})

function buildGuestProfile() {
  return {
    createdAt: serverTimestamp(),
    displayName: 'Guest Player',
    email: null,
    isAnonymous: true,
    lastSeenAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}

async function signInGuest() {
  const credential = await signInAnonymously(auth)
  expect(credential.user.isAnonymous).toBe(true)
  return credential.user
}

async function linkEmail(user, email) {
  const linked = await linkWithCredential(
    user,
    EmailAuthProvider.credential(email, 'spike-password-1'),
  )
  return linked.user
}

describe('guest migration spike (emulator only)', () => {
  it('preserves the UID when linking an email credential to an anonymous guest', async () => {
    const guest = await signInGuest()
    const linked = await linkEmail(guest, 'guest-link@example.test')

    expect(linked.uid).toBe(guest.uid)
    expect(auth.currentUser.uid).toBe(guest.uid)
    expect(linked.isAnonymous).toBe(false)
    expect(
      linked.providerData.some((provider) => provider.providerId === 'password'),
    ).toBe(true)
  })

  it('preserves profile data across the anonymous -> linked migration', async () => {
    const guest = await signInGuest()

    await setDoc(doc(db, 'profiles', guest.uid), buildGuestProfile())
    const before = await getDoc(doc(db, 'profiles', guest.uid))
    expect(before.exists()).toBe(true)
    expect(before.data().displayName).toBe('Guest Player')

    const linked = await linkEmail(guest, 'guest-data@example.test')
    expect(linked.uid).toBe(guest.uid)

    const after = await getDoc(doc(db, 'profiles', guest.uid))
    expect(after.exists()).toBe(true)
    expect(after.data().displayName).toBe('Guest Player')
    expect(after.data().isAnonymous).toBe(true)

    await setDoc(
      doc(db, 'profiles', guest.uid),
      {
        displayName: 'Guest Player',
        lastSeenAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
    const updated = await getDoc(doc(db, 'profiles', guest.uid))
    expect(updated.data().displayName).toBe('Guest Player')
  })
})
