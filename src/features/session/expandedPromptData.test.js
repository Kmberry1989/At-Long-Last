import { describe, expect, it } from 'vitest'
import { activityDefinitions } from './contentPackData.js'
import {
  ACTIVITY_PROMPT_VARIANTS,
  pickActivityPrompt,
} from './expandedPromptData.js'

describe('expanded activity prompts', () => {
  it('adds sixty balanced prompt variants to registered activities', () => {
    const definitions = new Map(
      activityDefinitions.map((definition) => [definition.id, definition]),
    )
    const counts = {
      playful: 0,
      spicy: 0,
      tender: 0,
    }
    const prompts = []

    Object.entries(ACTIVITY_PROMPT_VARIANTS).forEach(([activityId, variants]) => {
      const definition = definitions.get(activityId)
      expect(definition).toBeDefined()
      counts[definition.vibe] += variants.length
      prompts.push(...variants)
    })

    expect(counts).toEqual({
      playful: 20,
      spicy: 20,
      tender: 20,
    })
    expect(prompts).toHaveLength(60)
    expect(new Set(prompts).size).toBe(prompts.length)
  })

  it('selects prompt variants deterministically from the supplied random source', () => {
    const definition = activityDefinitions.find(
      (activity) => activity.id === 'comfort-menu',
    )

    expect(pickActivityPrompt(definition, () => 0)).toBe(definition.prompt)
    expect(pickActivityPrompt(definition, () => 0.999)).toBe(
      ACTIVITY_PROMPT_VARIANTS['comfort-menu'].at(-1),
    )
  })
})
