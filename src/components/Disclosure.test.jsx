/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Disclosure } from './Disclosure.jsx'

afterEach(cleanup)

describe('Disclosure', () => {
  it('keeps secondary content hidden until opened', () => {
    render(
      <Disclosure label="Other ways to join">
        <p>Public room browser</p>
      </Disclosure>,
    )

    const toggle = screen.getByRole('button', { name: /Other ways to join/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Public room browser')).toBeNull()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Public room browser')).toBeVisible()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Public room browser')).toBeNull()
  })
})
