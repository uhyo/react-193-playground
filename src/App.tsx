import { useState, version } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main>
      <h1>React 19.3 Playground</h1>
      <p>
        Running React <code>{version}</code>
      </p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Count is {count}
      </button>
      <p>
        Edit <code>src/App.tsx</code> to start experimenting with React 19.3
        features.
      </p>
    </main>
  )
}

export default App
