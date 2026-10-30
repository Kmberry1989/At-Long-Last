import { describe, expect, it } from 'vitest'
import { pickFreshPrompt } from './promptRotation.js'
import { activityRegistry } from './activityRegistry.jsx'

const items = [{ id: 'a', prompt: 'A question?' }, { id: 'b', prompt: 'B question?' }, { id: 'c', prompt: 'C question?' }]
const page = prompt => ({ payload: { prompt } })

describe('couple question rotation', () => {
  it('passes history through the actual conversation, prediction, photo, and sealed registries', () => {
    for (const id of ['comfort-menu', 'mind-meld', 'prediction-box', 'the-vault', 'vibe-check', 'blind-canvas', 'photo-flashback', 'bluff-bidding', 'same-wavelength', 'mutual-yes']) {
      const entry = activityRegistry[id]
      const first = entry.createInitialState([], { random: () => 0 })
      const prompt = first.prompt || first.topic
      const next = entry.createInitialState([], { random: () => 0, history: [{ payload: { prompt } }] })
      expect(next.prompt || next.topic, id).not.toBe(prompt)
    }
  })
  it('uses unseen material across different activity families and sessions', () => {
    const history = [{ ...page('A QUESTION?'), sessionId: 'last-night', type: 'prediction' }, page('C question?')]
    expect(pickFreshPrompt(items, () => 0, history).id).toBe('b')
    expect(pickFreshPrompt(items, () => .999, history).id).toBe('b')
  })
  it('cycles to the least recent question after the bank is exhausted', () => {
    const history = [page('B question?'), page('A question?'), page('C question?'), page('B question?')]
    expect(pickFreshPrompt(items, () => 0, history).id).toBe('c')
    expect(pickFreshPrompt(items, () => 0, [page('C question?'), ...history]).id).toBe('a')
  })
  it('rotates plain-text prompts and does not confuse answers with questions', () => {
    expect(pickFreshPrompt(['A question?', 'B question?'], () => 0, [{ text: 'A question?', payload: { entries: [{ text: 'A question?' }] } }])).toBe('A question?')
    expect(pickFreshPrompt(['A question?', 'B question?'], () => 0, [page('A question?')])).toBe('B question?')
  })
  it('retains deterministic selection with no history and safely bounds random inputs', () => {
    expect(pickFreshPrompt(items, () => 0).id).toBe('a')
    expect(pickFreshPrompt(items, () => 1).id).toBe('c')
    expect(pickFreshPrompt(items, () => -1).id).toBe('a')
    expect(() => pickFreshPrompt([])).toThrow('no questions')
  })
})
