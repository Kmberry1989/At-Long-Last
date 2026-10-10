import { describe, expect, it } from 'vitest'
import {
  WAVELENGTH_MATCHES_TOTAL,
  WAVELENGTH_PROMPT_COUNT,
  WAVELENGTH_PROMPTS,
  decodeWavelengthSubmission,
  encodeWavelengthSubmission,
  getWavelengthOptionLabel,
  getWavelengthPromptsForSession,
  isValidWavelengthSubmission,
  pickWavelengthPrompts,
  scoreWavelengthDuel,
  wavelengthHearts,
  wavelengthVerdict,
} from './wavelengthDuelData.js'

describe('wavelength duel encoding', () => {
  it('round-trips answers and guesses through the excerpt', () => {
    const answers = ['a', 'b', 'c', 'd', 'a']
    const guesses = ['d', 'c', 'b', 'a', 'd']

    const decoded = decodeWavelengthSubmission(encodeWavelengthSubmission(answers, guesses))

    expect(decoded.answers).toEqual(answers)
    expect(decoded.guesses).toEqual(guesses)
  })

  it('keeps the excerpt well inside the 100-char rules budget', () => {
    const excerpt = encodeWavelengthSubmission(['a', 'b', 'c', 'd', 'a'], ['d', 'c', 'b', 'a', 'd'])
    expect(excerpt.length).toBeLessThanOrEqual(100)
  })

  it('rejects malformed excerpts', () => {
    expect(decodeWavelengthSubmission(null)).toBeNull()
    expect(decodeWavelengthSubmission('a=abc;g=abcde')).toBeNull()
    expect(decodeWavelengthSubmission('a=abcde;g=abcdz')).toBeNull()
    expect(decodeWavelengthSubmission('tampered')).toBeNull()
  })

  it('validates submissions before sealing', () => {
    expect(isValidWavelengthSubmission(['a', 'b', 'c', 'd', 'a'], ['a', 'b', 'c', 'd', 'a'])).toBe(true)
    expect(isValidWavelengthSubmission(['a', 'b'], ['a', 'b', 'c', 'd', 'a'])).toBe(false)
    expect(isValidWavelengthSubmission(['a', 'b', 'c', 'd', 'z'], ['a', 'b', 'c', 'd', 'a'])).toBe(false)
  })
})

describe('wavelength duel scoring', () => {
  it('scores a perfect round 10/10', () => {
    const one = { excerpt: encodeWavelengthSubmission(['a', 'b', 'c', 'd', 'a'], ['b', 'c', 'd', 'a', 'b']) }
    const two = { excerpt: encodeWavelengthSubmission(['b', 'c', 'd', 'a', 'b'], ['a', 'b', 'c', 'd', 'a']) }

    const { matches, rows, total } = scoreWavelengthDuel(one, two)

    expect(total).toBe(WAVELENGTH_MATCHES_TOTAL)
    expect(matches).toBe(10)
    expect(rows.every((row) => row.oneHit && row.twoHit)).toBe(true)
  })

  it('scores cross-player: my guesses against their answers', () => {
    // Player one guesses everything right; player two guesses nothing right.
    const one = { excerpt: encodeWavelengthSubmission(['a', 'a', 'a', 'a', 'a'], ['b', 'b', 'b', 'b', 'b']) }
    const two = { excerpt: encodeWavelengthSubmission(['b', 'b', 'b', 'b', 'b'], ['c', 'c', 'c', 'c', 'c']) }

    const { matches } = scoreWavelengthDuel(one, two)

    expect(matches).toBe(5)
  })

  it('scores zero when nobody matches', () => {
    const one = { excerpt: encodeWavelengthSubmission(['a', 'a', 'a', 'a', 'a'], ['b', 'b', 'b', 'b', 'b']) }
    const two = { excerpt: encodeWavelengthSubmission(['c', 'c', 'c', 'c', 'c'], ['d', 'd', 'd', 'd', 'd']) }

    const { matches } = scoreWavelengthDuel(one, two)

    expect(matches).toBe(0)
  })

  it('handles a missing or skipped opponent gracefully', () => {
    const one = { excerpt: encodeWavelengthSubmission(['a', 'a', 'a', 'a', 'a'], ['a', 'a', 'a', 'a', 'a']) }

    expect(scoreWavelengthDuel(one, null).matches).toBe(0)
    expect(scoreWavelengthDuel(one, { skipped: true }).matches).toBe(0)
  })
})

