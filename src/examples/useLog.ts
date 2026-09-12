import { useCallback, useState } from 'react'

/**
 * A tiny rolling event log used by several examples.
 */
export function useLog(limit = 6): [string[], (entry: string) => void] {
  const [entries, setEntries] = useState<string[]>([])
  const push = useCallback(
    (entry: string) => {
      setEntries((prev) => [...prev.slice(-(limit - 1)), entry])
    },
    [limit],
  )
  return [entries, push]
}
