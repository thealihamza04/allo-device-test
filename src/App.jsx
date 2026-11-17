import { useCallback, useEffect, useRef, useState } from 'react'
import { MacBook, IPad, IPhone, Foldable } from './Devices.jsx'
import { keyStep, listenForSwipes } from './gestures.js'

const SECTIONS = [
  { id: 'desktop', label: 'Desktop', device: 'MacBook Pro', Mockup: MacBook },
  { id: 'tablet', label: 'Tablet', device: 'iPad Pro', Mockup: IPad },
  { id: 'mobile', label: 'Mobile', device: 'iPhone 14 Pro', Mockup: IPhone },
  { id: 'foldable', label: 'Foldable', device: 'Foldable', Mockup: Foldable },
]

const LAST = SECTIONS.length - 1
const clamp = i => Math.max(0, Math.min(LAST, i))

const HINT = 'Swipe, drag, or press ← → to switch devices'
const HINT_MS = 4000
const STEP_TOAST_MS = 1600

function indexFromHash() {
  const i = SECTIONS.findIndex(s => `#${s.id}` === location.hash)
  return i < 0 ? 0 : i
}

function Section({ id, label, device, Mockup }) {
  const [viewport, setViewport] = useState('')
  const [folded, setFolded] = useState(false)
  const isFoldable = id === 'foldable'

  return (
    <>
      <div className="section-head">
        <div>
          <h2>{label}</h2>
          <p>{device}{isFoldable && (folded ? ', folded' : ', unfolded')} · viewport {viewport || '…'}</p>
        </div>
        {isFoldable && (
          <button className="toggle" onClick={() => setFolded(f => !f)}>
            {folded ? 'Unfold' : 'Fold'}
          </button>
        )}
      </div>
      <div className="slide-stage">
        <Mockup folded={folded} onViewport={setViewport} />
      </div>
    </>
  )
}

// A small message at the bottom: how to switch on load, then where you are.
function useToast() {
  const [toast, setToast] = useState({ text: HINT, id: 0 })
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), toast.id === 0 ? HINT_MS : STEP_TOAST_MS)
    return () => clearTimeout(t)
  }, [toast])

  const show = useCallback(text => {
    setToast(prev => ({ text, id: prev.id + 1 }))
    setVisible(true)
  }, [])

  return [toast.text, visible, show]
}

export default function App() {
  const [index, setIndex] = useState(indexFromHash)
  const [toastText, toastVisible, showToast] = useToast()
  const viewportRef = useRef(null)
  const shownIndex = useRef(index)

  const step = useCallback(dir => {
    setIndex(i => clamp(dir === 'first' ? 0 : dir === 'last' ? LAST : i + dir))
  }, [])

  // The URL names the shown mockup, so links and reloads land on it.
  useEffect(() => {
    history.replaceState(null, '', `#${SECTIONS[index].id}`)
    // Focus left in a now-hidden slide would send keys to a mockup off screen.
    if (document.activeElement?.closest('[inert]')) viewportRef.current.focus({ preventScroll: true })
    // Only a real switch replaces the hint shown on load.
    if (shownIndex.current === index) return
    shownIndex.current = index
    showToast(`${SECTIONS[index].label} · ${index + 1} of ${SECTIONS.length}`)
  }, [index, showToast])

  useEffect(() => {
    const onHash = () => setIndex(indexFromHash())
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const onKey = e => {
      const dir = keyStep(e)
      if (dir === null) return
      e.preventDefault()
      step(dir)
    }
    // Swipes and keys inside a device screen arrive from its iframe.
    const onMessage = e => {
      if (e.origin === location.origin && e.data?.type === 'carousel-step') step(e.data.dir)
    }
    addEventListener('keydown', onKey)
    addEventListener('message', onMessage)
    const stopSwipes = listenForSwipes(viewportRef.current, step)
    return () => {
      removeEventListener('keydown', onKey)
      removeEventListener('message', onMessage)
      stopSwipes()
    }
  }, [step])

  return (
    <main className="carousel" aria-roledescription="carousel" aria-label="Device mockups">
      <div className="carousel-viewport" ref={viewportRef} tabIndex={-1}>
        <div className="carousel-track" style={{ transform: `translateX(${-index * 100}%)` }}>
          {SECTIONS.map((s, i) => (
            <section
              key={s.id}
              className="carousel-slide"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${SECTIONS.length}: ${s.label}`}
              inert={i !== index}
            >
              <Section {...s} />
            </section>
          ))}
        </div>
      </div>
      <div className={`toast ${toastVisible ? 'is-visible' : ''}`} role="status" aria-live="polite">
        {toastText}
      </div>
    </main>
  )
}
