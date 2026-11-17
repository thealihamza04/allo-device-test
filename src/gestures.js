const SWIPE_MIN = 50 // px of horizontal travel for a swipe or drag
const WHEEL_MIN = 60 // px of summed horizontal wheel delta for a trackpad swipe
const WHEEL_LOCK = 600 // ms before another trackpad swipe can step again

// Things that keep their own pointer drags and arrow keys.
const OWN_INPUT = 'input, textarea, select, button, a, [contenteditable]'

// Calls onStep(1) or onStep(-1) for a horizontal swipe on `el`: touch, pen or
// mouse drag, or a two-finger trackpad swipe. Vertical movement is left alone
// so the page still scrolls. Returns a cleanup function.
export function listenForSwipes(el, onStep) {
  let start = null

  const down = e => {
    if (e.button !== 0 || e.target.closest(OWN_INPUT)) return
    start = { x: e.clientX, y: e.clientY }
  }
  const up = e => {
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    start = null
    if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * 1.5) onStep(dx < 0 ? 1 : -1)
  }
  const cancel = () => { start = null }

  let sum = 0
  let locked = false
  let settle
  const wheel = e => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
    // Stops the browser's own back/forward swipe while over the carousel.
    e.preventDefault()
    if (locked) return
    sum += e.deltaX
    clearTimeout(settle)
    settle = setTimeout(() => { sum = 0 }, 200)
    if (Math.abs(sum) >= WHEEL_MIN) {
      onStep(sum > 0 ? 1 : -1)
      sum = 0
      locked = true
      setTimeout(() => { locked = false }, WHEEL_LOCK)
    }
  }

  el.addEventListener('pointerdown', down)
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', cancel)
  el.addEventListener('wheel', wheel, { passive: false })
  return () => {
    el.removeEventListener('pointerdown', down)
    el.removeEventListener('pointerup', up)
    el.removeEventListener('pointercancel', cancel)
    el.removeEventListener('wheel', wheel)
    clearTimeout(settle)
  }
}

// Maps a keydown to a carousel step, or null. Fields and sliders keep their keys.
export function keyStep(e) {
  if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.(OWN_INPUT.replace('button, a, ', ''))) return null
  return { ArrowRight: 1, ArrowLeft: -1, Home: 'first', End: 'last' }[e.key] ?? null
}
