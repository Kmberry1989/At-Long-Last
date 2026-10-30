import { readFile } from 'node:fs/promises'
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc, deleteDoc, deleteField } from 'firebase/firestore'
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest'
import { recordNightComplete } from '../src/features/couple/progressService.js'
import { acknowledgeMoment } from '../src/features/couple/milestoneService.js'
import { createPairingInvite, acceptPairingInvite, commitPairing, unpairAccounts, beginPairingNight, refreshPairingInvite, emailLockKey } from '../src/features/couple/pairingService.js'
let env
const email = (uid) => `${uid}@example.test`
const dbFor = (uid, address = email(uid), verified = true) => env.authenticatedContext(uid, { email: address, email_verified: verified }).firestore()
beforeAll(async () => { env = await initializeTestEnvironment({ projectId: 'demo-pairing-regression', firestore: { host: '127.0.0.1', port: 8080, rules: await readFile('firestore.rules', 'utf8') } }) })
beforeEach(async () => { await env.clearFirestore() })
afterAll(async () => { await env?.cleanup() })
async function connect() {
  const a = dbFor('alpha'), b = dbFor('beta')
  const id = await createPairingInvite({ db: a, userId: 'alpha', displayName: 'Alpha', origin: 'http://localhost', avatar: '/assets/players/heart.glb' })
  const couple = (await getDoc(doc(a, 'couples', id))).data()
  await acceptPairingInvite({ db: b, userId: 'beta', displayName: 'Beta', avatar: '/assets/players/globe-classic.glb', code: couple.inviteCode })
  return { a, b, id, code: couple.inviteCode }
}
async function commit(db, id, uid, address = email(uid), verified = true) { return commitPairing({ db, coupleId: id, userId: uid, email: address, emailVerified: verified }) }
describe('persistent pairing and permanent email commitments', () => {
  it('consumes an invite once and keeps both account links without starting a game', async () => {
    const { a, b, id, code } = await connect()
    expect((await getDoc(doc(a, 'couples', id))).data().activeSessionId).toBeNull()
    expect((await getDoc(doc(b, 'playerCouples', 'beta'))).data().coupleId).toBe(id)
    expect((await getDoc(doc(a, 'coupleInvites', code))).exists()).toBe(false)
    await expect(acceptPairingInvite({ db: dbFor('third'), userId: 'third', displayName: 'Third', code })).rejects.toThrow(/used|cancelled/)
    expect((await getDoc(doc(a, 'pairingMoments', `${id}_connected`))).exists()).toBe(true)
  })
  it('requires each verified person to consent and atomically locks both emails', async () => {
    const { a, b, id } = await connect()
    await commit(a, id, 'alpha')
    expect((await getDoc(doc(a, 'pairingLocks', emailLockKey(email('alpha'))))).exists()).toBe(false)
    await commit(b, id, 'beta')
    const couple = (await getDoc(doc(a, 'couples', id))).data()
    expect(couple.commitments).toEqual(['alpha', 'beta'])
    expect(couple.committedAt).toBeTruthy()
    expect((await getDoc(doc(a, 'pairingLocks', emailLockKey(email('alpha'))))).data().coupleId).toBe(id)
    expect((await getDoc(doc(b, 'pairingLocks', emailLockKey(email('beta'))))).data().coupleId).toBe(id)
    expect((await getDoc(doc(a, 'pairingMoments', `${id}_committed`))).exists()).toBe(true)
    await commit(a, id, 'alpha')
  })
  it('rejects forged consent, an unverified token, and an email not owned by the caller', async () => {
    const { a, id } = await connect()
    await assertFails(updateDoc(doc(a, 'couples', id), { commitments: ['alpha', 'beta'], commitmentEmails: { alpha: email('alpha'), beta: email('beta') } }))
    await expect(commit(dbFor('beta', email('beta'), false), id, 'beta', email('beta'), true)).rejects.toThrow()
    await expect(commit(a, id, 'alpha', 'someone-else@example.test')).rejects.toThrow()
  })
  it('has no client unlink, reset, lock deletion, or email-based re-pair path after commitment', async () => {
    const { a, b, id } = await connect(); await commit(a, id, 'alpha'); await commit(b, id, 'beta')
    await expect(unpairAccounts({ db: a, coupleId: id, userId: 'alpha' })).rejects.toThrow(/permanent/)
    await assertFails(deleteDoc(doc(a, 'pairingLocks', emailLockKey(email('alpha')))))
    await assertFails(updateDoc(doc(a, 'pairingLocks', emailLockKey(email('alpha'))), { coupleId: 'other' }))
    await assertFails(updateDoc(doc(a, 'couples', id), { status: 'unpaired', activeSessionId: null, visibility: 'private' }))
    await assertFails(deleteDoc(doc(a, 'playerCouples', 'alpha')))
    await assertFails(deleteDoc(doc(a, 'couples', id)))
    await assertFails(updateDoc(doc(a, 'couples', id), { commitments: [], commitmentEmails: deleteField(), committedAt: deleteField() }))
    await expect(createPairingInvite({ db: dbFor('new-uid', email('alpha').toUpperCase()), userId: 'new-uid', displayName: 'New', origin: 'http://localhost' })).rejects.toThrow()
  })
  it('lets either partner start one shared night under concurrent requests', async () => {
    const { a, b, id } = await connect()
    const results = await Promise.all([beginPairingNight({ db: b, coupleId: id, preset: 'quick' }), beginPairingNight({ db: a, coupleId: id, preset: 'quick' })])
    expect(results[0]).toBe(results[1])
    expect((await getDoc(doc(a, 'couples', id))).data().playerIds).toEqual(['alpha', 'beta'])
  })
  it('archives an uncommitted connection without deleting its saved history', async () => {
    const { a, b, id } = await connect(); await unpairAccounts({ db: a, coupleId: id, userId: 'alpha' })
    expect((await getDoc(doc(b, 'couples', id))).data().status).toBe('unpaired')
    expect((await getDoc(doc(b, 'pairingMoments', `${id}_connected`))).exists()).toBe(true)
    await expect(commit(b, id, 'beta')).rejects.toThrow()
    await assertSucceeds(deleteDoc(doc(b, 'playerCouples', 'beta')))
  })
  it('records first-night and later milestones once with private per-person receipts', async () => {
    const { a, b, id } = await connect()
    const players = (await getDoc(doc(a, 'couples', id))).data().players
    const args = { players, dateStr: '2026-10-29', heartsEarned: 6, sessionId: 'night-one', stats: {} }
    await recordNightComplete(a, id, args)
    await recordNightComplete(a, id, args)
    expect((await getDoc(doc(a, 'coupleProgress', id))).data().lifetimeNights).toBe(1)
    expect((await getDoc(doc(a, 'pairingMoments', `${id}_night_1`))).data().names).toEqual(['Alpha', 'Beta'])
    await acknowledgeMoment(a, 'alpha', `${id}_night_1`)
    expect((await getDoc(doc(a, 'profiles', 'alpha', 'celebrationReceipts', `${id}_night_1`))).exists()).toBe(true)
    await assertFails(getDoc(doc(b, 'profiles', 'alpha', 'celebrationReceipts', `${id}_night_1`)))
    await env.withSecurityRulesDisabled(async (context) => updateDoc(doc(context.firestore(), 'coupleProgress', id), { lifetimeNights: 9 }))
    await recordNightComplete(b, id, { ...args, sessionId: 'night-ten' })
    expect((await getDoc(doc(b, 'pairingMoments', `${id}_night_10`))).data().nights).toBe(10)
  })

  it('enriches a legacy waiting invitation without changing its code or history', async () => {
    const a = dbFor('alpha'), b = dbFor('beta')
    const id = await createPairingInvite({ db: a, userId: 'alpha', displayName: 'Alpha', origin: 'http://localhost' })
    const couple = { id, ...(await getDoc(doc(a, 'couples', id))).data() }
    await env.withSecurityRulesDisabled(async (context) => updateDoc(doc(context.firestore(), 'coupleInvites', couple.inviteCode), { hostId: deleteField() }))
    await expect(acceptPairingInvite({ db: b, userId: 'beta', displayName: 'Beta', code: couple.inviteCode })).rejects.toThrow(/open their invitation/)
    await refreshPairingInvite({ db: a, couple, userId: 'alpha' })
    await acceptPairingInvite({ db: b, userId: 'beta', displayName: 'Beta', code: couple.inviteCode })
    expect((await getDoc(doc(a, 'couples', id))).data().playerIds).toEqual(['alpha', 'beta'])
  })

  it('keeps ceremony receipts private and milestones immutable', async () => {
    const { a, b, id } = await connect()
    await assertFails(getDoc(doc(dbFor('outsider'), 'pairingMoments', `${id}_connected`)))
    await assertFails(deleteDoc(doc(a, 'pairingMoments', `${id}_connected`)))
    await assertFails(setDoc(doc(b, 'profiles', 'alpha', 'celebrationReceipts', `${id}_connected`), { seenAt: new Date() }))
  })
})
