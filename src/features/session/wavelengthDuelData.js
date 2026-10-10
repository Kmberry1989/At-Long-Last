/**
 * Wavelength Duel — the Happy-Couple-format simultaneous prediction duel
 * (research clone #2). Both partners answer for themselves AND guess their
 * partner's answer on the same prompt set. Matches earn shared hearts; the
 * per-prompt scorecard becomes the scrapbook artifact.
 *
 * Answers are encoded compactly into the duel result `excerpt` (rules allow
 * <= 100 chars) as `a=<answers>;g=<guesses>` with single-char option ids.
 */

export const WAVELENGTH_DUEL_ID = 'wavelength-duel'
export const WAVELENGTH_PROMPT_COUNT = 5
export const WAVELENGTH_MATCHES_TOTAL = WAVELENGTH_PROMPT_COUNT * 2

export const WAVELENGTH_PROMPTS = [
  {
    id: 'friday-night',
    options: [
      { id: 'a', label: 'Takeout + couch fort' },
      { id: 'b', label: 'Out with friends' },
      { id: 'c', label: 'Cooking something new together' },
      { id: 'd', label: 'Stargazing drive' },
    ],
    text: 'The ideal Friday night is…',
  },
  {
    id: 'best-gift',
    options: [
      { id: 'a', label: 'A handwritten letter' },
      { id: 'b', label: 'A surprise date, planned' },
      { id: 'c', label: 'Something sparkly' },
      { id: 'd', label: 'A whole free day, no plans' },
    ],
    text: 'The best gift to receive is…',
  },
  {
    id: 'recharge',
    options: [
      { id: 'a', label: 'Quiet solo time' },
      { id: 'b', label: 'Venting it all out' },
      { id: 'c', label: 'A long walk' },
      { id: 'd', label: 'Music + dance break' },
    ],
    text: 'After a long day, the recharge looks like…',
  },
  {
    id: 'dream-trip',
    options: [
      { id: 'a', label: 'Beach, nothing planned' },
      { id: 'b', label: 'City food tour' },
      { id: 'c', label: 'Cabin in the woods' },
      { id: 'd', label: 'Road trip, no map' },
    ],
    text: 'The dream trip together is…',
  },
  {
    id: 'love-moment',
    options: [
      { id: 'a', label: 'Coffee in bed' },
      { id: 'b', label: 'A random “thinking of you” text' },
      { id: 'c', label: 'A long, no-rush hug' },
      { id: 'd', label: 'A chore quietly handled' },
    ],
    text: 'The smallest moment that says “I love you”…',
  },
  {
    id: 'sunday-morning',
    options: [
      { id: 'a', label: 'Coffee and nowhere to be' },
      { id: 'b', label: 'A big cooked breakfast' },
      { id: 'c', label: 'A slow walk, no phones' },
      { id: 'd', label: 'Back to sleep, obviously' },
    ],
    text: 'The perfect slow Sunday morning starts with…',
  },
  {
    id: 'chore-least',
    options: [
      { id: 'a', label: 'Dishes. Always the dishes' },
      { id: 'b', label: 'Folding laundry' },
      { id: 'c', label: 'Cleaning the bathroom' },
      { id: 'd', label: 'Taking out the trash' },
    ],
    text: 'The chore you would happily never do again…',
  },
  {
    id: 'comfort-watch',
    options: [
      { id: 'a', label: 'The old sitcom, again' },
      { id: 'b', label: 'A cozy documentary' },
      { id: 'c', label: 'Reality TV, zero shame' },
      { id: 'd', label: 'Whatever is shortest' },
    ],
    text: 'The comfort rewatch when nothing else sounds good…',
  },
  {
    id: 'grocery-extra',
    options: [
      { id: 'a', label: 'Something from the bakery' },
      { id: 'b', label: 'Fancy cheese, obviously' },
      { id: 'c', label: 'Ice cream, obviously' },
      { id: 'd', label: 'Snacks for the couch' },
    ],
    text: 'The grocery run always ends with one extra…',
  },
  {
    id: 'day-over',
    options: [
      { id: 'a', label: 'Pajamas immediately' },
      { id: 'b', label: 'A hot shower' },
      { id: 'c', label: 'Couch + blanket cocoon' },
      { id: 'd', label: 'Cooking something nice' },
    ],
    text: 'The signal that the day is officially over…',
  },
  {
    id: 'road-trip-role',
    options: [
      { id: 'a', label: 'Driver, windows down' },
      { id: 'b', label: 'DJ, full control' },
      { id: 'c', label: 'Navigator with snacks' },
      { id: 'd', label: 'Passenger princess, napping' },
    ],
    text: 'On a road trip, your natural role is…',
  },
  {
    id: 'bad-day-fix',
    options: [
      { id: 'a', label: 'Vent it all out' },
      { id: 'b', label: 'A walk to clear the head' },
      { id: 'c', label: 'Comfort food, stat' },
      { id: 'd', label: 'Quiet time, then talk' },
    ],
    text: 'The fastest fix for a bad day…',
  },
  {
    id: 'weekend-project',
    options: [
      { id: 'a', label: 'Rearranging a room' },
      { id: 'b', label: 'Trying a new recipe' },
      { id: 'c', label: 'A thrift-store treasure hunt' },
      { id: 'd', label: 'Absolutely nothing, on purpose' },
    ],
    text: 'The ideal low-stakes weekend project…',
  },
  {
    id: 'sleep-essential',
    options: [
      { id: 'a', label: 'Total darkness' },
      { id: 'b', label: 'A fan humming' },
      { id: 'c', label: 'The good pillow arrangement' },
      { id: 'd', label: 'Cool room, warm blanket' },
    ],
    text: 'The non-negotiable for good sleep…',
  },
  {
    id: 'small-win',
    options: [
      { id: 'a', label: 'Dessert, obviously' },
      { id: 'b', label: 'Tell everyone immediately' },
      { id: 'c', label: 'A little dance' },
      { id: 'd', label: 'Bank it quietly, smile all day' },
    ],
    text: 'The right way to celebrate a small win…',
  },
]

