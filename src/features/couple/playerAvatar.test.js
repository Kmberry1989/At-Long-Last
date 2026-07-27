import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PLAYER_AVATAR,
  getPlayerPiece,
  PLAYER_PIECES,
  resolvePlayerAvatar,
} from './playerAvatar.js'

describe('playerAvatar', () => {
  it('keeps the available player model', () => {
    expect(resolvePlayerAvatar(DEFAULT_PLAYER_AVATAR)).toBe(
      DEFAULT_PLAYER_AVATAR,
    )
  })

  it('offers every shipped player model with a matching preview', () => {
    expect(PLAYER_PIECES).toHaveLength(53)
    expect(new Set(PLAYER_PIECES.map((piece) => piece.avatar)).size).toBe(53)
    expect(PLAYER_PIECES.every((piece) => (
      piece.avatar.endsWith(`${piece.id}.glb`) &&
      piece.thumbnail.endsWith(`${piece.id}.webp`)
    ))).toBe(true)
    expect(getPlayerPiece('/assets/players/owl.glb').label).toBe('Owl')
  })

  it('normalizes legacy and unknown player models before loading', () => {
    expect(resolvePlayerAvatar('/assets/players/rochelle.glb')).toBe(
      DEFAULT_PLAYER_AVATAR,
    )
    expect(resolvePlayerAvatar('/assets/players/missing.glb')).toBe(
      DEFAULT_PLAYER_AVATAR,
    )
    expect(resolvePlayerAvatar()).toBe(DEFAULT_PLAYER_AVATAR)
  })
})
