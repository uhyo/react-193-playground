import { Fragment, useEffect, useRef } from 'react'
import type { FragmentInstance, MouseEvent as ReactMouseEvent } from 'react'
import { Log } from './Log.tsx'
import { useLog } from './useLog.ts'

/**
 * A fragment has no DOM node, yet its FragmentInstance can dispatch events
 * that bubble to the real DOM parent, and it knows where it sits in the
 * document via compareDocumentPosition().
 */
export function FragmentGhost() {
  const fragmentRef = useRef<FragmentInstance>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [log, pushLog] = useLog()

  // A plain-DOM listener on the parent card — the kind of code that lives
  // outside React entirely (analytics, web components, jQuery-era widgets).
  useEffect(() => {
    const card = cardRef.current
    if (card === null) {
      return
    }
    const handlePing = (event: Event) => {
      const detail = (event as CustomEvent<{ from: string }>).detail
      pushLog(`parent <div> caught bubbling "fragment-ping" from ${detail.from}`)
      card.classList.remove('pinged')
      // Restart the flash animation.
      void card.offsetWidth
      card.classList.add('pinged')
    }
    card.addEventListener('fragment-ping', handlePing)
    return () => {
      card.removeEventListener('fragment-ping', handlePing)
    }
  }, [pushLog])

  const locate = (event: ReactMouseEvent) => {
    const instance = fragmentRef.current
    const target = event.target
    if (instance === null || !(target instanceof Element)) {
      return
    }
    const mask = instance.compareDocumentPosition(target)
    let where = 'somewhere unexpected'
    if (mask & Node.DOCUMENT_POSITION_CONTAINED_BY) {
      where = 'inside the fragment group'
    } else if (mask & Node.DOCUMENT_POSITION_FOLLOWING) {
      where = 'after the fragment group'
    } else if (mask & Node.DOCUMENT_POSITION_PRECEDING) {
      where = 'before the fragment group'
    } else if (mask & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC) {
      where = 'in a position react-dom could not verify (see note below)'
    }
    pushLog(
      `compareDocumentPosition: clicked <${target.tagName.toLowerCase()}> is ${where} (bitmask ${mask})`,
    )
  }

  return (
    <div className="demo">
      <div className="row">
        <button
          type="button"
          onClick={() => {
            fragmentRef.current?.dispatchEvent(
              new CustomEvent('fragment-ping', {
                bubbles: true,
                detail: { from: 'the FragmentInstance' },
              }),
            )
          }}
        >
          dispatchEvent(new CustomEvent(…))
        </button>
      </div>
      <div className="ghost-card" ref={cardRef} onClick={locate}>
        <p>I render before the fragment. Click me.</p>
        <Fragment ref={fragmentRef}>
          <p className="ghost-member">fragment child #1</p>
          <p className="ghost-member">fragment child #2</p>
        </Fragment>
        <p>…and I render after it. Click me too.</p>
      </div>
      <Log entries={log} />
      <p className="note">
        The custom event is dispatched on the node-less fragment and still
        bubbles to the parent <code>&lt;div&gt;</code>’s native listener.
        Clicking around the card uses <code>compareDocumentPosition()</code> to
        show that the fragment knows its place in the document.
      </p>
      <p className="note">
        Quirk found while building this playground: in react-dom 19.3.0,
        clicking the element <em>after</em> the group alternates between{' '}
        <code>FOLLOWING</code> (4) and{' '}
        <code>DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC</code> (32) on every
        other render — the internal fiber-tree validation appears to compare
        fibers from different alternate generations. Click it twice to see
        both.
      </p>
    </div>
  )
}
