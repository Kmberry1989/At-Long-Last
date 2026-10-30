import { describe, expect, it } from 'vitest'
import { activityDefinitions } from './contentPackData.js'
import { activityRegistry } from './activityRegistry.jsx'
import {
  ACTIVITY_PROMPT_VARIANTS,
  pickActivityPrompt,
} from './expandedPromptData.js'

const conversationDefinitions = activityDefinitions.filter((entry) => ['prompt', 'journal', 'ritual'].includes(entry.type))

describe('expanded activity prompts', () => {
  it('gives all 63 conversation activities 12 distinct prompts with balanced vibes', () => {
    expect(conversationDefinitions).toHaveLength(63)
    expect(Object.keys(ACTIVITY_PROMPT_VARIANTS).sort()).toEqual(conversationDefinitions.map((entry) => entry.id).sort())
    const counts = { playful: 0, spicy: 0, tender: 0 }
    const prompts = []
    for (const definition of conversationDefinitions) {
      const variants = ACTIVITY_PROMPT_VARIANTS[definition.id]
      expect(variants, definition.id).toHaveLength(11)
      counts[definition.vibe] += variants.length
      prompts.push(definition.prompt, ...variants)
    }
    expect(counts).toEqual({ playful: 231, spicy: 231, tender: 231 })
    expect(prompts).toHaveLength(756)
    expect(new Set(prompts.map((prompt) => prompt.trim().toLowerCase())).size).toBe(756)
    expect(prompts.every((prompt) => prompt.trim().length > 0 && prompt.length <= 1000)).toBe(true)
  })

  it('selects prompt variants deterministically from the supplied random source', () => {
    const definition = activityDefinitions.find((activity) => activity.id === 'comfort-menu')
    expect(pickActivityPrompt(definition, () => 0)).toBe(definition.prompt)
    expect(pickActivityPrompt(definition, () => 0.999)).toBe(ACTIVITY_PROMPT_VARIANTS['comfort-menu'].at(-1))
  })

  it('reaches every prompt through the real registry before repeating, even across saved nights', () => {
    for (const definition of conversationDefinitions) {
      const entry = activityRegistry[definition.id]
      const history = []
      const seen = new Set()
      for (let night = 0; night < 12; night += 1) {
        const state = entry.createInitialState([], { random: () => 0, history })
        expect(seen.has(state.prompt), `${definition.id}, night ${night}`).toBe(false)
        seen.add(state.prompt)
        history.unshift({ sessionId: `saved-night-${night}`, payload: { prompt: state.prompt } })
      }
      expect(seen).toEqual(new Set([definition.prompt, ...ACTIVITY_PROMPT_VARIANTS[definition.id]]))
      // The original question is now oldest, rather than choosing a recent repeat.
      expect(entry.createInitialState([], { random: () => 0, history }).prompt).toBe(definition.prompt)
    }
  })

  it('keeps expanded prompts in completed scrapbook results without changing the two-turn flow', () => {
    const players = [{ displayName: 'Alex' }, { displayName: 'Blair' }]
    for (const id of ['comfort-menu', 'museum-of-us', 'green-light-tonight', 'postcard-next-year']) {
      const entry = activityRegistry[id]
      const initial = entry.createInitialState(players, { random: () => 0.999 })
      const first = entry.advance(initial, { input: { text: 'A little thought from Alex.' }, playerIndex: 0 })
      expect(first.completed).toBe(false)
      const second = entry.advance(first.state, { input: { text: 'A little thought from Blair.' }, playerIndex: 1 })
      expect(second.completed).toBe(true)
      const result = entry.resolve(second.state, players)
      expect(result.payload.prompt).toBe(ACTIVITY_PROMPT_VARIANTS[id].at(-1))
      expect(result.text).toContain('Alex: A little thought from Alex.')
      expect(result.text).toContain('Blair: A little thought from Blair.')
      if (id === 'postcard-next-year') expect(result.openAt).toBeTypeOf('string')
    }
  })
})
