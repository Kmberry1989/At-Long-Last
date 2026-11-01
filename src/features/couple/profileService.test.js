import { afterEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ runTransaction: vi.fn() }))
vi.mock('firebase/firestore', () => ({ runTransaction: mocks.runTransaction, doc: vi.fn(), serverTimestamp: vi.fn(() => 'now'), setDoc: vi.fn() }))
import { ensureProfileDocument } from './profileService.js'
afterEach(() => vi.clearAllMocks())
describe('profile initialization', () => {
  it('shares an in-flight profile write across duplicate auth callbacks, then allows later logins', async () => {
    let finish
    mocks.runTransaction.mockImplementationOnce(() => new Promise(resolve => { finish = resolve })).mockResolvedValue(undefined)
    const args = { db: {}, user: { uid: 'a', displayName: 'A' } }
    const first = ensureProfileDocument(args)
    const duplicate = ensureProfileDocument(args)
    expect(mocks.runTransaction).toHaveBeenCalledTimes(1)
    finish()
    await Promise.all([first, duplicate])
    await ensureProfileDocument(args)
    expect(mocks.runTransaction).toHaveBeenCalledTimes(2)
  })
  it('releases the in-flight marker after a failed write so retry remains available', async () => {
    mocks.runTransaction.mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined)
    const args = { db: {}, user: { uid: 'a' } }
    await expect(ensureProfileDocument(args)).rejects.toThrow('offline')
    await ensureProfileDocument(args)
    expect(mocks.runTransaction).toHaveBeenCalledTimes(2)
  })
})
