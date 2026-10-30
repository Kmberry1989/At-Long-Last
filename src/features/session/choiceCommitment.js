function hex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function choiceDigest(answerId, nonce) {
  return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${nonce}:${answerId}`))))
}

export async function commitChoice(answerId) {
  const nonce = hex(crypto.getRandomValues(new Uint8Array(24)))
  return { answerId, nonce, commitment: await choiceDigest(answerId, nonce) }
}

export async function verifyChoice(input, commitment) {
  return typeof input.answerId === 'string' && /^[a-f0-9]{48}$/.test(input.nonce || '') &&
    await choiceDigest(input.answerId, input.nonce) === commitment
}
