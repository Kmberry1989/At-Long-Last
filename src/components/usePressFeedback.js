import { useEffect } from 'react'

// Native :active varies across touch browsers. This visual-only attribute tracks
// a real press through pointer cancellation and keyboard release without changing clicks.
export function usePressFeedback() {
  useEffect(() => {
    let pressed = null
    let pointerId = null
    function release() {
      pressed?.removeAttribute('data-pressed')
      pressed = null
      pointerId = null
    }
    function press(target) {
      release()
      const control = target instanceof Element ? target.closest('button, summary') : null
      if (!control || control.disabled || control.getAttribute('aria-disabled') === 'true') return
      pressed = control
      pressed.setAttribute('data-pressed', 'true')
    }
    function down(event) {
      if (event.isPrimary === false || (event.button !== undefined && event.button !== 0)) return
      press(event.target)
      pointerId = event.pointerId
    }
    function move(event) {
      if (!pressed || event.pointerId !== pointerId) return
      const rect = pressed.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) release()
    }
    function keydown(event) {
      if (!event.repeat && (event.key === ' ' || event.key === 'Enter')) press(event.target)
    }
    const listeners = [['pointerdown', down], ['pointermove', move], ['pointerup', release], ['pointercancel', release], ['keydown', keydown], ['keyup', release], ['focusout', release], ['visibilitychange', release]]
    listeners.forEach(([name, handler]) => document.addEventListener(name, handler, true))
    window.addEventListener('blur', release)
    return () => {
      release()
      listeners.forEach(([name, handler]) => document.removeEventListener(name, handler, true))
      window.removeEventListener('blur', release)
    }
  }, [])
}
