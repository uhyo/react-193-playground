import type { ComponentType } from 'react'
import { FocusGroup } from './FocusGroup.tsx'
import { FragmentGhost } from './FragmentGhost.tsx'
import { GroupEvents } from './GroupEvents.tsx'
import { HiddenGroup } from './HiddenGroup.tsx'
import { RovingChips } from './RovingChips.tsx'
import { SectionSpy } from './SectionSpy.tsx'
import { SpotlightGroup } from './SpotlightGroup.tsx'

export type Example = {
  id: string
  title: string
  description: string
  apis: string[]
  Component: ComponentType
}

export const examples: Example[] = [
  {
    id: 'group-events',
    title: 'Group events',
    description:
      'One click listener for a group of sibling cards, attached to the fragment instead of a wrapper element. Children mounted later pick the listener up automatically.',
    apis: ['addEventListener', 'removeEventListener'],
    Component: GroupEvents,
  },
  {
    id: 'focus-group',
    title: 'Focus a black box',
    description:
      'Focus management for a third-party form that exposes no ref: focus the first or last focusable element and track focus with bubbling focusin/focusout events.',
    apis: ['focus', 'focusLast', 'blur', 'addEventListener'],
    Component: FocusGroup,
  },
  {
    id: 'spotlight',
    title: 'Union spotlight',
    description:
      'Draws a single live bounding box around a contiguous run of siblings by combining getClientRects() with a ResizeObserver — no wrapper div disturbing the flex layout.',
    apis: ['getClientRects', 'observeUsing', 'unobserveUsing'],
    Component: SpotlightGroup,
  },
  {
    id: 'section-spy',
    title: 'Scrollspy',
    description:
      'A table of contents that tracks wrapper-free article sections with IntersectionObservers and jumps to a section with scrollIntoView().',
    apis: ['observeUsing', 'scrollIntoView'],
    Component: SectionSpy,
  },
  {
    id: 'roving-chips',
    title: 'Roving focus chips',
    description:
      'Arrow-key navigation across sibling chips using one keydown listener on the fragment, with focus()/focusLast() providing wrap-around.',
    apis: ['addEventListener', 'focus', 'focusLast', 'blur'],
    Component: RovingChips,
  },
  {
    id: 'hidden-group',
    title: 'Hidden group',
    description:
      'A <Hidden enabled> wrapper that renders no element but applies the HTML hidden attribute to all first-level DOM children, by passing a hand-rolled observer to observeUsing(). Children mounted later are hidden before first paint.',
    apis: ['observeUsing', 'unobserveUsing'],
    Component: HiddenGroup,
  },
  {
    id: 'fragment-ghost',
    title: 'Ghost in the DOM',
    description:
      'The fragment has no DOM node, but it can dispatch events that bubble to its DOM parent and report its document position relative to other nodes.',
    apis: ['dispatchEvent', 'compareDocumentPosition'],
    Component: FragmentGhost,
  },
]
