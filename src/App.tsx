import { useState, version } from 'react'
import './App.css'
import { examples } from './examples/index.ts'

function App() {
  const [activeId, setActiveId] = useState(examples[0].id)
  const active = examples.find((example) => example.id === activeId) ?? examples[0]
  const ActiveDemo = active.Component

  return (
    <main>
      <header className="hero">
        <h1>Fragment Refs</h1>
        <p>
          Running React <code>{version}</code> — pass a <code>ref</code> to{' '}
          <code>&lt;Fragment&gt;</code> and drive its children’s DOM as a
          group, with no wrapper element.
        </p>
      </header>
      <nav className="tabs" aria-label="Examples">
        {examples.map((example) => (
          <button
            type="button"
            key={example.id}
            aria-pressed={example.id === active.id}
            onClick={() => setActiveId(example.id)}
          >
            {example.title}
          </button>
        ))}
      </nav>
      <section className="example">
        <h2>{active.title}</h2>
        <p className="apis">
          {active.apis.map((api) => (
            <code key={api}>{api}</code>
          ))}
        </p>
        <p>{active.description}</p>
        <ActiveDemo key={active.id} />
      </section>
    </main>
  )
}

export default App
