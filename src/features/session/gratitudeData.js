export function getGratitudePrompt(prompts = [], sessionId = '', round = 1) {
  if (!prompts.length) return ''
  const seed = `${sessionId}:${round}`
  let hash = 2166136261
  for (const character of seed) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619)
  }
  return prompts[(hash >>> 0) % prompts.length]
}
