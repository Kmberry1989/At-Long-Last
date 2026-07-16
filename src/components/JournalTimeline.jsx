function formatOpenAt(openAt) {
  if (!openAt) {
    return null
  }

  const value = new Date(openAt)
  if (Number.isNaN(value.getTime())) {
    return null
  }

  return value.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function JournalTimeline({ entries }) {
  if (!entries.length) {
    return (
      <div className="journal-card journal-empty">
        <strong>Your board is still clean.</strong>
        <p>The timeline starts filling in as soon as a moment is worth keeping.</p>
      </div>
    )
  }

  return (
    <div className="journal-timeline">
      {entries.map((entry) => {
        const openAt = formatOpenAt(entry.openAt)
        const imageDataUrl = entry.payload?.imageDataUrl || null

        return (
          <article key={entry.id} className={`journal-card timeline-entry vibe-${entry.vibe || 'tender'}`}>
            <div className="timeline-marker" />
            <div className="timeline-body">
              <div className="timeline-head">
                <p className="entry-type">{entry.type}</p>
                {openAt && <span className="timeline-open-at">Opens {openAt}</span>}
              </div>
              <strong>{entry.title}</strong>
              <p>{entry.summary}</p>
              {entry.text && entry.text !== entry.summary && (
                <pre className="timeline-text">{entry.text}</pre>
              )}
              {imageDataUrl && (
                <img
                  alt={entry.title}
                  className="timeline-image"
                  src={imageDataUrl}
                />
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
