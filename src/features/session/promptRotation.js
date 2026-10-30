function questionKey(value) {
  if (typeof value === 'string') return value.trim().toLowerCase()
  return questionKey(value?.prompt || value?.text || value?.topic || value?.label || value?.id || '')
}

/** Prefer unseen questions, then the least recently encountered question. */
export function pickFreshPrompt(items, random = Math.random, history = []) {
  if (!items.length) throw new Error('This activity has no questions available.')
  const lastSeen = new Map()
  // Journal subscriptions deliver newest first. Never inspect answer text.
  history.forEach((entry, index) => {
    for (const value of [entry.payload?.prompt, entry.payload?.topic]) {
      const key = questionKey(value)
      if (key && !lastSeen.has(key)) lastSeen.set(key, index)
    }
  })
  const ranks = items.map(item => lastSeen.get(questionKey(item)) ?? Infinity)
  const oldest = Math.max(...ranks)
  const pool = items.filter((_item, index) => ranks[index] === oldest)
  const index = Math.max(0, Math.min(pool.length - 1, Math.floor(random() * pool.length)))
  return pool[index]
}
