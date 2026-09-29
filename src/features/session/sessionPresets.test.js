import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SESSION_PRESET,
  getSessionPreset,
  SESSION_PRESET_OPTIONS,
} from './sessionPresets.js'

describe('sessionPresets', () => {
  it('defaults new couples to the quick preset', () => {
    expect(DEFAULT_SESSION_PRESET).toBe('quick')
    expect(getSessionPreset(undefined).id).toBe('quick')
  })

  it('labels presets by time, not round counts', () => {
    const labels = Object.fromEntries(
      SESSION_PRESET_OPTIONS.map((preset) => [preset.id, preset]),
    )

    expect(labels.quick.label).toBe('Quick spark')
    expect(labels.quick.minutesLabel).toBe('~10 min')
    expect(labels.standard.label).toBe('Date night')
    expect(labels.standard.minutesLabel).toBe('~25 min')
    expect(labels.long.label).toBe('Stay awhile')
    expect(labels.long.minutesLabel).toBe('~40 min')
  })

  it('keeps round counts internal to the preset definition', () => {
    const rounds = Object.fromEntries(
      SESSION_PRESET_OPTIONS.map((preset) => [preset.id, preset.totalRounds]),
    )

    expect(rounds).toEqual({ quick: 4, standard: 6, long: 8 })
  })
})
