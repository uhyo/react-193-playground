import { Fragment, useEffect, useRef, useState } from 'react'
import type { FragmentInstance, ReactNode } from 'react'
import { Log } from './Log.tsx'
import { useLog } from './useLog.ts'

/**
 * A reusable wrapper that attaches a click listener to whatever DOM its
 * children happen to render — without introducing a wrapper element.
 */
function ClickableGroup({
  onGroupClick,
  children,
}: {
  onGroupClick: EventListener
  children: ReactNode
}) {
  const fragmentRef = useRef<FragmentInstance>(null)

  useEffect(() => {
    const instance = fragmentRef.current
    if (instance === null) {
      return
    }
    instance.addEventListener('click', onGroupClick)
    return () => {
      instance.removeEventListener('click', onGroupClick)
    }
  }, [onGroupClick])

  return <Fragment ref={fragmentRef}>{children}</Fragment>
}

const CARDS = [
  { name: 'alpha', title: 'Card alpha', blurb: 'Click anywhere on me.' },
  { name: 'beta', title: 'Card beta', blurb: 'Or on my nested button.' },
  { name: 'gamma', title: 'Card gamma', blurb: 'I can be unmounted.' },
]

export function GroupEvents() {
  const [log, pushLog] = useLog()
  const [clicks, setClicks] = useState(0)
  const [showGamma, setShowGamma] = useState(true)

  const handleGroupClick: EventListener = (event) => {
    // The listener is attached to each first-level DOM child, so
    // currentTarget is the card, even when a nested element was clicked.
    const card = event.currentTarget
    const target = event.target
    if (!(card instanceof HTMLElement) || !(target instanceof Element)) {
      return
    }
    setClicks((c) => c + 1)
    pushLog(
      `click on <${target.tagName.toLowerCase()}> reached first-level child “${card.dataset.card}”`,
    )
  }

  return (
    <div className="demo">
      <div className="row">
        <span className="badge">group clicks: {clicks}</span>
        <button type="button" onClick={() => setShowGamma((s) => !s)}>
          {showGamma ? 'Unmount' : 'Mount'} card gamma
        </button>
      </div>
      <div className="card-row">
        <ClickableGroup onGroupClick={handleGroupClick}>
          {CARDS.filter((card) => card.name !== 'gamma' || showGamma).map(
            (card) => (
              <article key={card.name} className="card" data-card={card.name}>
                <h3>{card.title}</h3>
                <p>{card.blurb}</p>
                <button type="button">nested button</button>
              </article>
            ),
          )}
        </ClickableGroup>
      </div>
      <Log entries={log} />
      <p className="note">
        The listener lives on the fragment’s first-level children, so a card
        mounted later picks it up automatically — remount card gamma and click
        it.
      </p>
    </div>
  )
}
