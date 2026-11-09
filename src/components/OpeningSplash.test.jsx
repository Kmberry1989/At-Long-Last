import { act, cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OpeningSplash } from './OpeningSplash.jsx'

afterEach(() => { cleanup(); vi.useRealTimers() })

describe('opening splash', () => {
  it('fades the wordmark in from black, then reveals the app', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    const { container } = render(<OpeningSplash onComplete={onComplete} />)
    expect(container.querySelector('.opening-splash-wordmark')).toHaveAttribute('src', '/assets/ui/atlonglast-wordmark-lockup.png')
    expect(container.querySelector('.opening-splash')).not.toHaveClass('is-leaving')

    act(() => { vi.advanceTimersByTime(1350) })
    expect(container.querySelector('.opening-splash')).toHaveClass('is-leaving')
    expect(onComplete).toHaveBeenCalledOnce()
    act(() => { vi.advanceTimersByTime(700) })
    expect(container.querySelector('.opening-splash')).toBeNull()
  })
})
