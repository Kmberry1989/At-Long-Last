import { describe, expect, it } from 'vitest'
import {
  computeMutualYes,
  createSalt,
  deriveSealedKey,
  isValidSalt,
  isValidSealedChoice,
  sealChoice,
  unsealChoice,
} from './sealedCrypto.js'

describe('sealedCrypto', () => {
  it('creates unique valid salts', () => {
    const a = createSalt()
    const b = createSalt()
    expect(isValidSalt(a)).toBe(true)
    expect(isValidSalt(b)).toBe(true)
    expect(a).not.toBe(b)
    expect(isValidSalt('nope')).toBe(false)
    expect(isValidSalt('0'.repeat(31))).toBe(false)
  })

  it('derives the same key regardless of salt order', async () => {
    const saltA = createSalt()
    const saltB = createSalt()
    const keyAB = await deriveSealedKey(saltA, saltB)
    const keyBA = await deriveSealedKey(saltB, saltA)
    // Round-trip through both key handles proves equality.
    const sealed = await sealChoice(keyAB, 'yes')
    expect(await unsealChoice(keyBA, sealed)).toBe('yes')
  })

  it('round-trips a choice through seal/unseal', async () => {
    const key = await deriveSealedKey(createSalt(), createSalt())
    const sealed = await sealChoice(key, 'maybe')
    expect(isValidSealedChoice(sealed)).toBe(true)
    expect(JSON.stringify(sealed)).not.toContain('maybe')
    expect(await unsealChoice(key, sealed)).toBe('maybe')
  })

  it('produces fresh ciphertext for the same choice', async () => {
    const key = await deriveSealedKey(createSalt(), createSalt())
    const first = await sealChoice(key, 'yes')
    const second = await sealChoice(key, 'yes')
    expect(first.data).not.toBe(second.data)
  })

  it('fails to decrypt with the wrong key', async () => {
    const key = await deriveSealedKey(createSalt(), createSalt())
    const other = await deriveSealedKey(createSalt(), createSalt())
    const sealed = await sealChoice(key, 'yes')
    await expect(unsealChoice(other, sealed)).rejects.toThrow()
  })

  it('computes mutual yes from a sealed partner choice', async () => {
    const saltA = createSalt()
    const saltB = createSalt()
    const key = await deriveSealedKey(saltA, saltB)
    const partnerSealed = await sealChoice(key, 'yes')

    expect(
      await computeMutualYes({
        myChoice: 'yes',
        partnerSealed,
        saltA,
        saltB,
      }),
    ).toBe(true)
    expect(
      await computeMutualYes({
        myChoice: 'maybe',
        partnerSealed,
        saltA,
        saltB,
      }),
    ).toBe(false)
  })

  it('rejects malformed inputs', async () => {
    const key = await deriveSealedKey(createSalt(), createSalt())
    await expect(sealChoice(key, '')).rejects.toThrow()
    await expect(unsealChoice(key, { iv: 'x' })).rejects.toThrow()
    await expect(deriveSealedKey('bad', createSalt())).rejects.toThrow()
    expect(isValidSealedChoice(null)).toBe(false)
    expect(isValidSealedChoice({ iv: 'a', data: 'b' })).toBe(true)
  })
})
