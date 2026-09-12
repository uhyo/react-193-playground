export function Log({ entries }: { entries: string[] }) {
  return (
    <div className="log" role="log" aria-label="Event log">
      {entries.length === 0 ? (
        <p className="log-empty">Interact with the demo — events show up here.</p>
      ) : (
        entries.map((entry, i) => (
          // Entries scroll off the top, so the index is fine as a key here.
          <p key={i}>{entry}</p>
        ))
      )}
    </div>
  )
}
