/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveInviteRoom } from '../features/couple/coupleService.js'
import { InviteJoinScreen } from './InviteJoinScreen.jsx'

afterEach(cleanup)

vi.mock('../features/couple/coupleService.js', () => ({
  resolveInviteRoom: vi.fn(),
}))

const baseProps = {
  db: {},
  inviteCode: 'ABC123',
  nickname: '',
  onJoin: vi.fn(),
  onNicknameChange: vi.fn(),
  onUseCodeInstead: vi.fn(),
  working: false,
}

describe('InviteJoinScreen', () => {
  it('shows a warm resolving state instead of a bare spinner', () => {
    resolveInviteRoom.mockReturnValue(new Promise(() => {}))

    render(<InviteJoinScreen {...baseProps} />)

    expect(screen.getByText('Finding your night…')).toBeTruthy()
    expect(screen.getByText('Private Invite')).toBeTruthy()
  })

  it('shows host identity, privacy confirmation, and joins after a nickname', async () => {
    resolveInviteRoom.mockResolvedValue({
      coupleId: 'couple-1',
      hostName: 'Robin',
      inviteCode: 'ABC123',
      status: 'open',
    })
    const onJoin = vi.fn()

    const { rerender } = render(
      <InviteJoinScreen {...baseProps} onJoin={onJoin} />,
    )

    expect(await screen.findByText("Join Robin's private night?")).toBeTruthy()
    expect(
      screen.getByText(/This room is for two people — just you and Robin/),
    ).toBeTruthy()

    const joinButton = screen.getByRole('button', { name: /Join Robin's Night/ })
    expect(joinButton).toBeDisabled()

    rerender(
      <InviteJoinScreen
        {...baseProps}
        nickname="  Alex  "
        onJoin={onJoin}
        onNicknameChange={baseProps.onNicknameChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Join Robin's Night/ }))
    expect(onJoin).toHaveBeenCalledWith('Alex')
  })

  it('falls back to manual code entry when resolution fails', async () => {
    resolveInviteRoom.mockRejectedValue(new Error('Invite not found.'))
    const onUseCodeInstead = vi.fn()

    render(<InviteJoinScreen {...baseProps} onUseCodeInstead={onUseCodeInstead} />)

    expect(await screen.findByText('That invite did not land.')).toBeTruthy()
    expect(screen.getByText('Invite not found.')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Use A Code Instead' }))
    expect(onUseCodeInstead).toHaveBeenCalledTimes(1)
  })

  it('offers the six-character code fallback on a resolved invite', async () => {
    resolveInviteRoom.mockResolvedValue({
      coupleId: 'couple-1',
      hostName: 'Robin',
      inviteCode: 'ABC123',
      status: 'open',
    })
    const onUseCodeInstead = vi.fn()

    render(<InviteJoinScreen {...baseProps} onUseCodeInstead={onUseCodeInstead} />)

    expect(await screen.findByText("Join Robin's private night?")).toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', { name: 'Use a six-character code instead' }),
    )
    expect(onUseCodeInstead).toHaveBeenCalledTimes(1)
  })
})
