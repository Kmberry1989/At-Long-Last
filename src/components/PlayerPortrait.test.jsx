import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { PlayerPortrait } from './PlayerPortrait.jsx'
afterEach(cleanup)
it('displays the Google photo inside the selected decorative frame', () => {
  const { container } = render(<PlayerPortrait player={{ displayName: 'Kyle Berry', photoURL: 'https://lh3.googleusercontent.com/a/photo' }} frameId="rose" />)
  expect(screen.getByRole('img', { name: 'Kyle Berry · Rose Gilt frame' })).toBeVisible()
  expect(container.querySelector('img')).toHaveAttribute('src', 'https://lh3.googleusercontent.com/a/photo')
  expect(container.querySelector('.portrait-frame-art')).toBeInTheDocument()
  fireEvent.error(container.querySelector('img'))
  expect(screen.getByText('KB')).toBeVisible()
  expect(container.querySelector('img')).toBeNull()
})
it('uses initials without substituting the board piece when no Google photo exists', () => {
  const { container } = render(<PlayerPortrait player={{ displayName: 'Elaine Berry', avatar: '/assets/players/owl.glb' }} />)
  expect(screen.getByText('EB')).toBeVisible()
  expect(container.querySelector('img')).toBeNull()
})
