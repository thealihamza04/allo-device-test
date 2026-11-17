import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import foldableOpen from './assets/mockups/foldable-open.png'
import foldableClosed from './assets/mockups/foldable-closed.png'

// Tracks an element's layout size (unaffected by CSS transforms).
function useSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight })
    // Measure now too: ResizeObserver may not fire until the page is painted.
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

// Scales a fixed-size mockup down so it fits inside its container's width and
// height, without ever scaling up. The container must have a definite height.
export function FitScale({ width, height, children }) {
  const ref = useRef(null)
  const available = useSize(ref)

  const scale = available.width && available.height
    ? Math.min(1, available.width / width, available.height / height)
    : 1

  return (
    <div ref={ref} className="fit">
      <div style={{ width: width * scale, height: height * scale }}>
        <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// Renders the demo in an iframe with a real CSS viewport `viewportWidth` wide,
// scaled to fill whatever box the device frame gives it.
export function Screen({ viewportWidth, safeTop = 0, className = '', onViewport }) {
  const ref = useRef(null)
  const { width, height } = useSize(ref)
  const scale = width ? width / viewportWidth : 1
  const viewportHeight = Math.round(height / scale)

  useEffect(() => {
    if (width) onViewport?.(`${viewportWidth} × ${viewportHeight}`)
  }, [width, viewportWidth, viewportHeight, onViewport])

  return (
    <div ref={ref} className={`screen ${className}`}>
      {width > 0 && (
        <iframe
          title="Demo preview"
          src={`${location.pathname}?embed=1&safe=${safeTop}`}
          style={{
            width: viewportWidth,
            height: viewportHeight,
            transform: `scale(${scale})`,
          }}
        />
      )}
    </div>
  )
}

// devices.css markup shared by all its devices.
function CssDevice({ name, color, screen }) {
  return (
    <div className={`device device-${name} ${color ? `device-${color}` : ''}`}>
      <div className="device-frame">
        <div className="device-screen">{screen}</div>
      </div>
      <div className="device-stripe" />
      <div className="device-header" />
      <div className="device-sensors" />
      <div className="device-btns" />
      <div className="device-power" />
    </div>
  )
}

export function MacBook({ onViewport }) {
  return (
    <FitScale width={740} height={434}>
      <CssDevice name="macbook-pro" color="spacegray"
        screen={<Screen viewportWidth={1440}onViewport={onViewport} />} />
    </FitScale>
  )
}

export function IPad({ onViewport }) {
  return (
    <FitScale width={560} height={778}>
      <CssDevice name="ipad-pro" color="spacegray"
        screen={<Screen viewportWidth={834} onViewport={onViewport} />} />
    </FitScale>
  )
}

export function IPhone({ onViewport }) {
  return (
    <FitScale width={428} height={868}>
      <CssDevice name="iphone-14-pro" color="purple"
        screen={<Screen viewportWidth={393} safeTop={59} onViewport={onViewport} />} />
    </FitScale>
  )
}

// Foldable frames are user-supplied images with transparent screens
// (assets/mockups). Sizes and screen boxes are in image pixels.
const FOLDABLE = {
  open: {
    src: foldableOpen, width: 1222, height: 875,
    screen: { x: 27, y: 31, w: 1165, h: 818 }, viewportWidth: 960, safeTop: 0,
  },
  folded: {
    src: foldableClosed, width: 693, height: 962,
    screen: { x: 39, y: 27, w: 628, h: 912 }, viewportWidth: 440, safeTop: 64,
  },
}
// Screen box grows by this much under the frame, so no gap shows at its edge.
const OVERLAP = 3

function ImageDevice({ d, onViewport }) {
  const { x, y, w, h } = d.screen
  return (
    <FitScale width={d.width} height={d.height}>
      <div className="image-device" style={{ width: d.width, height: d.height }}>
        <div className="image-device-screen" style={{
          left: x - OVERLAP, top: y - OVERLAP, width: w + OVERLAP * 2, height: h + OVERLAP * 2,
        }}>
          <Screen viewportWidth={d.viewportWidth} safeTop={d.safeTop} onViewport={onViewport} />
        </div>
        <img className="image-device-frame" src={d.src} alt="" width={d.width} height={d.height} />
      </div>
    </FitScale>
  )
}

// Open and folded are two separate phones. Both stay mounted, so each has
// the site loaded before it is shown and keeps its own scroll and settings;
// the one not shown sits behind, invisible and unfocusable.
export function Foldable({ folded, onViewport }) {
  return (
    <div className="foldable-states">
      {['open', 'folded'].map(state => {
        const shown = (state === 'folded') === folded
        return (
          <div key={state} className={shown ? '' : 'foldable-standby'} inert={!shown}>
            <ImageDevice d={FOLDABLE[state]} onViewport={shown ? onViewport : undefined} />
          </div>
        )
      })}
    </div>
  )
}
