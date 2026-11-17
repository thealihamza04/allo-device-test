import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'allo-font'
import 'devices.css/dist/devices.css'
import './index.css'
import App from './App.jsx'
import Demo from './Demo.jsx'
import { keyStep, listenForSwipes } from './gestures.js'
// Device mockups load this same page with ?embed=1 inside an iframe,
// so the demo gets a real viewport of the device's size.
const params = new URLSearchParams(location.search)
const embed = params.has('embed')
if (embed) {
  document.documentElement.classList.add('embed')
  // Stands in for the device's top safe area (notch / dynamic island).
  document.documentElement.style.setProperty('--safe-top', `${params.get('safe') || 0}px`)

  // Swipes and arrow keys over a device screen switch mockups in the page
  // around it; sliders and other inputs keep their own drags and keys.
  if (parent !== window) {
    const send = dir => parent.postMessage({ type: 'carousel-step', dir }, location.origin)
    listenForSwipes(document, send)
    addEventListener('keydown', e => {
      const dir = keyStep(e)
      if (dir === null) return
      e.preventDefault()
      send(dir)
    })
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>{embed ? <Demo /> : <App />}</StrictMode>,
)
