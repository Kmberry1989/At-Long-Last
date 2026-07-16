import { describe, expect, it, vi } from 'vitest'
import {
  buildCreateCouplePayload,
  buildInviteLookupPayload,
  buildJoinCouplePatch,
  buildLeaveCouplePatch,
  buildPlayerCoupleLinkPayload,
  createInviteCode,
  normalizeInviteCode,
} from './coupleService.js'

describe('coupleService', () => {
  it('normalizes invite codes', () => {
    expect(normalizeInviteCode('ab-12 cd!')).toBe('AB2CD')
  })

  it('creates deterministic invite codes', () => {
    const random = vi
      .fn()
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.4)
      .mockReturnValueOnce(0.5)

    expect(createInviteCode(random)).toHaveLength(6)
  })

  it('builds the initial couple payload', () => {
    const payload = buildCreateCouplePayload({
      displayName: 'Kyle',
      inviteCode: 'ABC123',
      origin: 'https://example.com',
      userId: 'u1',
    })

    expect(payload.players).toHaveLength(1)
    expect(payload.playerIds).toEqual(['u1'])
    expect(payload.shareLink).toBe('https://example.com/?code=ABC123')
    expect(payload.boardState).toEqual({
      playfulStickerIds: [],
      spicyGlowLevel: 0,
      tenderStars: 0,
    })
  })

  it('builds a minimal invite lookup payload', () => {
    expect(buildInviteLookupPayload({ coupleId: 'couple-1' })).toEqual({
      coupleId: 'couple-1',
    })
  })

  it('builds a player-to-couple link payload', () => {
    expect(buildPlayerCoupleLinkPayload({ coupleId: 'couple-1' })).toEqual({
      coupleId: 'couple-1',
    })
  })

  it('adds the second player when joining', () => {
    const patch = buildJoinCouplePatch(
      {
        playerIds: ['u1'],
        players: [{ uid: 'u1', displayName: 'One' }],
        status: 'waiting',
      },
      { displayName: 'Two', userId: 'u2' },
    )

    expect(patch.playerIds).toEqual(['u1', 'u2'])
    expect(patch.players[1].displayName).toBe('Two')
    expect(patch.status).toBe('paired')
  })

  it('keeps the remaining player when someone leaves before the session starts', () => {
    const patch = buildLeaveCouplePatch(
      {
        playerIds: ['u1', 'u2'],
        players: [
          { uid: 'u1', displayName: 'One' },
          { uid: 'u2', displayName: 'Two' },
        ],
        status: 'paired',
      },
      'u2',
    )

    expect(patch.playerIds).toEqual(['u1'])
    expect(patch.players).toEqual([{ uid: 'u1', displayName: 'One' }])
    expect(patch.status).toBe('waiting')
  })

  it('returns null when the last player leaves a couple', () => {
    expect(
      buildLeaveCouplePatch(
        {
          playerIds: ['u1'],
          players: [{ uid: 'u1', displayName: 'One' }],
          status: 'waiting',
        },
        'u1',
      ),
    ).toBeNull()
  })
})
