import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { BrandIcon, BrandText } from './BrandIcon.jsx'
afterEach(cleanup)
it('replaces legacy decoration with scalable marks while preserving meaningful copy', () => {
  const { container } = render(<button><BrandText text="✦ Open scrapbook 💌" /></button>)
  expect(screen.getByRole('button', { name: 'Open scrapbook' })).toBeVisible()
  expect(container.querySelectorAll('svg[aria-hidden=true]')).toHaveLength(2)
  expect(container.textContent).not.toMatch(/[✦💌]/u)
})
it('supports a named meaningful icon without exposing decorative SVG paths', () => {
  render(<BrandIcon name="dice" label="Roll two dice" />)
  expect(screen.getByRole('img', { name: 'Roll two dice' })).toBeVisible()
})
