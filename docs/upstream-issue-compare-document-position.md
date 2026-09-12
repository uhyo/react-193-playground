# Draft issue for facebook/react

Draft text for reporting the `compareDocumentPosition` quirk found while
building this playground. Copy everything below the rule into a new issue at
<https://github.com/facebook/react/issues/new?template=bug_report.md>
(the sections follow that template).

A single-file reproduction lives next to this file at
[`repro-compare-document-position.html`](./repro-compare-document-position.html)
(no build step; it loads react/react-dom 19.3.0 from esm.sh — link or attach
it to the issue).

---

**Title:** Bug: FragmentInstance.compareDocumentPosition alternates between FOLLOWING and IMPLEMENTATION_SPECIFIC on every other render (no portals involved)

React version: 19.3.0 (react and react-dom). The relevant validation code
looks unchanged on current `main`, so I believe it is still affected.

## Steps To Reproduce

1. Render a `<Fragment ref={fragmentRef}>` with at least one DOM child, plus a
   sibling element *after* the fragment under the same parent. No portals, no
   empty fragment, no `<Activity>`.
2. Call `fragmentRef.current.compareDocumentPosition(afterSibling)` and then
   trigger any state update (re-render).
3. Repeat step 2.

```jsx
import { Fragment, useRef, useState } from 'react';

function App() {
  const fragmentRef = useRef(null);
  const [results, setResults] = useState([]);
  return (
    <div>
      <button
        onClick={() => {
          const mask = fragmentRef.current.compareDocumentPosition(
            document.getElementById('after'),
          );
          // The state update re-renders, which flips the result of the
          // *next* click.
          setResults((prev) => [...prev, mask]);
        }}
      >
        compareDocumentPosition(afterSibling)
      </button>
      <Fragment ref={fragmentRef}>
        <p>fragment child</p>
      </Fragment>
      <p id="after">sibling after the fragment</p>
      <pre>{results.join(', ')}</pre>
    </div>
  );
}
```

Link to code example: (single-file repro, no build step —
`repro-compare-document-position.html`)

## The current behavior

The result alternates with render parity:

```
4, 32, 4, 32, 4, 32
```

i.e. `DOCUMENT_POSITION_FOLLOWING` on even render generations and bare
`DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC` on odd ones. The
`PRECEDING` case (a sibling *before* the fragment) is affected the same way on
odd generations. Queries for nodes *inside* the fragment (`CONTAINED_BY`) are
stable.

Reproduced in Chromium with react-dom 19.3.0, in both development and
production builds, with and without `StrictMode`.

## The expected behavior

A stable `DOCUMENT_POSITION_FOLLOWING` (4) / `DOCUMENT_POSITION_PRECEDING` (2)
regardless of how many times the tree has re-rendered. Per the
[Fragment docs](https://react.dev/reference/react/Fragment),
`DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC` is expected only for empty
Fragments and Fragments with children rendered through a portal — neither
applies here.

## Probable cause

The fiber-tree validation added in #34069
(`validateDocumentPositionWithFiberTree`) returns
`DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC` when it cannot corroborate the
DOM-derived answer. Its helpers `isFiberPrecedingCheck` and
`isFiberFollowingCheck` in
`packages/react-reconciler/src/ReactFiberTreeReflection.js` compare fibers by
strict identity (`child === boundary`, `child === target`), while nearby
checks in the same file accept alternates (e.g.
`current === fragmentFiber || current.alternate === fragmentFiber` in the
`CONTAINED_BY` branch — which is presumably why that case is stable).

The traversal walks the current tree from the common ancestor, but `target`
comes from `getClosestInstanceFromNode(otherNode)` (the fiber cached on the
DOM node) and `boundary` from traversing the FragmentInstance's stored
`_fragmentFiber` — after a commit these can belong to the alternate
generation, so the identity comparisons miss, the search finds nothing,
validation reports failure, and the fallback 32 is returned. The
fiber/alternate pair swaps roles on each commit, which matches the observed
every-other-render alternation exactly.
