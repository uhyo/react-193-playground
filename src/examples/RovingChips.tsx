import { Fragment, useEffect, useRef, useState } from 'react'
import type { FragmentInstance } from 'react'

const SUGGESTIONS = ['Solid', 'Svelte', 'Vue', 'Angular', 'Preact', 'Qwik']

/**
 * Arrow-key navigation across a row of sibling chips, implemented with a
 * single keydown listener on the fragment plus focus()/focusLast() for
 * wrap-around — no wrapper element and no per-chip handlers.
 */
export function RovingChips() {
  const fragmentRef = useRef<FragmentInstance>(null)
  const [chips, setChips] = useState(['React', 'TypeScript', 'Vite', 'oxlint'])

  useEffect(() => {
    const instance = fragmentRef.current
    if (instance === null) {
      return
    }
    const handleKeyDown: EventListener = (event) => {
      const { key } = event as KeyboardEvent
      const chip = event.currentTarget
      if (!(chip instanceof HTMLElement)) {
        return
      }
      switch (key) {
        case 'ArrowRight': {
          const next = chip.nextElementSibling
          if (next instanceof HTMLElement) {
            next.focus()
          } else {
            instance.focus() // wrap around to the first chip
          }
          break
        }
        case 'ArrowLeft': {
          const prev = chip.previousElementSibling
          if (prev instanceof HTMLElement) {
            prev.focus()
          } else {
            instance.focusLast() // wrap around to the last chip
          }
          break
        }
        case 'Home':
          instance.focus()
          break
        case 'End':
          instance.focusLast()
          break
        case 'Escape':
          instance.blur()
          break
        default:
          return
      }
      event.preventDefault()
    }
    instance.addEventListener('keydown', handleKeyDown)
    return () => {
      instance.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const remaining = SUGGESTIONS.filter((s) => !chips.includes(s))

  return (
    <div className="demo">
      <div className="row">
        <button
          type="button"
          disabled={remaining.length === 0}
          onClick={() => setChips((prev) => [...prev, remaining[0]])}
        >
          Add “{remaining[0] ?? '…'}”
        </button>
        <span className="badge">
          ← → to move, Home/End to jump, Esc to blur, click to remove
        </span>
      </div>
      <div className="chip-row">
        <Fragment ref={fragmentRef}>
          {chips.map((chip) => (
            <button
              type="button"
              key={chip}
              className="chip"
              onClick={() =>
                setChips((prev) => prev.filter((c) => c !== chip))
              }
            >
              {chip} ✕
            </button>
          ))}
        </Fragment>
      </div>
      <p className="note">
        Focus a chip, then use the arrow keys. The keydown listener was added
        once via <code>addEventListener()</code> on the fragment; chips added
        later pick it up automatically, and wrap-around reuses{' '}
        <code>focus()</code>/<code>focusLast()</code>.
      </p>
    </div>
  )
}
