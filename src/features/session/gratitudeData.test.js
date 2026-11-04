import { describe, expect, it } from 'vitest'
import { getGratitudePrompt } from './gratitudeData.js'

describe('Gratitude prompts', () => {
  it('uses a stable shared prompt for each session and round', () => {
    const prompts = ['A small kindness', 'A favorite memory', 'A thing I admire']
    expect(getGratitudePrompt(prompts, 'night-a', 1)).toBe(getGratitudePrompt(prompts, 'night-a', 1))
    expect(getGratitudePrompt(prompts, 'night-a', 1)).not.toBe(getGratitudePrompt(prompts, 'night-a', 2))
  })
})
