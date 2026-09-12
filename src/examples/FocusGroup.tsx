import { Fragment, useEffect, useRef, useState } from 'react'
import type { FragmentInstance } from 'react'

/**
 * Pretend this is a third-party component: it renders a group of siblings,
 * exposes no ref prop, and we cannot edit it. Fragment refs let the caller
 * manage its focus anyway.
 */
function ThirdPartySignupForm() {
  return (
    <>
      <label>
        Name
        <input name="name" placeholder="Ada Lovelace" />
      </label>
      <label>
        Email
        <input name="email" type="email" placeholder="ada@example.com" />
      </label>
      <label>
        Plan
        <select name="plan" defaultValue="free">
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>
      </label>
      <button type="button">Sign up</button>
    </>
  )
}

export function FocusGroup() {
  const fragmentRef = useRef<FragmentInstance>(null)
  const [focused, setFocused] = useState<string | null>(null)

  // focusin/focusout bubble, so listening on the fragment's first-level
  // children is enough to track focus anywhere inside the form.
  useEffect(() => {
    const instance = fragmentRef.current
    if (instance === null) {
      return
    }
    const handleFocusIn: EventListener = (event) => {
      const target = event.target
      if (target instanceof HTMLElement) {
        const name = target.getAttribute('name')
        setFocused(
          name === null
            ? `<${target.tagName.toLowerCase()}>`
            : `<${target.tagName.toLowerCase()} name="${name}">`,
        )
      }
    }
    const handleFocusOut = () => {
      setFocused(null)
    }
    instance.addEventListener('focusin', handleFocusIn)
    instance.addEventListener('focusout', handleFocusOut)
    return () => {
      instance.removeEventListener('focusin', handleFocusIn)
      instance.removeEventListener('focusout', handleFocusOut)
    }
  }, [])

  return (
    <div className="demo">
      <div className="row">
        <button type="button" onClick={() => fragmentRef.current?.focus()}>
          focus()
        </button>
        <button type="button" onClick={() => fragmentRef.current?.focusLast()}>
          focusLast()
        </button>
        <button type="button" onClick={() => fragmentRef.current?.blur()}>
          blur()
        </button>
        <span className="badge">
          {focused === null ? 'nothing focused' : `focused: ${focused}`}
        </span>
      </div>
      <div className="form-grid">
        <Fragment ref={fragmentRef}>
          <ThirdPartySignupForm />
        </Fragment>
      </div>
      <p className="note">
        <code>focus()</code> searches nested children depth-first for the first
        focusable element; <code>focusLast()</code> searches in reverse. The
        form component never had to expose a ref.
      </p>
    </div>
  )
}