describe('wavelength hearts and verdicts', () => {
  it('floors hearts at 2 so a rough round never feels punishing', () => {
    expect(wavelengthHearts(0)).toBe(2)
    expect(wavelengthHearts(1)).toBe(2)
  })

  it('awards one heart per match above the floor', () => {
    expect(wavelengthHearts(5)).toBe(5)
    expect(wavelengthHearts(10)).toBe(10)
  })

  it('keeps verdicts warm at every score', () => {
    expect(wavelengthVerdict(10)).toContain('telepathic')
    expect(wavelengthVerdict(7)).toContain('Strong signal')
    expect(wavelengthVerdict(5)).toContain('Tuned in')
    expect(wavelengthVerdict(3)).toContain('unpredictable')
    expect(wavelengthVerdict(0)).toContain('out of sync')
  })

  it('labels options for the scorecard', () => {
    expect(getWavelengthOptionLabel(0, 'a')).toBe('Takeout + couch fort')
    expect(getWavelengthOptionLabel(99, 'a')).toBe('—')
  })
})

describe('wavelength prompt picking', () => {
  it('picks 5 unique prompts deterministically per seed', () => {
    const first = pickWavelengthPrompts('session-1:2:1:wavelength-duel')
    const second = pickWavelengthPrompts('session-1:2:1:wavelength-duel')
    const other = pickWavelengthPrompts('session-1:3:1:wavelength-duel')

    expect(first).toHaveLength(WAVELENGTH_PROMPT_COUNT)
    expect(new Set(first.map((prompt) => prompt.id)).size).toBe(WAVELENGTH_PROMPT_COUNT)
    expect(first.map((prompt) => prompt.id)).toEqual(second.map((prompt) => prompt.id))
    expect(other.map((prompt) => prompt.id)).not.toEqual(first.map((prompt) => prompt.id))
    first.forEach((prompt) => {
      expect(prompt.options).toHaveLength(4)
    })
  })

  it('derives the same prompts for both phones from the shared session', () => {
    const session = {
      currentDuel: { attempt: 1, id: 'wavelength-duel' },
      id: 'session-abc',
      round: 2,
    }

    const phoneOne = getWavelengthPromptsForSession(session)
    const phoneTwo = getWavelengthPromptsForSession(JSON.parse(JSON.stringify(session)))

    expect(phoneOne.map((prompt) => prompt.id)).toEqual(
      phoneTwo.map((prompt) => prompt.id),
    )
  })

  it('scores against the picked prompts, not the full pool', () => {
    const prompts = pickWavelengthPrompts('scoring-seed')
    const answers = ['a', 'a', 'a', 'a', 'a']
    const one = { excerpt: encodeWavelengthSubmission(answers, answers) }
    const two = { excerpt: encodeWavelengthSubmission(answers, answers) }

    const { matches, rows } = scoreWavelengthDuel(one, two, prompts)

    expect(matches).toBe(10)
    expect(rows).toHaveLength(WAVELENGTH_PROMPT_COUNT)
    expect(rows[0].prompt.id).toBe(prompts[0].id)
    expect(getWavelengthOptionLabel(0, 'a', prompts)).toBe(prompts[0].options[0].label)
  })

  it('draws from the full 15-prompt pool', () => {
    expect(WAVELENGTH_PROMPTS.length).toBe(15)
    expect(new Set(WAVELENGTH_PROMPTS.map((prompt) => prompt.id)).size).toBe(15)
  })
})
