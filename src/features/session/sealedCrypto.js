/**
 * Sealed-choice cryptography for consent-safe mutual matching.
 *
 * Threat model: the two partners are curious, not adversarial. The goal is
 * that a unilateral "yes" on a Mutual Yes card is never stored in plaintext
 * in Firestore (activity documents or journal entries) and never rendered
 * for the partner to see. Both clients derive the same AES-GCM key from
 * random salts they exchange, encrypt their own choice locally, and only
 * ever write ciphertext. Each client decrypts in memory, computes the
 * mutual-yes outcome, and persists only that boolean outcome.
 *
 * Residual risk, stated plainly: anyone with read access to the activity
 * document holds both salts and both ciphertexts, so a determined reader
 * could re-derive the key and decrypt. What this prevents is casual
 * recovery — opening DevTools, reading the journal, or glimpsing a
 * synced document will never surface a plaintext unilateral yes.
 */

const SALT_BYTES = 16
const IV_BYTES = 12

function getCrypto() {
  const cryptoRef =
    typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
  if (!cryptoRef?.subtle || !cryptoRef?.getRandomValues) {
    throw new Error('WebCrypto is unavailable in this environment.')
  }
  return cryptoRef
}

function toHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function toBase64(bytes) {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  if (typeof btoa === 'function') {
    return btoa(binary)
  }
  // Node fallback for tests.
  return Buffer.from(binary, 'binary').toString('base64')
}

function fromBase64(base64) {
  if (typeof atob === 'function') {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }
  return new Uint8Array(Buffer.from(base64, 'base64'))
}

/** A fresh random salt, hex-encoded. Salts are public; the choice is not. */
export function createSalt() {
  const cryptoRef = getCrypto()
  return toHex(cryptoRef.getRandomValues(new Uint8Array(SALT_BYTES)))
}

export function isValidSalt(value) {
  return typeof value === 'string' && /^[0-9a-f]{32}$/i.test(value)
}

/**
 * Derive the shared AES-GCM key from both players' salts.
 * Ordering is canonicalized so both clients derive the same key
 * regardless of who submitted first.
 */
export async function deriveSealedKey(saltA, saltB) {
  if (!isValidSalt(saltA) || !isValidSalt(saltB)) {
    throw new Error('Both salts are required to derive the sealed key.')
  }
  const cryptoRef = getCrypto()
  const [first, second] = [saltA.toLowerCase(), saltB.toLowerCase()].sort()
  const keyMaterial = await cryptoRef.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${first}|${second}`),
  )
  return cryptoRef.subtle.importKey('raw', keyMaterial, 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ])
}

/** Encrypt a choice string. Returns { iv, data } base64 ciphertext. */
export async function sealChoice(key, choice) {
  if (typeof choice !== 'string' || choice.length === 0 || choice.length > 32) {
    throw new Error('Choice must be a short non-empty string.')
  }
  const cryptoRef = getCrypto()
  const iv = cryptoRef.getRandomValues(new Uint8Array(IV_BYTES))
  const ciphertext = await cryptoRef.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(choice),
  )
  return { iv: toBase64(iv), data: toBase64(new Uint8Array(ciphertext)) }
}

/** Decrypt a sealed choice back to its plaintext string. */
export async function unsealChoice(key, sealed) {
  const cryptoRef = getCrypto()
  if (
    !sealed ||
    typeof sealed.iv !== 'string' ||
    typeof sealed.data !== 'string' ||
    sealed.iv.length > 64 ||
    sealed.data.length > 256
  ) {
    throw new Error('Malformed sealed choice.')
  }
  const plaintext = await cryptoRef.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(sealed.iv) },
    key,
    fromBase64(sealed.data),
  )
  return new TextDecoder().decode(plaintext)
}

export function isValidSealedChoice(value) {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof value.iv === 'string' &&
    typeof value.data === 'string' &&
    value.iv.length > 0 &&
    value.iv.length <= 64 &&
    value.data.length > 0 &&
    value.data.length <= 256
  )
}

/**
 * Convenience helper used by the Mutual Yes card: given both salts and the
 * partner's sealed choice, decrypt it and report whether both choices are
 * the given "yes" choice id.
 */
export async function computeMutualYes({ myChoice, partnerSealed, saltA, saltB, yesId = 'yes' }) {
  const key = await deriveSealedKey(saltA, saltB)
  const partnerChoice = await unsealChoice(key, partnerSealed)
  return myChoice === yesId && partnerChoice === yesId
}
