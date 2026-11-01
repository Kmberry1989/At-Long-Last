import { readFile } from 'node:fs/promises'
import { initializeTestEnvironment, assertFails } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest'
import { syncGooglePortrait, selectPortraitFrame } from '../src/features/couple/portraitService.js'
import { buildDefaultProgress } from '../src/features/couple/progressService.js'
let env
const auth = uid => env.authenticatedContext(uid).firestore()
beforeAll(async () => {
  const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080').split(':')
  env = await initializeTestEnvironment({ projectId: 'demo-portrait-frames', firestore: { host, port: Number(port), rules: await readFile('firestore.rules', 'utf8') } })
})
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), 'couples', 'pair'), { status: 'paired', playerIds: ['a', 'b'] })
    await setDoc(doc(context.firestore(), 'coupleProgress', 'pair'), { ...buildDefaultProgress('pair'), lifetimeHearts: 100 })
  })
})
afterAll(async () => env?.cleanup())
describe('Google portraits and heart-purchased frames', () => {
  it('shares photos only with the partner and charges exactly once for a permanent frame unlock', async () => {
    const a = auth('a'), b = auth('b')
    await syncGooglePortrait(a, 'pair', { uid: 'a', photoURL: 'https://lh3.googleusercontent.com/a/photo' })
    await selectPortraitFrame(a, 'pair', 'a', 'ivory')
    expect((await getDoc(doc(a, 'coupleProgress', 'pair'))).data().heartsSpent).toBe(0)
    await selectPortraitFrame(a, 'pair', 'a', 'rose')
    await selectPortraitFrame(a, 'pair', 'a', 'rose')
    const saved = (await getDoc(doc(b, 'couplePortraits', 'pair', 'players', 'a'))).data()
    expect(saved.selectedFrame).toBe('rose')
    expect(saved.photoURL).toBe('https://lh3.googleusercontent.com/a/photo')
    expect((await getDoc(doc(a, 'coupleProgress', 'pair'))).data().heartsSpent).toBe(48)
    await assertFails(getDoc(doc(auth('outside'), 'couplePortraits', 'pair', 'players', 'a')))
    await assertFails(updateDoc(doc(b, 'couplePortraits', 'pair', 'players', 'a'), { selectedFrame: 'ribbon', updatedAt: serverTimestamp() }))
  })
  it('rejects forged free unlocks, unowned selection, invalid photos, and overspending', async () => {
    const a = auth('a')
    await syncGooglePortrait(a, 'pair', { uid: 'a' })
    const ref = doc(a, 'couplePortraits', 'pair', 'players', 'a')
    await assertFails(updateDoc(ref, { ownedFrames: ['ribbon', 'ivory', 'midnight', 'laurel'], selectedFrame: 'laurel', updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(ref, { selectedFrame: 'rose', updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(ref, { photoURL: 'https://evil.test/photo', updatedAt: serverTimestamp() }))
    await selectPortraitFrame(a, 'pair', 'a', 'laurel')
    await expect(selectPortraitFrame(a, 'pair', 'a', 'rose')).rejects.toThrow('48 shared hearts')
    expect((await getDoc(doc(a, 'coupleProgress', 'pair'))).data().heartsSpent).toBe(80)
  })
})
