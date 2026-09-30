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
 * Cross-score two wavelength submissions. Player one's guesses are checked
 * against player two's answers and vice versa — 2 possible matches per
 * prompt, 10 total. Cooperative: there is no winner, only a wavelength.
 */
export function scoreWavelengthDuel(resultOne, resultTwo) {
  const one = decodeWavelengthSubmission(resultOne?.excerpt)
  const two = decodeWavelengthSubmission(resultTwo?.excerpt)

  const rows = WAVELENGTH_PROMPTS.map((prompt, index) => {
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

export function getWavelengthOptionLabel(promptIndex, optionId) {
  const prompt = WAVELENGTH_PROMPTS[promptIndex]
  return prompt?.options.find((option) => option.id === optionId)?.label ?? '—'
}
