import { useState } from 'react'
import GreetingWall from './GreetingWall.jsx'

const WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900]

const FEATURES = [
  { title: 'Variable weight', text: 'Every weight from Thin 100 to Black 900 comes from one font file.' },
  { title: 'Roundness axis', text: 'Slide from sharp to round to change how friendly it feels.' },
  { title: 'Optical size', text: 'Small text gets sturdier shapes and big headings get finer ones, automatically.' },
  { title: 'True obliques', text: 'Every weight has a properly drawn slanted version.' },
]

const ROWS = [
  ['Starter', '1,111', '$9.00'],
  ['Team', '24,880', '$49.00'],
  ['Business', '307,415', '$199.00'],
]

// A range input whose label and end labels are drawn in the axis they control.
function Slider({ label, min, max, value, onChange, labelStyle, ends }) {
  const fill = ((value - min) / (max - min)) * 100

  return (
    <label className="demo-slider">
      <span className="demo-slider-head">
        <span style={labelStyle}>{label}</span>
        <output>{value}</output>
      </span>
      <input type="range" min={min} max={max} step="1" value={value}
        style={{ '--fill': `${fill}%` }}
        onChange={e => onChange(+e.target.value)} />
      <span className="demo-slider-ends" aria-hidden="true">
        {ends.map(end => <span key={end.text} style={end.style}>{end.text}</span>)}
      </span>
    </label>
  )
}

export default function Demo() {
  const [weight, setWeight] = useState(700)
  const [round, setRound] = useState(50)
  const [oblique, setOblique] = useState(false)

  const style = {
    fontWeight: weight,
    fontVariationSettings: `"ROND" ${round}`,
    fontStyle: oblique ? 'italic' : 'normal',
  }

  return (
    <div className="demo">
      <header className="demo-nav">
        <span className="demo-logo">Allo</span>
        <nav>
          <a href="#type">Type</a>
          <a href="#features">Features</a>
          <a href="#numbers">Numbers</a>
        </nav>
      </header>

      <GreetingWall />

      <section className="demo-hero" id="type">
        <p className="demo-eyebrow">Free and open source typeface</p>
        <h1 style={style}>Your friendly neighborhood typeface</h1>
        <p className="demo-lead">
          Warm without being too cute, clear without being too cold. Made for screens and interfaces.
        </p>

        <div className="demo-controls">
          <Slider label="Weight" min={100} max={900} value={weight} onChange={setWeight}
            labelStyle={{ fontWeight: weight }}
            ends={[
              { text: 'Thin', style: { fontWeight: 100 } },
              { text: 'Black', style: { fontWeight: 900 } },
            ]} />
          <Slider label="Roundness" min={0} max={100} value={round} onChange={setRound}
            labelStyle={{ fontVariationSettings: `"ROND" ${round}` }}
            ends={[
              { text: 'Sharp', style: { fontVariationSettings: '"ROND" 0' } },
              { text: 'Round', style: { fontVariationSettings: '"ROND" 100' } },
            ]} />
          <label className="demo-switch">
            <input type="checkbox" role="switch" checked={oblique}
              onChange={e => setOblique(e.target.checked)} />
            <span className="demo-switch-track" aria-hidden="true" />
            <span style={{ fontStyle: oblique ? 'italic' : 'normal' }}>Oblique</span>
          </label>
        </div>
      </section>

      <section className="demo-weights" aria-label="Weights">
        {WEIGHTS.map(w => (
          <div key={w} style={{ fontWeight: w }}>
            <span className="demo-aa">Aa</span>
            <small>{w}</small>
          </div>
        ))}
      </section>

      <section className="demo-grid" id="features">
        {FEATURES.map(f => (
          <article key={f.title} className="demo-card">
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </article>
        ))}
      </section>

      <section className="demo-numbers" id="numbers">
        <h2>Tabular figures</h2>
        <table>
          <thead>
            <tr><th>Plan</th><th>Users</th><th>Price</th></tr>
          </thead>
          <tbody>
            {ROWS.map(r => (
              <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
        <p className="demo-extras">½ ¾ → ← (HELLO) 1:30 — “quotes”</p>
      </section>

      <footer className="demo-footer">Allo by Josh Puckett · SIL Open Font License</footer>
    </div>
  )
}
