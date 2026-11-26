import { describe, expect, it } from 'vitest'
import { activityDefinitions } from './contentPackData.js'
import { activityRegistry } from './activityRegistry.jsx'
import {
  ACTIVITY_PROMPT_VARIANTS,
  pickActivityPrompt,
} from './expandedPromptData.js'

const conversationDefinitions = activityDefinitions.filter((entry) => ['prompt', 'journal', 'ritual'].includes(entry.type))

// The full prompt pool for one conversation activity: the original question,
// the 11 variants from the expansion map (base activities only), and the
// prompts merged in from the Expanded Edition pack (4 for base activities,
// 12 for the new activities, which have no singular prompt or variants).
const promptPoolFor = (definition) => [
  definition.prompt,
  ...(ACTIVITY_PROMPT_VARIANTS[definition.id] ?? []),
  ...(definition.prompts ?? []),
].filter(Boolean)

describe('expanded activity prompts', () => {
  it('gives all 74 conversation activities distinct prompts with balanced vibes', () => {
    const baseDefinitions = conversationDefinitions.filter((entry) => ACTIVITY_PROMPT_VARIANTS[entry.id])
    const newDefinitions = conversationDefinitions.filter((entry) => !ACTIVITY_PROMPT_VARIANTS[entry.id])
    expect(conversationDefinitions).toHaveLength(74)
    expect(baseDefinitions).toHaveLength(63)
    expect(newDefinitions).toHaveLength(11)
    expect(Object.keys(ACTIVITY_PROMPT_VARIANTS).sort()).toEqual(baseDefinitions.map((entry) => entry.id).sort())
    const counts = { playful: 0, spicy: 0, tender: 0 }
    const prompts = []
    for (const definition of conversationDefinitions) {
      const variants = ACTIVITY_PROMPT_VARIANTS[definition.id]
      if (variants) {
        expect(variants, definition.id).toHaveLength(11)
        expect(definition.prompts, definition.id).toHaveLength(4)
      } else {
        expect(definition.prompts, definition.id).toHaveLength(12)
      }
      const pool = promptPoolFor(definition)
      expect(pool, definition.id).toHaveLength(variants ? 16 : 12)
      counts[definition.vibe] += pool.length
      prompts.push(...pool)
    }
    expect(counts).toEqual({ playful: 372, spicy: 384, tender: 384 })
    expect(prompts).toHaveLength(1140)
    expect(new Set(prompts.map((prompt) => prompt.trim().toLowerCase())).size).toBe(1140)
    expect(prompts.every((prompt) => prompt.trim().length > 0 && prompt.length <= 1000)).toBe(true)
  })

  it('selects prompt variants deterministically from the supplied random source', () => {
    const definition = activityDefinitions.find((activity) => activity.id === 'comfort-menu')
    expect(pickActivityPrompt(definition, () => 0)).toBe(definition.prompt)
    expect(pickActivityPrompt(definition, () => 0.999)).toBe(definition.prompts.at(-1))
  })

  it('reaches every prompt through the real registry before repeating, even across saved nights', () => {
    for (const definition of conversationDefinitions) {
      const pool = promptPoolFor(definition)
      const entry = activityRegistry[definition.id]
      const history = []
      const seen = new Set()
      for (let night = 0; night < pool.length; night += 1) {
        const state = entry.createInitialState([], { random: () => 0, history })
        expect(seen.has(state.prompt), `${definition.id}, night ${night}`).toBe(false)
        seen.add(state.prompt)
        history.unshift({ sessionId: `saved-night-${night}`, payload: { prompt: state.prompt } })
      }
      expect(seen).toEqual(new Set(pool))
      // The original question is now oldest, rather than choosing a recent repeat.
      expect(entry.createInitialState([], { random: () => 0, history }).prompt).toBe(pool[0])
    }
  })

  it('keeps expanded prompts in completed scrapbook results without changing the two-turn flow', () => {
    const players = [{ displayName: 'Alex' }, { displayName: 'Blair' }]
    for (const id of ['comfort-menu', 'museum-of-us', 'green-light-tonight', 'postcard-next-year']) {
      const definition = activityDefinitions.find((activity) => activity.id === id)
      const entry = activityRegistry[id]
      const initial = entry.createInitialState(players, { random: () => 0.999 })
      const first = entry.advance(initial, { input: { text: 'A little thought from Alex.' }, playerIndex: 0 })
      expect(first.completed).toBe(false)
      const second = entry.advance(first.state, { input: { text: 'A little thought from Blair.' }, playerIndex: 1 })
      expect(second.completed).toBe(true)
      const result = entry.resolve(second.state, players)
      expect(result.payload.prompt).toBe(definition.prompts.at(-1))
      expect(result.text).toContain('Alex: A little thought from Alex.')
      expect(result.text).toContain('Blair: A little thought from Blair.')
      if (id === 'postcard-next-year') expect(result.openAt).toBeTypeOf('string')
    }
  })
})
