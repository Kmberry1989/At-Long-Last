import { readFile } from 'node:fs/promises'
import { initializeTestEnvironment, assertFails } from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest'
import { savePieceStyle, saveThemeVote, syncGooglePortrait, selectPortraitFrame } from '../src/features/couple/portraitService.js'
import { buildDefaultProgress, ensureCoupleProgress } from '../src/features/couple/progressService.js'
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

  it('shares validated player color and PBR finish with the couple', async () => {
    const a = auth('a'), b = auth('b')
    await syncGooglePortrait(a, 'pair', { uid: 'a' })
    await savePieceStyle(a, 'pair', 'a', { color: '#8050c8', material: 'gold' })
    const saved = (await getDoc(doc(b, 'couplePortraits', 'pair', 'players', 'a'))).data()
    expect(saved.pieceColor).toBe('#8050c8')
    expect(saved.pieceMaterial).toBe('gold')
    const ref = doc(a, 'couplePortraits', 'pair', 'players', 'a')
    await assertFails(updateDoc(ref, { pieceColor: 'purple', updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(ref, { pieceMaterial: 'glass', updatedAt: serverTimestamp() }))
  })

  it('keeps theme votes private to each player and applies the shared theme only after matching votes', async () => {
    const a = auth('a'), b = auth('b')
    await syncGooglePortrait(a, 'pair', { uid: 'a' })
    await syncGooglePortrait(b, 'pair', { uid: 'b' })
    await saveThemeVote(a, 'pair', 'a', 'b', 'garden')
    expect((await getDoc(doc(a, 'coupleProgress', 'pair'))).data().selectedTheme).toBeUndefined()
    expect((await getDoc(doc(b, 'couplePortraits', 'pair', 'players', 'a'))).data().themeVote).toBe('garden')

    const agreement = await saveThemeVote(b, 'pair', 'b', 'a', 'garden')
    expect(agreement.agreed).toBe(true)
    expect((await getDoc(doc(b, 'coupleProgress', 'pair'))).data().selectedTheme).toBe('garden')
    await saveThemeVote(a, 'pair', 'a', 'b', 'auto')
    expect((await getDoc(doc(b, 'coupleProgress', 'pair'))).data().selectedTheme).toBe('garden')
    await saveThemeVote(b, 'pair', 'b', 'a', 'auto')
    expect((await getDoc(doc(b, 'coupleProgress', 'pair'))).data().selectedTheme).toBeUndefined()
  })

  it('rejects a vote for a locked theme and accepts it after a shared unlock', async () => {
    const a = auth('a'), b = auth('b')
    await syncGooglePortrait(a, 'pair', { uid: 'a' })
    await syncGooglePortrait(b, 'pair', { uid: 'b' })
    const ref = doc(a, 'couplePortraits', 'pair', 'players', 'a')
    await assertFails(updateDoc(ref, { themeVote: 'starlit-rooftop', updatedAt: serverTimestamp() }))
    await env.withSecurityRulesDisabled(async context => {
      await updateDoc(doc(context.firestore(), 'coupleProgress', 'pair'), { unlockedThemes: ['starlit-rooftop'] })
    })
    await saveThemeVote(a, 'pair', 'a', 'b', 'starlit-rooftop')
    await saveThemeVote(b, 'pair', 'b', 'a', 'starlit-rooftop')
    expect((await getDoc(doc(b, 'coupleProgress', 'pair'))).data().selectedTheme).toBe('starlit-rooftop')
  })

  it('creates only the default progress record and permits a narrowly scoped shared-theme update', async () => {
    const a = auth('a'), b = auth('b')
    await env.withSecurityRulesDisabled(context => deleteDoc(doc(context.firestore(), 'coupleProgress', 'pair')))
    const initial = await ensureCoupleProgress(a, 'pair')
    expect(initial.lifetimeNights).toBe(0)
    await syncGooglePortrait(a, 'pair', { uid: 'a' })
    await syncGooglePortrait(b, 'pair', { uid: 'b' })
    await saveThemeVote(a, 'pair', 'a', 'b', 'city')
    await saveThemeVote(b, 'pair', 'b', 'a', 'city')
    expect((await getDoc(doc(b, 'coupleProgress', 'pair'))).data().selectedTheme).toBe('city')
    await assertFails(updateDoc(doc(a, 'coupleProgress', 'pair'), {
      selectedTheme: 'city', heartsSpent: 1, updatedAt: serverTimestamp(),
    }))
  })
})
