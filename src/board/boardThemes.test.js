import { describe, expect, it } from 'vitest'
import { BOARD_THEME_SETS, getBoardThemeById, getBoardThemeForRound } from './boardThemes.js'

describe('board themes', () => {
  it('moves through each theme before repeating', () => {
    expect([1, 2, 3, 4, 5, 6].map((round) => getBoardThemeForRound(round).id)).toEqual([
      'cozy',
      'garden',
      'beach',
      'city',
      'holiday',
      'cozy',
    ])
  })

  it('uses five named, placeable decorations for every theme', () => {
    Object.values(BOARD_THEME_SETS).forEach((theme) => {
      expect(theme.decorations).toHaveLength(5)
      expect(theme.surfaces.inset.texture).toMatch(/^\/assets\/board\/.+\.png$/)
      expect(theme.surfaces.inset.repeat).toHaveLength(2)
      expect(theme.surfaces.tabletop.texture).toMatch(/^\/assets\/board\/.+\.png$/)
      expect(theme.surfaces.tabletop.repeat).toHaveLength(2)
      theme.decorations.forEach((decoration) => {
        expect(decoration.id).not.toMatch(/^object-/)
        expect(decoration.label).toBeTruthy()
        expect(decoration.model).toMatch(/^\/assets\/board\//)
        expect(decoration.position).toHaveLength(3)
      })
    })
  })

  it('gives each base and remix a defined sky and ambient motion without replacing the existing props', () => {
    for (const theme of Object.values(BOARD_THEME_SETS)) {
      expect(theme.environment).toMatchObject({
        top: expect.stringMatching(/^#[0-9a-f]{6}$/i),
        horizon: expect.stringMatching(/^#[0-9a-f]{6}$/i),
        mode: expect.any(String),
      })
      expect(theme.environment.count).toBeGreaterThan(0)
    }
    for (const id of ['starlit-rooftop', 'autumn-embers', 'cherry-blossom', 'aurora-veil']) {
      const remix = getBoardThemeById(id)
      expect(remix.environment.mode).toBeTruthy()
      expect(remix.decorations).toHaveLength(5)
    }
  })
})

describe('getBoardThemeById', () => {
  it('returns base sets unchanged', () => {
    expect(getBoardThemeById('garden')).toBe(BOARD_THEME_SETS.garden)
  })

  it('remixes unlockable themes onto base sets with new surface colors', () => {
    const remix = getBoardThemeById('starlit-rooftop')

    expect(remix.id).toBe('starlit-rooftop')
    expect(remix.label).toBe('Starlit Rooftop')
    expect(remix.decorations).toBe(BOARD_THEME_SETS.city.decorations)
    expect(remix.surfaces.tabletop.texture).toBe(
      BOARD_THEME_SETS.city.surfaces.tabletop.texture,
    )
    expect(remix.surfaces.tabletop.color).not.toBe(
      BOARD_THEME_SETS.city.surfaces.tabletop.color,
    )
  })

  it('returns null for missing or unknown ids', () => {
    expect(getBoardThemeById(null)).toBeNull()
    expect(getBoardThemeById('not-a-theme')).toBeNull()
  })
})
