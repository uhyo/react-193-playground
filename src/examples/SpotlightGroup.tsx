import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import type { FragmentInstance } from 'react'

type Item = { id: number; big: boolean }

type Box = { top: number; left: number; width: number; height: number }

const INITIAL_ITEMS: Item[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  big: false,
}))

/**
 * Draws one union bounding box around a contiguous run of siblings by
 * combining getClientRects() with a ResizeObserver attached via
 * observeUsing() — no wrapper element around the highlighted items.
 */
export function SpotlightGroup() {
  const fragmentRef = useRef<FragmentInstance>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS)
  const [seenCount, setSeenCount] = useState(5)
  const [box, setBox] = useState<Box | null>(null)
  const nextIdRef = useRef(INITIAL_ITEMS.length + 1)

  const newItems = items.slice(seenCount)

  useLayoutEffect(() => {
    const instance = fragmentRef.current
    const board = boardRef.current
    if (board === null) {
      return
    }
    const measure = () => {
      const rects = instance?.getClientRects() ?? []
      if (rects.length === 0) {
        setBox(null)
        return
      }
      const base = board.getBoundingClientRect()
      let top = Infinity
      let left = Infinity
      let right = -Infinity
      let bottom = -Infinity
      for (const rect of rects) {
        top = Math.min(top, rect.top)
        left = Math.min(left, rect.left)
        right = Math.max(right, rect.right)
        bottom = Math.max(bottom, rect.bottom)
      }
      const pad = 6
      setBox({
        top: top - base.top - pad,
        left: left - base.left - pad,
        width: right - left + pad * 2,
        height: bottom - top + pad * 2,
      })
    }
    measure()
    window.addEventListener('resize', measure)
    let observer: ResizeObserver | undefined
    if (instance !== null) {
      observer = new ResizeObserver(measure)
      instance.observeUsing(observer)
    }
    return () => {
      window.removeEventListener('resize', measure)
      if (instance !== null && observer !== undefined) {
        instance.unobserveUsing(observer)
        observer.disconnect()
      }
    }
  }, [items, seenCount])

  const toggleItem = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, big: !item.big } : item,
      ),
    )
  }

  const renderItem = (item: Item) => (
    <button
      type="button"
      key={item.id}
      className={`tile${item.big ? ' big' : ''}`}
      onClick={() => toggleItem(item.id)}
    >
      #{item.id}
    </button>
  )

  return (
    <div className="demo">
      <div className="row">
        <button
          type="button"
          onClick={() => {
            setItems((prev) => [...prev, { id: nextIdRef.current, big: false }])
            nextIdRef.current += 1
          }}
        >
          Add unseen item
        </button>
        <button
          type="button"
          onClick={() => setSeenCount((c) => Math.min(c + 1, items.length))}
        >
          Mark one as seen
        </button>
        <button
          type="button"
          onClick={() => {
            setItems(INITIAL_ITEMS)
            setSeenCount(5)
            nextIdRef.current = INITIAL_ITEMS.length + 1
          }}
        >
          Reset
        </button>
        <span className="badge">{newItems.length} unseen</span>
      </div>
      <div className="board" ref={boardRef}>
        {items.slice(0, seenCount).map(renderItem)}
        <Fragment ref={fragmentRef}>{newItems.map(renderItem)}</Fragment>
        {box !== null && (
          <div className="spotlight-box" style={box}>
            <span>{newItems.length} new</span>
          </div>
        )}
      </div>
      <p className="note">
        The dashed box is the union of{' '}
        <code>fragmentRef.current.getClientRects()</code>. Click a tile to
        resize it — the ResizeObserver attached with <code>observeUsing()</code>{' '}
        re-measures the group, and adding or seeing items re-runs the layout
        effect.
      </p>
    </div>
  )
}
