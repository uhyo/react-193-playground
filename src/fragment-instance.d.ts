import type { FragmentInstance } from 'react'
// Load @types/react-dom's `declare module 'react'` augmentation, which adds
// the FragmentInstance methods. Nothing else in the app imports the
// react-dom root module, so without this the interface would stay empty.
import type {} from 'react-dom'

declare module 'react' {
  interface FragmentInstance {
    /**
     * Compares the document position of the Fragment with another node,
     * like `Node.compareDocumentPosition()`. Shipped in react-dom 19.3 but
     * not yet declared in `@types/react-dom`.
     */
    compareDocumentPosition(otherNode: Node): number
  }
}

declare global {
  interface Element {
    /**
     * Set by react-dom on first-level DOM children of a `<Fragment ref={…}>`:
     * the set of FragmentInstances that own this element.
     */
    reactFragments?: Set<FragmentInstance>
  }
}

export {}
