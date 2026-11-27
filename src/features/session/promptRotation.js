function questionKey(value) {
  if (typeof value === 'string') return value.trim().toLowerCase()
  return questionKey(value?.prompt || value?.text || value?.topic || value?.label || value?.id || '')
}

function stablePromptId(item) {
  const key = questionKey(item)
  let hash = 2166136261
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  const slug = key.normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 42) || 'prompt'
  return `${slug}-${(hash >>> 0).toString(36)}`
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
  const selected = pool[index]
  if (selected && typeof selected === 'object' && !selected.id) {
    return { ...selected, id: stablePromptId(selected) }
  }
  return selected
}
