import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getDoc } from 'firebase/firestore'
import { resolveInviteRoom } from './coupleService.js'

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((db, collectionPath, docId) => ({ collectionPath, docId })),
  getDoc: vi.fn(),
}))

function docSnapshot(data) {
  return {
    data: () => data,
    exists: () => Boolean(data),
  }
}

describe('resolveInviteRoom', () => {
  beforeEach(() => {
    getDoc.mockReset()
  })

  it('resolves a private room from the invite host preview', async () => {
    getDoc
      .mockResolvedValueOnce(
        docSnapshot({
          coupleId: 'couple-1',
          hostAvatar: '/assets/players/owl.glb',
          hostName: 'Robin',
        }),
      )
      .mockResolvedValueOnce(docSnapshot(null))

    const room = await resolveInviteRoom({ code: 'abc234', db: {} })

    expect(room).toEqual({
      coupleId: 'couple-1',
      hostAvatar: '/assets/players/owl.glb',
      hostName: 'Robin',
      inviteCode: 'ABC234',
      isPublic: false,
    })
    expect(getDoc.mock.calls[0][0].collectionPath).toBe('coupleInvites')
    expect(getDoc.mock.calls[0][0].docId).toBe('ABC234')
    expect(getDoc.mock.calls[1][0].collectionPath).toBe('publicLobbies')
  })

  it('resolves a public room with its lobby row', async () => {
    getDoc
      .mockResolvedValueOnce(docSnapshot({ coupleId: 'couple-1' }))
      .mockResolvedValueOnce(
        docSnapshot({
          hostName: 'Robin',
          inviteCode: 'ABC234',
          playerCount: 1,
          status: 'open',
        }),
      )

    const room = await resolveInviteRoom({ code: 'abc234', db: {} })

    expect(room).toEqual({
      coupleId: 'couple-1',
      hostAvatar: null,
      hostName: 'Robin',
      inviteCode: 'ABC234',
      isPublic: true,
    })
  })

  it('rejects when the invite code is blank', async () => {
    await expect(resolveInviteRoom({ code: '  ', db: {} })).rejects.toThrow(
      /missing its code/,
    )
    expect(getDoc).not.toHaveBeenCalled()
  })

  it('rejects when the invite does not exist', async () => {
    getDoc.mockResolvedValueOnce(docSnapshot(null))

    await expect(resolveInviteRoom({ code: 'ZZZ999', db: {} })).rejects.toThrow(
      /Invite not found/,
    )
  })

  it('rejects when the public room is no longer open', async () => {
    getDoc
      .mockResolvedValueOnce(docSnapshot({ coupleId: 'couple-1' }))
      .mockResolvedValueOnce(
        docSnapshot({
          hostName: 'Robin',
          inviteCode: 'ABC234',
          playerCount: 2,
          status: 'paired',
        }),
      )

    await expect(resolveInviteRoom({ code: 'ABC234', db: {} })).rejects.toThrow(
      /no longer open/,
    )
  })
})
