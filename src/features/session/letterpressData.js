export const LETTERPRESS_PROMPTS = [
  'A small ritual we should keep is…',
  'The coziest ordinary evening includes…',
  'A place that feels like ours is…',
  'One tiny adventure we should take…',
  'A perfect slow morning begins with…',
  'The sound that feels like home…',
  'A tradition we could start this week…',
  'The best kind of unexpected day…',
  'A little thing that always makes me smile…',
  'Our ideal hideaway would have…',
  'One memory I want to make with you…',
  'A shared home should always feel…',
  'The loveliest way to spend an hour…',
  'A meal tastes better when…',
  'Our private celebration dance needs…',
  'A note I would leave for you says…',
  'A rainy afternoon is made for…',
  'A tiny promise for an ordinary day…',
  'The best view is better with…',
  'One thing we should plant or grow…',
  'A favorite chapter still ahead…',
  'The gentlest way to say “I’m here”…',
  'A keepsake from tonight might be…',
  'When the world gets loud, we can…',
]

export function getLetterpressPrompt(sessionId = '', round = 1) {
  const seed = `${sessionId}:${round}`
  let hash = 2166136261
  for (const character of seed) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619)
  }
  return LETTERPRESS_PROMPTS[(hash >>> 0) % LETTERPRESS_PROMPTS.length]
}

export function getLetterpressWords(value) {
  return String(value || '').trim().split(/\s+/).filter(Boolean).slice(0, 4)
}

export function weaveLetterpressWords(wordsOne = [], wordsTwo = []) {
  const woven = []
  for (let index = 0; index < Math.max(wordsOne.length, wordsTwo.length); index += 1) {
    if (wordsOne[index]) woven.push(wordsOne[index])
    if (wordsTwo[index]) woven.push(wordsTwo[index])
  }
  return woven.join(' ')
}
