import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import type { FragmentInstance } from 'react'

type Section = { id: string; title: string; paragraphs: string[] }

const SECTIONS: Section[] = [
  {
    id: 'why',
    title: 'Why fragment refs',
    paragraphs: [
      'Plenty of DOM APIs want an element: IntersectionObserver, focus, scrollIntoView, event listeners. Until React 19.3, a component that rendered a group of siblings had to add a wrapper div just to get one — breaking flex and grid layouts, CSS selectors, and semantics along the way.',
      'A ref on <Fragment> hands you a FragmentInstance instead: an object that stands in for the group of children without adding anything to the DOM.',
    ],
  },
  {
    id: 'events',
    title: 'Events without wrappers',
    paragraphs: [
      'addEventListener on a FragmentInstance attaches the listener to every first-level DOM child of the fragment. React keeps the set up to date: children mounted later get the listener too, and children inside hidden <Activity> trees only get it once revealed.',
      'dispatchEvent works in the other direction — an event dispatched on the fragment can bubble up to the parent DOM node, as if the fragment were a real element.',
    ],
  },
  {
    id: 'observers',
    title: 'Observers and layout',
    paragraphs: [
      'observeUsing() connects an IntersectionObserver or ResizeObserver to all first-level children — that is exactly what powers the section tracking on this page. Each section here is an h3 followed by paragraphs with no wrapper around them.',
      'getClientRects() returns the bounding rectangles of the children, so you can measure the group, draw overlays around it, or hit-test against it.',
    ],
  },
  {
    id: 'focus',
    title: 'Focus and scrolling',
    paragraphs: [
      'focus() and focusLast() search the fragment’s subtree depth-first for a focusable element, which makes focus management work even for third-party components that expose no ref.',
      'scrollIntoView() scrolls the group into view — clicking an entry in the table of contents on the left calls it on that section’s FragmentInstance.',
    ],
  },
]

function SpySection({
  section,
  root,
  onVisibleChange,
  onInstance,
}: {
  section: Section
  root: HTMLElement | null
  onVisibleChange: (id: string, visibleChildren: number) => void
  onInstance: (id: string, instance: FragmentInstance | null) => void
}) {
  const fragmentRef = useRef<FragmentInstance>(null)

  useEffect(() => {
    const instance = fragmentRef.current
    if (instance === null || root === null) {
      return
    }
    onInstance(section.id, instance)
    const visibleChildren = new Set<Element>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleChildren.add(entry.target)
          } else {
            visibleChildren.delete(entry.target)
          }
        }
        onVisibleChange(section.id, visibleChildren.size)
      },
      { root, threshold: 0.3 },
    )
    instance.observeUsing(observer)
    return () => {
      instance.unobserveUsing(observer)
      observer.disconnect()
      onVisibleChange(section.id, 0)
      onInstance(section.id, null)
    }
  }, [section.id, root, onVisibleChange, onInstance])

  return (
    <Fragment ref={fragmentRef}>
      <h3>{section.title}</h3>
      {section.paragraphs.map((text, i) => (
        <p key={i}>{text}</p>
      ))}
    </Fragment>
  )
}

/**
 * A scrollspy built entirely on fragment refs: each article section is a
 * wrapper-free group of siblings observed with observeUsing(), and the
 * table of contents jumps to a section via scrollIntoView().
 */
export function SectionSpy() {
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState<Record<string, number>>({})
  const instancesRef = useRef(new Map<string, FragmentInstance>())

  const onVisibleChange = useCallback((id: string, count: number) => {
    setVisible((prev) => (prev[id] === count ? prev : { ...prev, [id]: count }))
  }, [])

  const onInstance = useCallback(
    (id: string, instance: FragmentInstance | null) => {
      if (instance === null) {
        instancesRef.current.delete(id)
      } else {
        instancesRef.current.set(id, instance)
      }
    },
    [],
  )

  return (
    <div className="demo">
      <div className="spy-layout">
        <nav className="spy-toc" aria-label="Table of contents">
          {SECTIONS.map((section) => (
            <button
              type="button"
              key={section.id}
              className={(visible[section.id] ?? 0) > 0 ? 'in-view' : ''}
              onClick={() => {
                instancesRef.current.get(section.id)?.scrollIntoView()
              }}
            >
              {section.title}
            </button>
          ))}
        </nav>
        <div className="spy-article" ref={setRoot}>
          {SECTIONS.map((section) => (
            <SpySection
              key={section.id}
              section={section}
              root={root}
              onVisibleChange={onVisibleChange}
              onInstance={onInstance}
            />
          ))}
        </div>
      </div>
      <p className="note">
        Highlighted entries mark sections currently visible in the scroll
        container. Each section is a fragment of an <code>&lt;h3&gt;</code> plus
        paragraphs — there is no per-section wrapper element to observe or
        scroll to.
      </p>
    </div>
  )
}
