import { Fragment, useCallback, useState } from 'react'
import type { FragmentInstance, ReactNode } from 'react'

/**
 * `<Hidden enabled>` renders no element of its own but applies the HTML
 * `hidden` attribute to all of its first-level DOM children.
 *
 * FragmentInstance deliberately exposes no "give me your child elements"
 * method, but observeUsing() never checks that its argument is a real
 * observer — it calls `observer.observe(element)` with every current
 * first-level DOM child, again for every child mounted later, and
 * `observer.unobserve(element)` for every child removed. Symmetrically,
 * unobserveUsing() calls `observer.unobserve(element)` with every current
 * child. All of those calls happen during React's commit phase, before
 * paint.
 *
 * That symmetry lets a callback ref with a cleanup carry the whole
 * component: attaching the ref applies the attribute to every child (and
 * to any child mounted later), the cleanup strips it from every child.
 * Keying the callback on `enabled` makes React detach the old observer and
 * attach a fresh one — closing over the new value — whenever it flips, so
 * there is no need to keep a registry of children or sync state through
 * effects and refs.
 */
function Hidden({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const attachObserver = useCallback(
    (instance: FragmentInstance) => {
      const observer = {
        observe(element: Element) {
          element.toggleAttribute('hidden', enabled)
        },
        unobserve(element: Element) {
          // Leave detached children clean in case they are moved elsewhere.
          element.removeAttribute('hidden')
        },
        // Never called by react-dom; only here so the object structurally
        // satisfies the ResizeObserver type that observeUsing() is declared
        // to accept.
        disconnect() {},
      }
      instance.observeUsing(observer)
      return () => {
        instance.unobserveUsing(observer)
      }
    },
    [enabled],
  )

  return <Fragment ref={attachObserver}>{children}</Fragment>
}

/**
 * A component child: the fragment sees through it to the DOM element it
 * renders, so it gets the `hidden` attribute like a plain element child.
 */
function OpaqueCard({ label }: { label: string }) {
  return (
    <article className="card">
      <h3>{label}</h3>
      <p>Rendered by a component, hidden all the same.</p>
    </article>
  )
}

export function HiddenGroup() {
  const [enabled, setEnabled] = useState(true)
  const [peek, setPeek] = useState(false)
  const [extras, setExtras] = useState(0)

  return (
    <div className="demo">
      <div className="row">
        <button type="button" onClick={() => setEnabled((e) => !e)}>
          {enabled ? 'Show' : 'Hide'} the group
        </button>
        <button type="button" onClick={() => setExtras((n) => n + 1)}>
          Mount a child into the group
        </button>
        <label className="badge">
          <input
            type="checkbox"
            checked={peek}
            onChange={(event) => setPeek(event.target.checked)}
          />{' '}
          X-ray <code>[hidden]</code> elements
        </label>
      </div>
      <div className={`card-row hidden-row${peek ? ' peek' : ''}`}>
        <article className="card">
          <h3>Sibling before</h3>
          <p>Not a child of the fragment — never hidden.</p>
        </article>
        <Hidden enabled={enabled}>
          <article className="card">
            <h3>Direct child</h3>
            <p>
              Gets the <code>hidden</code> attribute from the fragment.
            </p>
          </article>
          <OpaqueCard label="Component child" />
          {Array.from({ length: extras }, (_, i) => (
            <article key={i} className="card">
              <h3>Late child #{i + 1}</h3>
              <p>Mounted after the fact — hidden before first paint.</p>
            </article>
          ))}
        </Hidden>
        <article className="card">
          <h3>Sibling after</h3>
          <p>Also outside the fragment, also unaffected.</p>
        </article>
      </div>
      <p className="note">
        <code>&lt;Hidden&gt;</code> renders no element: the cards stay direct
        flex items of the row. A callback ref on the fragment passes{' '}
        <code>observeUsing()</code> a plain{' '}
        <code>{'{ observe, unobserve }'}</code> object that toggles the{' '}
        <code>hidden</code> attribute, so children mounted while the group is
        hidden never flash — try “Mount a child” while hidden, then use the
        X-ray to see the attribute sitting on the real, still-mounted DOM.
        Toggling works by swapping the ref callback itself: React runs the
        old ref’s cleanup and attaches a new observer, re-visiting every
        child, all before paint.
        (Unrelated to fragments, but note: the cards’ own{' '}
        <code>display: flex</code> beats the UA’s{' '}
        <code>[hidden] {'{ display: none }'}</code>, so the stylesheet backs
        the attribute up with <code>.card[hidden]</code>.)
      </p>
    </div>
  )
}
