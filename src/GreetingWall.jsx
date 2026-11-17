// Greetings and Allo's interface symbols, each pulsing between Thin and
// Black on its own timing. Rows are fixed so words never jump lines while
// their widths change; narrow screens split each row in two.
const ROWS = [
  ['Hello', '★', 'Hola', '⌫', 'Ciao', '♥', 'Hallo'],
  ['Salam', '×', 'Hej', '⌕', 'Aloha', '&', 'Bonjour'],
  ['Ahoj', '⌘', 'Salve', '⚠', 'Moi', '⇧', 'Servus'],
  ['Namaste', '⌥', 'Oi', '→', 'Merhaba', '↵', 'Szia'],
  ['Jambo', '§', 'Shalom', '›', 'Tere', '#', 'Hoi'],
]

const COLORS = ['#ff2d55', '#1ee3c4', '#2f7bff', '#ff9500', '#00c7ff', '#b43cff', '#ffd60a', '#34e05a', '#ff2bd6', '#c49a6c']

// Small seeded generator, so colors and timings stay the same on every load.
function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

const rand = seeded(7)
const TOKENS = ROWS.map(row => row.map(text => ({
  text,
  color: COLORS[Math.floor(rand() * COLORS.length)],
  duration: 2.4 + rand() * 2.6,
  delay: -rand() * 5,
})))

function Token({ text, color, duration, delay }) {
  return (
    <span style={{ color, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}>
      {text}
    </span>
  )
}

function Row({ tokens }) {
  return (
    <div className="wall-row">
      {tokens.map((t, i) => <Token key={i} {...t} />)}
    </div>
  )
}

export default function GreetingWall() {
  return (
    <section className="wall" aria-label="Hello in many languages, in every Allo weight">
      <div className="wall-wide">
        {TOKENS.map((row, i) => <Row key={i} tokens={row} />)}
      </div>
      <div className="wall-narrow">
        {TOKENS.flatMap((row, i) => [
          <Row key={`${i}a`} tokens={row.slice(0, 4)} />,
          <Row key={`${i}b`} tokens={row.slice(4)} />,
        ])}
      </div>
    </section>
  )
}
