import { readFile } from 'node:fs/promises'
import { initializeTestEnvironment, assertFails } from '@firebase/rules-unit-testing'
import { doc, getDoc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore'
import { beforeAll, beforeEach, afterAll, describe, it, expect } from 'vitest'
import { sendEmailInvitation, acceptEmailInvitation, declineEmailInvitation } from '../src/features/couple/emailInvitationService.js'
import { clearPlayerCoupleLink } from '../src/features/couple/coupleService.js'
import { unpairAccounts, commitPairing } from '../src/features/couple/pairingService.js'
let env
const email = (uid) => `${uid}@example.test`
const dbFor = (uid, address = email(uid), verified = true) => env.authenticatedContext(uid, { email: address, email_verified: verified }).firestore()
beforeAll(async () => { env = await initializeTestEnvironment({ projectId: 'demo-email-invitations', firestore: { host: '127.0.0.1', port: 8080, rules: await readFile('firestore.rules', 'utf8') } }) })
beforeEach(async () => env.clearFirestore())
afterAll(async () => env?.cleanup())
async function invite() {
  const a = dbFor('alpha'), b = dbFor('beta')
  const id = await sendEmailInvitation({ db: a, userId: 'alpha', email: email('alpha'), emailVerified: true, recipientEmail: ' BETA@EXAMPLE.TEST ', displayName: 'Alpha', avatar: '/assets/players/heart.glb', origin: 'http://localhost' })
  return { a, b, id }
}
const accept = (db, id, uid = 'beta', address = email(uid), verified = true) => acceptEmailInvitation({ db, invitationId: id, userId: uid, email: address, emailVerified: verified, displayName: uid, avatar: '/assets/players/globe-classic.glb' })
describe('verified email invitations', () => {
  it('normalizes the addressee and makes the invite discoverable only to that verified email', async () => {
    const { a, b, id } = await invite()
    expect((await getDoc(doc(a, 'emailInvitations', id))).data().recipientEmail).toBe(email('beta'))
    const inbox = await getDocs(query(collection(b, 'emailInvitations'), where('recipientEmail', '==', email('beta'))))
    expect(inbox.docs.map((d) => d.id)).toEqual([id])
    await assertFails(getDoc(doc(dbFor('outsider'), 'emailInvitations', id)))
    await assertFails(getDoc(doc(dbFor('beta', email('beta'), false), 'emailInvitations', id)))
    await assertFails(getDocs(collection(b, 'emailInvitations')))
    const couple = (await getDoc(doc(a, 'couples', id))).data()
    expect((await getDoc(doc(a, 'coupleInvites', couple.inviteCode))).exists()).toBe(false)
  })
  it('accepts once, banks the connection moment, and retains the mutual permanent commitment', async () => {
    const { a, b, id } = await invite()
    await accept(b, id)
    expect((await getDoc(doc(b, 'playerCouples', 'beta'))).data().coupleId).toBe(id)
    expect((await getDoc(doc(b, 'couples', id))).data().activeSessionId).toBeNull()
    expect((await getDoc(doc(a, 'pairingMoments', `${id}_connected`))).exists()).toBe(true)
    await commitPairing({ db: a, coupleId: id, userId: 'alpha', email: email('alpha'), emailVerified: true })
    await commitPairing({ db: b, coupleId: id, userId: 'beta', email: email('beta'), emailVerified: true })
    expect((await getDoc(doc(a, 'couples', id))).data().commitments).toHaveLength(2)
    await expect(unpairAccounts({ db: a, coupleId: id, userId: 'alpha' })).rejects.toThrow(/permanent/)
  })
  it('rejects wrong-email and unverified acceptance even if the client claims verification', async () => {
    const { id } = await invite()
    await expect(accept(dbFor('other'), id, 'other', email('beta'))).rejects.toThrow()
    await expect(accept(dbFor('beta', email('beta'), false), id)).rejects.toThrow()
  })
  it('supports decline and cancellation without letting sender forge recipient consent', async () => {
    const { a, b, id } = await invite()
    await assertFails(updateDoc(doc(a, 'emailInvitations', id), { status: 'declined' }))
    await declineEmailInvitation({ db: b, invitationId: id })
    expect((await getDoc(doc(a, 'emailInvitations', id))).data().status).toBe('declined')
    await expect(accept(b, id)).rejects.toThrow(/no longer/)
    await unpairAccounts({ db: a, coupleId: id, userId: 'alpha' })
    expect((await getDoc(doc(a, 'emailInvitations', id))).exists()).toBe(false)
  })
  it('rejects forged sender verification, sender email, and retargeting an existing invitation', async () => {
    const args = { userId: 'alpha', email: email('alpha'), emailVerified: true, recipientEmail: email('beta'), displayName: 'Alpha', origin: 'http://localhost' }
    await expect(sendEmailInvitation({ ...args, db: dbFor('alpha', email('alpha'), false) })).rejects.toThrow()
    await expect(sendEmailInvitation({ ...args, db: dbFor('alpha'), email: 'forged@example.test' })).rejects.toThrow()
    const { a, id } = await invite()
    await assertFails(updateDoc(doc(a, 'emailInvitations', id), { recipientEmail: 'other@example.test' }))
    await expect(sendEmailInvitation({ ...args, db: a, recipientEmail: 'other@example.test' })).rejects.toThrow(/Cancel/)
  })
  it('does not let stale invitation cleanup remove a newly accepted connection', async () => {
    const { a, b, id } = await invite()
    const outgoing = await sendEmailInvitation({ db: b, userId: 'beta', email: email('beta'), emailVerified: true, recipientEmail: email('alpha'), displayName: 'Beta', origin: 'http://localhost' })
    await unpairAccounts({ db: b, coupleId: outgoing, userId: 'beta' })
    await accept(b, id)
    await clearPlayerCoupleLink({ db: b, userId: 'beta', expectedCoupleId: outgoing })
    expect((await getDoc(doc(b, 'playerCouples', 'beta'))).data().coupleId).toBe(id)
    expect((await getDoc(doc(a, 'couples', id))).data().playerIds).toEqual(['alpha', 'beta'])
  })
  it('makes a canceled invitation unusable and prevents self-invitation', async () => {
    const { a, b, id } = await invite()
    await unpairAccounts({ db: a, coupleId: id, userId: 'alpha' })
    await expect(accept(b, id)).rejects.toThrow()
    await expect(sendEmailInvitation({ db: a, userId: 'alpha', email: email('alpha'), emailVerified: true, recipientEmail: email('alpha') })).rejects.toThrow(/own/)
  })
})
