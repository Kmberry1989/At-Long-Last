import { describe, expect, it } from 'vitest'
import { BOARD_THEME_SETS, getBoardCardPilePalette, getBoardThemeById, getBoardThemeForRound } from './boardThemes.js'

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
      expect(theme.surfaces.inset.texture).toMatch(/^\/assets\/board\/.+\.(png|jpg|svg)$/)
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

  it('gives every base and unlockable theme its own panorama, board ink, dice, spaces, and cards', () => {
    const themes = [
      ...Object.values(BOARD_THEME_SETS),
      ...['starlit-rooftop', 'autumn-embers', 'cherry-blossom', 'aurora-veil'].map(getBoardThemeById),
    ]
    expect(new Set(themes.map((theme) => theme.environment.panorama)).size).toBe(themes.length)
    expect(new Set(themes.map((theme) => theme.skinOverlay)).size).toBe(themes.length)
    expect(new Set(themes.map((theme) => theme.surfaces.inset.texture)).size).toBe(themes.length)

    for (const theme of themes) {
      expect(theme.environment.panorama).toMatch(/^\/assets\/board\/skyboxes\/.+\.webp$/)
      expect(theme.skinOverlay).toMatch(/^\/assets\/board\/skins\/.+\.svg$/)
      expect(theme.surfaces.inset.texture).toMatch(/^\/assets\/board\/.+\.(png|jpg|svg)$/)
      expect(theme.diceSkin).toMatchObject({ face: expect.stringMatching(/^#/), alternate: expect.stringMatching(/^#/), pip: expect.stringMatching(/^#/), edge: expect.stringMatching(/^#/), fabric: expect.stringMatching(/^#/) })
      expect(theme.spaceColors).toMatchObject({ connection: expect.stringMatching(/^#/), duel: expect.stringMatching(/^#/), heart: expect.stringMatching(/^#/), keepsake: expect.stringMatching(/^#/), oops: expect.stringMatching(/^#/ ) })
      expect(theme.cardSkin).toMatchObject({ top: expect.stringMatching(/^#/), bottom: expect.stringMatching(/^#/), ink: expect.stringMatching(/^#/), accent: expect.stringMatching(/^#/), border: expect.stringMatching(/^#/ ) })
    }
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

  it('gives every theme related but clearly different draw and discard shades', () => {
    const themes = [
      ...Object.values(BOARD_THEME_SETS),
      ...['starlit-rooftop', 'autumn-embers', 'cherry-blossom', 'aurora-veil'].map(getBoardThemeById),
    ]
    const brightness = hex => {
      const channels = [1, 3, 5].map(index => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
      const linear = channels.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
    }
    for (const theme of themes) {
      const palette = getBoardCardPilePalette(theme)
      expect(palette.draw).toMatch(/^#[0-9a-f]{6}$/i)
      expect(palette.discard).toMatch(/^#[0-9a-f]{6}$/i)
      expect(palette.discard).not.toBe(palette.draw)
      expect(brightness(palette.discard) - brightness(palette.draw)).toBeGreaterThan(0.08)
    }
    expect(new Set(themes.map(theme => getBoardCardPilePalette(theme).draw)).size).toBe(themes.length)
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
