# react-193-playground

A playground for trying out new features in React 19.3, built with [Vite](https://vite.dev/) and TypeScript.

## Fragment refs

React 19.3 stabilized [fragment refs](https://react.dev/reference/react/Fragment): passing a `ref` to `<Fragment>` (the shorthand `<>` doesn't accept props) yields a `FragmentInstance` — an object that stands in for the fragment's DOM children as a group, with no wrapper element. It exposes `addEventListener`/`removeEventListener`/`dispatchEvent`, `focus`/`focusLast`/`blur`, `observeUsing`/`unobserveUsing`, `getClientRects`, `getRootNode`, `compareDocumentPosition`, and `scrollIntoView`.

This app (`npm run dev`) is a tabbed set of demos:

| Example | APIs | What it shows |
| ------- | ---- | ------------- |
| Group events | `addEventListener` | One click listener for a group of sibling cards; children mounted later pick it up automatically |
| Focus a black box | `focus`, `focusLast`, `blur` | Focus management for a "third-party" form that exposes no ref, plus focus tracking via bubbling `focusin` |
| Union spotlight | `getClientRects`, `observeUsing` | A live union bounding box drawn around a wrapper-free run of siblings, kept fresh by a ResizeObserver |
| Scrollspy | `observeUsing`, `scrollIntoView` | A table of contents tracking wrapper-free article sections with IntersectionObservers |
| Roving focus chips | `addEventListener`, `focus`, `focusLast` | Arrow-key navigation across sibling chips with wrap-around, from a single fragment-level keydown listener |
| Ghost in the DOM | `dispatchEvent`, `compareDocumentPosition` | A custom event bubbling from the node-less fragment to its DOM parent, and document-position queries against it |

Only the first two are adapted from the official docs; the rest are original.

Notes from building this:

- The `FragmentInstance` methods are typed via `@types/react-dom`'s `declare module 'react'` augmentation, which only loads if the `react-dom` root module is in the type graph — see `src/fragment-instance.d.ts`, which also declares `compareDocumentPosition` (shipped in react-dom 19.3.0 but missing from `@types/react-dom` 19.3.0).
- Observed quirk in react-dom 19.3.0: `compareDocumentPosition` for a node *following* (or *preceding*) the fragment alternates between the correct bitmask and `DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC` (32) on every other render of the fragment — the internal fiber-tree validation appears to compare fibers across alternate generations. Positions *inside* the fragment are stable. See [`docs/upstream-issue-compare-document-position.md`](./docs/upstream-issue-compare-document-position.md) for a draft bug report and [`docs/repro-compare-document-position.html`](./docs/repro-compare-document-position.html) for a standalone reproduction.

## Getting started

```sh
npm install
npm run dev
```

## Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the dev server with HMR            |
| `npm run build`   | Type-check and build for production      |
| `npm run preview` | Preview the production build locally     |
| `npm run lint`    | Lint the codebase with oxlint            |

## Stack

- [React 19.3](https://react.dev/)
- [Vite](https://vite.dev/) with [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react)
- TypeScript