export const WAVELENGTH_DUEL_DEFINITION = {
  durationSec: 180,
  howToPlay: [
    'Five quick prompts. Answer honestly for yourself, then guess what your partner will answer. Every match earns a shared heart — up to 10.',
  ],
  id: WAVELENGTH_DUEL_ID,
  intensity: 1,
  name: 'Wavelength Duel',
  skippable: true,
  tagline: 'Answer for you, guess for them. How in sync are you, really?',
  vibe: 'playful',
}

function isOptionId(value) {
  return value === 'a' || value === 'b' || value === 'c' || value === 'd'
}

export function encodeWavelengthSubmission(answers = [], guesses = []) {
  const answerPart = answers.slice(0, WAVELENGTH_PROMPT_COUNT).join('')
  const guessPart = guesses.slice(0, WAVELENGTH_PROMPT_COUNT).join('')
  return `a=${answerPart};g=${guessPart}`
}

export function decodeWavelengthSubmission(excerpt) {
  if (typeof excerpt !== 'string') {
    return null
  }

  const match = /^a=([a-d]{5});g=([a-d]{5})$/.exec(excerpt)
  if (!match) {
    return null
  }

  return {
    answers: match[1].split(''),
    guesses: match[2].split(''),
  }
}

export function isValidWavelengthSubmission(answers, guesses) {
  return (
    Array.isArray(answers) &&
    Array.isArray(guesses) &&
    answers.length === WAVELENGTH_PROMPT_COUNT &&
    guesses.length === WAVELENGTH_PROMPT_COUNT &&
    answers.every(isOptionId) &&
    guesses.every(isOptionId)
  )
}

/**
 * Deterministic per-duel prompt sampling. Both phones derive the same seed
 * from the shared session (id + round + duel attempt), so they always ask
 * the same 5 prompts without any extra Firestore writes.
 */
function hashSeedString(value) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mulberry32(seed) {
  let state = seed >>> 0
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pickWavelengthPrompts(seed, count = WAVELENGTH_PROMPT_COUNT) {
  const random = mulberry32(hashSeedString(String(seed ?? 'wavelength')))
  const pool = [...WAVELENGTH_PROMPTS]
  const picked = []
  const target = Math.min(count, pool.length)

  while (picked.length < target && pool.length > 0) {
    const index = Math.floor(random() * pool.length)
    picked.push(pool.splice(index, 1)[0])
  }

  return picked
}

export function getWavelengthPromptsForSession(session) {
  const duel = session?.currentDuel
  const seed = [session?.id, session?.round, duel?.attempt, duel?.id].join(':')
  return pickWavelengthPrompts(seed)
}

/**
 * Cross-score two wavelength submissions. Player one's guesses are checked
 * against player two's answers and vice versa — 2 possible matches per
 * prompt, 10 total. Cooperative: there is no winner, only a wavelength.
 */
export function scoreWavelengthDuel(resultOne, resultTwo, prompts) {
  const list = (prompts && prompts.length >= WAVELENGTH_PROMPT_COUNT ? prompts : WAVELENGTH_PROMPTS).slice(0, WAVELENGTH_PROMPT_COUNT)
  const one = decodeWavelengthSubmission(resultOne?.excerpt)
  const two = decodeWavelengthSubmission(resultTwo?.excerpt)

  const rows = list.map((prompt, index) => {
    const oneAnswer = one?.answers[index] ?? null
    const oneGuess = one?.guesses[index] ?? null
    const twoAnswer = two?.answers[index] ?? null
    const twoGuess = two?.guesses[index] ?? null
    const oneHit = oneGuess != null && twoAnswer != null && oneGuess === twoAnswer
    const twoHit = twoGuess != null && oneAnswer != null && twoGuess === oneAnswer

    return {
      oneAnswer,
      oneGuess,
      oneHit,
      prompt,
      twoAnswer,
      twoGuess,
      twoHit,
    }
  })

  const matches = rows.reduce(
    (total, row) => total + (row.oneHit ? 1 : 0) + (row.twoHit ? 1 : 0),
    0,
  )

  return { matches, rows, total: WAVELENGTH_MATCHES_TOTAL }
}

export function wavelengthHearts(matches) {
  // Participation floor (no guilt for a gloriously out-of-sync round),
  // attunement bonus on top.
  return Math.max(2, Math.min(WAVELENGTH_MATCHES_TOTAL, matches))
}

export function wavelengthVerdict(matches) {
  if (matches >= 9) {
    return 'Practically telepathic.'
  }
  if (matches >= 7) {
    return 'Strong signal, tiny static.'
  }
  if (matches >= 5) {
    return 'Tuned in, still discovering.'
  }
  if (matches >= 3) {
    return 'Beautifully unpredictable.'
  }
  return 'Gloriously out of sync — and still here.'
}

export function getWavelengthOptionLabel(promptIndex, optionId, prompts) {
  const list = (prompts && prompts.length > promptIndex ? prompts : WAVELENGTH_PROMPTS).slice(0, WAVELENGTH_PROMPT_COUNT)
  const prompt = list[promptIndex]
  return prompt?.options.find((option) => option.id === optionId)?.label ?? '—'
}
