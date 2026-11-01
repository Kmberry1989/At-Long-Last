import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { usePressFeedback } from './usePressFeedback.js'
afterEach(cleanup)
function Controls({ onClick }) { usePressFeedback(); return <><button onClick={onClick}>Quick</button><button disabled>Unavailable</button></> }
it('tracks a touch press and release without replacing the click action', () => {
  const click = vi.fn()
  render(<Controls onClick={click} />)
  const button=screen.getByRole('button',{name:'Quick'})
  fireEvent.pointerDown(button,{pointerId:1,isPrimary:true,button:0})
  expect(button).toHaveAttribute('data-pressed','true')
  fireEvent.pointerUp(button,{pointerId:1,isPrimary:true})
  expect(button).not.toHaveAttribute('data-pressed')
  fireEvent.click(button)
  expect(click).toHaveBeenCalledOnce()
})
it('clears cancelled or keyboard presses and ignores disabled controls', () => {
  render(<Controls />)
  const button=screen.getByRole('button',{name:'Quick'})
  fireEvent.keyDown(button,{key:' '})
  expect(button).toHaveAttribute('data-pressed','true')
  fireEvent.keyUp(button,{key:' '})
  expect(button).not.toHaveAttribute('data-pressed')
  fireEvent.pointerDown(button,{pointerId:1,isPrimary:true,button:0})
  fireEvent.pointerCancel(button,{pointerId:1})
  expect(button).not.toHaveAttribute('data-pressed')
  const disabled=screen.getByRole('button',{name:'Unavailable'})
  fireEvent.pointerDown(disabled,{pointerId:1,isPrimary:true,button:0})
  expect(disabled).not.toHaveAttribute('data-pressed')
})
